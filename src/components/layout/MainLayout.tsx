import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BookmarkGrid } from '../bookmarks/BookmarkGrid';
import { BookmarkFormModal } from '../bookmarks/BookmarkFormModal';
import { DeleteConfirmModal } from '../bookmarks/DeleteConfirmModal';
import { FolderModal } from '../folders/FolderModal';
import { ToastContainer } from '../ui/Toast';
import { useBookmarkStore } from '../../store/useBookmarkStore';

export const MainLayout: React.FC = () => {
  const { fetchFromSupabase } = useBookmarkStore();

  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-row transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <Header />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <BookmarkGrid />
        </main>
      </div>

      {/* Overlays and Modals */}
      <BookmarkFormModal />
      <FolderModal />
      <DeleteConfirmModal />
      <ToastContainer />
    </div>
  );
};
