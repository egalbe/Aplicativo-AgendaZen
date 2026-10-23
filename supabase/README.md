# Configuração e Execução do Banco de Dados Supabase — AgendaZen

Este guia contém as instruções passo a passo para aplicar o banco de dados oficial do AgendaZen no seu projeto Supabase.

---

## 📁 Estrutura de Arquivos Criados:
1. `supabase/migrations/20261023000001_initial_schema.sql`:
   - Schema relacional completo: 28 tabelas, enums, constraints, índices de alta performance e chaves estrangeiras com cascata segura.
   - Funções de isolamento multi-tenant: `public.is_member()` e `public.has_role()`.
   - Políticas RLS rigorosas: dados clínicos e prontuários (`medical_records`, `record_entries`, `body_markings`) são protegidos e inacessíveis para recepção/financeiro.
   - Triggers automáticos: abatimento e estorno de sessões de pacotes ao concluir consultas (`trg_appointment_package_consumption`) e logs de auditoria de agendamento.
2. `supabase/seeds/02_acupuncture_points_seed.sql`:
   - Catálogo com mais de 70 pontos anatômicos dos 14 meridianos principais (P, IG, E, BP, C, ID, B, R, PC, TA, VB, F, VG, VC) e Pontos Extras (EX), com indicação clínica e coordenadas percentuais x/y para o mapa corporal SVG.
3. `supabase/seeds/01_initial_data.sql`:
   - Seed de demonstração: clínica padrão, 3 profissionais (CREFITO), serviços de fisio e acupuntura, segmentos de preço (Particular e VIP), pacotes de sessões, regras de agenda e protocolos clínicos prontos.

---

## 🚀 Como Aplicar no Supabase

### Opção 1: Via Painel Web do Supabase (SQL Editor) — Mais Fácil e Rápido
1. Acesse o dashboard do seu projeto no Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. No menu lateral esquerdo, clique no ícone **SQL Editor** (`>_`).
3. Clique em **New query**.
4. Abra o arquivo `supabase/migrations/20261023000001_initial_schema.sql`, copie todo o conteúdo e cole no editor do Supabase.
5. Clique no botão verde **Run** (Executar). Aguarde a mensagem de `Success`.
6. Crie uma nova query, copie e cole o conteúdo de `supabase/seeds/02_acupuncture_points_seed.sql` e execute (**Run**).
7. Por fim, copie e cole o conteúdo de `supabase/seeds/01_initial_data.sql` e execute (**Run**).

### Opção 2: Via Supabase CLI (Linha de Comando)
Caso utilize a CLI do Supabase localmente:
```bash
# Iniciar o Supabase local (Docker)
npx supabase start

# Aplicar as migrações e seeds
npx supabase db reset
```

---

## 🛡️ O que Testar no Banco:
- No painel **Table Editor** do Supabase, verifique se todas as tabelas foram criadas com o ícone de cadeado verde indicando que o **RLS está ativo**.
- Na tabela `acupuncture_points`, verifique se os pontos dos 14 meridianos foram inseridos.
- Na tabela `clinics`, confirme a presença da clínica de teste com slug `clinica-demonstracao`.
