-- ==============================================================================
-- AgendaZen: Dados Iniciais de Demonstração (Seed)
-- Arquivo: supabase/seeds/01_initial_data.sql
-- ==============================================================================

-- 1. Criação de uma Clínica Modelo (Demo)
insert into clinics (id, name, slug, document, phone, address, brand_colors, trial_ends_at)
values (
  'a0000000-0000-0000-0000-000000000001',
  'Clínica AgendaZen Integrada',
  'clinica-demonstracao',
  '28.335.884/0001-54',
  '(11) 98765-4321',
  '{"street": "Av. Paulista", "number": "1000", "complement": "Conj. 82", "neighborhood": "Bela Vista", "city": "São Paulo", "state": "SP", "zip": "01310-100"}'::jsonb,
  '{"primary": "#0F4C5C", "secondary": "#52B788", "accent": "#E0A96D"}'::jsonb,
  now() + interval '30 days'
) on conflict (id) do nothing;

-- 2. Segmentos de Pacientes Padrão
insert into patient_segments (id, clinic_id, name, description, is_default)
values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Particular Padrão', 'Pacientes sem desconto ou plano corporativo', true),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Fidelidade / VIP', 'Pacientes assíduos com tabela diferenciada', false),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Convênio', 'Atendimento vinculado a operadora de saúde', false)
on conflict do nothing;

-- 3. Profissionais da Clínica
insert into professionals (id, clinic_id, name, specialty, council_number, color, commission_rate)
values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Dra. Camila Santos', 'physio', 'CREFITO-3/123456-F', '#0F4C5C', 50.00),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Dr. Roberto Takahashi', 'acupuncture', 'CREFITO-3/654321-A', '#52B788', 55.00),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Dra. Juliana Mendes', 'both', 'CREFITO-3/789123-FA', '#E0A96D', 60.00)
on conflict (id) do nothing;

-- 4. Serviços Oferecidos
insert into services (id, clinic_id, name, specialty, duration_min)
values
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Fisioterapia Traumato-Ortopédica', 'physio', 50),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Sessão de Acupuntura Sistêmica', 'acupuncture', 50),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Atendimento Integrado (Fisio + Acupuntura)', 'both', 75)
on conflict (id) do nothing;

-- 5. Tabelas de Preço (Avulso e Pacotes)
-- Serviço 1: Fisioterapia (Particular)
insert into service_prices (clinic_id, service_id, segment_id, mode, price, sessions, valid_days)
values
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'single', 180.00, 1, null),
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'package', 1500.00, 10, 90),
-- Serviço 2: Acupuntura (Particular)
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'single', 200.00, 1, null),
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'package', 1700.00, 10, 90),
-- Preços VIP (Desconto especial)
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'single', 150.00, 1, null),
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'single', 170.00, 1, null)
on conflict do nothing;

-- 6. Regras de Horários Semanais para a Agenda (Segunda a Sexta, 08:00 às 18:00)
insert into schedule_rules (clinic_id, professional_id, weekday, start_time, end_time, slot_minutes, default_status)
values
  -- Dra. Camila (Seg a Sex)
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 1, '08:00', '18:00', 50, 'free'),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 2, '08:00', '18:00', 50, 'free'),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 3, '08:00', '18:00', 50, 'free'),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 4, '08:00', '18:00', 50, 'free'),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 5, '08:00', '18:00', 50, 'free'),
  -- Dr. Roberto (Seg, Qua, Sex)
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 1, '09:00', '19:00', 50, 'free'),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 3, '09:00', '19:00', 50, 'free'),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 5, '09:00', '19:00', 50, 'free')
on conflict do nothing;

-- 7. Protocolos Clínicos de Acupuntura Salvos
insert into treatment_protocols (clinic_id, name, description, point_codes)
values
  (
    'a0000000-0000-0000-0000-000000000001',
    'Lombalgia Aguda / Ciatalgia',
    'Protocolo clássico para alívio rápido de dor lombar e descompressão do trajeto ciático.',
    array['B23', 'B25', 'B40', 'B60', 'VB30', 'VG3', 'VG4', 'EX-UE7']
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'Cervicalgia e Tensão Escapular',
    'Tratamento de torcicolo, contratura de trapézio e cefaleia tensional.',
    array['VB20', 'VB21', 'ID3', 'ID11', 'TA5', 'VG14', 'EX-HN5']
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'Ansiedade, Insônia e Harmonização Shen',
    'Acalmar a mente (Shen), regulação de sono e equilíbrio emocional.',
    array['C7', 'PC6', 'VC17', 'VG20', 'EX-HN3', 'BP6', 'F3', 'R1']
  )
on conflict do nothing;
