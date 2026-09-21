import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bookmark, Folder, ViewMode, SortOption, ActiveFilter, Toast, ThemeMode } from '../types';
import { INITIAL_BOOKMARKS, INITIAL_FOLDERS } from '../data/initialData';

interface BookmarkState {
  bookmarks: Bookmark[];
  folders: Folder[];
  viewMode: ViewMode;
  sortOption: SortOption;
  searchQuery: string;
  activeFilter: ActiveFilter;
  theme: ThemeMode;
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  isAddModalOpen: boolean;
  editingBookmark: Bookmark | null;
  isFolderModalOpen: boolean;
  deletingBookmarkId: string | null;
  toasts: Toast[];

  // Actions
  addBookmark: (data: { url: string; title: string; description: string; folderId?: string; tags: string[]; isFavorite?: boolean }) => void;
  updateBookmark: (id: string, data: Partial<Bookmark>) => void;
  deleteBookmark: (id: string) => void;
  toggleFavorite: (id: string) => void;
  
  addFolder: (name: string, icon?: string, color?: string) => void;
  deleteFolder: (id: string) => void;

  setViewMode: (mode: ViewMode) => void;
  setSortOption: (sort: SortOption) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: ActiveFilter) => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setAddModalOpen: (open: boolean) => void;
  setEditingBookmark: (bm: Bookmark | null) => void;
  setFolderModalOpen: (open: boolean) => void;
  setDeletingBookmarkId: (id: string | null) => void;

  addToast: (title: string, description?: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;

  resetToDemo: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: INITIAL_BOOKMARKS,
      folders: INITIAL_FOLDERS,
      viewMode: 'grid',
      sortOption: 'newest',
      searchQuery: '',
      activeFilter: { type: 'all', label: 'Semua Tautan' },
      theme: 'dark',
      isSidebarCollapsed: false,
      isMobileMenuOpen: false,
      isAddModalOpen: false,
      editingBookmark: null,
      isFolderModalOpen: false,
      deletingBookmarkId: null,
      toasts: [],

      addBookmark: (data) => {
        const newBookmark: Bookmark = {
          id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: data.url,
          title: data.title || data.url,
          description: data.description,
          folderId: data.folderId || '',
          tags: data.tags,
          isFavorite: !!data.isFavorite,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          bookmarks: [newBookmark, ...state.bookmarks],
        }));

        get().addToast('Tautan Berhasil Ditambahkan', newBookmark.title, 'success');
      },

      updateBookmark: (id, updates) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((bm) =>
            bm.id === id ? { ...bm, ...updates, updatedAt: new Date().toISOString() } : bm
          ),
        }));
        get().addToast('Tautan Diperbarui', 'Perubahan berhasil disimpan.', 'success');
      },

      deleteBookmark: (id) => {
        const target = get().bookmarks.find((bm) => bm.id === id);
        set((state) => ({
          bookmarks: state.bookmarks.filter((bm) => bm.id !== id),
          deletingBookmarkId: null,
        }));
        if (target) {
          get().addToast('Tautan Dihapus', `"${target.title}" telah dihapus.`, 'info');
        }
      },

      toggleFavorite: (id) => {
        const item = get().bookmarks.find((bm) => bm.id === id);
        const willFavorite = item ? !item.isFavorite : false;
        
        set((state) => ({
          bookmarks: state.bookmarks.map((bm) =>
            bm.id === id ? { ...bm, isFavorite: !bm.isFavorite } : bm
          ),
        }));

        if (item) {
          get().addToast(
            willFavorite ? 'Ditambahkan ke Favorit' : 'Dihapus dari Favorit',
            item.title,
            'info'
          );
        }
      },

      addFolder: (name, icon = 'Folder', color = '#6366f1') => {
        const trimmed = name.trim();
        if (!trimmed) return;
        
        const newFolder: Folder = {
          id: `folder-${Date.now()}`,
          name: trimmed,
          icon,
          color,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          folders: [...state.folders, newFolder],
        }));

        get().addToast('Folder Dibuat', `Koleksi "${trimmed}" berhasil dibuat.`, 'success');
      },

      deleteFolder: (id) => {
        const folder = get().folders.find((f) => f.id === id);
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
          bookmarks: state.bookmarks.map((bm) =>
            bm.folderId === id ? { ...bm, folderId: '' } : bm
          ),
          activeFilter: state.activeFilter.value === id 
            ? { type: 'all', label: 'Semua Tautan' } 
            : state.activeFilter,
        }));

        if (folder) {
          get().addToast('Folder Dihapus', `Koleksi "${folder.name}" telah dihapus.`, 'info');
        }
      },

      setViewMode: (mode) => set({ viewMode: mode }),
      setSortOption: (sort) => set({ sortOption: sort }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveFilter: (filter) => set({ activeFilter: filter }),
      
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
          if (next === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        set({ theme: next });
      },

      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        set({ theme });
      },

      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setAddModalOpen: (open) => set({ isAddModalOpen: open }),
      setEditingBookmark: (bm) => set({ editingBookmark: bm }),
      setFolderModalOpen: (open) => set({ isFolderModalOpen: open }),
      setDeletingBookmarkId: (id) => set({ deletingBookmarkId: id }),

      addToast: (title, description, type = 'info') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        const toast: Toast = { id, title, description, type };
        
        set((state) => ({
          toasts: [...state.toasts.slice(-4), toast],
        }));

        setTimeout(() => {
          get().removeToast(id);
        }, 3500);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      resetToDemo: () => {
        set({
          bookmarks: INITIAL_BOOKMARKS,
          folders: INITIAL_FOLDERS,
          activeFilter: { type: 'all', label: 'Semua Tautan' },
          searchQuery: '',
        });
        get().addToast('Data Demo Dipulihkan', 'Semua contoh tautan dan folder telah direset.', 'info');
      },

      exportData: () => {
        const { bookmarks, folders } = get();
        return JSON.stringify({ bookmarks, folders, version: '1.0' }, null, 2);
      },

      importData: (jsonData: string) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (Array.isArray(parsed.bookmarks) && Array.isArray(parsed.folders)) {
            set({
              bookmarks: parsed.bookmarks,
              folders: parsed.folders,
            });
            get().addToast('Impor Berhasil', `${parsed.bookmarks.length} tautan berhasil diimpor.`, 'success');
            return true;
          }
          get().addToast('Gagal Impor', 'Format berkas JSON tidak sesuai.', 'error');
          return false;
        } catch {
          get().addToast('Gagal Impor', 'Gagal memproses berkas JSON.', 'error');
          return false;
        }
      },
    }),
    {
      name: 'tautanku-storage-v1',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        folders: state.folders,
        viewMode: state.viewMode,
        sortOption: state.sortOption,
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }
  )
);
