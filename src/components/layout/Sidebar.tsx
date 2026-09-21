import React, { useMemo, useRef } from 'react';
import { 
  BookmarkCheck, 
  Bookmark, 
  Star, 
  FolderMinus, 
  FolderPlus, 
  Tag as TagIcon, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Upload, 
  RotateCcw,
  X,
  Database
} from 'lucide-react';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { isSupabaseConfigured } from '../../lib/supabase';

export const Sidebar: React.FC = () => {
  const {
    bookmarks,
    folders,
    activeFilter,
    setActiveFilter,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileMenuOpen,
    setMobileMenuOpen,
    setFolderModalOpen,
    resetToDemo,
    exportData,
    importData,
    addToast
  } = useBookmarkStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Counts calculations
  const totalAll = bookmarks.length;
  const totalFavorites = bookmarks.filter((b) => b.isFavorite).length;
  const totalUncategorized = bookmarks.filter((b) => !b.folderId || b.folderId.trim() === '').length;

  // Folder counts map
  const folderCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of folders) {
      map[f.id] = bookmarks.filter((b) => b.folderId === f.id).length;
    }
    return map;
  }, [folders, bookmarks]);

  // Tags collection with count
  const tagCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of bookmarks) {
      if (b.tags && Array.isArray(b.tags)) {
        for (const t of b.tags) {
          map[t] = (map[t] || 0) + 1;
        }
      }
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [bookmarks]);

  // Export JSON file
  const handleExport = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tautanku-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Ekspor Berhasil', 'Berkas cadangan JSON berhasil diunduh.', 'success');
  };

  // Import JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importData(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 mb-2 border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white block truncate">
                  TautanKu
                </span>
                <span className="text-[10px] text-zinc-500 font-medium block">
                  Bookmark Manager
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-2 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
          {/* Main Links */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Utama
              </p>
            )}

            {/* Semua Tautan */}
            <button
              type="button"
              onClick={() => {
                setActiveFilter({ type: 'all', label: 'Semua Tautan' });
                setMobileMenuOpen(false);
              }}
              title="Semua Tautan"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeFilter.type === 'all'
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Bookmark className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Semua Tautan</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[11px] font-mono text-zinc-500 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80">
                  {totalAll}
                </span>
              )}
            </button>

            {/* Favorit */}
            <button
              type="button"
              onClick={() => {
                setActiveFilter({ type: 'favorites', label: 'Favorit' });
                setMobileMenuOpen(false);
              }}
              title="Favorit"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeFilter.type === 'favorites'
                  ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Star className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400" />
                {!isSidebarCollapsed && <span className="truncate">Favorit</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[11px] font-mono text-zinc-500 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80">
                  {totalFavorites}
                </span>
              )}
            </button>

            {/* Belum Dikategorikan */}
            <button
              type="button"
              onClick={() => {
                setActiveFilter({ type: 'uncategorized', label: 'Belum Dikategorikan' });
                setMobileMenuOpen(false);
              }}
              title="Belum Dikategorikan"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeFilter.type === 'uncategorized'
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FolderMinus className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Belum Dikategorikan</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[11px] font-mono text-zinc-500 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80">
                  {totalUncategorized}
                </span>
              )}
            </button>
          </div>

          {/* Folders / Koleksi */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              {!isSidebarCollapsed && (
                <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Koleksi & Folder
                </p>
              )}
              <button
                type="button"
                onClick={() => setFolderModalOpen(true)}
                title="Tambah Folder Baru"
                className="p-1 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {folders.map((folder) => {
              const isCurrent = activeFilter.type === 'folder' && activeFilter.value === folder.id;
              const count = folderCounts[folder.id] || 0;

              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => {
                    setActiveFilter({
                      type: 'folder',
                      value: folder.id,
                      label: folder.name,
                    });
                    setMobileMenuOpen(false);
                  }}
                  title={folder.name}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-zinc-200/70 dark:bg-zinc-800/90 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: folder.color || '#6366f1' }}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{folder.name}</span>
                    )}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[11px] font-mono text-zinc-500 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900/80">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tags */}
          {tagCounts.length > 0 && !isSidebarCollapsed && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Label (Tags)
              </p>
              <div className="flex flex-wrap gap-1.5 px-2">
                {tagCounts.map(([tag, count]) => {
                  const isCurrent = activeFilter.type === 'tag' && activeFilter.value === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setActiveFilter({
                          type: 'tag',
                          value: tag,
                          label: `#${tag}`,
                        });
                        setMobileMenuOpen(false);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40'
                          : 'bg-zinc-100 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800/80'
                      }`}
                    >
                      <TagIcon className="w-2.5 h-2.5" />
                      <span>{tag}</span>
                      <span className="text-[10px] text-zinc-500">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Utility Actions: Reset Demo, Export, Import */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 space-y-1 bg-zinc-50/70 dark:bg-zinc-950/40">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          className="hidden"
        />

        {!isSidebarCollapsed ? (
          <div className="space-y-1.5">
            {/* Database Connection Status Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium border mb-1 transition-colors ${
              isSupabaseConfigured
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}>
              <Database className={`w-3 h-3 ${isSupabaseConfigured ? 'text-emerald-500' : 'text-zinc-400'}`} />
              <span className="truncate">
                {isSupabaseConfigured ? 'Database Supabase Terhubung' : 'Penyimpanan: Mode Lokal'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleExport}
                title="Ekspor Data ke JSON"
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-colors shadow-xs"
              >
                <Download className="w-3 h-3" />
                <span>Ekspor</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Impor Data dari JSON"
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-colors shadow-xs"
              >
                <Upload className="w-3 h-3" />
                <span>Impor</span>
              </button>
            </div>

            <button
              type="button"
              onClick={resetToDemo}
              title="Kembalikan Contoh Data Bawaan"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={resetToDemo}
              title="Reset Data Demo"
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 border-r border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Sheet */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
