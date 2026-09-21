import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookmarkX, Plus, FilterX } from 'lucide-react';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { BookmarkCard } from './BookmarkCard';
import { BookmarkRow } from './BookmarkRow';

export const BookmarkGrid: React.FC = () => {
  const { 
    bookmarks, 
    viewMode, 
    sortOption, 
    searchQuery, 
    activeFilter, 
    setAddModalOpen,
    setActiveFilter,
    setSearchQuery 
  } = useBookmarkStore();

  const filteredBookmarks = useMemo(() => {
    return bookmarks
      .filter((bm) => {
        // 1. Navigation / category filter
        if (activeFilter.type === 'favorites') {
          if (!bm.isFavorite) return false;
        } else if (activeFilter.type === 'uncategorized') {
          if (bm.folderId && bm.folderId.trim() !== '') return false;
        } else if (activeFilter.type === 'folder') {
          if (bm.folderId !== activeFilter.value) return false;
        } else if (activeFilter.type === 'tag') {
          if (!bm.tags || !bm.tags.some(t => t.toLowerCase() === activeFilter.value?.toLowerCase())) {
            return false;
          }
        }

        // 2. Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = bm.title.toLowerCase().includes(q);
          const matchUrl = bm.url.toLowerCase().includes(q);
          const matchDesc = (bm.description || '').toLowerCase().includes(q);
          const matchTags = (bm.tags || []).some(t => t.toLowerCase().includes(q));
          return matchTitle || matchUrl || matchDesc || matchTags;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOption === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortOption === 'alpha') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [bookmarks, activeFilter, searchQuery, sortOption]);

  const hasFilterActive = activeFilter.type !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="w-full">
      {/* Active Filter Pill Bar (if any) */}
      {hasFilterActive && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium">Filter aktif:</span>
          {activeFilter.type !== 'all' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              <span>{activeFilter.label}</span>
              <button
                type="button"
                onClick={() => setActiveFilter({ type: 'all', label: 'Semua Tautan' })}
                className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                title="Hapus filter"
              >
                &times;
              </button>
            </div>
          )}

          {searchQuery.trim() && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              <span>Cari: &ldquo;{searchQuery}&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                title="Hapus pencarian"
              >
                &times;
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setActiveFilter({ type: 'all', label: 'Semua Tautan' });
              setSearchQuery('');
            }}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 underline underline-offset-4 ml-2"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredBookmarks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/20 my-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 text-zinc-400 dark:text-zinc-500 shadow-sm">
            {hasFilterActive ? (
              <FilterX className="w-7 h-7 text-zinc-400 dark:text-zinc-500" />
            ) : (
              <BookmarkX className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
            )}
          </div>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            {hasFilterActive ? 'Tidak ada tautan yang cocok' : 'Belum ada tautan tersimpan'}
          </h3>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
            {hasFilterActive
              ? 'Coba sesuaikan kata kunci pencarian atau bersihkan filter yang sedang aktif.'
              : 'Mulai bangun perpustakaan tautan digital Anda dengan menyimpan artikel, dokumentasi, atau inspirasi.'}
          </p>

          <div className="flex items-center gap-3">
            {hasFilterActive ? (
              <button
                type="button"
                onClick={() => {
                  setActiveFilter({ type: 'all', label: 'Semua Tautan' });
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700"
              >
                Hapus Filter
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tautan Baru</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Grid or List View Rendering */}
      {filteredBookmarks.length > 0 && (
        <div>
          {viewMode === 'grid' ? (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div layout className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkRow key={bookmark.id} bookmark={bookmark} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
