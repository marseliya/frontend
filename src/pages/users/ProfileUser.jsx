import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ChatModal from "../../components/ChatModal";
import { getSocket, initSocket } from "../../socket";
import { useToast } from "../../components/ToastAlert";
import ConfirmModal from "../../components/ConfirmModal";

const ProfileUser = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { success, error, warning, info } = useToast();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profil");

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    nama: "",
    nomor_hp: "",
    alamat: "",
    foto_profile: "",
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Wishlist action loading
  const [wishlistLoading, setWishlistLoading] = useState(null);

  // Hapus akun
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // State untuk rating
  const [ratingLoading, setRatingLoading] = useState(null);
  const [ratingsMap, setRatingsMap] = useState({});

  // =====================================================
  // STATE UNTUK CHAT (BARU)
  // =====================================================
  const [chatOrder, setChatOrder] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const socket = getSocket();

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  const formatTanggal = (tgl) =>
    tgl
      ? new Date(tgl).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

  // State untuk confirm modal
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showConfirm = (title, message, onConfirm) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // =====================================================
  // 1. FETCH ALL INITIAL DATA (USER, ORDERS, WISHLIST)
  // =====================================================
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, orderRes, cartRes, bookRes, orderItemRes] =
          await Promise.all([
            api.get("/api/profile-user"),
            api.get("/api/orders"),
            api.get("/api/carts"),
            api.get("/api/books"),
            api.get("/api/orders/order-items"),
          ]);

        const profileUser = userRes.data.data || userRes.data;
        const carts = cartRes.data.data || cartRes.data || [];
        const books = bookRes.data.data || bookRes.data || [];
        const allOrders = orderRes.data.data || orderRes.data || [];
        const orderItems = orderItemRes.data.data || orderItemRes.data || [];

        // Mapping data
        const booksMap = {};
        books.forEach((book) => {
          booksMap[book.id] = book;
        });

        const wishlistData = carts
          .map((cart) => ({
            ...cart,
            book: booksMap[cart.book_id] || null,
          }))
          .filter((item) => item.book !== null);

        const myOrders = allOrders.filter((o) => o.user_id === profileUser?.id);
        const ordersWithBooks = myOrders.map((order) => {
          const items = orderItems.filter((item) => item.order_id === order.id);
          const judulBuku = items.map((item) => booksMap[item.book_id]?.judul);
          return { ...order, judul_buku: judulBuku };
        });

        setUser(profileUser);
        setEditData({
          nama: profileUser?.nama || "",
          nomor_hp: profileUser?.nomor_hp || "",
          alamat: profileUser?.alamat || "",
          foto_profile: profileUser?.foto_profile || "",
        });
        setOrders(ordersWithBooks);
        setWishlist(wishlistData);
      } catch (err) {
        console.error("Gagal fetch profil:", err);
        error("Gagal memuat data profil");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // =====================================================
  // 2. FETCH RATING STATUS
  // =====================================================
  useEffect(() => {
    const fetchAllRatings = async () => {
      if (orders.length === 0) return;

      for (const order of orders) {
        if (
          order.status_pembayaran === "selesai" &&
          order.status_pengambilan === "selesai" &&
          order.metode_pengambilan === "diantar"
        ) {
          if (!ratingsMap[order.id]) {
            try {
              const res = await api.get(`/api/ratings/order/${order.id}`);
              if (res.data.data) {
                setRatingsMap((prev) => ({
                  ...prev,
                  [order.id]: res.data.data,
                }));
              }
            } catch (err) {
              console.error(`Gagal fetch rating untuk order ${order.id}:`, err);
            }
          }
        }
      }
    };

    fetchAllRatings();
  }, [orders]);

  // =====================================================
  // 3. FETCH UNREAD COUNT (CHAT)
  // =====================================================
  const fetchUnreadCounts = async () => {
    try {
      const res = await api.get("/api/messages/unread/count");
      setUnreadCounts(res.data.data || {});
    } catch (err) {
      console.error("Gagal fetch unread count:", err);
    }
  };

  // =====================================================
  // 4. SOCKET SETUP & INIT
  // =====================================================
  useEffect(() => {
    initSocket();

    if (user?.id) {
      socket.emit("join-user", user.id);
    }

    fetchUnreadCounts();

    // Interval refresh unread count setiap 10 detik
    const interval = setInterval(fetchUnreadCounts, 10000);

    // Socket listener untuk pesan baru
    const handleNewMessage = () => {
      fetchUnreadCounts();
    };

    socket.on("new-message", handleNewMessage);
    socket.on("order-message", handleNewMessage);

    return () => {
      clearInterval(interval);
      socket.off("new-message", handleNewMessage);
      socket.off("order-message", handleNewMessage);
    };
  }, [user?.id]);

  // =====================================================
  // 5. HANDLER FUNCTIONS
  // =====================================================
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewFoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const formData = new FormData();
      formData.append("nama", editData.nama);
      formData.append("nomor_hp", editData.nomor_hp);
      formData.append("alamat", editData.alamat);

      if (fotoFile) {
        formData.append("foto_profile", fotoFile);
      }

      await api.put(`/api/users/update/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const userRes = await api.get("/api/profile-user");
      const updatedUser = userRes.data.data || userRes.data;
      setUser(updatedUser);

      setEditMode(false);
      setFotoFile(null);
      setPreviewFoto(null);

      success("Profil berhasil diperbarui!");
    } catch (err) {
      console.error("Gagal update:", err);
      error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUnlove = async (bookId) => {
    setWishlistLoading(bookId);
    try {
      await api.delete(`/api/carts/delete/${bookId}`);
      setWishlist((prev) => prev.filter((w) => w.book_id !== bookId));
      success("Berhasil dihapus dari wishlist");
    } catch (err) {
      console.error("Gagal hapus wishlist:", err);
      error("Gagal menghapus dari wishlist");
    } finally {
      setWishlistLoading(null);
    }
  };

  const handlePesanBuku = (bookId) => {
    // Cek apakah buku masih ada di wishlist dan tidak dihapus
    const item = wishlist.find((w) => w.book_id === bookId);
    if (!item || !item.book) {
      error("Buku sudah tidak tersedia");
      return;
    }
    navigate(`/detail-buku/${bookId}`);
  };

  const handleDeleteAccount = async () => {
    // Cek order aktif
    const hasActiveOrder = orders.some(
      (o) =>
        o.status_pembayaran === "pending" ||
        o.status_pengambilan === "belum diambil" ||
        o.status_pengambilan === "dikirim"
    );

    if (hasActiveOrder) {
      setDeleteError(
        "Akun tidak dapat dihapus karena masih ada pesanan yang aktif."
      );
      error("Masih ada pesanan yang aktif.");
      return;
    }

    const hasOrderHistory = orders.length > 0;
    const deleteType = hasOrderHistory
      ? "soft delete (riwayat pesanan tetap tersimpan)"
      : "hapus permanen";

    showConfirm(
      "Hapus Akun",
      `Akun Anda akan ${deleteType}. Apakah Anda yakin?`,
      async () => {
        setDeleteLoading(true);
        try {
          const response = await api.delete(`/api/users/delete/${user.id}`);

          // CEK RESPONSE DARI BACKEND
          if (response.data.success) {
            localStorage.removeItem("token");
            success(response.data.message);
            navigate("/");
          } else {
            throw new Error(response.data.message || "Gagal menghapus akun");
          }
        } catch (err) {
          console.error("Delete account error:", err);
          setDeleteError(
            err.response?.data?.message || "Gagal menghapus akun."
          );
          error(err.response?.data?.message || "Gagal menghapus akun.");
          setDeleteLoading(false);
        }
      }
    );
  };

  const handleCancelOrder = async (order) => {
    if (
      order.status_pembayaran !== "pending" ||
      order.status_pengambilan !== "pending"
    ) {
      error("Order hanya bisa dibatalkan jika status masih pending");
      return;
    }

    showConfirm(
      "Batalkan Pesanan",
      "Apakah Anda yakin ingin membatalkan pesanan ini? Stok buku akan dikembalikan.",
      async () => {
        try {
          const response = await api.delete(`/api/orders/delete/${order.id}`);

          if (response.data.success) {
            // Hapus dari daftar orders
            setOrders((prev) => prev.filter((o) => o.id !== order.id));
            success(response.data.message || "Pesanan berhasil dibatalkan");
          }
        } catch (err) {
          console.error("Cancel order error:", err);
          error(err.response?.data?.message || "Gagal membatalkan pesanan");
        }
      }
    );
  };

  const handleSubmitRating = async (orderId, driverId, rating) => {
    setRatingLoading(orderId);
    try {
      await api.post("/api/ratings/create", {
        order_id: orderId,
        rating: rating,
      });

      setRatingsMap((prev) => ({
        ...prev,
        [orderId]: { rating, created_at: new Date().toISOString() },
      }));

      success(`Terima kasih! Rating ${rating} bintang untuk driver`);
    } catch (err) {
      console.error("Gagal memberikan rating:", err);
      error(err.response?.data?.message || "Gagal memberikan rating");
    } finally {
      setRatingLoading(null);
    }
  };

  const statusPembayaranColor = (status) => {
    if (status === "selesai") return "text-green-600 dark:text-green-400";
    if (status === "pending") return "text-amber-600 dark:text-amber-400";
    return "text-zinc-500 dark:text-zinc-400";
  };

  const statusAmbilColor = (status) => {
    if (status === "selesai") return "text-green-600 dark:text-green-400";
    if (status === "dikirim") return "text-blue-600 dark:text-blue-400";
    if (status === "pending") return "text-amber-600 dark:text-amber-400";
    return "text-zinc-500 dark:text-zinc-400";
  };

  const tabs = [
    { key: "profil", label: "Profil" },
    { key: "pesanan", label: "Pesanan Saya" },
    { key: "wishlist", label: "Wishlist" },
    { key: "akun", label: "Pengaturan Akun" },
  ];

  if (loading) {
    return (
      <div className="text-center py-32 text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
        Memuat Profil...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Profil */}
      <div className="flex items-center gap-5 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="relative shrink-0">
          {user?.foto_profile ? (
            <img
              src={user.foto_profile}
              alt={user?.nama}
              className="w-16 h-16 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-book-card-light border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xl font-medium text-zinc-500 dark:text-zinc-400 uppercase">
              {user?.nama?.[0] || "U"}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            {user?.nama}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {user?.email}
          </p>
          <span className="text-[10px] uppercase tracking-widest font-mono font-bold px-1.5 py-0.5 mt-1 inline-block bg-book-light border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-zinc-200 dark:border-zinc-800 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-xs uppercase tracking-widest font-medium transition-colors whitespace-nowrap cursor-pointer
              ${
                activeTab === tab.key
                  ? "border-b-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-500 dark:hover:text-zinc-300"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB PROFIL ── */}
      {activeTab === "profil" && (
        <div className="space-y-6 max-w-lg">
          {!editMode ? (
            <>
              {[
                { label: "Nama", value: user?.nama },
                { label: "Email", value: user?.email },
                { label: "Nomor HP", value: user?.nomor_hp || "-" },
                { label: "Alamat", value: user?.alamat || "-" },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    {label}
                  </p>
                  <p className="text-sm text-zinc-900 dark:text-white">
                    {value}
                  </p>
                </div>
              ))}
              <button
                onClick={() => setEditMode(true)}
                className="mt-4 px-6 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer"
              >
                Edit Profil
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {/* Foto Profil */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Foto Profil
                </p>
                <div className="flex items-center gap-4">
                  {user?.foto_profile ? (
                    <img
                      src={user.foto_profile}
                      alt="preview"
                      className="w-14 h-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-book-card-light border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-lg text-zinc-400 uppercase">
                      {user?.nama?.[0] || "U"}
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileRef.current.click()}
                    className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer"
                  >
                    Pilih Foto
                  </button>
                </div>
                {fotoFile && (
                  <p className="text-[10px] text-zinc-400">
                    File siap diupload: {fotoFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-medium text-zinc-600 dark:text-zinc-400">
                  Nama
                </label>
                <input
                  type="text"
                  value={editData.nama}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, nama: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-book-card-light border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 rounded-none text-zinc-900 dark:text-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-medium text-zinc-600 dark:text-zinc-400">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  value={editData.nomor_hp}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, nomor_hp: e.target.value }))
                  }
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2 text-sm bg-book-card-light border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 rounded-none text-zinc-900 dark:text-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-medium text-zinc-600 dark:text-zinc-400">
                  Alamat
                </label>
                <textarea
                  value={editData.alamat}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, alamat: e.target.value }))
                  }
                  rows={3}
                  placeholder="Tulis alamat lengkap..."
                  className="w-full px-3 py-2 text-sm bg-book-card-light border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 rounded-none text-zinc-900 dark:text-white resize-none transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="px-4 py-2 border border-zinc-700 dark:border-zinc-300 text-xs uppercase tracking-widest font-medium text-zinc-400 dark:text-zinc-600 hover:bg-zinc-500 dark:hover:bg-zinc-300 transition-colors rounded-none cursor-pointer"
                >
                  {saveLoading ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFotoFile(null);
                    setPreviewFoto(null);
                  }}
                  className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB PESANAN ── */}
      {activeTab === "pesanan" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 border border-dashed border-zinc-300 dark:border-zinc-800">
              Belum ada pesanan
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-book-card-light border border-zinc-200 dark:border-zinc-800 p-5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Kode Pesanan
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5">
                      {order.kode_pesanan}
                    </p>
                    <p>
                      {order.judul_buku?.map((judul, index) => (
                        <span
                          key={index}
                          className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5"
                        >
                          {judul}
                        </span>
                      ))}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {formatTanggal(order.created_at)}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">
                      Total
                    </p>
                    <p className="font-mono font-semibold text-zinc-900 dark:text-white">
                      {formatRupiah(order.total_harga)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">
                      Pembayaran
                    </p>
                    <p
                      className={`text-xs font-medium uppercase ${statusPembayaranColor(
                        order.status_pembayaran
                      )}`}
                    >
                      {order.status_pembayaran}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">
                      Pengambilan
                    </p>
                    <p
                      className={`text-xs font-medium uppercase ${statusAmbilColor(
                        order.status_pengambilan
                      )}`}
                    >
                      {order.status_pengambilan}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">
                      Metode Pengambilan
                    </p>
                    <p className="text-xs text-zinc-700 uppercase dark:text-zinc-300">
                      {order.metode_pengambilan}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">
                      Metode Pembayaran
                    </p>
                    <p className="text-xs text-zinc-700 uppercase dark:text-zinc-300 ">
                      {order.metode_pembayaran}
                    </p>
                  </div>
                </div>

                {order.catatan && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 italic border-t border-zinc-100 dark:border-zinc-800 pt-2">
                    Catatan: {order.catatan}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  {/* ── TOMBOL BATALKAN ── */}
                  {order.status_pembayaran === "pending" &&
                    order.status_pengambilan === "pending" && (
                      <button
                        onClick={() => handleCancelOrder(order)}
                        className="px-3 py-1 text-xs text-white rounded bg-red-500 hover:bg-red-600 cursor-pointer"
                      >
                        Batalkan
                      </button>
                    )}

                  {/* ── TOMBOL CHAT (HANYA UNTUK STATUS DIKIRIM) ── */}
                  {order.metode_pengambilan === "diantar" &&
                    order.status_pengambilan === "dikirim" && (
                      <button
                        onClick={() => setChatOrder(order)}
                        className="relative px-3 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded flex items-center gap-1 cursor-pointer"
                      >
                        💬 Chat
                        {unreadCounts[order.id] > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                            {unreadCounts[order.id]}
                          </span>
                        )}
                      </button>
                    )}
                </div>

                {/* Rating Component */}
                {order.status_pembayaran === "selesai" &&
                  order.status_pengambilan === "selesai" &&
                  order.metode_pengambilan === "diantar" && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      {ratingsMap[order.id] ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">
                            Rating Anda:
                          </span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-lg ${
                                  star <= ratingsMap[order.id].rating
                                    ? "text-yellow-400"
                                    : "text-zinc-300 dark:text-zinc-600"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-zinc-500 mb-2">
                            Berikan rating untuk driver:
                          </p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() =>
                                  handleSubmitRating(
                                    order.id,
                                    order.driver_id,
                                    star
                                  )
                                }
                                disabled={ratingLoading === order.id}
                                className="text-2xl text-zinc-300 dark:text-zinc-600 hover:text-yellow-400 transition-colors disabled:opacity-50"
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB WISHLIST ── */}
      {activeTab === "wishlist" && (
        <div className="space-y-4">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 border border-dashed border-zinc-300 dark:border-zinc-800">
              Wishlist kosong
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-book-card-light border border-zinc-200 dark:border-zinc-800 p-4 flex gap-4 items-start"
                >
                  {item.book?.cover ? (
                    <img
                      src={item.book.cover}
                      alt={item.book?.judul}
                      className="w-14 h-20 object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-20 bg-book-light border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 text-[9px] text-zinc-400 uppercase tracking-wider text-center">
                      No Cover
                    </div>
                  )}
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {item.book?.judul || `Buku #${item.book_id}`}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-serif italic">
                      {item.book?.penulis || "-"}
                    </p>
                    <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {formatRupiah(item.book?.harga || 0)}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handlePesanBuku(item.book_id)}
                        className={`px-3 py-1 text-[10px] uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-colors rounded-none cursor-pointer ${
                          !item.book ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {item.book ? "Pesan" : "Tidak Tersedia"}
                      </button>
                      <button
                        disabled={wishlistLoading === item.book_id}
                        onClick={() => handleUnlove(item.book_id)}
                        className="p-1.5 border border-zinc-300 dark:border-zinc-700 text-red-400 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors rounded-none disabled:opacity-40 cursor-pointer"
                        title="Hapus dari wishlist"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          fill="#ef4444"
                          className="w-3.5 h-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB PENGATURAN AKUN ── */}
      {activeTab === "akun" && (
        <div className="max-w-lg space-y-6">
          <div className="bg-book-card-light border border-red-200 dark:border-red-900/50 p-5 space-y-3">
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
              Hapus Akun
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Akun yang dihapus tidak dapat dipulihkan. Penghapusan hanya bisa
              dilakukan jika tidak ada pesanan yang berstatus{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                pending
              </span>{" "}
              atau{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                belum diambil
              </span>
              .
            </p>
            {deleteError && (
              <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2">
                {deleteError}
              </p>
            )}
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-widest font-medium transition-colors rounded-none disabled:opacity-50 cursor-pointer"
            >
              {deleteLoading ? "Menghapus..." : "Hapus Akun Saya"}
            </button>
          </div>
        </div>
      )}

      {/* Modal Chat */}
      {chatOrder && (
        <ChatModal
          orderId={chatOrder.id}
          userId={user?.id}
          driverId={chatOrder.driver_id}
          orderStatus={chatOrder.status_pengambilan}
          onClose={() => {
            setChatOrder(null);
            fetchUnreadCounts();
          }}
        />
      )}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() =>
          setConfirmState({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
          })
        }
      />
    </div>
  );
};

export default ProfileUser;
