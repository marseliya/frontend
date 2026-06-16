import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/ToastAlert";

const HomeUser = () => {
  const { success, error, warning, info } = useToast();
  const [books, setBooks] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [wishlist, setWishlist] = useState(new Set());
  const [vouchers, setVouchers] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [minHarga, setMinHarga] = useState("");
  const [maxHarga, setMaxHarga] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 6;

  const [loading, setLoading] = useState(false);
  const [cartLoadingId, setCartLoadingId] = useState(null);

  const extractCategories = (booksData) => {
    const categorySet = new Set();
    booksData.forEach(book => {
      if (book.kategori) {
        book.kategori.split('/').map(p => p.trim()).forEach(part => {
          if (part) categorySet.add(part);
        });
      }
    });
    return Array.from(categorySet).sort();
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page, limit, search,
        minHarga: minHarga || 0,
        maxHarga: maxHarga || 999999999,
      });
      if (selectedCategories.length > 0) {
        queryParams.append("kategori", selectedCategories[0]);
      }
      const response = await api.get(`/api/books?${queryParams.toString()}`);
      const resData = response.data;
      const booksData = resData.data || [];
      setBooks(booksData);
      setTotalData(resData.total_data || 0);
      if (booksData.length > 0 && categories.length === 0) {
        setCategories(extractCategories(booksData));
      }
    } catch (error) {
      console.error("Gagal mengambil data buku:", error.response?.data?.message || error.message);
      error("Gagal memuat data buku");
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/api/carts/");
      const ids = new Set(response.data.data?.map((item) => item.book_id));
      setWishlist(ids);
    } catch (error) {
      console.error("Gagal fetch wishlist:", error);
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await api.get("/api/vouchers/active");
      setVouchers(response.data.data || []);
    } catch (error) {
      console.error("Gagal fetch vouchers:", error);
    }
  };

  const fetchTopAuthors = async () => {
    try {
      const response = await api.get("/api/books/top-authors?limit=2");
      setTopAuthors(response.data.data || []);
    } catch (error) {
      console.error("Gagal fetch top authors:", error);
    }
  };

  const fetchLatestBooks = async () => {
    try {
      const response = await api.get("/api/books/latest?limit=6");
      setLatestBooks(response.data.data || []);
    } catch (error) {
      console.error("Gagal fetch latest books:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, search, minHarga, maxHarga, selectedCategories]);

  useEffect(() => {
    fetchWishlist();
    fetchVouchers();
    fetchTopAuthors();
    fetchLatestBooks();
  }, []);

  const handleToggleWishlist = async (bookId) => {
    setCartLoadingId(bookId);
    const isWishlisted = wishlist.has(bookId);
    try {
      if (isWishlisted) {
        await api.delete(`/api/carts/delete/${bookId}`);
        setWishlist((prev) => {
          const next = new Set(prev);
          next.delete(bookId);
          return next;
        });
        success("Berhasil dihapus dari wishlist");
      } else {
        await api.post("/api/carts/add", { book_id: bookId });
        setWishlist((prev) => new Set(prev).add(bookId));
        success("Berhasil ditambahkan ke wishlist");
      }
    } catch (error) {
      console.error("Gagal toggle wishlist:", error.response?.data?.message || error.message);
      error(error.response?.data?.message || "Gagal mengubah wishlist");
    } finally {
      setCartLoadingId(null);
    }
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [category]
    );
    setPage(1);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    info("Filter diterapkan");
  };

  const totalPage = Math.ceil(totalData / limit);

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  return (
    <>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* SECTION 1: FILTER */}
        <section className="bg-book-card-light border border-zinc-200 dark:border-zinc-800 p-6 mb-8 rounded-none transition-colors duration-200">
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-zinc-950 dark:text-white">
                  Cari Judul Buku
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Masukkan kata kunci judul..."
                  className="w-full px-3 py-2 text-sm bg-book-light border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 rounded-none text-zinc-900 dark:text-white transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-medium text-zinc-950 dark:text-white">
                  Harga Min (Rp)
                </label>
                <input
                  type="number"
                  value={minHarga}
                  onChange={(e) => setMinHarga(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm bg-book-light border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 rounded-none text-zinc-900 dark:text-white transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-medium text-zinc-950 dark:text-white">
                  Harga Max (Rp)
                </label>
                <input
                  type="number"
                  value={maxHarga}
                  onChange={(e) => setMaxHarga(e.target.value)}
                  placeholder="99999999"
                  className="w-full px-3 py-2 text-sm bg-book-light border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 rounded-none text-zinc-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            {categories.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-medium text-zinc-950 dark:text-white">
                  Filter Kategori
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="px-3 py-1 text-xs transition-colors rounded-none bg-book-light border border-zinc-300 dark:border-zinc-500 text-zinc-500 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-500"
                  >
                    Semua
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryToggle(cat)}
                      className={`px-3 py-1 text-xs transition-colors rounded-none ${
                        selectedCategories.includes(cat)
                          ? "bg-zinc-500 text-white dark:bg-white dark:text-zinc-500"
                          : "bg-book-light border border-zinc-300 dark:border-zinc-500 text-zinc-500 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-500"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-book-light border-zinc-300 dark:border-zinc-800 text-xs uppercase tracking-widest font-medium border hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors rounded-none cursor-pointer"
              >
                Terapkan Filter
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 2: TOP AUTHORS */}
        {topAuthors.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-950 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4">
              ✍️ Penulis Paling Produktif
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topAuthors.map((author) => (
                <div key={author.penulis} className="bg-book-card-light border border-zinc-200 dark:border-zinc-800 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                        {author.penulis}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {author.total_buku} buku diterbitkan
                      </p>
                    </div>
                    <span className="text-2xl opacity-20">✍️</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">Buku terbaru:</p>
                    <div className="flex flex-wrap gap-2">
                      {author.buku_terbaru?.map((book) => (
                        <Link
                          key={book.id}
                          to={`/detail-buku/${book.id}`}
                          className="px-3 py-1 text-xs transition-colors rounded-none bg-book-light border border-zinc-300 dark:border-zinc-500 text-zinc-500 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-500"
                        >
                          {book.judul.length > 25 ? book.judul.slice(0, 25) + '...' : book.judul}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: GRID BUKU */}
        <section id="katalog" className="space-y-6 mb-8">
          <div className="flex justify-between items-baseline border-b border-zinc-300 dark:border-zinc-800 pb-2">
            <h2 className="text-lg font-medium tracking-tight uppercase text-zinc-950 dark:text-white">
              Koleksi Tersedia
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              Total Item: {totalData}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-24 text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
              Memuat Data Buku...
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-24 text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800">
              Tidak ada pustaka data yang cocok
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-book-card-light border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between rounded-none transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-600"
                >
                  <div className="space-y-3">
                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt={book.judul}
                        className="w-full h-48 object-cover border border-zinc-200 dark:border-zinc-900 rounded-none mb-2"
                      />
                    ) : (
                      <div className="w-full h-48 bg-book-light flex items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded-none mb-2 text-zinc-400 text-xs tracking-wider uppercase">
                        No Image Cover
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {book.kategori?.split('/').slice(0, 5).map((cat, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] tracking-widest uppercase font-mono px-1.5 py-0.5 bg-book-light text-zinc-950 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-800"
                          >
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-base font-semibold tracking-tight pt-1 text-zinc-950 dark:text-white">
                        {book.judul}
                      </h3>
                      <p className="text-xs text-zinc-700 dark:text-zinc-400 font-serif italic font-medium">
                        Oleh: {book.penulis}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-400 line-clamp-3 font-normal pt-1">
                      {book.deskripsi || "Tidak ada deskripsi arsip."}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-900/60 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-black dark:text-white font-mono">
                        {formatRupiah(book.harga)}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 font-medium">
                        Stok: {book.stok}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/detail-buku/${book.id}`}
                        className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-mono border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-colors rounded-none"
                      >
                        Detail
                      </Link>
                      <button
                        type="button"
                        disabled={cartLoadingId === book.id || book.stok <= 0}
                        onClick={() => handleToggleWishlist(book.id)}
                        className="p-2 border border-zinc-300 dark:border-zinc-800 transition-colors duration-150 bg-book-light rounded-none disabled:opacity-40 cursor-pointer"
                        title={wishlist.has(book.id) ? "Hapus dari wishlist" : "Tambah ke wishlist"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 transition-transform active:scale-90"
                          fill={wishlist.has(book.id) ? "#ef4444" : "none"}
                          style={{ color: wishlist.has(book.id) ? "#ef4444" : undefined }}
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
        </section>

        {/* SECTION 4: PAGINATION */}
        {totalPage > 1 && (
          <section className="flex justify-center items-center gap-2 mb-12">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-800 bg-book-card-light text-zinc-900 dark:text-white text-xs font-mono uppercase disabled:opacity-40 transition-colors rounded-none cursor-pointer"
            >
              Prev
            </button>
            <div className="text-xs font-mono px-4 text-zinc-500 dark:text-zinc-400">
              Halaman {page} dari {totalPage}
            </div>
            <button
              disabled={page === totalPage}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-800 bg-book-card-light text-zinc-900 dark:text-white text-xs font-mono uppercase disabled:opacity-40 transition-colors rounded-none cursor-pointer"
            >
              Next
            </button>
          </section>
        )}

        {/* SECTION 5: VOUCHER AKTIF */}
        {vouchers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-950 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4">
              🎫 Voucher Aktif untuk Anda
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {vouchers.slice(0, 4).map((voucher) => (
                <div
                  key={voucher.id}
                  className="bg-book-card-light border border-zinc-200 dark:border-zinc-700 border-l-4 border-l-amber-500 p-3 shadow-sm"
                >
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {voucher.nama_vouchers}
                  </p>
                  <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
                    {voucher.tipe_vouchers === "percent"
                      ? `${voucher.nilai}% OFF`
                      : formatRupiah(voucher.nilai)}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Berlaku s/d {new Date(voucher.tanggal_selesai).toLocaleDateString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 6: REKOMENDASI BUKU TERBARU */}
        {latestBooks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-950 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-6">
              📚 Buku Terbaru
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {latestBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/detail-buku/${book.id}`}
                  className="group block bg-book-card-light border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all duration-200"
                >
                  <div className="aspect-2/3 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt={book.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 uppercase tracking-wider">
                        No Cover
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    <h3 className="text-xs font-medium text-zinc-900 dark:text-white line-clamp-2">
                      {book.judul}
                    </h3>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                      {book.penulis}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      {formatRupiah(book.harga)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </>
  );
};

export default HomeUser;