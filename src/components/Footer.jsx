import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-book-card-light  text-zinc-500 dark:text-zinc-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-2 space-y-3">
            <span className="text-xs tracking-wider font-semibold text-zinc-900 dark:text-white uppercase">Celeritas</span>
            <p className="text-xs leading-relaxed max-w-sm">
              Sistem manajemen informasi perpustakaan mandiri berbasis logika komputasi bersih. Mengutamakan integritas data literatur pustaka.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-zinc-900 dark:text-white">Sistem</span>
            <ul className="text-xs space-y-1.5">
              <li><a href="#kebijakan" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#syarat" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Ketentuan Layanan</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-zinc-900 dark:text-white">Kontak</span>
            <p className="text-xs leading-relaxed">
              admin@celeritas.archive.id<br />
              Bandung, Jawa Barat, Indonesia
            </p>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-900 text-center text-[11px] tracking-wider text-zinc-400 dark:text-zinc-600">
          &copy; 2026 CELERITAS CORE SYSTEM. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
};

export default Footer;