import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-book-light w-full max-w-md border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-900 dark:text-white">
          {title || "Konfirmasi"}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {message}
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500 transition-colors rounded-none cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 border border-zinc-700 dark:border-zinc-300 text-xs uppercase tracking-widest font-medium text-zinc-400 dark:text-zinc-600 hover:bg-zinc-500 dark:hover:bg-zinc-300 transition-colors rounded-none cursor-pointer"
          >
            {loading ? "Memproses..." : "Ya, Lanjutkan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;