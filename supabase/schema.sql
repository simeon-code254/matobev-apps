create extension if not exists pgcrypto;
do $$ begin
  alter table public.profiles add column if not exists suspended boolean default false;
exception when undefined_table then null; end $$;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('player','scout','admin')) not null,
  country text not null,
  full_name text,
  avatar_url text,
  position text,
  team text,
  league text,
  bio text,
  approved boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.trials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date timestamptz not null,
  country text not null,
  thumbnail_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  published boolean default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  country text,
  start_date date,
  end_date date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  thread_id text generated always as (
    case when sender_id::text < receiver_id::text then sender_id::text || '_' || receiver_id::text
         else receiver_id::text || '_' || sender_id::text end
  ) stored,
  created_at timestamptz default now(),
  read_at timestamptz
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  status text check (status in ('uploaded','processing','ready','failed')) default 'uploaded',
  created_at timestamptz default now()
);

create table if not exists public.player_cards (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  upload_id uuid references public.uploads(id) on delete set null,
  speed int not null,
  stamina int not null,
  passing int not null,
  shooting int not null,
  strength int not null,
  card_image_url text,
  created_at timestamptz default now()
);

/* Storage buckets */
insert into storage.buckets (id, name, public) values
  ('videos','videos', false),
  ('thumbnails','thumbnails', true),
  ('player-cards','player-cards', true),
  ('avatars','avatars', true)
on conflict (id) do nothing;

/* Storage policies */
create policy "videos owners can upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'videos' and owner = auth.uid());

create policy "videos owners read own objects" on storage.objects
  for select to authenticated
  using (bucket_id = 'videos' and owner = auth.uid());

create policy "public read thumbnails" on storage.objects
  for select to anon
  using (bucket_id = 'thumbnails');

create policy "public read player-cards" on storage.objects
  for select to anon
  using (bucket_id = 'player-cards');

create policy "public read avatars" on storage.objects
  for select to anon
  using (bucket_id = 'avatars');

create policy "auth can upload thumbnails" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'thumbnails');

create policy "auth can upload player-cards" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'player-cards');

create policy "auth can upload avatars" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars');

alter table public.profiles enable row level security;
alter table public.trials enable row level security;
alter table public.news enable row level security;
alter table public.tournaments enable row level security;
alter table public.messages enable row level security;
alter table public.uploads enable row level security;
alter table public.player_cards enable row level security;

create policy profiles_self_read on public.profiles
  for select using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id);

create policy trials_insert_scouters on public.trials
  for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('scout','admin')));

create policy trials_select_all on public.trials
/* Trials owner/admin policies (idempotent) */
do $$ begin
  create policy trials_update_owner_or_admin on public.trials
    for update using (
      (created_by = auth.uid()) or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
    ) with check (
      (created_by = auth.uid()) or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
    );
exception when duplicate_object then null; end $$;
do $$ begin
  create policy trials_delete_owner_or_admin on public.trials
    for delete using (
      (created_by = auth.uid()) or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
    );
exception when duplicate_object then null; end $$;
create index if not exists idx_trials_country_date on public.trials(country, date);

create policy news_select_all on public.news
  for select using (true);
/* News admin write policies (idempotent) */
do $$ begin
  create policy news_admin_insert on public.news
    for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy news_admin_update on public.news
    for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy news_admin_delete on public.news
    for delete using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
exception when duplicate_object then null; end $$;
create index if not exists idx_news_created_at on public.news(created_at desc);


create policy tournaments_select_all on public.tournaments
  for select using (true);

create policy messages_rw_participants on public.messages
  for all using (sender_id = auth.uid() or receiver_id = auth.uid())
  with check (sender_id = auth.uid());

create policy uploads_owner_rw on public.uploads
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy player_cards_select_public on public.player_cards
  for select using (true);
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  description text,
  file_url text not null,
  thumbnail_url text,
  stats jsonb,
  created_at timestamptz default now()
);

