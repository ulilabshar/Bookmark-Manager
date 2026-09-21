import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bookmark, Folder, ViewMode, SortOption, ActiveFilter, Toast, ThemeMode } from '../types';
import { INITIAL_BOOKMARKS, INITIAL_FOLDERS } from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  isSyncing: boolean;
  toasts: Toast[];

  // Actions
  fetchFromSupabase: () => Promise<void>;
  addBookmark: (data: { url: string; title: string; description: string; folderId?: string; tags: string[]; isFavorite?: boolean }) => Promise<void>;
  updateBookmark: (id: string, data: Partial<Bookmark>) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  
  addFolder: (name: string, icon?: string, color?: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;

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
      bookmarks: [],
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
      isSyncing: false,
      toasts: [],

      fetchFromSupabase: async () => {
        // Cek jika sedang mode demo
        const isDemo = localStorage.getItem('tautanku_demo_session');
        if (isDemo) {
          // Jika akun demo dan belum ada bookmark, muat INITIAL_BOOKMARKS untuk demo saja
          if (get().bookmarks.length === 0) {
            set({ bookmarks: INITIAL_BOOKMARKS });
          }
          return;
        }

        if (!supabase || !isSupabaseConfigured) return;
        try {
          set({ isSyncing: true });

          // 1. Fetch folders
          const { data: foldersData, error: foldersErr } = await supabase
            .from('folders')
            .select('*')
            .order('created_at', { ascending: true });

          if (!foldersErr && foldersData && foldersData.length > 0) {
            const mappedFolders: Folder[] = foldersData.map((f: any) => ({
              id: f.id,
              name: f.name,
              icon: f.icon || 'Folder',
              color: f.color || '#6366f1',
              createdAt: f.created_at,
            }));
            set({ folders: mappedFolders });
          }

          // 2. Fetch bookmarks
          const { data: bookmarksData, error: bookmarksErr } = await supabase
            .from('bookmarks')
            .select('*')
            .order('created_at', { ascending: false });

          if (!bookmarksErr && bookmarksData) {
            const mappedBookmarks: Bookmark[] = bookmarksData.map((b: any) => ({
              id: b.id,
              url: b.url,
              title: b.title,
              description: b.description || '',
              folderId: b.folder_id || '',
              tags: b.tags || [],
              isFavorite: !!b.is_favorite,
              faviconUrl: b.favicon_url,
              createdAt: b.created_at,
              updatedAt: b.updated_at,
            }));
            set({ bookmarks: mappedBookmarks });
          }
        } catch (error) {
          console.error('Gagal mengambil data dari Supabase:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      addBookmark: async (data) => {
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

        // Optimistic local update
        set((state) => ({
          bookmarks: [newBookmark, ...state.bookmarks],
        }));

        get().addToast('Tautan Berhasil Ditambahkan', newBookmark.title, 'success');

        // Sync with Supabase
        if (supabase && isSupabaseConfigured) {
          try {
            let validFolderId: string | null = null;
            if (newBookmark.folderId && newBookmark.folderId.trim() !== '') {
              // Ensure folder exists in Supabase
              const targetFolder = get().folders.find((f) => f.id === newBookmark.folderId);
              if (targetFolder) {
                await supabase.from('folders').upsert({
                  id: targetFolder.id,
                  name: targetFolder.name,
                  icon: targetFolder.icon || 'Folder',
                  color: targetFolder.color || '#6366f1',
                  created_at: targetFolder.createdAt,
                });
                validFolderId = targetFolder.id;
              }
            }

            const { error } = await supabase.from('bookmarks').insert({
              id: newBookmark.id,
              url: newBookmark.url,
              title: newBookmark.title,
              description: newBookmark.description,
              folder_id: validFolderId,
              tags: newBookmark.tags,
              is_favorite: newBookmark.isFavorite,
              created_at: newBookmark.createdAt,
              updated_at: newBookmark.updatedAt,
            });

            if (error) {
              console.error('Gagal menyimpan ke Supabase:', error);
              get().addToast('Peringatan Database', `Supabase: ${error.message}`, 'warning');
            } else {
              get().addToast('Tersimpan di Supabase', 'Data berhasil disinkronkan ke database cloud.', 'success');
            }
          } catch (err: any) {
            console.error('Gagal menyimpan tautan ke Supabase:', err);
            get().addToast('Peringatan Database', err?.message || 'Gagal terhubung ke Supabase', 'warning');
          }
        }
      },

      updateBookmark: async (id, updates) => {
        const updatedAt = new Date().toISOString();
        set((state) => ({
          bookmarks: state.bookmarks.map((bm) =>
            bm.id === id ? { ...bm, ...updates, updatedAt } : bm
          ),
        }));
        get().addToast('Tautan Diperbarui', 'Perubahan berhasil disimpan.', 'success');

        if (supabase && isSupabaseConfigured) {
          try {
            const payload: any = { updated_at: updatedAt };
            if (updates.url !== undefined) payload.url = updates.url;
            if (updates.title !== undefined) payload.title = updates.title;
            if (updates.description !== undefined) payload.description = updates.description;
            if (updates.folderId !== undefined) payload.folder_id = updates.folderId || null;
            if (updates.tags !== undefined) payload.tags = updates.tags;
            if (updates.isFavorite !== undefined) payload.is_favorite = updates.isFavorite;

            const { error } = await supabase.from('bookmarks').update(payload).eq('id', id);
            if (error) {
              console.error('Gagal update di Supabase:', error);
            }
          } catch (err) {
            console.error('Gagal memperbarui tautan di Supabase:', err);
          }
        }
      },

      deleteBookmark: async (id) => {
        const target = get().bookmarks.find((bm) => bm.id === id);
        set((state) => ({
          bookmarks: state.bookmarks.filter((bm) => bm.id !== id),
          deletingBookmarkId: null,
        }));
        if (target) {
          get().addToast('Tautan Dihapus', `"${target.title}" telah dihapus.`, 'info');
        }

        if (supabase && isSupabaseConfigured) {
          try {
            const { error } = await supabase.from('bookmarks').delete().eq('id', id);
            if (error) {
              console.error('Gagal menghapus dari Supabase:', error);
            }
          } catch (err) {
            console.error('Gagal menghapus tautan dari Supabase:', err);
          }
        }
      },

      toggleFavorite: async (id) => {
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

        if (supabase && isSupabaseConfigured) {
          try {
            const { error } = await supabase.from('bookmarks').update({ is_favorite: willFavorite }).eq('id', id);
            if (error) {
              console.error('Gagal toggle favorit di Supabase:', error);
            }
          } catch (err) {
            console.error('Gagal mengubah status favorit di Supabase:', err);
          }
        }
      },

      addFolder: async (name, icon = 'Folder', color = '#6366f1') => {
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

        if (supabase && isSupabaseConfigured) {
          try {
            const { error } = await supabase.from('folders').insert({
              id: newFolder.id,
              name: newFolder.name,
              icon: newFolder.icon,
              color: newFolder.color,
              created_at: newFolder.createdAt,
            });
            if (error) {
              console.error('Gagal insert folder di Supabase:', error);
            }
          } catch (err) {
            console.error('Gagal membuat folder di Supabase:', err);
          }
        }
      },

      deleteFolder: async (id) => {
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

        if (supabase && isSupabaseConfigured) {
          try {
            const { error } = await supabase.from('folders').delete().eq('id', id);
            if (error) {
              console.error('Gagal delete folder di Supabase:', error);
            }
          } catch (err) {
            console.error('Gagal menghapus folder di Supabase:', err);
          }
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
      name: 'tautanku-storage-v2',
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
