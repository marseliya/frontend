import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Header = ({ darkMode, setDarkMode }) => {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/profile-user");
        setUser(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProfile();
  }, []);

  const navigate = useNavigate();

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  // =========================
  // CLOSE MOBILE MENU SAAT NAVIGASI
  // =========================
  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    navigate(href);
  };

  // =========================
  // GET NAV LINKS BERDASARKAN ROLE
  // =========================
  const getNavLinks = () => {
    if (user?.role === "USER") {
      return [
        { label: "Katalog", href: "/home-user" },
        { label: "Profil", href: "/profile-user" },
      ];
    }
    if (user?.role === "ADMIN") {
      return [
        { label: "Dashboard", href: "/home-admin" },
        { label: "Users", href: "/kelola-user" },
        { label: "Books", href: "/kelola-buku" },
        { label: "Orders", href: "/kelola-order" },
        { label: "Vouchers", href: "/kelola-voucher" },
      ];
    }
    if (user?.role === "DRIVER") {
      return [
        { label: "Dashboard", href: "/home-driver" },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-book-card-light transition-colors duration-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 tracking-wider font-semibold uppercase text-sm text-zinc-900 dark:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
            Celeritas
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-400">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            {/* Toggle Theme */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-none bg-book-light dark:bg-zinc-900/50"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
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
                    d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M4.22 19.78l1.58-1.58M17.66 6.34l1.58-1.58M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"
                  />
                </svg>
              ) : (
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
                    d="M21.75 12.83A9.75 9.75 0 0 1 11.46 3.57 9.75 9.75 0 0 0 21.75 12.83Z"
                  />
                </svg>
              )}
            </button>

            {/* Logout button - hidden on mobile (masuk ke mobile menu) */}
            <button
              onClick={handleLogout}
              className="hidden md:block text-xs uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Logout
            </button>

            {/* Burger Menu Button - visible only on mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 border border-zinc-200 dark:border-zinc-800 rounded-none bg-book-light dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              aria-label="Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 bg-book-card-light border-b border-zinc-200 dark:border-zinc-800 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav className="flex flex-col py-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="px-6 py-3 text-sm uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          {/* Divider */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 my-2 mx-4" />
          {/* Logout in mobile menu */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="px-6 py-3 text-left text-sm uppercase tracking-widest font-medium text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Logout
          </button>
        </nav>
      </div>
    </>
  );
};

export default Header;