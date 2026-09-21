import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  initAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const DEMO_EMAIL = 'admin@test.com';
const DEMO_PASSWORD = 'admin123';
const DEMO_STORAGE_KEY = 'tautanku_demo_session';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  initAuth: async () => {
    // 1. Cek apakah ada sesi demo yang aktif
    const savedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        if (parsed?.user) {
          set({
            user: parsed.user,
            session: parsed.session ?? null,
            isLoading: false,
          });
          return;
        }
      } catch {
        localStorage.removeItem(DEMO_STORAGE_KEY);
      }
    }

    if (!supabase || !isSupabaseConfigured) {
      set({ isLoading: false });
      return;
    }

    try {
      // 2. Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });

      // 3. Listen to real-time auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
        // Jika sedang mode demo, jangan ditimpa session null dari supabase
        if (localStorage.getItem(DEMO_STORAGE_KEY)) return;

        set({
          session,
          user: session?.user ?? null,
          isLoading: false,
        });
      });
    } catch (err: any) {
      console.error('Gagal inisialisasi auth:', err);
      set({ isLoading: false, error: err?.message || 'Gagal memuat sesi' });
    }
  },

  signIn: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Kredensial Demo Cepat
    if (cleanEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const demoUser: User = {
        id: 'demo-admin-user-id',
        app_metadata: {},
        user_metadata: { name: 'Admin Demo' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: DEMO_EMAIL,
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      } as unknown as User;

      const demoSession: Session = {
        access_token: 'demo-access-token',
        token_type: 'bearer',
        expires_in: 86400,
        refresh_token: 'demo-refresh-token',
        user: demoUser,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
      };

      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ user: demoUser, session: demoSession }));

      set({
        session: demoSession,
        user: demoUser,
        isLoading: false,
        error: null,
      });

      return { success: true };
    }

    // 2. Kredensial Supabase Asli
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, error: 'Koneksi Supabase belum terkonfigurasi' };
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      localStorage.removeItem(DEMO_STORAGE_KEY);
      set({
        session: data.session,
        user: data.user,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Terjadi kesalahan saat masuk';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  signUp: async (email, password) => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, error: 'Koneksi Supabase belum terkonfigurasi' };
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      set({
        session: data.session,
        user: data.user,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Terjadi kesalahan saat mendaftar';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  signOut: async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);

    if (!supabase || !isSupabaseConfigured) {
      set({ user: null, session: null, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error saat logout:', err);
    } finally {
      set({ user: null, session: null, isLoading: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));
