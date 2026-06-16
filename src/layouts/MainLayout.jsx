import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  }, [darkMode]);

  const handleToggleDark = (val) => {
    setDarkMode(val);
    localStorage.setItem("theme", val ? "dark" : "light");
  };

  return (
    /* PERBAIKAN: bg-book-light di sini akan mengambil warna #f4f1ea (krem) pada mode terang,
      dan berkat CSS di atas, saat .dark aktif nilainya otomatis berubah menjadi #1c1c1c.
    */
    <div className="min-h-screen bg-book-light text-zinc-900 dark:text-white transition-colors duration-200 flex flex-col">
      <Header darkMode={darkMode} setDarkMode={handleToggleDark} />
      
      <main className="grow">
        <Outlet /> 
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;