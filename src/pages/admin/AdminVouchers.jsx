import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastAlert";
import ConfirmModal from "../../components/ConfirmModal";

const defaultForm = {
  nama_vouchers: "",
  tipe_vouchers: "percent",
  nilai: "",
  stok: 1,
  max_usage_per_user: 1,
  tanggal_mulai: "",
  tanggal_selesai: "",
  is_active: true,
};

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

const Badge = ({ children, color = "zinc" }) => {
  const colors = {
    zinc: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
    green:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    purple:
      "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    red: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  };

  return (
    <span
      className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 border font-mono ${colors[color]}`}
    >
      {children}
    </span>
  );
};

const VoucherModal = ({
  open,
  onClose,
  form,
  setForm,
  onSubmit,
  loading,
  mode,
}) => {
  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      <div className="bg-book-card-light border border-zinc-200 dark:border-zinc-800 w-full max-w-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-500">
            {mode === "create" ? "Tambah Voucher" : "Edit Voucher"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xl cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500">
              Nama Voucher
            </label>
            <input
              type="text"
              name="nama_vouchers"
              value={form.nama_vouchers}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500">
                Tipe Voucher
              </label>
              <select
                name="tipe_vouchers"
                value={form.tipe_vouchers}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              >
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500">
                Nilai
              </label>
              <input
                type="number"
                name="nilai"
                value={form.nilai}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500">
                Stok
              </label>
              <input
                type="number"
                name="stok"
                value={form.stok}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500">
                Maksimal per user
              </label>
              <input
                type="number"
                name="max_usage_per_user"
                value={form.max_usage_per_user}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500">
                Tanggal Mulai
              </label>
              <input
                type="datetime-local"
                name="tanggal_mulai"
                value={form.tanggal_mulai}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500">
                Tanggal Selesai
              </label>
              <input
                type="datetime-local"
                name="tanggal_selesai"
                value={form.tanggal_selesai}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Voucher aktif
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer disabled:opacity-50"
            >
              {loading
                ? "Menyimpan..."
                : mode === "create"
                ? "Tambah"
                : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminVouchers = () => {
  const {
    success: toastSuccess,
    error: toastError,
    warning: toastWarning,
    info: toastInfo,
  } = useToast();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const navigate = useNavigate();

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

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/vouchers/");
      setVouchers(res.data.data || []);
    } catch (err) {
      console.log(err);
      toastError("Gagal memuat data voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const openCreate = () => {
    setMode("create");
    setForm(defaultForm);
    setSelectedId(null);
    setModalOpen(true);
  };

  const openEdit = (voucher) => {
    setMode("edit");
    setSelectedId(voucher.id);
    setForm({
      nama_vouchers: voucher.nama_vouchers || "",
      tipe_vouchers: voucher.tipe_vouchers || "percent",
      nilai: voucher.nilai || "",
      stok: voucher.stok || 1,
      max_usage_per_user: voucher.max_usage_per_user || 1,
      tanggal_mulai: voucher.tanggal_mulai
        ? voucher.tanggal_mulai.slice(0, 16)
        : "",
      tanggal_selesai: voucher.tanggal_selesai
        ? voucher.tanggal_selesai.slice(0, 16)
        : "",
      is_active: voucher.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDASI FRONTEND: Tanggal selesai harus >= tanggal mulai
    if (form.tanggal_mulai && form.tanggal_selesai) {
      const mulai = new Date(form.tanggal_mulai);
      const selesai = new Date(form.tanggal_selesai);

      if (selesai < mulai) {
        toastError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai");
        return;
      }
    }
    try {
      setLoading(true);

      const payload = {
        nama_vouchers: form.nama_vouchers,
        tipe_vouchers: form.tipe_vouchers,
        nilai: parseInt(form.nilai) || 0,
        stok: parseInt(form.stok) || 1,
        max_usage_per_user: parseInt(form.max_usage_per_user) || 1,
        tanggal_mulai: form.tanggal_mulai || null,
        tanggal_selesai: form.tanggal_selesai || null,
        is_active: form.is_active,
      };

      if (mode === "create") {
        await api.post("/api/vouchers/create", payload);
        toastSuccess("Voucher berhasil dibuat");
      } else {
        await api.put(`/api/vouchers/update/${selectedId}`, payload);
        toastSuccess("Voucher berhasil diupdate");
      }

      setModalOpen(false);
      fetchVouchers();
    } catch (err) {
      console.error("Full error:", err);
      console.error("Response data:", err.response?.data);
      toastError(err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-zinc-900 dark:text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate("/home-admin")}
            className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mb-2 transition-colors cursor-pointer"
          >
            <IconArrowLeft /> Kembali
          </button>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 dark:text-zinc-400 mb-1">
            Manajemen
          </p>
          <h1 className="text-3xl font-light text-zinc-900 dark:text-white">
            Kelola Voucher
          </h1>
        </div>
        <button
          onClick={openCreate}
          className="px-7 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer"
        >
          Tambah Voucher
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-zinc-200 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : vouchers.length === 0 ? (
        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 py-16 text-center text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Tidak ada voucher
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className="bg-book-card-light border border-zinc-200 dark:border-zinc-800 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-medium text-zinc-900 dark:text-white">
                    {v.nama_vouchers}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {v.tipe_vouchers === "percent"
                      ? `${v.nilai}%`
                      : `Rp ${Number(v.nilai).toLocaleString("id-ID")}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    color={v.tipe_vouchers === "percent" ? "purple" : "green"}
                  >
                    {v.tipe_vouchers}
                  </Badge>
                  <Badge color={v.is_active ? "green" : "red"}>
                    {v.is_active ? "aktif" : "nonaktif"}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <p>
                  Mulai:{" "}
                  {v.tanggal_mulai
                    ? new Date(v.tanggal_mulai).toLocaleDateString("id-ID")
                    : "-"}
                </p>
                <p>
                  Selesai:{" "}
                  {v.tanggal_selesai
                    ? new Date(v.tanggal_selesai).toLocaleDateString("id-ID")
                    : "-"}
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => openEdit(v)}
                  className="px-5 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <VoucherModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        loading={loading}
        mode={mode}
      />
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

export default AdminVouchers;
