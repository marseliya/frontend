import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/ToastAlert";
import ConfirmModal from "../../components/ConfirmModal";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconUsers = () => (
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
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </svg>
);
const IconBooks = () => (
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
      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
    />
  </svg>
);
const IconOrders = () => (
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
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
    />
  </svg>
);
const IconVouchers = () => (
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
      d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
    />
  </svg>
);
const IconArrow = () => (
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
      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
    />
  </svg>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ children, color = "zinc" }) => (
  <span className={`badge badge-${color}`}>{children}</span>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, count, action }) => (
  <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-700">
    <div className="flex items-center gap-3">
      <h2 className="text-xs uppercase tracking-widest font-semibold">
        {title}
      </h2>
      {count !== undefined && (
        <span className="text-[10px] uppercase tracking-widest px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 text-zinc-500">
          {count} total
        </span>
      )}
    </div>
    {action}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
const TABS = [
  { key: "users", label: "Pengguna", icon: <IconUsers /> },
  { key: "books", label: "Buku", icon: <IconBooks /> },
  { key: "orders", label: "Pesanan", icon: <IconOrders /> },
  { key: "vouchers", label: "Voucher", icon: <IconVouchers /> },
];

const HomeAdmin = () => {
  const navigate = useNavigate();
  const { success, error, warning, info } = useToast();
  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [counts, setCounts] = useState({
    users: 0,
    books: 0,
    orders: 0,
    vouchers: 0,
  });
  const [loading, setLoading] = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchTab = async (tab) => {
    setLoading(true);
    try {
      const endpointMap = {
        users: "/api/users",
        books: "/api/books",
        orders: "/api/orders",
        vouchers: "/api/vouchers",
      };

      const res = await api.get(`${endpointMap[tab]}?limit=4&page=1`);
      let data = [];
      let total = 0;

      if (tab === "users") {
        data = res.data.data || [];
        total = res.data.total_data || data.length;
        setUsers(data);
        setCounts((p) => ({ ...p, users: total }));
      }
      if (tab === "books") {
        data = res.data.data || [];
        total = res.data.total_data || data.length;
        setBooks(data);
        setCounts((p) => ({ ...p, books: total }));
      }
      if (tab === "orders") {
        data = res.data.data || [];
        total = res.data.total_data || data.length;
        setOrders(data);
        setCounts((p) => ({ ...p, orders: total }));
      }
      if (tab === "vouchers") {
        data = res.data.data || [];
        total = res.data.total_data || data.length;
        setVouchers(data);
        setCounts((p) => ({ ...p, vouchers: total }));
      }
    } catch (err) {
      console.error(err);
      error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTab(activeTab);
  }, [activeTab]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const formatRupiah = (v) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(v ?? 0);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  // ── Tab renderers ───────────────────────────────────────────────────────────
  const renderUsers = () => (
    <div>
      <SectionHeader
        title="Pengguna Terdaftar"
        count={counts.users}
        action={
          <button
            onClick={() => navigate("/kelola-user")}
            className="btn-ghost flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-3 py-1.5 transition-colors cursor-pointer"
          >
            Kelola Semua <IconArrow />
          </button>
        }
      />
      {loading ? (
        <Skeleton />
      ) : users.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between px-4 py-3 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors bg-book-card-light"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-xs font-semibold shrink-0">
                  {u.nama?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.nama}</p>
                  <p className="text-xs text-zinc-500 font-mono truncate">
                    {u.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <Badge color={u.role === "ADMIN" ? "purple" : "zinc"}>
                  {u.role}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );  
  
  const renderBooks = () => (
    <div>
      <SectionHeader
        title="Koleksi Buku"
        count={counts.books}
        action={
          <button
            onClick={() => navigate("/kelola-buku")}
            className="btn-ghost flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-3 py-1.5 transition-colors cursor-pointer"
          >
            Kelola Semua <IconArrow />
          </button>
        }
      />
      {loading ? (
        <Skeleton />
      ) : books.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {books.map((b) => (
            <div
              key={b.id}
              className="flex gap-3 p-3 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors bg-book-card-light"
            >
              <div className="w-12 h-16 shrink-0 bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 overflow-hidden">
                {b.cover ? (
                  <img
                    src={b.cover}
                    alt={b.judul}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-400 uppercase tracking-wider">
                    No img
                  </div>
                )}
              </div>
              <div className="min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <p className="text-sm font-medium truncate">{b.judul}</p>
                  <p className="text-xs text-zinc-500 italic truncate">
                    {b.penulis}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono">
                    {formatRupiah(b.harga)}
                  </span>
                  <Badge color={b.stok > 0 ? "green" : "red"}>
                    Stok: {b.stok}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 text-center">
        <button
          onClick={() => navigate("/kelola-buku")}
          className="btn-ghost text-[10px] uppercase tracking-widest underline underline-offset-4 transition-colors cursor-pointer"
        >
          Lihat semua {counts.books} buku →
        </button>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div>
      <SectionHeader
        title="Pesanan"
        count={counts.orders}
        action={
          <button
            onClick={() => navigate("/kelola-order")}
            className="btn-ghost flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-3 py-1.5 transition-colors cursor-pointer"
          >
            Kelola Semua <IconArrow />
          </button>
        }
      />
      {loading ? (
        <Skeleton />
      ) : orders.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between px-4 py-3 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors bg-book-card-light"
            >
              <div className="min-w-0">
                <p className="text-xs font-mono font-medium">
                  {o.kode_pesanan}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {formatDate(o.created_at)}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-widest">
                  {o.metode_pengambilan}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-xs font-mono">
                  {formatRupiah(o.total_harga)}
                </span>
                <Badge
                  color={
                    o.status_pembayaran === "selesai"
                      ? "green"
                      : o.status_pembayaran === "gagal"
                      ? "red"
                      : "amber"
                  }
                >
                  {o.status_pembayaran}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVouchers = () => (
    <div>
      <SectionHeader
        title="Voucher"
        count={counts.vouchers}
        action={
          <button
            onClick={() => navigate("/kelola-voucher")}
            className="btn-ghost flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-3 py-1.5 transition-colors cursor-pointer"
          >
            Kelola Semua <IconArrow />
          </button>
        }
      />
      {loading ? (
        <Skeleton />
      ) : vouchers.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className="p-4 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors bg-book-card-light relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-zinc-900 dark:bg-zinc-100" />
              <p className="text-sm font-medium truncate pr-3">
                {v.nama_vouchers}
              </p>
              <p className="text-xs font-mono text-zinc-500 mt-1">
                {v.tipe_vouchers === "percent"
                  ? `${v.nilai}%`
                  : formatRupiah(v.nilai)}{" "}
                diskon
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge color={v.is_active ? "green" : "zinc"}>
                  {v.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
                <Badge color="zinc">{v.tipe_vouchers}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 text-center">
        <button
          onClick={() => navigate("/kelola-voucher")}
          className="btn-ghost text-[10px] uppercase tracking-widest underline underline-offset-4 transition-colors cursor-pointer"
        >
          Kelola semua {counts.vouchers} voucher →
        </button>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <p className="text-[10px] tracking-widest uppercase text-zinc-500 mb-1">
          Panel Kontrol
        </p>
        <h1 className="text-2xl font-light tracking-tight">
          Dasbor Administrator
        </h1>
      </div>

      {/* Tab Navbar */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-700 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-widest font-medium whitespace-nowrap transition-colors border-b-2 -mb-px cursor-pointer
              ${
                activeTab === tab.key
                  ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
          >
            {tab.icon}
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                  ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-book-card-light border border-zinc-200 dark:border-zinc-800 p-6">
        {activeTab === "users" && renderUsers()}
        {activeTab === "books" && renderBooks()}
        {activeTab === "orders" && renderOrders()}
        {activeTab === "vouchers" && renderVouchers()}
      </div>
    </div>
  );
};

// ─── Skeleton & Empty ─────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="h-14 bg-zinc-200 dark:bg-zinc-700 animate-pulse"
      />
    ))}
  </div>
);

const Empty = () => (
  <div className="text-center py-16 text-xs uppercase tracking-widest text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-700">
    Tidak ada data
  </div>
);

export default HomeAdmin;