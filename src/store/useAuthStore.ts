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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  initAuth: async () => {
    if (!supabase || !isSupabaseConfigured) {
      set({ isLoading: false });
      return;
    }

    try {
      // 1. Check current session
      const { data: { session } } = await supabase.auth.getSession();
      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });

      // 2. Listen to real-time auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
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
    if (!supabase || !isSupabaseConfigured) {
      set({ user: null, session: null });
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
