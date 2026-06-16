import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/ToastAlert";
import ConfirmModal from "../../components/ConfirmModal";

// ─────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────
const IconTrash = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
    />
  </svg>
);

const IconArrowLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────────────────────
const Badge = ({ children, color = "zinc" }) => {
  const colorMap = {
    zinc: "badge-zinc",
    purple: "badge-purple",
    green: "badge-green",
    amber: "badge-amber",
    red: "badge-red",
  };

  return (
    <span className={`badge ${colorMap[color] || "badge-zinc"}`}>
      {children}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
  >
    <div className="w-full max-w-2xl bg-book-card-light border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-book-card-light z-10">
        <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-500">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xl cursor-pointer"
        >
          ×
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const AdminUsers = () => {
  const { success, error, warning, info } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userOrdersLoading, setUserOrdersLoading] = useState(false);

  const [driverStats, setDriverStats] = useState(null);
  const [driverOrders, setDriverOrders] = useState([]);
  const [driverStatsLoading, setDriverStatsLoading] = useState(false);

  const limit = 15;

  // ── CONFIRM MODAL STATE ──────────────────────────────────
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    loading: false,
  });

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

  // ── FETCH ────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/users", {
        params: { page, limit, search: search || undefined },
      });
      setUsers(res.data.data || []);
      setTotalData(res.data.total_data || 0);
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId) => {
    try {
      setUserOrdersLoading(true);
      const res = await api.get(`/api/orders/user/${userId}`);
      setUserOrders(res.data.data || res.data.orders || []);
    } catch (err) {
      console.log(err);
      setUserOrders([]);
    } finally {
      setUserOrdersLoading(false);
    }
  };

  const fetchDriverData = async (driverId) => {
    try {
      setDriverStatsLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        api.get(`/api/ratings/driver/${driverId}/stats`),
        api.get(`/api/orders/driver/${driverId}`),
      ]);
      setDriverStats(statsRes.data.data || null);
      setDriverOrders(ordersRes.data.data || []);
    } catch (err) {
      console.log(err);
      setDriverStats(null);
      setDriverOrders([]);
    } finally {
      setDriverStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

// ── DELETE USER ──────────────────────────────────────────
const handleDeleteUser = async (id, nama) => {
  // Cek apakah user punya order aktif
  try {
    const res = await api.get(`/api/orders/user/${id}`);
    const userOrderList = res.data.data || res.data.orders || [];
    const hasActiveOrder = userOrderList.some(
      (o) =>
        o.status_pembayaran !== "selesai" ||
        o.status_pengambilan !== "selesai"
    );
    if (hasActiveOrder) {
      warning("Pengguna masih memiliki pesanan yang belum selesai.");
      return;
    }
  } catch (err) {
    console.log("Gagal cek pesanan:", err);
  }

  // Cek apakah user pernah order (untuk menentukan soft/hard delete)
  let hasOrderHistory = false;
  let hasDriverHistory = false;
  
  try {
    // Cek order sebagai user
    const orderRes = await api.get(`/api/orders/user/${id}`);
    const orders = orderRes.data.data || orderRes.data.orders || [];
    hasOrderHistory = orders.length > 0;
    
    // Cek order sebagai driver
    const driverRes = await api.get(`/api/orders/driver/${id}`);
    const driverOrders = driverRes.data.data || driverRes.data.orders || [];
    hasDriverHistory = driverOrders.length > 0;
  } catch (err) {
    console.log("Gagal cek riwayat:", err);
  }

  const deleteType = (hasOrderHistory || hasDriverHistory) 
    ? "soft delete (riwayat akan tetap tersimpan)" 
    : "hapus permanen";

  showConfirm(
    "Hapus Pengguna",
    `"${nama}" akan ${deleteType}. Apakah Anda yakin?`,
    async () => {
      setConfirmState((prev) => ({ ...prev, loading: true }));
      try {
        await api.delete(`/api/users/delete/${id}`);
        success(`Pengguna berhasil ${hasOrderHistory || hasDriverHistory ? 'dihapus (riwayat tetap ada)' : 'dihapus permanen'}`);
        closeConfirm();
        fetchUsers();
      } catch (err) {
        error(err.response?.data?.message || err.message);
        setConfirmState((prev) => ({ ...prev, loading: false }));
      }
    }
  );
};

  // ── HELPERS ──────────────────────────────────────────────
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";
  const formatRupiah = (v) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(v ?? 0);

  const totalPages = Math.ceil(totalData / limit);

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mb-2 transition-colors cursor-pointer"
          >
            <IconArrowLeft /> Kembali
          </button>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1">
            Manajemen
          </p>
          <h1 className="text-3xl font-light">Kelola Pengguna</h1>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari pengguna berdasarkan nama..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:border-zinc-900 dark:focus:border-white text-sm"
        />
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-zinc-200 dark:bg-zinc-800/50 animate-pulse border border-zinc-300 dark:border-zinc-700"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 py-20 text-center text-xs uppercase tracking-[0.2em] text-zinc-500">
          Tidak ada pengguna
        </div>
      ) : (
        <>
          {/* USER LIST */}
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between px-4 py-3 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition bg-book-card-light"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {u.nama?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{u.nama}</p>
                    <p className="text-xs text-zinc-500 font-mono line-clamp-1">
                      {u.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Badge color={u.role === "ADMIN" ? "purple" : "zinc"}>
                    {u.role}
                  </Badge>
                  {u.role !== "ADMIN" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          if (u.role === "DRIVER") {
                            fetchDriverData(u.id);
                          } else {
                            fetchUserOrders(u.id);
                          }
                        }}
                        className="btn-outline px-3 py-1.5 border text-[10px] uppercase tracking-widest font-medium transition cursor-pointer"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.nama)}
                        className="btn-danger p-1.5 border transition cursor-pointer"
                      >
                        <IconTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-outline px-4 py-2 border text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Prev
              </button>
              <span className="text-sm tracking-wide">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-outline px-4 py-2 border text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL DETAIL USER */}
      {selectedUser && (
        <Modal
          title="Detail Pengguna"
          onClose={() => {
            setSelectedUser(null);
            setDriverStats(null);
            setDriverOrders([]);
            setUserOrders([]);
          }}
        >
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="w-14 h-14 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xl font-semibold shrink-0">
                {selectedUser.nama?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="text-base font-medium">{selectedUser.nama}</p>
                <p className="text-xs text-zinc-500 font-mono">
                  {selectedUser.email}
                </p>
                <div className="mt-1.5">
                  <Badge
                    color={selectedUser.role === "ADMIN" ? "purple" : "zinc"}
                  >
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ["ID Pengguna", selectedUser.id],
                ["Nomor HP", selectedUser.nomor_hp || "-"],
                ["Status Akun", selectedUser.is_active ? "Aktif" : "Nonaktif"],
                ["Tanggal Bergabung", formatDate(selectedUser.created_at)],
                ["Alamat", selectedUser.alamat || "-"],
              ].map(([k, v]) => (
                <div key={k} className={k === "Alamat" ? "sm:col-span-2" : ""}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
                    {k}
                  </p>
                  <p className="text-sm font-medium">{v}</p>
                </div>
              ))}
            </div>

            {/* DRIVER SECTION */}
            {selectedUser.role === "DRIVER" ? (
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                <p className="text-xs uppercase tracking-widest font-semibold">
                  Rating Driver
                </p>
                {driverStatsLoading ? (
                  <div className="h-16 bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                ) : driverStats ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-light">
                        {driverStats.average_rating.toFixed(1)}
                      </span>
                      <div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className={`text-lg ${
                                s <= Math.round(driverStats.average_rating)
                                  ? "text-yellow-400"
                                  : "text-zinc-300 dark:text-zinc-600"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-zinc-500">
                          dari {driverStats.total_ratings} ulasan
                        </p>
                      </div>
                    </div>
                    {/* Distribusi */}
                    <div className="space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div
                          key={star}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="w-4 text-zinc-500">{star}</span>
                          <span className="text-yellow-400 text-sm">★</span>
                          <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700">
                            <div
                              className="h-full bg-yellow-400"
                              style={{
                                width:
                                  driverStats.total_ratings > 0
                                    ? `${
                                        (driverStats.distribution[star] /
                                          driverStats.total_ratings) *
                                        100
                                      }%`
                                    : "0%",
                              }}
                            />
                          </div>
                          <span className="w-4 text-zinc-500 text-right">
                            {driverStats.distribution[star]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">Belum ada rating</p>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-widest font-semibold">
                      Riwayat Pengiriman
                    </p>
                    <Badge color="zinc">{driverOrders.length} Order</Badge>
                  </div>
                  {driverStatsLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-16 bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : driverOrders.length === 0 ? (
                    <div className="text-xs text-zinc-500 text-center py-8 border border-dashed border-zinc-300 dark:border-zinc-700">
                      Belum ada pengiriman
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {driverOrders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-950/30"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs font-mono font-semibold">
                                {order.kode_pesanan}
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                            <span className="text-xs font-mono">
                              {formatRupiah(order.total_harga)}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge
                              color={
                                order.status_pengambilan === "selesai"
                                  ? "green"
                                  : order.status_pengambilan === "dikirim"
                                  ? "blue"
                                  : "amber"
                              }
                            >
                              {order.status_pengambilan}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* CUSTOMER SECTION */
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-widest font-semibold">
                    Riwayat Pesanan
                  </p>
                  <Badge color="zinc">{userOrders.length} Order</Badge>
                </div>

                {userOrdersLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-zinc-200 dark:bg-zinc-800/50 animate-pulse border border-zinc-200 dark:border-zinc-800"
                      />
                    ))}
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="text-xs text-zinc-500 text-center py-8 border border-dashed border-zinc-300 dark:border-zinc-700">
                    Belum ada pesanan dari pengguna ini
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {userOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-950/30"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-mono font-semibold">
                              {order.kode_pesanan}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <span className="text-xs font-mono font-medium">
                            {formatRupiah(order.total_harga)}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <Badge
                            color={
                              order.status_pembayaran === "selesai"
                                ? "green"
                                : "amber"
                            }
                          >
                            Bayar: {order.status_pembayaran}
                          </Badge>
                          <Badge
                            color={
                              order.status_pengambilan === "selesai"
                                ? "green"
                                : order.status_pengambilan === "diproses"
                                ? "purple"
                                : "zinc"
                            }
                          >
                            Ambil: {order.status_pengambilan}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* CONFIRM MODAL */}
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

export default AdminUsers;