-- Plataforma firma de abogados — esquema inicial con RLS.
-- Roles: client (por defecto), lawyer, admin. Nadie puede auto-asignarse rol.

create extension if not exists pgcrypto;

create type public.user_role as enum ('client', 'lawyer', 'admin');
create type public.request_status as enum ('pendiente', 'en_revision', 'contactado', 'cerrado', 'rechazado');
create type public.review_status as enum ('pendiente', 'aprobada', 'rechazada');

-- ───────────────────────── perfiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text check (phone is null or char_length(phone) <= 30),
  document_id text check (document_id is null or char_length(document_id) <= 30),
  city text check (city is null or char_length(city) <= 80),
  role public.user_role not null default 'client',
  data_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpers de rol. SECURITY DEFINER para evitar recursión de RLS sobre profiles.
create or replace function public.current_role_name()
returns public.user_role
language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false) $$;

-- ───────────────────────── firmas, especialidades, abogados
create table public.firms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  city text,
  website text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.specialties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  name text not null check (char_length(name) between 2 and 120),
  short_name text not null,
  icon text not null default 'scale',
  summary text not null default '',
  description text not null default '',
  problems text[] not null default '{}',
  services text[] not null default '{}',
  faqs jsonb not null default '[]'::jsonb check (jsonb_typeof(faqs) = 'array'),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lawyers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  firm_id uuid references public.firms (id) on delete set null,
  full_name text not null check (char_length(full_name) between 3 and 120),
  title text not null default 'Abogado',
  photo_url text,
  bio text not null default '' check (char_length(bio) <= 4000),
  experience text not null default '' check (char_length(experience) <= 4000),
  education text not null default '' check (char_length(education) <= 4000),
  services text[] not null default '{}',
  years_experience int check (years_experience is null or years_experience between 0 and 70),
  professional_card text,
  availability text not null default 'Disponible para consultas',
  accepts_consultations boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lawyers_firm_idx on public.lawyers (firm_id);

create table public.lawyer_specialties (
  lawyer_id uuid not null references public.lawyers (id) on delete cascade,
  specialty_id uuid not null references public.specialties (id) on delete cascade,
  primary key (lawyer_id, specialty_id)
);
create index lawyer_specialties_specialty_idx on public.lawyer_specialties (specialty_id);

-- ───────────────────────── solicitudes de asesoría
create table public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  specialty_id uuid not null references public.specialties (id) on delete restrict,
  lawyer_id uuid references public.lawyers (id) on delete set null,
  firm_id uuid references public.firms (id) on delete set null,
  subject text not null check (char_length(subject) between 5 and 140),
  description text not null check (char_length(description) between 20 and 4000),
  preferred_contact text not null default 'whatsapp' check (preferred_contact in ('whatsapp', 'llamada', 'correo')),
  status public.request_status not null default 'pendiente',
  admin_notes text,
  data_consent boolean not null check (data_consent = true),
  data_consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index consultation_requests_client_idx on public.consultation_requests (client_id, created_at desc);
create index consultation_requests_lawyer_idx on public.consultation_requests (lawyer_id);
create index consultation_requests_status_idx on public.consultation_requests (status);

create table public.request_status_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.consultation_requests (id) on delete cascade,
  status public.request_status not null,
  note text,
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index request_status_history_request_idx on public.request_status_history (request_id, created_at);

-- ───────────────────────── reseñas
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  lawyer_id uuid references public.lawyers (id) on delete set null,
  specialty_id uuid references public.specialties (id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 20 and 1500),
  public_name text not null check (char_length(public_name) between 2 and 80),
  show_name boolean not null default false,
  status public.review_status not null default 'pendiente',
  moderated_by uuid references public.profiles (id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now()
);
create index reviews_status_idx on public.reviews (status, created_at desc);

-- ───────────────────────── configuración y contacto
create table public.site_settings (
  key text primary key check (key ~ '^[a-z0-9_]{2,60}$'),
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or char_length(phone) <= 30),
  specialty_id uuid references public.specialties (id) on delete set null,
  message text not null check (char_length(message) between 10 and 3000),
  data_consent boolean not null check (data_consent = true),
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- ───────────────────────── triggers
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at = now(); return new; end $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger specialties_touch before update on public.specialties for each row execute function public.touch_updated_at();
create trigger lawyers_touch before update on public.lawyers for each row execute function public.touch_updated_at();
create trigger requests_touch before update on public.consultation_requests for each row execute function public.touch_updated_at();

