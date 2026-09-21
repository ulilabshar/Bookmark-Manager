import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  ExternalLink, 
  Copy, 
  Check, 
  Pencil, 
  Trash2, 
  Globe 
} from 'lucide-react';
import type { Bookmark } from '../../types';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { extractDomain, getFaviconUrl, formatDateIndonesian } from '../../utils/helpers';

interface BookmarkRowProps {
  bookmark: Bookmark;
}

export const BookmarkRow: React.FC<BookmarkRowProps> = ({ bookmark }) => {
  const { 
    folders, 
    toggleFavorite, 
    setEditingBookmark, 
    setDeletingBookmarkId, 
    setActiveFilter,
    addToast 
  } = useBookmarkStore();

  const [copied, setCopied] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const domain = extractDomain(bookmark.url);
  const folder = folders.find((f) => f.id === bookmark.folderId);
  const favicon = getFaviconUrl(bookmark.url);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(bookmark.url);
    setCopied(true);
    addToast('Tautan Disalin', bookmark.url, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(bookmark.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBookmark(bookmark);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingBookmarkId(bookmark.id);
  };

  const handleOpen = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    setActiveFilter({ type: 'tag', value: tag, label: `#${tag}` });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={handleOpen}
      className="group flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/90 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all cursor-pointer backdrop-blur-sm shadow-xs"
    >
      {/* Left side: Star, Favicon, Title, Domain, Description */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={handleFavorite}
          aria-label={bookmark.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          className={`p-1 rounded-md transition-all shrink-0 ${
            bookmark.isFavorite
              ? 'text-amber-500 dark:text-amber-400 bg-amber-500/10'
              : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <Star
            className={`w-4 h-4 ${bookmark.isFavorite ? 'fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400' : ''}`}
          />
        </button>

        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center shrink-0 overflow-hidden">
          {!faviconError && favicon ? (
            <img
              src={favicon}
              alt={domain}
              onError={() => setFaviconError(true)}
              className="w-3.5 h-3.5 object-contain"
              loading="lazy"
            />
          ) : (
            <Globe className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors truncate">
              {bookmark.title}
            </h4>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 hidden sm:inline truncate">
              {domain}
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate hidden md:block mt-0.5">
            {bookmark.description || 'Tidak ada deskripsi.'}
          </p>
        </div>
      </div>

      {/* Middle side: Folder & Tags */}
      <div className="hidden lg:flex items-center gap-3 shrink-0">
        {folder && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: folder.color || '#6366f1' }}
            />
            {folder.name}
          </span>
        )}

        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex items-center gap-1">
            {bookmark.tags.slice(0, 2).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => handleTagClick(e, tag)}
                className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/40 hover:bg-zinc-200 dark:hover:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Date & Hover Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap group-hover:hidden sm:block">
          {formatDateIndonesian(bookmark.createdAt)}
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title="Salin Tautan"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            title="Buka di Tab Baru"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleEdit}
            title="Edit Tautan"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            title="Hapus Tautan"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
