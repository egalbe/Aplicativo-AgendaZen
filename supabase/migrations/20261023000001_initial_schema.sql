-- ==============================================================================
-- AgendaZen: Schema Completo de Banco de Dados (Supabase / PostgreSQL 15+)
-- Arquivo: supabase/migrations/20261023000001_initial_schema.sql
-- Multi-tenancy com Row Level Security (RLS) estrito
-- ==============================================================================

-- 1. Extensões Essenciais
create extension if not exists btree_gist;
create extension if not exists pgcrypto;

-- 2. Enums do Sistema
create type member_role as enum ('owner', 'admin', 'professional', 'receptionist', 'financial');
create type slot_status as enum ('free', 'reserved', 'blocked');
create type appt_status as enum (
  'scheduled',   -- Agendado
  'confirmed',   -- Confirmado pelo paciente/clínica
  'checked_in',  -- Paciente chegou na clínica
  'in_progress', -- Em atendimento
  'done',        -- Concluído
  'no_show',     -- Faltou sem aviso
  'cancelled',   -- Cancelado
  'rescheduled'  -- Remarcado
);
create type specialty as enum ('physio', 'acupuncture', 'both');
create type price_mode as enum ('single', 'package', 'loyalty');
create type payment_method as enum ('pix', 'credit_card', 'debit_card', 'cash', 'bank_slip', 'insurance');
create type payment_status as enum ('open', 'partially_paid', 'paid', 'cancelled');
create type insurance_batch_status as enum ('draft', 'submitted', 'paid', 'disputed');

-- ==============================================================================
-- 3. MÓDULO TENANT & CONFIGURAÇÕES (CLINICS, MEMBERS, PROFESSIONALS)
-- ==============================================================================

-- Tabela principal de Clínicas / Tenants
create table clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  document text, -- CNPJ ou CPF do responsável
  phone text,
  address jsonb default '{}'::jsonb, -- { street, number, neighborhood, city, state, zip }
  logo_url text,
  brand_colors jsonb default '{"primary": "#0F4C5C", "secondary": "#52B788", "accent": "#E0A96D"}'::jsonb,
  trial_ends_at timestamptz default (now() + interval '14 days'),
  active boolean not null default true,
  settings jsonb default '{"cancellation_limit_hours": 4, "max_days_ahead": 60, "min_notice_hours": 2}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Membros da Clínica e seus Papéis (Roles)
create table clinic_members (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role not null default 'receptionist',
  created_at timestamptz not null default now(),
  unique(clinic_id, user_id)
);

-- Profissionais de Atendimento (Fisioterapeutas e Acupunturistas)
create table professionals (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  member_id uuid references clinic_members(id) on delete set null,
  name text not null,
  specialty specialty not null default 'physio',
  council_number text, -- Registro no CREFITO
  color text not null default '#0F4C5C', -- Cor visual na grade de agendamento
  commission_rate numeric(5,2) default 0.00, -- Percentual de repasse padrão (%)
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Segmentos de Pacientes (Ex: Particular, VIP, Convênio, Social, Amigos & Família)
create table patient_segments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  description text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique(clinic_id, name)
);

