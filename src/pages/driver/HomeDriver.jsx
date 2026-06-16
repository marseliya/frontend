import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import ChatModal from "../../components/ChatModal";
import ConfirmModal from "../../components/ConfirmModal";
import { getSocket, initSocket } from "../../socket";
import { useToast } from "../../components/ToastAlert";
import { Navigate, useNavigate } from "react-router-dom";

const HomeDriver = () => {
  const { success, error, warning, info } = useToast();
  const [orders, setOrders] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [rating, setRating] = useState({ average_rating: 0, total_ratings: 0 });
  const navigate = useNavigate();

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingRating, setLoadingRating] = useState(true);

  // 🔥 STATE UNTUK CHAT
  const [chatOrder, setChatOrder] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const socket = getSocket();

  // 🔥 STATE UNTUK CONFIRM MODAL
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    loading: false,
  });

  // =====================================================
  // SHOW CONFIRM MODAL
  // =====================================================
  const showConfirm = (title, message, onConfirm) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => onConfirm(),
      loading: false,
    });
  };

  const closeConfirm = () => {
    setConfirmState({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
      loading: false,
    });
  };

  // =====================================================
  // FETCH PROFILE
  // =====================================================
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.get("/api/profile-user");
      setProfile(res.data.data || res.data);
    } catch (err) {
      console.log(err);
      error("Gagal memuat profil");
    } finally {
      setLoadingProfile(false);
    }
  };

  // =====================================================
  // FETCH ORDERS DRIVER
  // =====================================================
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get("/api/driver/orders");
      setOrders(res.data.data || []);
    } catch (err) {
      console.log(err);
      error("Gagal memuat order");
    } finally {
      setLoadingOrders(false);
    }
  };

  // =====================================================
  // FETCH KOMISI
  // =====================================================
  const fetchCommissions = async () => {
    try {
      const res = await api.get("/api/driver/commissions");
      setCommissions(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // =====================================================
  // FETCH RATING
  // =====================================================
  const fetchRating = async () => {
    try {
      setLoadingRating(true);
      const res = await api.get("/api/ratings/driver/me");
      setRating(res.data.data || { average_rating: 0, total_ratings: 0 });
    } catch (error) {
      console.log("Gagal fetch rating:", error);
      setRating({ average_rating: 0, total_ratings: 0 });
    } finally {
      setLoadingRating(false);
    }
  };

  // =====================================================
  // FETCH UNREAD COUNT (CHAT)
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
  // TAKE ORDER (AMBIL ORDER)
  // =====================================================
  const handleTakeOrder = async (id) => {
    showConfirm(
      "Ambil Pesanan",
      "Ambil pesanan? Pesanan akan ditandai sebagai 'dikirim'",
      async () => {
        setConfirmState((prev) => ({ ...prev, loading: true }));
        try {
          await api.put(`/api/driver/orders/${id}/take`);
          success("Pesanan berhasil diambil");
          fetchOrders();
          closeConfirm();
        } catch (error) {
          error(error.response?.data?.message || "Gagal mengambil pesanan");
          setConfirmState((prev) => ({ ...prev, loading: false }));
        }
      }
    );
  };

  // =====================================================
  // FINISH ORDER
  // =====================================================
  const handleSelesai = async (id) => {
    showConfirm(
      "Selesaikan Pesanan",
      "Selesaikan pesanan? Pesanan akan ditandai selesai",
      async () => {
        setConfirmState((prev) => ({ ...prev, loading: true }));
        try {
          await api.put(`/api/driver/orders/${id}/finish`);
          success("Pesanan selesai");
          fetchOrders();
          fetchCommissions();
          fetchRating();
          closeConfirm();
        } catch (error) {
          error(error.response?.data?.message || "Gagal menyelesaikan pesanan");
          setConfirmState((prev) => ({ ...prev, loading: false }));
        }
      }
    );
  };

  // =====================================================
  // SOCKET SETUP & INIT
  // =====================================================
  useEffect(() => {
    initSocket();

    if (profile?.id) {
      socket.emit("join-user", profile.id);
    }

    fetchUnreadCounts();

    const interval = setInterval(fetchUnreadCounts, 10000);

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
  }, [profile?.id]);

  // =====================================================
  // INITIAL FETCH
  // =====================================================
  useEffect(() => {
    fetchProfile();
    fetchOrders();
    fetchCommissions();
    fetchRating();
  }, []);

  // =====================================================
  // KOMISI
  // =====================================================
  const totalKomisi = commissions.reduce(
    (acc, item) => acc + Number(item.commission),
    0
  );

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  // =====================================================
  // RENDER BINTANG RATING
  // =====================================================
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400 text-lg">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="text-yellow-400 text-lg">½</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span
            key={`empty-${i}`}
            className="text-zinc-300 dark:text-zinc-600 text-lg"
          >
            ★
          </span>
        ))}
        <span className="text-xs text-zinc-500 ml-1">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  // =====================================================
  // DELETE DRIVER ACCOUNT
  // =====================================================
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteDriverAccount = async () => {
    // Cek apakah driver sedang mengirim order
    const hasActiveDelivery = orders.some(
      (o) => o.status_pengambilan === "dikirim"
    );
    
    if (hasActiveDelivery) {
      setDeleteError(
        "Akun tidak dapat dihapus karena masih ada pesanan yang sedang dikirim."
      );
      error("Masih ada pesanan yang sedang dikirim.");
      return;
    }
  
    const hasDriverHistory = orders.length > 0;
    const deleteType = hasDriverHistory 
      ? "soft delete (riwayat pesanan tetap tersimpan)" 
      : "hapus permanen";
  
    showConfirm(
      "Hapus Akun Driver",
      `Akun driver Anda akan ${deleteType}. Apakah Anda yakin?`,
      async () => {
        setDeleteLoading(true);
        try {
          const response = await api.delete(`/api/users/delete/${profile.id}`);
          
          if (response.data.success) {
            // HAPUS TOKEN
            localStorage.removeItem('token');            
            success(response.data.message);
            navigate("/");
          } else {
            throw new Error(response.data.message || "Gagal menghapus akun");
          }
        } catch (err) {
          console.error("Delete driver account error:", err);
          setDeleteError(err.response?.data?.message || "Gagal menghapus akun.");
          error(err.response?.data?.message || "Gagal menghapus akun.");
          setDeleteLoading(false);
        }
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mb-1">
          Driver Dashboard
        </p>
        <h1 className="text-3xl font-light text-zinc-900 dark:text-white">
          Home Driver
        </h1>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* PROFILE */}
        <div className="xl:col-span-1 bg-book-card-light border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-6">
            Profile Driver
          </h2>

          {loadingProfile ? (
            <div className="space-y-3">
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
                  Nama
                </p>
                <p className="text-zinc-900 dark:text-white">{profile?.nama}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
                  Email
                </p>
                <p className="text-zinc-900 dark:text-white">
                  {profile?.email}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
                  Rating Driver
                </p>
                {loadingRating ? (
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 animate-pulse w-32" />
                ) : (
                  <div>
                    {renderStars(rating.average_rating)}
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Dari {rating.total_ratings} ulasan
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
                  Total Komisi
                </p>
                <p className="text-2xl font-semibold text-emerald-600">
                  {formatRupiah(totalKomisi)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ORDER */}
        <div className="xl:col-span-2 bg-book-card-light border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Order Aktif
            </h2>
          </div>

          {loadingOrders ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-500">
              Tidak ada order aktif
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium">Kode</th>
                    <th className="text-left px-6 py-4 font-medium">Alamat</th>
                    <th className="text-left px-6 py-4 font-medium">Total</th>
                    <th className="text-left px-6 py-4 font-medium">Status</th>
                    <th className="text-right px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-zinc-200 dark:border-zinc-800"
                    >
                      <td className="px-6 py-4">{order.kode_pesanan}</td>
                      <td className="px-6 py-4 max-w-60 truncate">
                        {order.alamat}
                      </td>
                      <td className="px-6 py-4">
                        {formatRupiah(order.total_harga)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge badge-amber">
                          {order.metode_pembayaran}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {/* 🔥 TOMBOL AMBIL ORDER (hanya untuk status pending) */}
                          {order.status_pengambilan === "pending" && (
                            <button
                              onClick={() => handleTakeOrder(order.id)}
                              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
                            >
                              Ambil Order
                            </button>
                          )}

                          {/* 🔥 TOMBOL SELESAI (hanya untuk status dikirim) */}
                          {order.status_pengambilan === "dikirim" && (
                            <>
                              <button
                                onClick={() => handleSelesai(order.id)}
                                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                              >
                                Selesaikan
                              </button>

                              {/* 🔥 TOMBOL CHAT */}
                              <button
                                onClick={() => setChatOrder(order)}
                                className="relative px-3 py-1 text-xs bg-indigo-500 rounded hover:bg-indigo-600 flex items-center gap-1 cursor-pointer"
                              >
                                💬 Chat
                                {unreadCounts[order.id] > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                    {unreadCounts[order.id]}
                                  </span>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* ── HAPUS AKUN DRIVER ── */}
        <div className="mt-8 bg-book-card-light border border-red-200 dark:border-red-900/50 p-5 space-y-3">
          <h3 className="text-sm font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
            Hapus Akun Driver
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Akun yang dihapus tidak dapat dipulihkan. Penghapusan hanya bisa
            dilakukan jika tidak ada pesanan yang sedang dikirim.
          </p>
          {deleteError && (
            <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2">
              {deleteError}
            </p>
          )}
          <button
            onClick={handleDeleteDriverAccount}
            disabled={deleteLoading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-widest font-medium transition-colors rounded-none disabled:opacity-50 cursor-pointer"
          >
            {deleteLoading ? "Menghapus..." : "Hapus Akun Driver"}
          </button>
        </div>
      </div>

      {/* Modal Chat */}
      {chatOrder && (
        <ChatModal
          orderId={chatOrder.id}
          userId={profile?.id}
          driverId={profile?.id}
          orderStatus={chatOrder.status_pengambilan}
          onClose={() => {
            setChatOrder(null);
            fetchUnreadCounts();
          }}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
        loading={confirmState.loading}
      />
    </div>
  );
};

export default HomeDriver;
