-- Subida de archivos: avatar de cada cuenta, foto pública del abogado (por él mismo)
-- y documentos adjuntos a una solicitud (privados).
-- Idempotente donde se puede: columnas/índices con if not exists y políticas con drop if exists.

-- ───────────────────────── avatar del perfil
alter table public.profiles add column if not exists avatar_url text;

-- Solo URLs públicas del bucket avatars dentro de la carpeta del propio usuario.
alter table public.profiles drop constraint if exists profiles_avatar_url_check;
alter table public.profiles add constraint profiles_avatar_url_check check (
  avatar_url is null
  or (char_length(avatar_url) <= 500 and position(('/storage/v1/object/public/avatars/' || id::text || '/') in avatar_url) > 0)
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Cada usuario escribe solo en avatars/<su uid>/… (la lectura es pública por URL).
-- SELECT propio: lo exigen el borrado (DELETE … RETURNING) y el reemplazo.
drop policy if exists avatars_own_select on storage.objects;
create policy avatars_own_select on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists avatars_own_insert on storage.objects;
create policy avatars_own_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists avatars_own_update on storage.objects;
create policy avatars_own_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists avatars_own_delete on storage.objects;
create policy avatars_own_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ───────────────────────── foto pública del abogado (la sube el propio abogado)
-- Carpeta lawyer-photos/<lawyers.id>/… solo si ese perfil de abogado está vinculado a su cuenta.
drop policy if exists lawyer_photos_own_select on storage.objects;
create policy lawyer_photos_own_select on storage.objects for select to authenticated
  using (
    bucket_id = 'lawyer-photos'
    and exists (select 1 from public.lawyers l where l.id::text = (storage.foldername(name))[1] and l.profile_id = (select auth.uid()))
  );
drop policy if exists lawyer_photos_own_insert on storage.objects;
create policy lawyer_photos_own_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'lawyer-photos'
    and exists (select 1 from public.lawyers l where l.id::text = (storage.foldername(name))[1] and l.profile_id = (select auth.uid()))
  );
drop policy if exists lawyer_photos_own_update on storage.objects;
create policy lawyer_photos_own_update on storage.objects for update to authenticated
  using (
    bucket_id = 'lawyer-photos'
    and exists (select 1 from public.lawyers l where l.id::text = (storage.foldername(name))[1] and l.profile_id = (select auth.uid()))
  )
  with check (
    bucket_id = 'lawyer-photos'
    and exists (select 1 from public.lawyers l where l.id::text = (storage.foldername(name))[1] and l.profile_id = (select auth.uid()))
  );
drop policy if exists lawyer_photos_own_delete on storage.objects;
create policy lawyer_photos_own_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'lawyer-photos'
    and exists (select 1 from public.lawyers l where l.id::text = (storage.foldername(name))[1] and l.profile_id = (select auth.uid()))
  );

-- El abogado no tiene UPDATE sobre lawyers (solo admin). Esta función cambia únicamente photo_url
-- de SU perfil y solo a una URL pública de su propia carpeta. Devuelve la URL anterior.
create or replace function public.set_own_lawyer_photo(p_url text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_old text;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;
  select id, photo_url into v_id, v_old from public.lawyers where profile_id = auth.uid();
  if v_id is null then
    raise exception 'Tu cuenta no está vinculada a un perfil de abogado';
  end if;
  if p_url is null or char_length(p_url) > 500
     or position(('/storage/v1/object/public/lawyer-photos/' || v_id::text || '/') in p_url) = 0 then
    raise exception 'URL de foto no válida';
  end if;
  update public.lawyers set photo_url = p_url where id = v_id;
  return v_old;
end $$;

revoke execute on function public.set_own_lawyer_photo(text) from public, anon;
grant execute on function public.set_own_lawyer_photo(text) to authenticated;

-- ───────────────────────── adjuntos de solicitudes
-- "Abierta" = el cliente aún puede aportar o retirar documentos: todo menos cerrado y rechazado.
create table if not exists public.request_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.consultation_requests (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id),
  path text not null unique,
  name text not null check (char_length(name) between 1 and 160),
  mime text not null check (mime in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  size int not null check (size between 1 and 10485760),
  created_at timestamptz not null default now(),
  -- La ruta en Storage siempre empieza por la carpeta de su solicitud.
  constraint request_attachments_path_folder check (split_part(path, '/', 1) = request_id::text)
);
create index if not exists request_attachments_request_idx on public.request_attachments (request_id, created_at);
create index if not exists request_attachments_uploaded_by_idx on public.request_attachments (uploaded_by);

alter table public.request_attachments enable row level security;

-- Sin UPDATE: un adjunto se sube o se borra, nunca se edita.
revoke all on public.request_attachments from anon, authenticated;
grant select, insert, delete on public.request_attachments to authenticated;

drop policy if exists attachments_select on public.request_attachments;
create policy attachments_select on public.request_attachments for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.consultation_requests r
      where r.id = request_id
        and (
          r.client_id = (select auth.uid())
          or exists (select 1 from public.lawyers l where l.id = r.lawyer_id and l.profile_id = (select auth.uid()))
        )
    )
  );

drop policy if exists attachments_insert_owner on public.request_attachments;
create policy attachments_insert_owner on public.request_attachments for insert to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and exists (
      select 1 from public.consultation_requests r
      where r.id = request_id and r.client_id = (select auth.uid()) and r.status not in ('cerrado', 'rechazado')
    )
  );

drop policy if exists attachments_delete on public.request_attachments;
create policy attachments_delete on public.request_attachments for delete to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.consultation_requests r
      where r.id = request_id and r.client_id = (select auth.uid()) and r.status not in ('cerrado', 'rechazado')
    )
  );

-- Máximo 5 adjuntos por solicitud. El candado por solicitud evita que dos subidas simultáneas pasen el límite.
create or replace function public.limit_request_attachments()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.request_id::text, 0));
  if (select count(*) from public.request_attachments where request_id = new.request_id) >= 5 then
    raise exception 'Máximo 5 documentos por solicitud' using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists request_attachments_limit on public.request_attachments;
create trigger request_attachments_limit before insert on public.request_attachments
for each row execute function public.limit_request_attachments();

-- ───────────────────────── storage: documentos de solicitudes (privado)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('request-files', 'request-files', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Carpeta request-files/<request_id>/… — mismas reglas que la tabla.
drop policy if exists request_files_select on storage.objects;
create policy request_files_select on storage.objects for select to authenticated
  using (
    bucket_id = 'request-files'
    and (
      (select public.is_admin())
      or exists (
        select 1 from public.consultation_requests r
        where r.id::text = (storage.foldername(name))[1]
          and (
            r.client_id = (select auth.uid())
            or exists (select 1 from public.lawyers l where l.id = r.lawyer_id and l.profile_id = (select auth.uid()))
          )
      )
    )
  );

drop policy if exists request_files_insert_owner on storage.objects;
create policy request_files_insert_owner on storage.objects for insert to authenticated
  with check (
    bucket_id = 'request-files'
    and exists (
      select 1 from public.consultation_requests r
      where r.id::text = (storage.foldername(name))[1]
        and r.client_id = (select auth.uid())
        and r.status not in ('cerrado', 'rechazado')
    )
  );

drop policy if exists request_files_delete on storage.objects;
create policy request_files_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'request-files'
    and (
      (select public.is_admin())
      or exists (
        select 1 from public.consultation_requests r
        where r.id::text = (storage.foldername(name))[1]
          and r.client_id = (select auth.uid())
          and r.status not in ('cerrado', 'rechazado')
      )
    )
  );