-- Serviços Oferecidos pela Clínica
create table services (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  specialty specialty not null default 'both',
  duration_min int not null default 50,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Tabela de Preços por Serviço, Segmento e Modalidade (Avulso, Pacote, Fidelidade)
create table service_prices (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  segment_id uuid not null references patient_segments(id) on delete cascade,
  mode price_mode not null default 'single',
  price numeric(10,2) not null check (price >= 0),
  sessions int default 1,     -- Para pacotes (ex: 10 sessões)
  valid_days int default 90,  -- Validade em dias do pacote
  created_at timestamptz not null default now(),
  unique(service_id, segment_id, mode, sessions)
);

-- ==============================================================================
-- 4. CONVÊNIOS & OPERADORAS DE SAÚDE
-- ==============================================================================

create table insurers (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  ans_registry text,
  contact text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table insurance_plans (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  insurer_id uuid not null references insurers(id) on delete cascade,
  name text not null,
  payout_per_session numeric(10,2) not null default 0.00,
  requires_authorization boolean not null default true,
  session_limit int,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 5. MÓDULO DE PACIENTES & CONSENTIMENTO LGPD
-- ==============================================================================

create table patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, -- Se o paciente tiver login próprio
  full_name text not null,
  cpf text,
  birth_date date,
  sex text,
  phone text not null, -- Celular / WhatsApp
  email text,
  address jsonb default '{}'::jsonb,
  profession text,
  emergency_contact text,
  notes text,
  photo_url text,
  segment_id uuid references patient_segments(id) on delete set null,
  lgpd_consent_at timestamptz,
  lgpd_consent_ip inet,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(clinic_id, cpf)
);

-- Histórico de alterações de segmento do paciente
create table patient_segment_history (
  id bigserial primary key,
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  old_segment uuid references patient_segments(id) on delete set null,
  new_segment uuid references patient_segments(id) on delete set null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

-- Convênios vinculados ao Paciente
create table patient_insurances (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  plan_id uuid not null references insurance_plans(id) on delete cascade,
  card_number text not null,
  valid_until date,
  created_at timestamptz not null default now()
);

-- Guias / Autorizações de Convênio
create table insurance_authorizations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_insurance_id uuid not null references patient_insurances(id) on delete cascade,
  guide_number text not null,
  sessions_authorized int not null,
  sessions_used int not null default 0,
  authorized_at date default current_date,
  expires_at date,
  created_at timestamptz not null default now()
);

-- Pacotes Adquiridos pelo Paciente
create table patient_packages (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  sessions_total int not null,
  sessions_used int not null default 0,
  price_paid numeric(10,2) not null,
  expires_at date,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 6. MÓDULO DE AGENDA & HORÁRIOS INTELIGENTES
-- ==============================================================================

-- Regras de Horários de Trabalho por Profissional (Dias e Janelas)
create table schedule_rules (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6), -- 0=Domingo, 1=Segunda, ..., 6=Sábado
  start_time time not null,
  end_time time not null,
  slot_minutes int not null default 50,
  default_status slot_status not null default 'free',
  room_name text default 'Sala 1',
  active boolean not null default true,
  check (start_time < end_time)
);

-- Intervalos e Pausas do Profissional (Ex: Almoço)
create table schedule_breaks (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references schedule_rules(id) on delete cascade,
  start_time time not null,
  end_time time not null,
  description text default 'Almoço/Intervalo',
  check (start_time < end_time)
);

-- Bloqueios Pontuais e Férias
create table schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  professional_id uuid references professionals(id) on delete cascade, -- Nulo = bloqueio de toda a clínica
  period tstzrange not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Exceções pontuais de Slots (Ex: transformar um horário 'reserved' em 'free' com 1 clique)
create table slot_overrides (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete cascade,
  starts_at timestamptz not null,
  status slot_status not null,
  created_at timestamptz not null default now(),
  unique(professional_id, starts_at)
);

-- Tabela Central de Agendamentos / Consultas
create table appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete restrict,
  patient_id uuid not null references patients(id) on delete restrict,
  service_id uuid references services(id) on delete set null,
  period tstzrange not null,
  status appt_status not null default 'scheduled',
  patient_package_id uuid references patient_packages(id) on delete set null,
  authorization_id uuid references insurance_authorizations(id) on delete set null,
  notes text,
  is_walk_in boolean not null default false, -- Encaixe manual
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Prevenção de conflito de horário no mesmo profissional (excluindo cancelados/remarcados)
  exclude using gist (
    professional_id with =,
    period with &&
  ) where (status not in ('cancelled', 'rescheduled'))
);

-- Log de Auditoria de Mudança de Status do Agendamento
create table appointment_status_log (
  id bigserial primary key,
  clinic_id uuid not null references clinics(id) on delete cascade,
  appointment_id uuid not null references appointments(id) on delete cascade,
  old_status appt_status,
  new_status appt_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  reason text,
  changed_at timestamptz not null default now()
);

-- ==============================================================================
-- 7. MÓDULO DE PRONTUÁRIO ELETRÔNICO, FISIOTERAPIA & ACUPUNTURA
-- ==============================================================================

-- Prontuário Geral do Paciente
create table medical_records (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  anamnesis jsonb default '{}'::jsonb, -- { main_complaint, history, medications, allergies, surgeries, habits }
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(clinic_id, patient_id)
);

-- Evoluções por Sessão (SOAP - Imutável, versionado)
create table record_entries (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  record_id uuid not null references medical_records(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  professional_id uuid not null references professionals(id) on delete restrict,
  soap jsonb not null, -- { subjective, objective, assessment, plan }
  pain_vas smallint check (pain_vas between 0 and 10), -- Escala Visual Analógica de Dor (EVA)
  version int not null default 1,
  supersedes uuid references record_entries(id),
  signed_by text, -- Nome/CREFITO do profissional que assinou
  created_at timestamptz not null default now()
);

-- Fisioterapia: Marcações no Mapa Corporal SVG (Frente e Costas)
create table body_markings (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  entry_id uuid not null references record_entries(id) on delete cascade,
  view text not null check (view in ('front', 'back')),
  x numeric(5,2) not null, -- Coordenada horizontal (0.00 a 100.00%)
  y numeric(5,2) not null, -- Coordenada vertical (0.00 a 100.00%)
  kind text not null,      -- 'dor', 'contratura', 'edema', 'limitacao', 'lesao'
  intensity smallint check (intensity between 0 and 10),
  side text check (side in ('left', 'right', 'center', 'bilateral')),
  note text,
  created_at timestamptz not null default now()
);

-- Acupuntura: Catálogo Mestre de Pontos de Acupuntura (Compartilhado entre todas as clínicas)
create table acupuncture_points (
  code text primary key, -- Ex: 'E36', 'IG4', 'BP6', 'VG20', 'VC12'
  pinyin text,           -- Ex: 'Zusanli', 'Hegu'
  name_pt text,          -- Ex: 'Três Milhas da Perna', 'Vale de Junção'
  meridian text not null,-- 'Pulmão', 'Intestino Grosso', 'Estômago', 'Vaso Governador', etc.
  location text,         -- Descrição anatômica precisa
  view text check (view in ('front', 'back', 'side')),
  x numeric(5,2),        -- Coordenada padrão no mapa SVG
  y numeric(5,2),
  point_type text,       -- 'Fonte', 'Tonificação', 'Sedação', 'Alarme (Mu)', 'Assentimento (Shu)'
  needs_review boolean not null default true
);

-- Acupuntura: Pontos Aplicados em uma Sessão Específica
create table acupuncture_session_points (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  entry_id uuid not null references record_entries(id) on delete cascade,
  point_code text not null references acupuncture_points(code),
  side text default 'bilateral' check (side in ('left', 'right', 'bilateral')),
  technique text default 'agulha' check (technique in ('agulha', 'moxa', 'ventosa', 'eletro', 'laser', 'auriculo')),
  retention_min int default 20, -- Tempo de permanência das agulhas (minutos)
  depth text,                   -- Ex: '0.5 tsun perpendicular'
  note text
);

-- Protocolos / Fórmulas de Pontos Salvas pela Clínica
create table treatment_protocols (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  description text,
  point_codes text[] not null, -- Array de códigos: ['E36', 'IG4', 'BP6']
  created_at timestamptz not null default now()
);

-- Anexos e Exames do Paciente (Supabase Storage)
create table attachments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  entry_id uuid references record_entries(id) on delete set null,
  file_name text not null,
  file_path text not null, -- Caminho no bucket privado do Supabase
  file_size int,
  mime_type text,
  uploaded_at timestamptz not null default now()
);

-- ==============================================================================
-- 8. MÓDULO FINANCEIRO
-- ==============================================================================

-- Contas a Receber (originadas de consultas, pacotes ou mensalidades)
create table receivables (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  package_id uuid references patient_packages(id) on delete set null,
  description text not null,
  amount numeric(10,2) not null check (amount >= 0),
  due_date date not null default current_date,
  status payment_status not null default 'open',
  created_at timestamptz not null default now()
);

-- Registros de Pagamento Efetuado (com suporte a pagamentos parciais)
create table payments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  receivable_id uuid not null references receivables(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  method payment_method not null,
  paid_at timestamptz not null default now(),
  notes text
);

-- Despesas / Contas a Pagar
create table expenses (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  category text not null, -- 'aluguel', 'insumos', 'energia', 'marketing', 'salarios'
  description text not null,
  amount numeric(10,2) not null check (amount > 0),
  due_date date not null,
  paid_at date,
  is_recurring boolean not null default false,
  created_at timestamptz not null default now()
);

-- Faturamento e Lotes de Convênio
create table insurance_batches (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  insurer_id uuid not null references insurers(id) on delete cascade,
  batch_number text not null,
  amount_claimed numeric(10,2) not null,
  amount_paid numeric(10,2) default 0.00,
  amount_disputed numeric(10,2) default 0.00, -- Glosas
  status insurance_batch_status not null default 'draft',
  submitted_at date,
  paid_at date,
  created_at timestamptz not null default now()
);

-- Repasses / Comissões dos Profissionais
create table commissions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  base_amount numeric(10,2) not null,
  commission_amount numeric(10,2) not null,
  status text not null default 'pending', -- 'pending', 'paid'
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 9. AUDITORIA & SEGURANÇA (LGPD)
-- ==============================================================================

create table audit_logs (
  id bigserial primary key,
  clinic_id uuid references clinics(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null, -- 'INSERT', 'UPDATE', 'DELETE', 'VIEW_SENSITIVE'
  table_name text not null,
  row_id text not null,
  diff jsonb,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 10. ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================

create index idx_clinics_slug on clinics(slug);
create index idx_clinic_members_user on clinic_members(user_id);
create index idx_clinic_members_clinic on clinic_members(clinic_id);
create index idx_professionals_clinic on professionals(clinic_id);
create index idx_patients_clinic on patients(clinic_id);
create index idx_patients_cpf on patients(clinic_id, cpf);
create index idx_patients_phone on patients(clinic_id, phone);
create index idx_appointments_clinic_period on appointments(clinic_id, period);
create index idx_appointments_patient on appointments(patient_id);
create index idx_appointments_prof on appointments(professional_id);
create index idx_records_patient on medical_records(patient_id);
create index idx_record_entries_record on record_entries(record_id);
create index idx_body_markings_entry on body_markings(entry_id);
create index idx_acu_points_entry on acupuncture_session_points(entry_id);
create index idx_receivables_clinic on receivables(clinic_id);
create index idx_audit_clinic on audit_logs(clinic_id);

-- ==============================================================================
-- 11. FUNÇÕES AUXILIARES DE RLS (SECURITY DEFINER)
-- ==============================================================================

-- Verifica se o usuário atual é membro da clínica
create or replace function public.is_member(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from clinic_members
    where clinic_id = cid and user_id = auth.uid()
  );
$$;

-- Verifica se o usuário atual possui um dos papéis (roles) permitidos
create or replace function public.has_role(cid uuid, roles member_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from clinic_members
    where clinic_id = cid and user_id = auth.uid() and role = any(roles)
  );
$$;

-- Retorna a clínica do usuário logado
create or replace function public.get_user_clinic_id()
returns uuid language sql stable security definer set search_path = public as $$
  select clinic_id from clinic_members
  where user_id = auth.uid()
  limit 1;
$$;

-- ==============================================================================
-- 12. HABILITAÇÃO DO RLS EM TODAS AS TABELAS
-- ==============================================================================

alter table clinics enable row level security;
alter table clinic_members enable row level security;
alter table professionals enable row level security;
alter table patient_segments enable row level security;
alter table services enable row level security;
alter table service_prices enable row level security;
alter table insurers enable row level security;
alter table insurance_plans enable row level security;
alter table patients enable row level security;
alter table patient_segment_history enable row level security;
alter table patient_insurances enable row level security;
alter table insurance_authorizations enable row level security;
alter table patient_packages enable row level security;
alter table schedule_rules enable row level security;
alter table schedule_breaks enable row level security;
alter table schedule_blocks enable row level security;
alter table slot_overrides enable row level security;
alter table appointments enable row level security;
alter table appointment_status_log enable row level security;
alter table medical_records enable row level security;
alter table record_entries enable row level security;
alter table body_markings enable row level security;
alter table acupuncture_points enable row level security;
alter table acupuncture_session_points enable row level security;
alter table treatment_protocols enable row level security;
alter table attachments enable row level security;
alter table receivables enable row level security;
alter table payments enable row level security;
alter table expenses enable row level security;
alter table insurance_batches enable row level security;
alter table commissions enable row level security;
alter table audit_logs enable row level security;

-- ==============================================================================
-- 13. POLÍTICAS DE ACESSO (POLICIES)
-- ==============================================================================

-- Clinics
create policy "Membros podem ver sua própria clínica"
  on clinics for select using (public.is_member(id));
create policy "Público pode ver dados básicos da clínica pelo slug (para auto-agendamento)"
  on clinics for select using (true);
create policy "Owner e admin podem atualizar a clínica"
  on clinics for update using (public.has_role(id, array['owner', 'admin']::member_role[]));

-- Clinic Members
create policy "Membros podem ver colegas de equipe da mesma clínica"
  on clinic_members for select using (public.is_member(clinic_id));
create policy "Owner e admin gerenciam membros da clínica"
  on clinic_members for all using (public.has_role(clinic_id, array['owner', 'admin']::member_role[]));

-- Tabelas Operacionais Gerais (acesso para todos os membros da clínica)
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'professionals', 'patient_segments', 'services', 'service_prices',
    'insurers', 'insurance_plans', 'patients', 'patient_segment_history',
    'patient_insurances', 'insurance_authorizations', 'patient_packages',
    'schedule_rules', 'schedule_blocks', 'slot_overrides',
    'appointments', 'appointment_status_log', 'treatment_protocols'
  ] loop
    execute format('create policy "Acesso multi-tenant por clínica: %I" on %I for all using (public.is_member(clinic_id)) with check (public.is_member(clinic_id))', tbl, tbl);
  end loop;
end $$;

-- Prontuário Clínico e Mapas: APENAS owner, admin e professional (Recepção e Financeiro NÃO acessam)
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'medical_records', 'record_entries', 'body_markings',
    'acupuncture_session_points', 'attachments'
  ] loop
    execute format('create policy "Acesso clínico restrito: %I" on %I for all using (public.has_role(clinic_id, array[''owner'', ''admin'', ''professional'']::member_role[])) with check (public.has_role(clinic_id, array[''owner'', ''admin'', ''professional'']::member_role[]))', tbl, tbl);
  end loop;
end $$;

-- Catálogo de Pontos de Acupuntura (Leitura livre para qualquer usuário autenticado)
create policy "Leitura do catálogo de pontos de acupuntura"
  on acupuncture_points for select using (auth.role() = 'authenticated');

-- Financeiro: APENAS owner, admin e financial
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'receivables', 'payments', 'expenses', 'insurance_batches', 'commissions'
  ] loop
    execute format('create policy "Acesso financeiro restrito: %I" on %I for all using (public.has_role(clinic_id, array[''owner'', ''admin'', ''financial'']::member_role[])) with check (public.has_role(clinic_id, array[''owner'', ''admin'', ''financial'']::member_role[]))', tbl, tbl);
  end loop;
