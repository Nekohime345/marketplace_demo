-- Run this once in the Supabase SQL Editor for your project.
create extension if not exists pgcrypto;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 90),
  description text not null check (char_length(description) between 1 and 1200),
  price numeric(10, 2) not null check (price > 0),
  email text not null check (char_length(email) <= 254),
  category text not null check (category in ('Furniture', 'Electronics', 'Home & garden', 'Fashion', 'Sports')),
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_email text not null check (char_length(buyer_email) <= 254),
  message text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;
alter table public.messages enable row level security;

create policy "Anyone can view listings" on public.listings
  for select to anon, authenticated using (true);
create policy "Anyone can create listings" on public.listings
  for insert to anon, authenticated with check (true);
create policy "Anyone can send seller messages" on public.messages
  for insert to anon, authenticated with check (true);

-- Table grants are needed in addition to RLS policies for the REST API roles.
grant usage on schema public to anon, authenticated;
grant select, insert on public.listings to anon, authenticated;
grant insert on public.messages to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

create policy "Anyone can upload listing photos" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'listing-images');
create policy "Anyone can view listing photos" on storage.objects
  for select to anon, authenticated using (bucket_id = 'listing-images');

grant select, insert on storage.objects to anon, authenticated;
