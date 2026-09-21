import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useBookmarkStore } from '../../store/useBookmarkStore';

export const DeleteConfirmModal: React.FC = () => {
  const { deletingBookmarkId, setDeletingBookmarkId, deleteBookmark, bookmarks } = useBookmarkStore();

  if (!deletingBookmarkId) return null;

  const target = bookmarks.find((b) => b.id === deletingBookmarkId);

  const handleConfirm = () => {
    deleteBookmark(deletingBookmarkId);
  };

  const handleCancel = () => {
    setDeletingBookmarkId(null);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md"
        onClick={handleCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-6 text-zinc-900 dark:text-zinc-100 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Hapus Tautan?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus tautan{' '}
                <span className="text-zinc-800 dark:text-zinc-200 font-medium font-mono">
                  &ldquo;{target?.title || 'Tautan ini'}&rdquo;
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Sekarang</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
