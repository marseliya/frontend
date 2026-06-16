import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/ToastAlert";
import ConfirmModal from "../../components/ConfirmModal";

// ─────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// BADGE (Menggunakan class utilitas .badge dari CSS global)
// ─────────────────────────────────────────────────────────────
const Badge = ({ children, color = "zinc" }) => {
  const colorMap = {
    zinc: "badge-zinc",
    green: "badge-green",
    red: "badge-red",
    amber: "badge-amber",
    blue: "badge-blue",
  };
  return <span className={`badge ${colorMap[color] || "badge-zinc"}`}>{children}</span>;
};

// ─────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, size = "max-w-xl" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
    <div className={`w-full ${size} bg-book-card-light border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-book-card-light z-10">
        <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-500">{title}</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xl cursor-pointer">×</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// FORM COMPONENTS
// ─────────────────────────────────────────────────────────────
const FormInput = ({ label, required, ...props }) => (
  <div>
    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2 block">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
    <input className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors" {...props} />
  </div>
);

const FormSelect = ({ label, required, children, ...props }) => (
  <div>
    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2 block">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
    <select className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors [&>option]:bg-book-card-light [&>option]:text-inherit" {...props}>{children}</select>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const AdminOrders = () => {
  const { success, error, warning, info } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [editOrderForm, setEditOrderForm] = useState({ status_pengambilan: "", tanggal_pengambilan: "", catatan: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [modalOrder, setModalOrder] = useState(false);
  
  // Confirm modal state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    loading: false,
  });

  const defaultItem = { book_id: "", qty: 1 };
  const defaultOrderForm = {
    user_id: "",
    metode_pembayaran: "",
    metode_pengambilan: "ambil sendiri",
    tanggal_pengambilan: "",
    items: [{ ...defaultItem }],
  };
  const [orderForm, setOrderForm] = useState({ ...defaultOrderForm, items: [{ ...defaultItem }] });
  const [orderLoading, setOrderLoading] = useState(false);

  const limit = 15;

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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/orders", {
        params: { page, limit, search: search || undefined },
      });
      setOrders(res.data.data || []);
      setTotalData(res.data.total_data || 0);
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search]);

  const handleEditOrder = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      await api.put(`/api/orders/update/${editOrder.id}`, {
        status_pembayaran: editOrderForm.status_pembayaran,   
        status_pengambilan: editOrderForm.status_pengambilan,
        tanggal_pengambilan: editOrderForm.tanggal_pengambilan || undefined,
        catatan: editOrderForm.catatan || undefined,
      });
      success("Pesanan berhasil diupdate");
      setEditOrder(null);
      fetchOrders();
    } catch (err) {
      error(err.response?.data?.message || err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    try {
      const validItems = orderForm.items.filter(item => item.book_id && item.qty > 0);
      if (validItems.length === 0) {
        warning("Tambahkan minimal 1 buku.");
        setOrderLoading(false);
        return;
      }
      const payload = {
        user_id: orderForm.user_id ? parseInt(orderForm.user_id) : undefined,
        metode_pembayaran: orderForm.metode_pembayaran,
        metode_pengambilan: orderForm.metode_pengambilan,
        tanggal_pengambilan: orderForm.tanggal_pengambilan || undefined, // ← tambah ini
        items: validItems.map(item => ({ book_id: parseInt(item.book_id), qty: parseInt(item.qty) })),
      };
      await api.post("/api/orders/create", payload);
      success("Pesanan berhasil dibuat.");
      setOrderForm({ ...defaultOrderForm, items: [{ ...defaultItem }] });
      setModalOrder(false);
      fetchOrders();
    } catch (err) {
      error(err.response?.data?.message || err.message);
    } finally {
      setOrderLoading(false);
    }
  };

  const addItem = () => setOrderForm(p => ({ ...p, items: [...p.items, { ...defaultItem }] }));
  const removeItem = (idx) => setOrderForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, field, value) => setOrderForm(p => ({ ...p, items: p.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));

  const formatRupiah = (v) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v ?? 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  const totalPages = Math.ceil(totalData / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={() => window.history.back()} className="flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mb-2 transition-colors cursor-pointer">
            <IconArrowLeft /> Kembali
          </button>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Manajemen</p>
          <h1 className="text-3xl font-light">Kelola Pesanan</h1>
        </div>
        <button onClick={() => setModalOrder(true)} className="btn-outline flex items-center gap-2 px-6 py-2.5 border text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer">
          <IconPlus /> Buat Order
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari pesanan berdasarkan kode pesanan..."
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:border-zinc-900 dark:focus:border-white text-sm"
        />
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-zinc-200 dark:bg-zinc-800/50 animate-pulse border border-zinc-300 dark:border-zinc-700" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 py-20 text-center text-xs uppercase tracking-[0.2em] text-zinc-500">
          Tidak ada pesanan
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-4 py-3 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition bg-book-card-light">
                <div className="min-w-0">
                  <p className="text-xs font-mono font-medium">{o.kode_pesanan}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{formatDate(o.created_at)}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-widest">{o.metode_pengambilan}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-xs font-mono font-medium">{formatRupiah(o.total_harga)}</span>
                  <Badge color={o.status_pembayaran === "selesai" ? "green" : o.status_pembayaran === "gagal" ? "red" : "amber"}>{o.status_pembayaran}</Badge>
                  <button onClick={() => setSelectedOrder(o)} className="btn-outline px-3 py-1.5 border text-[10px] uppercase tracking-widest font-medium transition cursor-pointer">
                    Detail
                  </button>
                  {o.metode_pengambilan === "ambil sendiri" && 
                    !(o.status_pembayaran === "selesai" && o.status_pengambilan === "selesai") && (
                    <button onClick={() => { setEditOrder(o); setEditOrderForm({ status_pengambilan: o.status_pengambilan, tanggal_pengambilan: o.tanggal_pengambilan ? new Date(o.tanggal_pengambilan).toISOString().slice(0, 16) : "", catatan: o.catatan || "" }); }} className="btn-outline px-3 py-1.5 border text-[10px] uppercase tracking-widest font-medium transition cursor-pointer">
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline px-4 py-2 border text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">
                Prev
              </button>
              <span className="text-sm tracking-wide">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-outline px-4 py-2 border text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL DETAIL ORDER */}
      {selectedOrder && (
        <Modal title="Detail Pesanan" onClose={() => setSelectedOrder(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div><p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Kode Pesanan</p><p className="text-base font-semibold font-mono">{selectedOrder.kode_pesanan}</p></div>
              <Badge color={selectedOrder.status_pembayaran === "selesai" ? "green" : selectedOrder.status_pembayaran === "gagal" ? "red" : "amber"}>{selectedOrder.status_pembayaran}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[["User ID", selectedOrder.user_id], ["Total Harga", formatRupiah(selectedOrder.total_harga)], ["Metode Bayar", selectedOrder.metode_pembayaran || "-"], ["Metode Ambil", selectedOrder.metode_pengambilan], ["Status Ambil", selectedOrder.status_pengambilan], ["Tgl Pengambilan", formatDate(selectedOrder.tanggal_pengambilan)], ["Dibuat", formatDate(selectedOrder.created_at)]].map(([k, v]) => (
                <div key={k}><p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">{k}</p><p className="text-sm font-medium">{v}</p></div>
              ))}
            </div>
            {selectedOrder.alamat && (<div><p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Alamat</p><p className="text-sm font-medium">{selectedOrder.alamat}</p></div>)}
            {selectedOrder.catatan && (<div><p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Catatan</p><p className="text-sm font-medium">{selectedOrder.catatan}</p></div>)}
          </div>
        </Modal>
      )}

      {/* MODAL EDIT ORDER */}
      {editOrder && (
        <Modal title="Edit Pesanan" onClose={() => setEditOrder(null)} size="max-w-xl">
          <form onSubmit={handleEditOrder} className="space-y-4">
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/30">
              <div><p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Kode Pesanan</p><p className="font-mono text-sm font-semibold">{editOrder.kode_pesanan}</p></div>
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Metode Pembayaran</p><p className="text-sm font-medium">{editOrder.metode_pembayaran}</p></div>
                <div><p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Metode Pengambilan</p><p className="text-sm font-medium">{editOrder.metode_pengambilan}</p></div>
              </div>
            </div>
            <FormSelect label="Status Pengambilan" value={editOrderForm.status_pengambilan} onChange={(e) => setEditOrderForm(p => ({ ...p, status_pengambilan: e.target.value }))}>
              <option value="pending">Pending</option>
              <option value="selesai">Selesai</option>
            </FormSelect>
            {editOrderForm.status_pengambilan === "selesai" && (
              <div className="text-[11px] text-zinc-500 border border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-zinc-50/30">ℹ️ Status pembayaran akan otomatis berubah menjadi <strong>selesai</strong> saat pengambilan selesai.</div>
            )}
            <FormInput label="Tanggal Pengambilan" type="datetime-local" value={editOrderForm.tanggal_pengambilan} onChange={(e) => setEditOrderForm(p => ({ ...p, tanggal_pengambilan: e.target.value }))} />
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Catatan</label>
              <textarea rows={3} value={editOrderForm.catatan} onChange={(e) => setEditOrderForm(p => ({ ...p, catatan: e.target.value }))} className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-white resize-none" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={editLoading} className="btn-outline px-6 py-2 text-xs uppercase tracking-widest font-medium border transition disabled:opacity-50 cursor-pointer">
                {editLoading ? "Menyimpan..." : "Update Pesanan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL BUAT ORDER */}
      {modalOrder && (
        <Modal title="Buat Pesanan Baru" onClose={() => setModalOrder(false)} size="max-w-2xl">
          <form onSubmit={handleOrderSubmit} className="space-y-5">
            <FormInput label="User ID" required type="number" min="1" placeholder="ID pengguna yang memesan" value={orderForm.user_id} onChange={(e) => setOrderForm(p => ({ ...p, user_id: e.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect label="Metode Pembayaran" required value={orderForm.metode_pembayaran} onChange={(e) => setOrderForm(p => ({ ...p, metode_pembayaran: e.target.value }))}>
                <option value="">Pilih metode</option><option value="cash">Tunai</option><option value="debit">Transfer Bank (Debit)</option>
              </FormSelect>
              <FormSelect label="Metode Pengambilan" value={orderForm.metode_pengambilan} onChange={(e) => setOrderForm(p => ({ ...p, metode_pengambilan: e.target.value }))}>
                <option value="ambil sendiri">Ambil Sendiri</option><option value="diantar">Diantar</option>
              </FormSelect>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Daftar Buku <span className="text-red-400">*</span></label>
                <button type="button" onClick={addItem} className="btn-outline flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 border transition cursor-pointer">+ Tambah Buku</button>
              </div>
              {orderForm.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/20 dark:bg-zinc-950/10">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Book ID</label>
                    <input type="number" required min="1" placeholder="ID buku" value={item.book_id} onChange={(e) => updateItem(idx, "book_id", e.target.value)} className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-white mt-1" />
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Jumlah</label>
                    <input type="number" required min="1" value={item.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-white mt-1" />
                  </div>
                  {orderForm.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="btn-danger p-3 border transition cursor-pointer">🗑</button>
                  )}
                </div>
              ))}
            </div>
            <FormInput label="Tanggal Pengambilan" type="datetime-local" value={orderForm.tanggal_pengambilan} onChange={(e) => setOrderForm(p => ({ ...p, tanggal_pengambilan: e.target.value }))} />
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={orderLoading} className="btn-outline px-8 py-2.5 text-xs uppercase tracking-widest font-medium border transition disabled:opacity-50 cursor-pointer">
                {orderLoading ? "Menyimpan..." : "Buat Pesanan"}
              </button>
            </div>
          </form>
        </Modal>
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

export default AdminOrders;