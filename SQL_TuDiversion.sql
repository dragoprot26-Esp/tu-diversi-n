-- ======================================================================
--  TU DIVERSIÓN (alquiler de inflables, metegoles, arcades, livings) — SQL
--  Base compartida del ecosistema CyC: pcxlhgdpxfuybzfsquem
--  Prefijo de licencia: DIVE-...
--  Correlo en el SQL Editor de Supabase. Idempotente (se puede repetir).
--
--  Reutiliza: tl_miembros (membresía), reclamar_tienda, validar_licencia,
--  sincronizar_clave_dueno, y el namespace @tiendalibre.app.
--
--  Propio de esta app:
--    1) tabla de datos      public.dive_backups (1 fila por local / licencia)
--    2) lectura pública     public.dive_publica(p_codigo)
--    3) alta de reserva     public.dive_agregar_reserva(p_codigo, p_reserva)
--    4) colaboradores       public.dive_verificar_colab(...) + public.dive_unir_colab(...)
--
--  Modelo de datos (datos jsonb) — una tienda por licencia:
--    { "tenant": {..., "collaborators":[{username,password,...}]},
--      "products": [...], "bookings": [...], "customers": [...], "gallery": [...] }
-- ======================================================================

-- 1) TABLA DE DATOS ----------------------------------------------------
create table if not exists public.dive_backups (
  tenant_id  text primary key,
  datos      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) RLS: solo miembros del local (dueño/colaborador) leen y escriben
do $$
declare pol record;
begin
  for pol in select policyname from pg_policies
    where schemaname='public' and tablename='dive_backups' loop
    execute format('drop policy if exists %I on public.dive_backups', pol.policyname);
  end loop;
  alter table public.dive_backups enable row level security;
  create policy dive_backups_miembros on public.dive_backups
    for all
    using      ( tenant_id in (select tenant_id from public.tl_miembros where user_id = auth.uid()) )
    with check ( tenant_id in (select tenant_id from public.tl_miembros where user_id = auth.uid()) );
end $$;

grant select, insert, update on public.dive_backups to authenticated;

-- 3) LECTURA PÚBLICA (web del cliente, sin datos sensibles) ------------
--    Devuelve el tenant SIN collaborators ni licenseKey, + products + gallery.
create or replace function public.dive_publica(p_codigo text)
returns json
language sql security definer set search_path = public as $$
  select json_build_object(
    'tenant',   coalesce(datos->'tenant','{}'::jsonb) - 'collaborators' - 'licenseKey',
    'products', coalesce(datos->'products', '[]'::jsonb),
    'gallery',  coalesce(datos->'gallery',  '[]'::jsonb)
  )
  from public.dive_backups
  where tenant_id = p_codigo
  limit 1;
$$;
grant execute on function public.dive_publica(text) to anon, authenticated;

-- 4) ALTA DE RESERVA (desde la web del cliente, anónimo) ---------------
--    La reserva ya viene con su código (TD-XXXX) generado por la app.
create or replace function public.dive_agregar_reserva(p_codigo text, p_reserva jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare cur jsonb; arr jsonb;
begin
  if not exists (select 1 from public.licencias where codigo = p_codigo) then
    return;  -- código inexistente: no hacemos nada
  end if;
  select datos into cur from public.dive_backups where tenant_id = p_codigo limit 1;
  if cur is null then cur := '{}'::jsonb; end if;
  arr := coalesce(cur->'bookings', '[]'::jsonb);
  arr := jsonb_build_array(p_reserva) || arr;   -- la reserva nueva primero
  cur := jsonb_set(cur, '{bookings}', arr, true);
  insert into public.dive_backups (tenant_id, datos, updated_at)
  values (p_codigo, cur, now())
  on conflict (tenant_id) do update set datos = excluded.datos, updated_at = now();
end $$;
grant execute on function public.dive_agregar_reserva(text, jsonb) to anon, authenticated;

-- 5) COLABORADORES -----------------------------------------------------
-- Verifica usuario+contraseña del colaborador contra datos->'tenant'->'collaborators'.
create or replace function public.dive_verificar_colab(p_codigo text, p_usuario text, p_pass text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare d jsonb; it jsonb; ok boolean := false;
begin
  select datos into d from public.dive_backups where tenant_id = p_codigo limit 1;
  if d is null then return false; end if;
  for it in select * from jsonb_array_elements(coalesce(d->'tenant'->'collaborators','[]'::jsonb)) loop
    if lower(it->>'username') = lower(p_usuario)
       and coalesce(it->>'password', it->>'passwordHash') = p_pass then ok := true; end if;
  end loop;
  return ok;
end $$;
grant execute on function public.dive_verificar_colab(text, text, text) to anon, authenticated;

-- Une al colaborador como miembro del local (autenticado).
create or replace function public.dive_unir_colab(p_codigo text, p_usuario text)
returns void
language plpgsql security definer set search_path = public as $$
declare d jsonb; it jsonb; permitido boolean := false;
begin
  if auth.uid() is null then raise exception 'No autenticado'; end if;
  select datos into d from public.dive_backups where tenant_id = p_codigo limit 1;
  if d is null then raise exception 'Local inexistente'; end if;
  for it in select * from jsonb_array_elements(coalesce(d->'tenant'->'collaborators','[]'::jsonb)) loop
    if lower(it->>'username') = lower(p_usuario) then permitido := true; end if;
  end loop;
  if not permitido then raise exception 'No estás en el equipo de este local'; end if;
  insert into public.tl_miembros(user_id, tenant_id, rol, usuario)
    values (auth.uid(), p_codigo, 'colab', p_usuario)
  on conflict (user_id) do update
    set tenant_id = excluded.tenant_id, rol = 'colab', usuario = excluded.usuario;
end $$;
grant execute on function public.dive_unir_colab(text, text) to authenticated;

-- ======================================================================
-- VERIFICACIÓN (en el navegador, reemplazá <ANON_KEY>) — debe dar [] :
--   https://pcxlhgdpxfuybzfsquem.supabase.co/rest/v1/dive_backups?select=*&limit=3&apikey=<ANON_KEY>
-- ======================================================================
