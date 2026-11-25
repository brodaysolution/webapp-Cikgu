-- CikguDocs: setup Supabase. Jalankan sekali dalam Supabase > SQL Editor.

-- 1. Jadual data: satu baris bagi setiap pengguna (profil sekolah + semua program, dalam JSON).
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- Setiap pengguna hanya boleh baca/tulis baris sendiri.
drop policy if exists "baca data sendiri" on public.user_data;
create policy "baca data sendiri" on public.user_data
  for select using (auth.uid() = user_id);
drop policy if exists "tambah data sendiri" on public.user_data;
create policy "tambah data sendiri" on public.user_data
  for insert with check (auth.uid() = user_id);
drop policy if exists "ubah data sendiri" on public.user_data;
create policy "ubah data sendiri" on public.user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. Storan gambar (resit, gambar program): bucket PERIBADI.
--    Laluan fail: <user_id>/<nama-fail>.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gambar', 'gambar', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "gambar: baca sendiri" on storage.objects;
create policy "gambar: baca sendiri" on storage.objects
  for select using (bucket_id = 'gambar' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "gambar: muat naik sendiri" on storage.objects;
create policy "gambar: muat naik sendiri" on storage.objects
  for insert with check (bucket_id = 'gambar' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "gambar: padam sendiri" on storage.objects;
create policy "gambar: padam sendiri" on storage.objects
  for delete using (bucket_id = 'gambar' and (storage.foldername(name))[1] = auth.uid()::text);