end $$;

-- Auditoria: Visível apenas para Owner e Admin
create policy "Owner e admin podem consultar auditoria"
  on audit_logs for select using (public.has_role(clinic_id, array['owner', 'admin']::member_role[]));

-- ==============================================================================
-- 14. TRIGGERS AUTOMÁTICOS
-- ==============================================================================

-- Trigger para atualizar contagem de sessões usadas em pacotes ao concluir agendamento
create or replace function public.fn_handle_appointment_package_consumption()
returns trigger language plpgsql security definer as $$
begin
  -- Se o agendamento foi marcado como concluído ('done') e tem pacote associado
  if new.status = 'done' and (old.status is distinct from 'done') and new.patient_package_id is not null then
    update patient_packages
    set sessions_used = sessions_used + 1
    where id = new.patient_package_id;
  end if;

  -- Se foi desfeito de 'done' para outro status, estorna a sessão
  if old.status = 'done' and new.status is distinct from 'done' and new.patient_package_id is not null then
    update patient_packages
    set sessions_used = greatest(0, sessions_used - 1)
    where id = new.patient_package_id;
  end if;

  return new;
end;
$$;

create trigger trg_appointment_package_consumption
after update of status on appointments
for each row execute function public.fn_handle_appointment_package_consumption();

-- Trigger para registrar log de mudança de status de agendamentos
create or replace function public.fn_log_appointment_status_change()
returns trigger language plpgsql security definer as $$
begin
  if old.status is distinct from new.status then
    insert into appointment_status_log(clinic_id, appointment_id, old_status, new_status, changed_by)
    values (new.clinic_id, new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger trg_log_appointment_status_change
after update of status on appointments
for each row execute function public.fn_log_appointment_status_change();
