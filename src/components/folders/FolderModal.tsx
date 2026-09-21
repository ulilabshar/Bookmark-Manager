import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FolderPlus, 
  Briefcase, 
  Sparkles, 
  BookOpen, 
  Code2, 
  Bookmark, 
  Compass, 
  Heart,
  Folder as FolderIcon
} from 'lucide-react';
import { useBookmarkStore } from '../../store/useBookmarkStore';

const COLOR_OPTIONS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Pink', value: '#ec4899' },
];

const ICON_OPTIONS = [
  { name: 'Folder', component: FolderIcon },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Sparkles', component: Sparkles },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Code2', component: Code2 },
  { name: 'Bookmark', component: Bookmark },
  { name: 'Compass', component: Compass },
  { name: 'Heart', component: Heart },
];

export const FolderModal: React.FC = () => {
  const { isFolderModalOpen, setFolderModalOpen, addFolder } = useBookmarkStore();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [selectedIcon, setSelectedIcon] = useState('Folder');
  const [error, setError] = useState('');

  if (!isFolderModalOpen) return null;

  const handleClose = () => {
    setName('');
    setError('');
    setFolderModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama folder wajib diisi');
      return;
    }

    addFolder(name.trim(), selectedIcon, selectedColor);
    handleClose();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-6 text-zinc-900 dark:text-zinc-100 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80 mb-5">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: selectedColor }}
              >
                <FolderPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Buat Koleksi / Folder Baru
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Kelompokkan tautan berdasarkan topik atau proyek
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Nama Folder <span className="text-rose-500 dark:text-rose-400">*</span>
              </label>
              <input
                type="text"
                autoFocus
                placeholder="cth. Belajar Frontend, Inspirasi Desain"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all ${
                  error ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
              {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
            </div>

            {/* Color selection */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Pilih Warna Aksen
              </label>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                      selectedColor === c.value ? 'scale-125 ring-2 ring-zinc-400 dark:ring-white/50 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900' : 'hover:scale-110 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Icon selection */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Pilih Ikon Folder
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ICON_OPTIONS.map((item) => {
                  const IconComp = item.component;
                  const isSelected = selectedIcon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedIcon(item.name)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                          : 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/40 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <IconComp className="w-5 h-5 mb-1" />
                      <span className="text-[10px] truncate max-w-full">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                Buat Folder
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
