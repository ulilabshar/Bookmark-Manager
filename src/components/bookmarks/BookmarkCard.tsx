import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  ExternalLink, 
  Copy, 
  Check, 
  Pencil, 
  Trash2, 
  Folder as FolderIcon,
  Globe
} from 'lucide-react';
import type { Bookmark } from '../../types';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { extractDomain, getFaviconUrl, formatDateIndonesian } from '../../utils/helpers';

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark }) => {
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

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    setActiveFilter({ type: 'tag', value: tag, label: `#${tag}` });
  };

  const handleFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (folder) {
      setActiveFilter({ type: 'folder', value: folder.id, label: folder.name });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={handleOpen}
      className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer"
    >
      <div>
        {/* Top bar: Favicon, Domain, and Quick Star */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center overflow-hidden shrink-0 shadow-xs group-hover:border-zinc-300 dark:group-hover:border-zinc-600 transition-colors">
              {!faviconError && favicon ? (
                <img
                  src={favicon}
                  alt={domain}
                  onError={() => setFaviconError(true)}
                  className="w-4 h-4 object-contain"
                  loading="lazy"
                />
              ) : (
                <Globe className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              )}
            </div>
            <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 truncate group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
              {domain}
            </span>
          </div>

          <button
            type="button"
            onClick={handleFavorite}
            aria-label={bookmark.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            className={`p-1.5 rounded-lg transition-all ${
              bookmark.isFavorite
                ? 'text-amber-500 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Star
              className={`w-4 h-4 ${bookmark.isFavorite ? 'fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400' : ''}`}
            />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors line-clamp-1 mb-1.5 tracking-tight">
          {bookmark.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400/90 line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
          {bookmark.description || 'Tidak ada deskripsi.'}
        </p>

        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {bookmark.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => handleTagClick(e, tag)}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors border border-zinc-200 dark:border-zinc-700/40"
              >
                #{tag}
              </button>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 self-center px-1">
                +{bookmark.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer: Folder & Date */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center gap-1.5 min-w-0">
          {folder ? (
            <button
              type="button"
              onClick={handleFolderClick}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors truncate"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: folder.color || '#6366f1' }}
              />
              <span className="truncate">{folder.name}</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              <FolderIcon className="w-3 h-3" />
              <span>Umum</span>
            </span>
          )}
        </div>

        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 shrink-0">
          {formatDateIndonesian(bookmark.createdAt)}
        </span>
      </div>

      {/* Floating Action Bar on Hover */}
      <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
        <div className="flex items-center justify-between p-1.5 rounded-xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-700/80 shadow-xl text-zinc-700 dark:text-zinc-300">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleOpen}
              title="Buka di Tab Baru"
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs flex items-center gap-1 px-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Buka</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              title="Salin Tautan"
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleEdit}
              title="Edit Tautan"
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              title="Hapus Tautan"
              className="p-1.5 rounded-lg hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400 text-zinc-400 dark:text-zinc-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
