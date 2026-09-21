import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './components/auth/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { BookmarkCheck, Loader2 } from 'lucide-react';

function App() {
  const { user, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Loading splash state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 animate-pulse">
            <BookmarkCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Memeriksa status sesi...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login Page
  if (!user) {
    return <LoginPage />;
  }

  // Authenticated -> Show Dashboard
  return <MainLayout />;
}

export default App;
