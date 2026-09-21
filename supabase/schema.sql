-- ==========================================
-- Skema Database Supabase untuk TautanKu
-- Salin dan jalankan seluruh skrip ini di:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==========================================

-- 1. Tabel Folders (Koleksi)
create table if not exists public.folders (
  id text primary key,
  name text not null,
  icon text default 'Folder',
  color text default '#6366f1',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabel Bookmarks (Tautan Tersimpan)
create table if not exists public.bookmarks (
  id text primary key,
  url text not null,
  title text not null,
  description text default '',
  folder_id text references public.folders(id) on delete set null,
  tags text[] default array[]::text[],
  is_favorite boolean default false,
  favicon_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Indeks untuk Performa Pencarian & Filter
create index if not exists idx_bookmarks_folder_id on public.bookmarks(folder_id);
create index if not exists idx_bookmarks_is_favorite on public.bookmarks(is_favorite);
create index if not exists idx_bookmarks_created_at on public.bookmarks(created_at desc);

-- 4. Keamanan Tingkat Baris (Row Level Security - RLS)
alter table public.folders enable row level security;
alter table public.bookmarks enable row level security;

-- Kebijakan Akses Publik (Anonim) untuk Membaca, Menambah, Mengubah, dan Menghapus
create policy "Akses publik penuh ke folders"
  on public.folders
  for all
  using (true)
  with check (true);

create policy "Akses publik penuh ke bookmarks"
  on public.bookmarks
  for all
  using (true)
  with check (true);

-- 5. Data Awal Contoh (Opsional)
insert into public.folders (id, name, icon, color, created_at)
values
  ('folder-work', 'Pekerjaan', 'Briefcase', '#6366f1', '2026-08-01T10:00:00.000Z'),
  ('folder-inspiration', 'Inspirasi & Desain', 'Sparkles', '#a855f7', '2026-08-05T11:30:00.000Z'),
  ('folder-readlater', 'Baca Nanti', 'BookOpen', '#10b981', '2026-08-10T14:15:00.000Z'),
  ('folder-devtools', 'Alat Pengembang', 'Code2', '#f59e0b', '2026-08-12T09:00:00.000Z')
on conflict (id) do nothing;

insert into public.bookmarks (id, url, title, description, folder_id, tags, is_favorite, created_at, updated_at)
values
  ('bm-1', 'https://linear.app', 'Linear – Pelacak Isu & Proyek Berkecepatan Tinggi', 'Aplikasi pelacak siklus kerja dan tugas tim dengan estetika antarmuka dark mode terbaik di kelasnya.', 'folder-work', array['Produktivitas', 'Manajemen', 'Desain'], true, '2026-09-19T08:20:00.000Z', '2026-09-19T08:20:00.000Z'),
  ('bm-2', 'https://raycast.com', 'Raycast – Peluncur Cepat & Ekstensi Produktivitas', 'Pusat komando keyboard yang dapat diperluas untuk mengontrol alur kerja harian tanpa menyentuh mouse.', 'folder-devtools', array['Produktivitas', 'Alat', 'Keyboard'], true, '2026-09-18T14:10:00.000Z', '2026-09-18T14:10:00.000Z'),
  ('bm-3', 'https://tailwindcss.com', 'Tailwind CSS – Framework CSS Utility Modern', 'Dokumentasi resmi styling modern berkecepatan tinggi dengan kelas atomik yang fleksibel.', 'folder-devtools', array['CSS', 'Frontend', 'Web'], false, '2026-09-17T09:30:00.000Z', '2026-09-17T09:30:00.000Z'),
  ('bm-4', 'https://mobbin.com', 'Mobbin – Direktori Referensi UI/UX Nyata', 'Koleksi screenshot dan alur antarmuka aplikasi iOS, Android, dan Web terpopuler di dunia.', 'folder-inspiration', array['UI/UX', 'Inspirasi', 'Desain'], true, '2026-09-16T16:45:00.000Z', '2026-09-16T16:45:00.000Z'),
  ('bm-5', 'https://supabase.com', 'Supabase – Alternatif Open Source Firebase', 'Database PostgreSQL instan, autentikasi pengguna, edge functions, dan real-time subscription.', 'folder-devtools', array['Backend', 'Database', 'PostgreSQL'], false, '2026-09-15T11:00:00.000Z', '2026-09-15T11:00:00.000Z')
on conflict (id) do nothing;