alter table public.videos enable row level security;

do $$ begin
  create policy videos_owner_rw on public.videos
    for all using (user_id = auth.uid())
    with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy videos_select_all on public.videos
    for select using (true);
exception when duplicate_object then null; end $$;

/* Social interactions: likes */
create table if not exists public.video_likes (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(video_id, user_id)
);
alter table public.video_likes enable row level security;
do $$ begin
  create policy video_likes_rw on public.video_likes
    for all using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy video_likes_select_all on public.video_likes
    for select using (true);
exception when duplicate_object then null; end $$;
create index if not exists idx_video_likes_vid on public.video_likes(video_id);

/* Social interactions: comments */
create table if not exists public.video_comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);
alter table public.video_comments enable row level security;
do $$ begin
  create policy video_comments_rw on public.video_comments
    for all using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy video_comments_select_all on public.video_comments
    for select using (true);
exception when duplicate_object then null; end $$;
create index if not exists idx_video_comments_vid_created on public.video_comments(video_id, created_at desc);

/* Admin-managed tournaments */
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  country text not null,
  description text,
  start_date timestamptz,
  end_date timestamptz,
  poster_url text,
  created_at timestamptz default now(),
  created_by uuid references public.profiles(id) on delete set null
);
alter table public.tournaments enable row level security;
do $$ begin
  create policy tournaments_select_all on public.tournaments for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy tournaments_admin_write on public.tournaments
    for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
exception when duplicate_object then null; end $$;
create index if not exists idx_tournaments_country on public.tournaments(country);
create index if not exists idx_tournaments_dates on public.tournaments(start_date, end_date);

/* Platform settings */
create table if not exists public.settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);
alter table public.settings enable row level security;
do $$ begin
  create policy settings_admin_rw on public.settings
    for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
exception when duplicate_object then null; end $$;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz default now()
);

alter table public.conversations enable row level security;

do $$ begin
  create policy conversations_participants_rw on public.conversations
    for all using (auth.uid() = user_a or auth.uid() = user_b)
    with check (auth.uid() = user_a or auth.uid() = user_b);
exception when duplicate_object then null; end $$;

create index if not exists idx_messages_thread_id on public.messages(thread_id);
create index if not exists idx_messages_created_at on public.messages(created_at);

create or replace view public.messages_view as
select
  m.thread_id as conversation_id,
  case
    when m.sender_id = auth.uid() then m.receiver_id
    else m.sender_id
  end as other_party_id,
  (select p.full_name from public.profiles p
   where p.id = case when m.sender_id = auth.uid() then m.receiver_id else m.sender_id end) as other_party_name,
  max(m.created_at) as last_message_at,
  (select m2.content from public.messages m2
   where m2.thread_id = m.thread_id
   order by m2.created_at desc
   limit 1) as last_message_preview
from public.messages m
where (m.sender_id = auth.uid() or m.receiver_id = auth.uid())
group by m.thread_id;

create index if not exists idx_trials_date on public.trials(date);
create index if not exists idx_trials_country on public.trials(country);
create index if not exists idx_videos_user_created on public.videos(user_id, created_at desc);
/* Additional RLS policies and indexes */

/* News: admin-only writes */
do $$ begin
  create policy news_admin_insert on public.news
    for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy news_admin_update on public.news
    for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy news_admin_delete on public.news
    for delete using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
exception when duplicate_object then null; end $$;

create index if not exists idx_news_created_at on public.news(created_at desc);

/* Trials: scouts and admins can write; only owner can update/delete, admins can manage all */
do $$ begin
  create policy trials_update_owner_or_admin on public.trials
    for update using (
      (created_by = auth.uid()) or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
    ) with check (
      (created_by = auth.uid()) or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy trials_delete_owner_or_admin on public.trials
    for delete using (
      (created_by = auth.uid()) or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
    );
exception when duplicate_object then null; end $$;
