import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastAlert";
import ConfirmModal from "../../components/ConfirmModal";

// ─────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// DEFAULT FORM
// ─────────────────────────────────────────────────────────────
const defaultForm = {
  judul: "",
  penulis: "",
  penerbit: "",
  tahun_terbit: "",
  kategori: "",
  deskripsi: "",
  harga: "",
  stok: "",
  cover: "",
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
const AdminBooks = () => {
  const { success, error, warning, info } = useToast();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState(defaultForm);

  const fileRef = useRef(null);

  const [coverType, setCoverType] = useState("url");
  const [coverFile, setCoverFile] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);

  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [search, setSearch] = useState("");

  const limit = 5;

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

  // ───────────────────────────────────────────────────────────
  // FETCH BOOKS
  // ───────────────────────────────────────────────────────────
  const fetchBooks = async (currentPage = page, currentSearch = search) => {
    try {
      setLoading(true);

      const res = await api.get("/api/books", {
        params: {
          page: currentPage,
          limit,
          search: currentSearch,
        },
      });

      setBooks(res.data.data || []);
      setTotalData(res.data.total_data || 0);
    } catch (err) {
      console.log(err);
      error("Gagal memuat data buku");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(page, search);
  }, [page, search]);

  // ───────────────────────────────────────────────────────────
  // HANDLE CHANGE
  // ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCoverFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewCover(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ───────────────────────────────────────────────────────────
  // OPEN ADD
  // ───────────────────────────────────────────────────────────
  const handleAdd = () => {
    setEditId(null);
    setForm(defaultForm);
    setCoverFile(null);
    setPreviewCover(null);
    setCoverType("url");
    setModal(true);
  };

  // ───────────────────────────────────────────────────────────
  // OPEN EDIT - FIXED!
  // ───────────────────────────────────────────────────────────
  const handleEdit = (book) => {
    setEditId(book.id);

    setForm({
      judul: book.judul || "",
      penulis: book.penulis || "",
      penerbit: book.penerbit || "",
      tahun_terbit: book.tahun_terbit || "",
      kategori: book.kategori || "",
      deskripsi: book.deskripsi || "",
      harga: book.harga !== undefined && book.harga !== null ? String(book.harga) : "",
      stok: book.stok !== undefined && book.stok !== null ? String(book.stok) : "",
      cover: book.cover || "",
    });

    setPreviewCover(book.cover || null);

    if (book.cover?.startsWith("http://localhost:3000/uploads")) {
      setCoverType("file");
    } else {
      setCoverType("url");
    }

    setModal(true);
  };

  // ───────────────────────────────────────────────────────────
  // SUBMIT - FIXED! (Kirim semua field seperti ProfileUser)
  // ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // KIRIM SEMUA FIELD (seperti ProfileUser)
      // TAPI dengan parsing yang benar untuk number
      const dataToSend = {
        judul: form.judul || "",
        penulis: form.penulis || "",
        penerbit: form.penerbit || "",
        tahun_terbit: form.tahun_terbit || "",
        kategori: form.kategori || "",
        deskripsi: form.deskripsi || "",
        // PENTING: Parse ke integer untuk stok, float untuk harga
        harga: form.harga ? parseFloat(form.harga) : 0,
        stok: form.stok ? parseInt(form.stok, 10) : 0,
        cover: form.cover || "",
      };

      // Append semua field ke FormData
      Object.keys(dataToSend).forEach((key) => {
        formData.append(key, dataToSend[key]);
      });

      // Handle cover
      if (coverType === "file" && coverFile) {
        formData.append("cover_file", coverFile);
      } else if (coverType === "url" && form.cover) {
        formData.append("cover_url", form.cover);
      }

      // Log untuk debugging
      console.log("Data yang dikirim:", Object.fromEntries(formData));

      if (editId) {
        await api.put(`/api/books/update/${editId}`, formData);
        success("Buku berhasil diupdate");
      } else {
        await api.post("/api/books/create", formData);
        success("Buku berhasil ditambahkan");
      }

      setModal(false);
      fetchBooks();
    } catch (err) {
      console.error("Error detail:", err.response?.data);
      error(err.response?.data?.message || err.message);
    }
  };

  // ───────────────────────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    showConfirm(
      "Hapus Buku",
      "Apakah Anda yakin ingin menghapus buku ini?",
      async () => {
        setConfirmState((prev) => ({ ...prev, loading: true }));
        try {
          await api.delete(`/api/books/delete/${id}`);
          success("Buku berhasil dihapus");
          closeConfirm();
          fetchBooks();
        } catch (err) {
          error(err.response?.data?.message || err.message);
          setConfirmState((prev) => ({ ...prev, loading: false }));
        }
      }
    );
  };

  // ───────────────────────────────────────────────────────────
  // FORMAT
  // ───────────────────────────────────────────────────────────
  const formatRupiah = (v) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(v || 0);

  // ───────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 text-zinc-900 dark:text-white">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/home-admin")}
              className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-500 dark:hover:text-zinc-300 mb-2 transition-colors cursor-pointer"
            >
              <IconArrowLeft /> Kembali
            </button>
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 dark:text-zinc-400 mb-1">Manajemen</p>
            <h1 className="text-3xl font-light text-zinc-900 dark:text-white">Kelola Buku</h1>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer"
          >
            <IconPlus />
            Tambah Buku
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Cari buku..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 bg-transparent"
          />
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 bg-zinc-200 dark:bg-zinc-800 animate-pulse border border-zinc-300 dark:border-zinc-700" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="border border-dashed border-zinc-300 dark:border-zinc-700 py-20 text-center text-xs uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
            Tidak ada buku
          </div>
        ) : (
          <>
            {/* GRID CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {books.map((book) => (
                <div key={book.id} className="bg-book-card-light border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition overflow-hidden">
                  {/* COVER */}
                  <div className="h-64 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                    {book.cover ? (
                      <img src={book.cover} alt={book.judul} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs uppercase tracking-[0.2em] text-zinc-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* BODY */}
                  <div className="p-5">
                    <div className="mb-4">
                      <h2 className="text-lg font-medium text-zinc-900 dark:text-white line-clamp-1">
                        {book.judul}
                      </h2>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 italic mt-1">
                        {book.penulis}
                      </p>
                    </div>

                    <div className="space-y-2 mb-5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Harga</span>
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {formatRupiah(book.harga)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Stok</span>
                        <span className={`px-2 py-1 text-[10px] uppercase tracking-wider border ${
                          book.stok > 0
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800"
                        }`}>
                          {book.stok}
                        </span>
                      </div>
                    </div>

                    {/* ACTION */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-zinc-500 dark:hover:border-white transition text-xs uppercase tracking-widest cursor-pointer"
                      >
                        <IconEdit />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(book.id)}
                        className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-500 hover:text-white transition cursor-pointer"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-500 transition cursor-pointer"
              >
                Prev
              </button>

              <span className="text-sm tracking-wide">
                Page {page} of {Math.ceil(totalData / limit) || 1}
              </span>

              <button
                disabled={page >= Math.ceil(totalData / limit)}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-500 transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-3xl bg-book-card-light border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-book-card-light z-10">
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-700 dark:text-zinc-300">
                {editId ? "Edit Buku" : "Tambah Buku"}
              </h2>
              <button onClick={() => setModal(false)} className="text-zinc-400 hover:text-zinc-500 dark:hover:text-white text-xl cursor-pointer">
                ×
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Judul" name="judul" value={form.judul} onChange={handleChange} required />
                <Input label="Penulis" name="penulis" value={form.penulis} onChange={handleChange} required />
                <Input label="Penerbit" name="penerbit" value={form.penerbit} onChange={handleChange} />
                <Input label="Tahun Terbit" name="tahun_terbit" type="number" value={form.tahun_terbit} onChange={handleChange} />
                <Input label="Kategori" name="kategori" value={form.kategori} onChange={handleChange} />
                
                {/* Harga - dengan step untuk menghindari floating point */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 mb-2 block">
                    Harga
                  </label>
                  <input
                    type="number"
                    name="harga"
                    step="1"
                    min="0"
                    value={form.harga}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                  />
                </div>

                {/* Stok - integer hanya */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 mb-2 block">
                    Stok
                  </label>
                  <input
                    type="number"
                    name="stok"
                    step="1"
                    min="0"
                    value={form.stok}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                  />
                </div>

                {/* COVER FIELD */}
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] block mb-2 text-zinc-600 dark:text-zinc-400">
                    Cover
                  </label>
                  <div className="flex gap-4 mb-3 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={coverType === "url"} onChange={() => setCoverType("url")} />
                      URL
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={coverType === "file"} onChange={() => setCoverType("file")} />
                      Upload
                    </label>
                  </div>

                  {coverType === "url" ? (
                    <input
                      type="text"
                      name="cover"
                      value={form.cover}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-white text-sm"
                    />
                  ) : (
                    <>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                      <button
                        type="button"
                        onClick={() => fileRef.current.click()}
                        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                      >
                        Pilih Cover
                      </button>
                    </>
                  )}

                  {previewCover && (
                    <img src={previewCover} alt="preview" className="mt-3 h-40 object-cover border border-zinc-200 dark:border-zinc-800" />
                  )}
                </div>
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 mb-2 block">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  rows={5}
                  value={form.deskripsi}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white resize-none"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer"
                >
                  {editId ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// INPUT COMPONENT
// ─────────────────────────────────────────────────────────────
const Input = ({ label, ...props }) => {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 mb-2 block">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
      />
    </div>
  );
};

export default AdminBooks;