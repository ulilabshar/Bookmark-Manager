import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useBookmarkStore } from '../../store/useBookmarkStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useBookmarkStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl text-zinc-900 dark:text-zinc-100 ring-1 ring-black/5 dark:ring-white/10"
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
                {isError && <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />}
                {!isSuccess && !isError && <Info className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Tutup"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
