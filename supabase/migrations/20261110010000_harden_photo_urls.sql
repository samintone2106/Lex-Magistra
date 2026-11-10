-- Refuerza la validación de URLs de fotos: patrón anclado de principio a fin (antes bastaba con que
-- la ruta del bucket apareciera en cualquier parte de la cadena, p. ej. en la query de otro dominio).
-- La URL debe ser exactamente <origen>/storage/v1/object/public/<bucket>/<id>/<archivo>[?v=<n>].

alter table public.profiles drop constraint if exists profiles_avatar_url_check;
alter table public.profiles add constraint profiles_avatar_url_check check (
  avatar_url is null
  or (
    char_length(avatar_url) <= 500
    and avatar_url !~ '\.\.'
    and avatar_url ~ ('^https?://[A-Za-z0-9.-]+(:[0-9]{1,5})?/storage/v1/object/public/avatars/'
                      || id::text || '/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)(\?v=[0-9]+)?$')
  )
);

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
  if p_url is null or char_length(p_url) > 500 or p_url ~ '\.\.'
     or p_url !~ ('^https?://[A-Za-z0-9.-]+(:[0-9]{1,5})?/storage/v1/object/public/lawyer-photos/'
                  || v_id::text || '/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)(\?v=[0-9]+)?$') then
    raise exception 'URL de foto no válida';
  end if;
  update public.lawyers set photo_url = p_url where id = v_id;
  return v_old;
end $$;

revoke execute on function public.set_own_lawyer_photo(text) from public, anon;
grant execute on function public.set_own_lawyer_photo(text) to authenticated;
