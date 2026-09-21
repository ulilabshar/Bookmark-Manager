import React from 'react';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Plus, 
  Menu, 
  ArrowUpDown,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import type { SortOption } from '../../types';

export const Header: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    viewMode, 
    setViewMode, 
    sortOption, 
    setSortOption, 
    setAddModalOpen, 
    setMobileMenuOpen,
    activeFilter,
    bookmarks,
    theme,
    toggleTheme 
  } = useBookmarkStore();

  const totalFilteredCount = bookmarks.filter((bm) => {
    if (activeFilter.type === 'favorites') return bm.isFavorite;
    if (activeFilter.type === 'uncategorized') return !bm.folderId || bm.folderId.trim() === '';
    if (activeFilter.type === 'folder') return bm.folderId === activeFilter.value;
    if (activeFilter.type === 'tag') {
      return bm.tags && bm.tags.some((t) => t.toLowerCase() === activeFilter.value?.toLowerCase());
    }
    return true;
  }).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-8 py-3.5 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl transition-colors duration-200">
      {/* Mobile Menu & Active Section Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 lg:hidden transition-colors"
          title="Buka Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <span>{activeFilter.label}</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
              {totalFilteredCount}
            </span>
          </h1>
        </div>
      </div>

      {/* Center / Search Bar with clear button 'X' */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6">
        <div className="relative group">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Cari judul, URL, atau label..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/90 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              title="Hapus pencarian"
              className="absolute right-2.5 top-2.5 p-0.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right controls: Theme Toggle, Sort, View Toggle, Add Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-all"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Sort dropdown */}
        <div className="relative hidden md:block">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            aria-label="Urutan tautan"
            className="appearance-none px-3 py-2 pr-7 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="alpha">Judul (A-Z)</option>
          </select>
          <ArrowUpDown className="pointer-events-none absolute right-2.5 top-2.5 w-3 h-3 text-zinc-400 dark:text-zinc-500" />
        </div>

        {/* View Mode Switcher (Grid vs List) */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            title="Tampilan Grid"
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            title="Tampilan List"
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Main "Tambah Tautan" Button */}
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Tautan</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>
    </header>
  );
};
