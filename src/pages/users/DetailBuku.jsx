import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/ToastAlert";

const DetailBuku = () => {
  const { id } = useParams();
  const { success, error, warning, info } = useToast();
  const [book, setBook] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());

  const [showOrder, setShowOrder] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [jumlah, setJumlah] = useState(1);
  const [metodePembayaran, setMetodePembayaran] = useState("cash");
  const [nomorDebit, setNomorDebit] = useState("");
  const [passwordDebit, setPasswordDebit] = useState("");
  const [metodeAmbil, setMetodeAmbil] = useState("ambil sendiri");
  const [catatan, setCatatan] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [cartLoadingId, setCartLoadingId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bookRes, voucherRes, userRes] = await Promise.all([
          api.get(`/api/books/${id}`),
          api.get("/api/vouchers/active"),
          api.get("/api/profile-user"),
        ]);

        const bookData = bookRes.data.data || bookRes.data;
        setBook(bookData);

        const voucherData = voucherRes.data.data || voucherRes.data || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const validVouchers = voucherData.filter((voucher) => {
          const tanggalSelesai = new Date(voucher.tanggal_selesai);
          tanggalSelesai.setHours(0, 0, 0, 0);
          return tanggalSelesai >= today && voucher.is_active === true;
        });

        setVouchers(validVouchers);
        setUser(userRes.data.data || userRes.data);

        // Ambil rekomendasi buku
        if (bookData) {
          try {
            const [kategoriBooks, penulisBooks] = await Promise.all([
              api.get(
                `/api/books?search=&minHarga=0&maxHarga=999999999&limit=6`
              ),
              api.get(
                `/api/books?search=&minHarga=0&maxHarga=999999999&limit=4`
              ),
            ]);

            let kategoriData = kategoriBooks.data.data || [];
            let penulisData = penulisBooks.data.data || [];

            // Filter berdasarkan kategori atau penulis
            if (bookData.kategori) {
              const keyword = bookData.kategori.split("/")[0].trim();
              kategoriData = kategoriData.filter(
                (b) =>
                  b.id !== bookData.id &&
                  b.kategori &&
                  b.kategori.includes(keyword)
              );
            }

            if (bookData.penulis) {
              penulisData = penulisData.filter(
                (b) => b.id !== bookData.id && b.penulis === bookData.penulis
              );
            }

            const allRecs = [...kategoriData, ...penulisData];
            const uniqueRecs = allRecs.filter(
              (rec, index, self) =>
                index === self.findIndex((r) => r.id === rec.id)
            );

            if (userRes.data.data || userRes.data) {
              await fetchWishlist();
            }

            setRecommendations(uniqueRecs.slice(0, 6));
          } catch (recError) {
            console.error("Gagal ambil rekomendasi:", recError);
          }
        }
      } catch (error) {
        console.error("Gagal fetch detail:", error);
        error("Gagal memuat data buku");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/api/carts/");
      const ids = new Set(response.data.data?.map((item) => item.book_id));
      setWishlist(ids);
    } catch (error) {
      console.error("Gagal fetch wishlist:", error);
    }
  };

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  const hitungDiskon = () => {
    if (!selectedVoucher || !book) return 0;
    if (selectedVoucher.tipe_vouchers === "percent") {
      return (book.harga * jumlah * selectedVoucher.nilai) / 100;
    }
    return selectedVoucher.nilai;
  };

  const totalHarga = book
    ? (() => {
        const subtotal = Math.max(
          0,
          book.harga * (jumlah || 1) - hitungDiskon()
        );
        if (metodeAmbil === "diantar") {
          return subtotal * 1.2;
        }
        return subtotal;
      })()
    : 0;

  const validateVoucher = () => {
    if (!selectedVoucher) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tanggalMulai = new Date(selectedVoucher.tanggal_mulai);
    tanggalMulai.setHours(0, 0, 0, 0);
    const tanggalSelesai = new Date(selectedVoucher.tanggal_selesai);
    tanggalSelesai.setHours(0, 0, 0, 0);

    if (tanggalMulai > today) {
      warning(
        `Voucher "${
          selectedVoucher.nama_vouchers
        }" belum dapat digunakan! Berlaku mulai: ${new Date(
          selectedVoucher.tanggal_mulai
        ).toLocaleDateString("id-ID")}`
      );
      return false;
    }

    if (tanggalSelesai < today) {
      error(`Voucher "${selectedVoucher.nama_vouchers}" sudah kadaluarsa!`);
      return false;
    }

    if (!selectedVoucher.is_active) {
      warning(`Voucher "${selectedVoucher.nama_vouchers}" sedang tidak aktif!`);
      return false;
    }

    return true;
  };

  const handleOrder = async () => {
    setOrderLoading(true);

    try {
      if (!validateVoucher()) {
        setOrderLoading(false);
        return;
      }

      if (metodePembayaran === "debit") {
        if (!nomorDebit) {
          error("Nomor debit wajib diisi");
          setOrderLoading(false);
          return;
        }
        if (nomorDebit.length !== 16) {
          error("Nomor debit harus 16 digit");
          setOrderLoading(false);
          return;
        }
        if (!passwordDebit) {
          error("Password debit wajib diisi");
          setOrderLoading(false);
          return;
        }
        if (passwordDebit.length < 6) {
          error("Password debit minimal 6 karakter");
          setOrderLoading(false);
          return;
        }
      }

      if (!jumlah || jumlah < 1) {
        error("Jumlah buku minimal 1");
        setOrderLoading(false);
        return;
      }

      if (jumlah > book.stok) {
        error(`Stok tidak mencukupi! Stok tersedia: ${book.stok}`);
        setOrderLoading(false);
        return;
      }

      const response = await api.post("/api/orders/create", {
        metode_pembayaran: metodePembayaran,
        metode_pengambilan: metodeAmbil,
        nomor_debit: nomorDebit,
        password_debit: passwordDebit,
        catatan,
        voucher_id: selectedVoucher?.id || null,
        items: [{ book_id: parseInt(id), qty: jumlah || 1 }],
      });
    } catch (error) {
      console.error("Gagal order:", error);
      const errorMessage =
        error.response?.data?.message || "Terjadi kesalahan pada server";
      if (errorMessage.toLowerCase().includes("voucher")) {
        error(
          `${errorMessage}\nSilakan pilih voucher lain atau lanjutkan tanpa voucher.`
        );
        setSelectedVoucher(null);
      } else {
        error(errorMessage);
      }
    } finally {
      setOrderLoading(false);
    }
  };

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
      console.error(
        "Gagal toggle wishlist:",
        error.response?.data?.message || error.message
      );
      error(error.response?.data?.message || "Gagal mengubah wishlist");
    } finally {
      setCartLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-32 text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
        Memuat Detail Buku...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-32 text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
        Buku tidak ditemukan.
      </div>
    );
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mb-2 transition-colors cursor-pointer"
      >
        <IconArrowLeft /> Kembali
      </button>
      {/* Detail Buku */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="md:col-span-1">
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.judul}
              className="w-full object-cover border border-zinc-200 dark:border-zinc-800"
            />
          ) : (
            <div className="w-full h-72 bg-book-light flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs tracking-wider uppercase">
              No Cover
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div>
            <span className="text-[10px] tracking-widest uppercase font-mono font-bold px-1.5 py-0.5 bg-book-light text-zinc-950 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-800">
              {book.kategori || "Umum"}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white mt-2">
              {book.judul}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-serif italic mt-1">
              Oleh: {book.penulis}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">
                Harga
              </p>
              <p className="font-bold font-mono text-zinc-950 dark:text-white">
                {formatRupiah(book.harga)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">
                Stok
              </p>
              <p className="font-mono text-zinc-950 dark:text-white">
                {book.stok}
              </p>
            </div>
            {book.tahun_terbit && (
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">
                  Tahun Terbit
                </p>
                <p className="font-mono text-zinc-950 dark:text-white">
                  {book.tahun_terbit}
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
              Deskripsi
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {book.deskripsi || "Tidak ada deskripsi."}
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowOrder(true)}
              disabled={book.stok <= 0}
              className="mt-4 px-6 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer disabled:opacity-50"
            >
              {book.stok <= 0 ? "Stok Habis" : "Pesan Sekarang"}
            </button>
            <button
              type="button"
              disabled={cartLoadingId === book.id || book.stok <= 0}
              onClick={() => handleToggleWishlist(book.id)}
              className="mt-4 px-6 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer disabled:opacity-50"
              title={
                wishlist.has(book.id)
                  ? "Hapus dari wishlist"
                  : "Tambah ke wishlist"
              }
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

      {/* Rekomendasi Buku */}
      {recommendations.length > 0 && (
        <div className="mb-16">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-950 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-6">
            Buku Rekomendasi
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.map((rec) => (
              <Link
                key={rec.id}
                to={`/detail-buku/${rec.id}`}
                className="group block bg-book-card-light border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all duration-200"
              >
                <div className="aspect-2/3 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {rec.cover ? (
                    <img
                      src={rec.cover}
                      alt={rec.judul}
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
                    {rec.judul}
                  </h3>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    {rec.penulis}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {formatRupiah(rec.harga)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Voucher Tersedia */}
      {vouchers.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-950 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4">
            Voucher Tersedia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {vouchers.map((v) => (
              <div
                key={v.id}
                className="border border-dashed p-3 space-y-1 bg-book-card-light border-zinc-300 dark:border-zinc-700"
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {v.nama_vouchers}
                </p>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  Diskon:{" "}
                  {v.tipe_vouchers === "percent"
                    ? `${v.nilai}%`
                    : formatRupiah(v.nilai)}
                </p>
                <p className="text-[10px] text-zinc-400">
                  Berlaku s/d{" "}
                  {new Date(v.tanggal_selesai).toLocaleDateString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Order */}
      {showOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-book-light w-full max-w-lg border border-zinc-200 dark:border-zinc-700 p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-900 dark:text-white">
                Form Pemesanan
              </h3>
              <button
                onClick={() => setShowOrder(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {
              <>
                {user && (
                  <div className="bg-book-card-light p-4 space-y-2 border border-zinc-200 dark:border-zinc-700">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">
                      Data Pemesan
                    </p>
                    {[
                      { label: "Nama", value: user.nama || user.name },
                      { label: "Email", value: user.email },
                      { label: "No. HP", value: user.nomor_hp },
                      { label: "Alamat", value: user.alamat },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-3 text-sm">
                        <span className="w-16 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide shrink-0">
                          {label}
                        </span>
                        <span className="text-zinc-900 dark:text-white">
                          {value || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-medium text-zinc-600 dark:text-zinc-400">
                    Jumlah Buku (Stok: {book.stok})
                  </label>
                  <input
                    type="number"
                    value={jumlah}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > book.stok) setJumlah(book.stok);
                      else if (val < 1) setJumlah(1);
                      else setJumlah(val);
                    }}
                    className="w-full px-3 py-2 text-sm bg-book-card-light border border-zinc-200 dark:border-zinc-700 rounded-none text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-medium text-zinc-600 dark:text-zinc-400">
                    Metode Pembayaran
                  </label>
                  <select
                    value={metodePembayaran}
                    onChange={(e) => setMetodePembayaran(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-book-card-light border border-zinc-200 dark:border-zinc-700 rounded-none text-zinc-900 dark:text-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="debit">Debit</option>
                  </select>

                  {metodePembayaran === "debit" && (
                    <div className="space-y-4 mt-3">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider font-medium text-zinc-600 dark:text-zinc-400">
                          Nomor Debit (16 digit)
                        </label>
                        <input
                          type="text"
                          value={nomorDebit}
                          onChange={(e) =>
                            setNomorDebit(
                              e.target.value.replace(/\D/g, "").slice(0, 16)
                            )
                          }
                          className="w-full px-3 py-2 text-sm bg-book-card-light border border-zinc-200 dark:border-zinc-700 rounded-none text-zinc-900 dark:text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider font-medium text-zinc-600 dark:text-zinc-400">
                          Password Debit
                        </label>
                        <input
                          type="password"
                          value={passwordDebit}
                          onChange={(e) =>
                            setPasswordDebit(e.target.value.slice(0, 20))
                          }
                          className="w-full px-3 py-2 text-sm bg-book-card-light border border-zinc-200 dark:border-zinc-700 rounded-none text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-medium text-zinc-600 dark:text-zinc-400">
                    Metode Pengambilan
                  </label>
                  <select
                    value={metodeAmbil}
                    onChange={(e) => setMetodeAmbil(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-book-card-light border border-zinc-200 dark:border-zinc-700 rounded-none text-zinc-900 dark:text-white"
                  >
                    <option value="ambil sendiri">
                      Ambil Sendiri (Gratis)
                    </option>
                    <option value="diantar">Dikirim (+20%)</option>
                  </select>
                </div>

                {vouchers.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider font-medium text-zinc-600 dark:text-zinc-400">
                      Voucher (Opsional)
                    </label>
                    <select
                      value={selectedVoucher?.id || ""}
                      onChange={(e) =>
                        setSelectedVoucher(
                          vouchers.find(
                            (v) => v.id === parseInt(e.target.value)
                          ) || null
                        )
                      }
                      className="w-full px-3 py-2 text-sm bg-book-card-light border border-zinc-200 dark:border-zinc-700 rounded-none text-zinc-900 dark:text-white"
                    >
                      <option value="">Tanpa Voucher</option>
                      {vouchers.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nama_vouchers} —{" "}
                          {v.tipe_vouchers === "percent"
                            ? `${v.nilai}%`
                            : formatRupiah(v.nilai)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-medium text-zinc-600 dark:text-zinc-400">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-book-card-light border border-zinc-200 dark:border-zinc-700 rounded-none text-zinc-900 dark:text-white resize-none"
                  />
                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-1 text-sm">
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Harga × {jumlah || 1}</span>
                    <span className="font-mono">
                      {formatRupiah(book.harga * (jumlah || 1))}
                    </span>
                  </div>
                  {selectedVoucher && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Diskon ({selectedVoucher.nama_vouchers})</span>
                      <span className="font-mono">
                        - {formatRupiah(hitungDiskon())}
                      </span>
                    </div>
                  )}
                  {metodeAmbil === "diantar" && (
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Biaya Pengiriman (20%)</span>
                      <span className="font-mono">
                        {formatRupiah(
                          Math.max(
                            0,
                            book.harga * (jumlah || 1) - hitungDiskon()
                          ) * 0.2
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-zinc-800 pt-2 mt-1">
                    <span>Total</span>
                    <span className="font-mono">
                      {formatRupiah(totalHarga)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleOrder}
                  disabled={orderLoading || jumlah === "" || jumlah < 1}
                  className="w-full mt-4 px-6 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer disabled:opacity-50"
                >
                  {orderLoading ? "Memproses..." : "Konfirmasi Pesanan"}
                </button>
              </>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailBuku;