-- Nuevo usuario de auth → perfil cliente.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, data_consent_at)
  values (
    new.id,
    coalesce(left(new.raw_user_meta_data ->> 'full_name', 120), ''),
    left(new.raw_user_meta_data ->> 'phone', 30),
    case when (new.raw_user_meta_data ->> 'data_consent') = 'true' then now() end
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Solo un admin cambia roles (o el service role, sin auth.uid()).
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'No autorizado para cambiar el rol';
  end if;
  return new;
end $$;

create trigger profiles_guard_role before update on public.profiles
for each row execute function public.guard_profile_role();

-- El cliente no puede tocar estado, notas ni consentimiento de su solicitud; historial automático.
create or replace function public.guard_request_update()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.client_id <> old.client_id or new.admin_notes is distinct from old.admin_notes
       or new.data_consent_at <> old.data_consent_at then
      raise exception 'Campo no editable';
    end if;
    -- Abogado asignado puede cambiar estado; el cliente solo puede cancelar (cerrado) si está pendiente.
    if new.status <> old.status then
      if exists (select 1 from public.lawyers l where l.id = old.lawyer_id and l.profile_id = auth.uid()) then
        null;
      elsif old.client_id = auth.uid() and old.status = 'pendiente' and new.status = 'cerrado' then
        null;
      else
        raise exception 'No autorizado para cambiar el estado';
      end if;
    end if;
  end if;
  if new.status <> old.status then
    insert into public.request_status_history (request_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end $$;

create trigger requests_guard before update on public.consultation_requests
for each row execute function public.guard_request_update();

create or replace function public.request_initial_history()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.request_status_history (request_id, status, changed_by, note)
  values (new.id, new.status, auth.uid(), 'Solicitud registrada');
  return new;
end $$;

create trigger requests_initial_history after insert on public.consultation_requests
for each row execute function public.request_initial_history();

-- Reseñas: el autor nunca fija estado ni moderación.
create or replace function public.guard_review_write()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pendiente';
      new.moderated_by := null;
      new.moderated_at := null;
    else
      raise exception 'Solo moderación puede editar reseñas';
    end if;
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    new.moderated_by := auth.uid();
    new.moderated_at := now();
  end if;
  return new;
end $$;

create trigger reviews_guard before insert or update on public.reviews
for each row execute function public.guard_review_write();

-- ───────────────────────── RLS
alter table public.profiles enable row level security;
alter table public.firms enable row level security;
alter table public.specialties enable row level security;
alter table public.lawyers enable row level security;
alter table public.lawyer_specialties enable row level security;
alter table public.consultation_requests enable row level security;
alter table public.request_status_history enable row level security;
alter table public.reviews enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;

-- profiles
create policy profiles_select_own on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
-- El abogado ve nombre y contacto de los clientes de solicitudes asignadas a él.
create policy profiles_select_assigned_clients on public.profiles for select to authenticated
  using (exists (
    select 1 from public.consultation_requests r
    join public.lawyers l on l.id = r.lawyer_id
    where r.client_id = profiles.id and l.profile_id = (select auth.uid())
  ));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- catálogo público
create policy firms_public_read on public.firms for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy firms_admin_write on public.firms for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy specialties_public_read on public.specialties for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy specialties_admin_write on public.specialties for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy lawyers_public_read on public.lawyers for select to anon, authenticated
  using (is_active or (select public.is_admin()) or profile_id = (select auth.uid()));
create policy lawyers_admin_write on public.lawyers for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy lawyer_specialties_public_read on public.lawyer_specialties for select to anon, authenticated
  using (true);
create policy lawyer_specialties_admin_write on public.lawyer_specialties for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- solicitudes: cliente ve las suyas, abogado las asignadas, admin todas
create policy requests_select on public.consultation_requests for select to authenticated
  using (
    client_id = (select auth.uid())
    or (select public.is_admin())
    or exists (select 1 from public.lawyers l where l.id = lawyer_id and l.profile_id = (select auth.uid()))
  );
create policy requests_insert_own on public.consultation_requests for insert to authenticated
  with check (client_id = (select auth.uid()) and status = 'pendiente' and admin_notes is null);
create policy requests_update on public.consultation_requests for update to authenticated
  using (
    client_id = (select auth.uid())
    or (select public.is_admin())
    or exists (select 1 from public.lawyers l where l.id = lawyer_id and l.profile_id = (select auth.uid()))
  );
create policy requests_admin_delete on public.consultation_requests for delete to authenticated
  using ((select public.is_admin()));

create policy history_select on public.request_status_history for select to authenticated
  using (exists (select 1 from public.consultation_requests r where r.id = request_id)); -- hereda RLS de requests

-- reseñas
create policy reviews_public_read on public.reviews for select to anon, authenticated
  using (status = 'aprobada' or author_id = (select auth.uid()) or (select public.is_admin()));
create policy reviews_insert_own on public.reviews for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy reviews_admin_update on public.reviews for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy reviews_delete on public.reviews for delete to authenticated
  using ((select public.is_admin()) or author_id = (select auth.uid()));

-- settings
create policy settings_public_read on public.site_settings for select to anon, authenticated using (true);
create policy settings_admin_write on public.site_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- contacto: cualquiera inserta, solo admin lee
create policy contact_insert on public.contact_messages for insert to anon, authenticated
  with check (handled = false);
create policy contact_admin_read on public.contact_messages for select to authenticated
  using ((select public.is_admin()));
create policy contact_admin_update on public.contact_messages for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Vista pública de promedio de reseñas (solo aprobadas).
create or replace view public.review_stats with (security_invoker = true) as
  select count(*)::int as total, coalesce(round(avg(rating)::numeric, 2), 0) as average
  from public.reviews where status = 'aprobada';

-- Estadísticas admin.
create or replace function public.admin_stats()
returns json language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'No autorizado'; end if;
  return json_build_object(
    'clients', (select count(*) from public.profiles where role = 'client'),
    'lawyers', (select count(*) from public.lawyers where is_active),
    'requests_total', (select count(*) from public.consultation_requests),
    'requests_open', (select count(*) from public.consultation_requests where status in ('pendiente', 'en_revision')),
    'reviews_pending', (select count(*) from public.reviews where status = 'pendiente'),
    'messages_open', (select count(*) from public.contact_messages where not handled),
    'by_specialty', (
      select coalesce(json_agg(x order by x.total desc), '[]'::json) from (
        select s.name, count(r.id)::int as total
        from public.specialties s left join public.consultation_requests r on r.specialty_id = s.id
        group by s.name
      ) x
    )
  );
end $$;

revoke execute on function public.admin_stats() from anon;

-- ───────────────────────── storage: fotos de abogados
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lawyer-photos', 'lawyer-photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy lawyer_photos_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'lawyer-photos' and (select public.is_admin()));
create policy lawyer_photos_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'lawyer-photos' and (select public.is_admin()));
create policy lawyer_photos_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'lawyer-photos' and (select public.is_admin()));
