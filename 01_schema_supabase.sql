-- AgendaZen: schema inicial (Supabase / Postgres). Revise antes de produção.
create extension if not exists btree_gist;
create extension if not exists pgcrypto;

create type member_role as enum ('owner','admin','professional','receptionist','financial');
create type slot_status as enum ('free','reserved','blocked');
create type appt_status as enum ('scheduled','confirmed','checked_in','in_progress','done','no_show','cancelled','rescheduled');
create type specialty as enum ('physio','acupuncture','both');

create table clinics(
  id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null,
  document text, phone text, address jsonb, logo_url text, trial_ends_at timestamptz default now()+interval '14 days',
  created_at timestamptz default now());

create table clinic_members(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  user_id uuid not null references auth.users on delete cascade, role member_role not null,
  unique(clinic_id,user_id));

create table professionals(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  member_id uuid references clinic_members, name text not null, specialty specialty not null,
  council_number text, color text default '#167C82', active boolean default true);

create table patient_segments(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  name text not null, is_default boolean default false, unique(clinic_id,name));

create table patients(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  user_id uuid references auth.users, full_name text not null, cpf text, birth_date date, sex text,
  phone text, email text, address jsonb, segment_id uuid references patient_segments,
  lgpd_consent_at timestamptz, lgpd_consent_ip inet, active boolean default true,
  created_at timestamptz default now(), unique(clinic_id,cpf));

create table patient_segment_history(
  id bigserial primary key, clinic_id uuid not null, patient_id uuid not null references patients on delete cascade,
  old_segment uuid, new_segment uuid, changed_by uuid, changed_at timestamptz default now());

create table services(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  name text not null, specialty specialty not null, duration_min int not null default 50, active boolean default true);

create table service_prices(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  service_id uuid not null references services on delete cascade, segment_id uuid not null references patient_segments,
  mode text not null check (mode in ('single','package','loyalty')),
  price numeric(10,2) not null, sessions int, valid_days int, unique(service_id,segment_id,mode,sessions));

create table patient_packages(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  patient_id uuid not null references patients on delete cascade, service_id uuid references services,
  sessions_total int not null, sessions_used int not null default 0, price_paid numeric(10,2), expires_at date);

create table insurers(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  name text not null, ans_registry text, contact text);
create table insurance_plans(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  insurer_id uuid not null references insurers on delete cascade, name text not null,
  payout_per_session numeric(10,2), requires_authorization boolean default true, session_limit int);
create table patient_insurances(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  patient_id uuid not null references patients on delete cascade, plan_id uuid not null references insurance_plans,
  card_number text, valid_until date);
create table insurance_authorizations(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  patient_insurance_id uuid not null references patient_insurances on delete cascade, guide_number text,
  sessions_authorized int not null, sessions_used int not null default 0);

create table schedule_rules(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  professional_id uuid not null references professionals on delete cascade, weekday smallint not null check (weekday between 0 and 6),
  start_time time not null, end_time time not null, slot_minutes int not null default 50,
  default_status slot_status not null default 'free', min_notice_hours int default 2, max_days_ahead int default 60);
create table schedule_blocks(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  professional_id uuid references professionals, period tstzrange not null, reason text);
-- exceções por data (ex.: abrir um horário reservado): slot_overrides
create table slot_overrides(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  professional_id uuid not null references professionals, starts_at timestamptz not null, status slot_status not null,
  unique(professional_id,starts_at));

create table appointments(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  professional_id uuid not null references professionals, patient_id uuid not null references patients,
  service_id uuid references services, period tstzrange not null, status appt_status not null default 'scheduled',
  patient_package_id uuid references patient_packages, authorization_id uuid references insurance_authorizations,
  notes text, created_at timestamptz default now(),
  exclude using gist (professional_id with =, period with &&) where (status not in ('cancelled','rescheduled')));

create table medical_records(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  patient_id uuid not null references patients on delete cascade, anamnesis jsonb, created_at timestamptz default now());
create table record_entries(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  record_id uuid not null references medical_records on delete cascade, appointment_id uuid references appointments,
  professional_id uuid not null references professionals, soap jsonb not null, pain_vas smallint check (pain_vas between 0 and 10),
  version int not null default 1, supersedes uuid references record_entries, created_at timestamptz default now());
create table body_markings(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  entry_id uuid not null references record_entries on delete cascade, view text check (view in ('front','back')),
  x numeric(5,2) not null, y numeric(5,2) not null, kind text not null, intensity smallint, side text, note text);
create table acupuncture_points(
  code text primary key, pinyin text, name_pt text, meridian text not null, location text,
  view text check (view in ('front','back','side')), x numeric(5,2), y numeric(5,2), needs_review boolean default true);
create table acupuncture_session_points(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  entry_id uuid not null references record_entries on delete cascade, point_code text not null references acupuncture_points,
  side text, technique text, retention_min int, depth text, note text);
create table treatment_protocols(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  name text not null, point_codes text[] not null);

create table receivables(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  patient_id uuid references patients, appointment_id uuid references appointments, amount numeric(10,2) not null,
  due_date date, status text not null default 'open');
create table payments(
  id uuid primary key default gen_random_uuid(), clinic_id uuid not null references clinics on delete cascade,
  receivable_id uuid not null references receivables on delete cascade, amount numeric(10,2) not null,
  method text not null, paid_at timestamptz default now());
create table audit_logs(
  id bigserial primary key, clinic_id uuid, user_id uuid, action text, table_name text, row_id text, at timestamptz default now(), diff jsonb);

-- ===== RLS =====
create or replace function public.is_member(cid uuid) returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from clinic_members m where m.clinic_id=cid and m.user_id=auth.uid()) $$;
create or replace function public.has_role(cid uuid, roles member_role[]) returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from clinic_members m where m.clinic_id=cid and m.user_id=auth.uid() and m.role=any(roles)) $$;

do $$ declare t text; begin
  foreach t in array array['professionals','patient_segments','patients','patient_segment_history','services','service_prices','patient_packages','insurers','insurance_plans','patient_insurances','insurance_authorizations','schedule_rules','schedule_blocks','slot_overrides','appointments','receivables','payments','treatment_protocols'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy tenant_all on %I for all using (public.is_member(clinic_id)) with check (public.is_member(clinic_id))', t);
  end loop;
  -- dados clínicos: apenas owner/admin/professional (recepção NÃO acessa)
  foreach t in array array['medical_records','record_entries','body_markings','acupuncture_session_points'] loop
    execute format('alter table %I enable row level security', t);
    execute format($f$create policy clinical_all on %I for all using (public.has_role(clinic_id, array['owner','admin','professional']::member_role[])) with check (public.has_role(clinic_id, array['owner','admin','professional']::member_role[]))$f$, t);
  end loop;
end $$;
alter table clinics enable row level security;
create policy clinic_read on clinics for select using (public.is_member(id));
alter table clinic_members enable row level security;
create policy members_read on clinic_members for select using (public.is_member(clinic_id));
alter table acupuncture_points enable row level security;
create policy points_read on acupuncture_points for select using (auth.role()='authenticated');
alter table audit_logs enable row level security;
create policy audit_read on audit_logs for select using (public.has_role(clinic_id, array['owner','admin']::member_role[]));
-- TODO: políticas para paciente (acesso aos próprios dados) e página pública /c/[slug] via RPC com rate limit.
