import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Link as LinkIcon, 
  Star 
} from 'lucide-react';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { extractDomain, getFaviconUrl, normalizeUrl } from '../../utils/helpers';

export const BookmarkFormModal: React.FC = () => {
  const { 
    isAddModalOpen, 
    setAddModalOpen, 
    editingBookmark, 
    setEditingBookmark, 
    folders, 
    bookmarks,
    addBookmark, 
    updateBookmark 
  } = useBookmarkStore();

  const isOpen = isAddModalOpen || !!editingBookmark;

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [urlError, setUrlError] = useState('');

  const urlInputRef = useRef<HTMLInputElement>(null);

  // Sync state when editing or opening
  useEffect(() => {
    if (editingBookmark) {
      setUrl(editingBookmark.url);
      setTitle(editingBookmark.title);
      setDescription(editingBookmark.description || '');
      setFolderId(editingBookmark.folderId || '');
      setTags(editingBookmark.tags || []);
      setIsFavorite(editingBookmark.isFavorite || false);
      setUrlError('');
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
      setFolderId('');
      setTags([]);
      setIsFavorite(false);
      setUrlError('');
    }
  }, [editingBookmark, isOpen]);

  // Focus on URL input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        urlInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Auto-generate title preview if empty and URL is provided
  const handleUrlBlur = () => {
    if (url.trim() && !title.trim()) {
      const domain = extractDomain(url);
      if (domain) {
        const suggested = domain.charAt(0).toUpperCase() + domain.slice(1);
        setTitle(suggested);
      }
    }
  };

  const handleClose = () => {
    setAddModalOpen(false);
    setEditingBookmark(null);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Collect all existing tags across bookmarks for suggestions
  const allExistingTags = Array.from(
    new Set(bookmarks.flatMap((b) => b.tags || []))
  ).filter((t) => !tags.includes(t));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setUrlError('URL tautan wajib diisi');
      return;
    }

    const finalUrl = normalizeUrl(url);

    if (editingBookmark) {
      updateBookmark(editingBookmark.id, {
        url: finalUrl,
        title: title.trim() || extractDomain(finalUrl) || finalUrl,
        description: description.trim(),
        folderId,
        tags,
        isFavorite,
      });
    } else {
      addBookmark({
        url: finalUrl,
        title: title.trim() || extractDomain(finalUrl) || finalUrl,
        description: description.trim(),
        folderId,
        tags,
        isFavorite,
      });
    }

    handleClose();
  };

  if (!isOpen) return null;

  const currentFavicon = url.trim() ? getFaviconUrl(url) : '';
  const currentDomain = url.trim() ? extractDomain(url) : '';

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md overflow-y-auto"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-6 text-zinc-900 dark:text-zinc-100 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingBookmark ? 'Edit Tautan Tersimpan' : 'Tambah Tautan Baru'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Simpan tautan favorit Anda ke dalam koleksi digital
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* URL Input */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Alamat Web (URL) <span className="text-rose-500 dark:text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  ref={urlInputRef}
                  type="text"
                  placeholder="https://contoh.com atau github.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) setUrlError('');
                  }}
                  onBlur={handleUrlBlur}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all ${
                    urlError 
                      ? 'border-rose-500 ring-2 ring-rose-500/20' 
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
                {currentFavicon && (
                  <div className="absolute right-3 top-2.5 flex items-center gap-1.5 pointer-events-none">
                    <img 
                      src={currentFavicon} 
                      alt="" 
                      className="w-4 h-4 rounded" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 max-w-[120px] truncate">
                      {currentDomain}
                    </span>
                  </div>
                )}
              </div>
              {urlError && <p className="text-xs text-rose-500 mt-1">{urlError}</p>}
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Judul Tautan
              </label>
              <input
                type="text"
                placeholder="cth. Linear – Pelacak Isu & Proyek"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Deskripsi Singkat (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Catatan ringkas mengenai tautan ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              />
            </div>

            {/* Folder Select */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Folder Koleksi
              </label>
              <div className="relative">
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                    📂 Tanpa Folder (Umum / Belum Dikategorikan)
                  </option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                      📁 {f.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-3 text-zinc-400 dark:text-zinc-500 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Label / Tags (Tekan Enter untuk menambah)
              </label>
              <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-zinc-950 transition-all min-h-[44px] flex flex-wrap items-center gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700/60"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500 transition-colors ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={tags.length === 0 ? "cth. Desain, Coding, Artikel..." : "Tambah label..."}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none px-1"
                />
              </div>

              {/* Tag suggestions */}
              {allExistingTags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs">
                  <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">Saran:</span>
                  {allExistingTags.slice(0, 5).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setTags([...tags, suggestion])}
                      className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-300 bg-zinc-100 dark:bg-zinc-800/40 hover:bg-zinc-200 dark:hover:bg-zinc-800 px-2 py-0.5 rounded transition-colors"
                    >
                      +{suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite Checkbox */}
            <div className="pt-1">
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none text-xs text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer accent-indigo-600"
                />
                <span className="flex items-center gap-1.5">
                  <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-amber-500 fill-amber-500' : 'text-zinc-400'}`} />
                  Tandai sebagai Favorit
                </span>
              </label>
            </div>

            {/* Buttons */}
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
                {editingBookmark ? 'Simpan Perubahan' : 'Simpan Tautan'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
