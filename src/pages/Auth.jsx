import React, { useState } from "react";
import Swal from "sweetalert2";
import api from "../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: location.state.message,
      });

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location, navigate]);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    nomor_hp: "",
    alamat: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/regis";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;
      const response = await api.post(endpoint, payload);
      const data = response.data;

      if (!isLogin) {
        await Swal.fire({
          icon: "success",
          title: "Registrasi Berhasil",
          text: data.message,
        });
        setFormData({
          nama: "",
          email: "",
          password: "",
          nomor_hp: "",
          alamat: "",
          role: "",
        });
        setIsLogin(true);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: data.message,
      });
      setFormData({
        nama: "",
        email: "",
        password: "",
        nomor_hp: "",
        alamat: "",
        role: "",
      });

      const role = data.user?.role;
      if (role === "USER") navigate("/home-user");
      else if (role === "DRIVER") navigate("/home-driver");
      else if (role === "ADMIN") navigate("/home-admin");
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Terjadi kesalahan";
      Swal.fire({ icon: "error", title: "Gagal", text: message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () =>
    setFormData({
      nama: "",
      email: "",
      password: "",
      nomor_hp: "",
      alamat: "",
      role: "",
    });

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-none outline-none transition-colors duration-200 " +
    "bg-[var(--color-background-secondary)] border border-[var(--color-border-secondary)] " +
    "text-[var(--color-text-primary)] focus:border-[var(--color-border-primary)]";

  const labelClass =
    "text-[10px] uppercase tracking-wider font-semibold font-mono text-[var(--color-text-secondary)]";

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "var(--color-background-tertiary)",
        color: "var(--color-text-primary)",
      }}
    >
      {/* Panel Kiri */}
      <div
        className="hidden md:flex md:w-1/2 p-12 flex-col justify-between"
        style={{
          background: "var(--color-background-secondary)",
          borderRight: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        <div
          className="flex items-center gap-2 tracking-widest font-mono text-xs uppercase font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
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
          Celeritas
        </div>

        <div className="my-auto max-w-md space-y-4">
          <p
            className="text-[10px] tracking-widest uppercase font-mono font-bold"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            System Sign In
          </p>
          <h1
            className="text-3xl font-light tracking-tight leading-tight"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            "Sebuah ruangan tanpa buku ibarat tubuh tanpa jiwa."
          </h1>
          <p
            className="text-sm italic"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            — Marcus Tullius Cicero
          </p>
        </div>

        <div
          className="text-[10px] tracking-wider font-mono"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          &copy; 2026 CELERITAS CORE SYSTEM. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* Panel Kanan */}
      <div
        className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32"
        style={{ background: "var(--color-background-primary)" }}
      >
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h2
              className="text-2xl font-light tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              {isLogin ? "Selamat Datang Kembali" : "Buat Akun Baru"}
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {isLogin
                ? "Silakan masuk untuk mengakses koleksi literatur Anda."
                : "Daftar segera untuk mulai mengelola pustaka digital."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className={labelClass}>Nama Lengkap *</label>
                <input
                  type="text"
                  name="nama"
                  required
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Nama sesuai identitas"
                  className={inputClass}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className={inputClass}
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className={labelClass}>Nomor Telepon</label>
                  <input
                    type="tel"
                    name="nomor_hp"
                    value={formData.nomor_hp}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Alamat</label>
                  <input
                    type="text"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    placeholder="Cicendo"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Role *</label>
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Pilih role
                    </option>
                    <option value="USER">User</option>
                    <option value="DRIVER">Driver</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className={labelClass}>Kata Sandi *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 px-6 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300  dark:hover:bg-zinc-400 transition-colors rounded-none cursor-pointer"
            >
              {loading
                ? "MEMPROSES..."
                : isLogin
                ? "MASUK KE AKUN"
                : "SELESAIKAN PENDAFTARAN"}
            </button>
          </form>

          <div
            className="pt-4 text-center"
            style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}
          >
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                resetForm();
              }}
              className="text-xs tracking-wide underline underline-offset-4 outline-none cursor-pointer transition-colors bg-transparent border-none"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) =>
                (e.target.style.color = "var(--color-text-primary)")
              }
              onMouseLeave={(e) =>
                (e.target.style.color = "var(--color-text-secondary)")
              }
            >
              {isLogin
                ? "Belum punya akun? Registrasi di sini"
                : "Sudah terdaftar? Masuk ke akun Anda"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
