# AgendaZen — Sistema de Gestão para Clínicas de Fisioterapia & Acupuntura

> **SaaS multi-tenant completo**, desenvolvido com **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Radix UI** e **Supabase (PostgreSQL 15+ com RLS nativo)**.

---

## 🌟 Visão Geral

O **AgendaZen** foi concebido exclusivamente para atender a rotina clínica de consultórios e clínicas de **Fisioterapia** e **Acupuntura**. A plataforma une:

1. **Auto-agendamento pelo Paciente** via QR Code de Balcão e Link Público (`/c/[slug]`).
2. **Consentimento LGPD Automatizado** com captura de IP e carimbo de data/hora no banco.
3. **Agenda Inteligente com Detecção de Colisão** via constraints `tstzrange` no PostgreSQL (código `23P01`).
4. **Prontuário Eletrônico Especializado**:
   - Metodologia **SOAP** (Subjetivo, Objetivo, Avaliação, Plano).
   - **Mapa Corporal Interativo em SVG** (vistas anterior e posterior) com pontuação EVA de dor (0 a 10) e categorização clínica.
   - **Catálogo de 361 Pontos de Acupuntura** categorizados por meridiano, com técnicas de agulhamento, moxa, ventosa e fórmulas clínicas de 1 clique.
5. **Módulo Financeiro & Split de Comissões**:
   - Contas a Receber e Baixa de Pagamentos (PIX, Cartão, Dinheiro).
   - Venda de Pacotes de Sessões com controle de expiração e saldo.
   - Cálculo e lançamento automático de **comissão por atendimento** conforme a alíquota de cada fisioterapeuta/acupunturista.
   - **DRE Sintético** (Demonstrativo do Resultado do Exercício) em tempo real.

---

## 🏗️ Arquitetura e Estrutura de Pastas

```
├── public/
│   ├── brand/               # Logos do AgendaZen (SVG e PNG)
│   └── manifest.json        # Configuração PWA instalável
├── src/
│   ├── app/
│   │   ├── (auth)/          # Telas de Login e Registro
│   │   ├── (dashboard)/     # Área autenticada da clínica
│   │   │   ├── agenda/      # Timeline diária, confirmações e encaixes
│   │   │   ├── pacientes/   # Cadastro, listagem e ficha detalhada
│   │   │   ├── prontuario/  # Evolução SOAP, Mapa Corporal SVG e Acupuntura
│   │   │   ├── financeiro/  # Contas a receber, baixas, pacotes, comissões e DRE
│   │   │   ├── divulgacao/  # Placa A5 para balcão, QR Code e link rápido
│   │   │   └── configuracoes/# Dados institucionais, profissionais, tabelas e convênios
│   │   ├── onboarding/      # Assistente de configuração inicial pós-cadastro
│   │   ├── c/[slug]/        # Portal público do paciente (Agendamento & Minhas Consultas)
│   │   ├── layout.tsx       # Root layout com PWA e fontes
│   │   └── page.tsx         # Landing page institucional do AgendaZen
│   ├── components/
│   │   ├── medical-record/  # BodyMapInteractive.tsx & AcupunctureSelector.tsx
│   │   ├── layout/          # DashboardNav.tsx (navegação responsiva com drawer)
│   │   └── ui/              # Componentes de UI baseados em Radix UI e Tailwind
│   ├── lib/
│   │   ├── schedule/        # Motor de cálculo de horários livres e quebras (availability.ts)
│   │   ├── supabase/        # Clientes Supabase SSR (server, client, admin e middleware)
│   │   ├── validations/     # Schemas Zod de validação
│   │   └── utils.ts         # Formatadores de moeda (BRL), CPF, telefone e datas
│   └── middleware.ts        # Proteção de rotas e renovação de tokens de sessão
```

---

## 🔐 Segurança e Multi-Tenancy (RLS)

O AgendaZen adota isolamento rígido de dados por clínica através de **Row Level Security (RLS)**:
- Todo registro pertence a um `clinic_id`.
- Os papéis de acesso em `clinic_members` são:
  - `owner` / `admin`: Acesso total a configurações, prontuários e financeiro.
  - `professional`: Acesso total à agenda, pacientes e prontuários clínicos.
  - `receptionist`: Acesso à recepção, cadastro de pacientes, agenda e agendamentos.
  - `financial`: Acesso a contas a receber, pagamentos, despesas e relatórios contábeis.
- O auto-agendamento do paciente (`/c/[slug]`) roda com segurança via `createAdminClient()`, validando colisões e gerando os registros de consentimento de forma anônima e segura.

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js 18+ instalado.
- Projeto criado no [Supabase](https://supabase.com).

### 2. Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz com as credenciais do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-publica
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-secreta
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Instalar Dependências e Rodar o Banco
Execute as migrações SQL disponíveis na pasta `supabase/` no SQL Editor do seu console Supabase para criar as tabelas, índices e funções de RLS.

Instale os pacotes npm:
```bash
npm install
```

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🧪 Roteiro de Teste do Fluxo E2E (Ponta a Ponta)

1. **Cadastro & Onboarding**:
   - Acesse `/register`, crie uma conta e preencha o onboarding com o nome da sua clínica (ex: "Clínica Zen Fisioterapia").
2. **Configuração de Profissionais e Preços**:
   - Em `/configuracoes`, adicione um fisioterapeuta/acupunturista com alíquota de comissão (ex: `40%`) e cadastre os serviços e preços.
3. **Impressão da Placa e Teste do QR Code**:
   - Acesse `/divulgacao` para visualizar a placa de balcão A5 e clique em "Abrir link público".
4. **Agendamento pelo Paciente**:
   - Em `/c/[slug]`, selecione um serviço, escolha um horário vago na grade, preencha os dados pessoais e marque o aceite da **LGPD**. Conclua o agendamento.
5. **Recepção e Sala de Espera**:
   - Em `/agenda`, veja o agendamento aparecer imediatamente. Mude o status para "Chegou na Clínica" (check-in) e depois "Em Atendimento".
6. **Atendimento SOAP e Mapa Corporal**:
   - Acesse `/prontuario`, selecione o paciente, preencha o SOAP, clique nos pontos de dor no **Mapa Corporal SVG** e selecione os **pontos de acupuntura** da sessão. Clique em **Salvar Evolução Clínica**.
7. **Baixa Financeira e Comissão**:
   - Acesse `/financeiro`, visualize a conta a receber gerada, dê baixa com pagamento via PIX. Verifique a comissão de 40% gerada automaticamente na aba **Comissões**.
8. **DRE**:
   - Na aba **DRE Sintético**, veja o resultado operacional e a margem líquida calculados instantaneamente.

---

## 📦 Build para Produção

Para validar a tipagem e compilar o projeto:
```bash
npm run build
```

O projeto foi validado com **100% de sucesso na compilação do Next.js**, cobrindo todas as 13 rotas estáticas e dinâmicas com tipagem estrita de TypeScript.
