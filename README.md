# OdontoPro

SaaS para gestão de clínicas odontológicas. Profissionais gerenciam agenda, serviços, perfil e assinaturas; pacientes agendam pela página pública da clínica.

## Stack

- **Next.js 16** (App Router) + **React 19** + TypeScript
- **PostgreSQL** + **Prisma 7**
- **NextAuth v5** (login com GitHub)
- **Stripe** (assinaturas / Checkout)
- **Tailwind CSS 4** + shadcn/ui + Sonner

## Funcionalidades

### Área pública
- Landing page com profissionais
- Login com GitHub
- Agendamento público em `/clinica/[id]` (data, horários e dados do paciente)

### Painel da clínica (`/dashboard`)
- **Agenda** — listar, filtrar por data e cancelar agendamentos
- **Lembretes** — criar e gerenciar lembretes
- **Serviços** — CRUD de serviços (nome, preço, duração)
- **Perfil** — dados da clínica, telefone, endereço e horários
- **Planos** — escolha de plano e checkout Stripe (Básico / Profissional)

### Assinaturas (Stripe)
- Criação de customer e sessão de Checkout
- Planos `BASIC` e `PROFESSIONAL` via Price IDs no `.env`
- Webhook em `/api/webhook` (eventos recebidos; persistência no banco em andamento)

## Estrutura principal

```text
src/app/
├── (public)/              # landing + agendamento público
├── (panel)/dashboard/     # painel autenticado
│   ├── services/
│   ├── profile/
│   ├── plans/
│   └── _components/       # agenda, lembretes, sidebar
└── api/
    ├── auth/[...nextauth]/
    ├── webhook/           # Stripe
    ├── clinic/
    └── schedule/
```

## Começando

### Pré-requisitos

- Node.js 20+
- PostgreSQL (ex.: Neon)
- Conta Stripe (modo teste)
- App OAuth no GitHub

### Instalação

```bash
npm install
```

Configure o banco e gere o client Prisma:

```bash
npx prisma db push
npx prisma generate
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Auth
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_URL=http://localhost:3000
DATABASE_URL=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PLAN_BASIC=
STRIPE_PLAN_PRO=
STRIPE_SUCCESS_URL=http://localhost:3000/dashboard/plans?success=true
STRIPE_CANCEL_URL=http://localhost:3000/dashboard/plans?cancel=true
```

### Rodar em desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Webhook Stripe (local)

Em outro terminal, com a [Stripe CLI](https://stripe.com/docs/stripe-cli) instalada:

```bash
npm run stripe:listen
```

Isso encaminha eventos para `localhost:3000/api/webhook`. Use o `whsec_...` gerado pela CLI em `STRIPE_WEBHOOK_SECRET`.

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção |
| `npm run stripe:listen` | Encaminha webhooks Stripe para o app local |

## Planos

| Plano | Limite de serviços | Uso |
|-------|--------------------|-----|
| **BASIC** | até 3 | Clínicas menores |
| **PROFESSIONAL** | até 50 | Clínicas em crescimento |

Os Price IDs vêm de `STRIPE_PLAN_BASIC` e `STRIPE_PLAN_PRO`.

## Status atual

- [x] Auth GitHub + painel protegido
- [x] Serviços, agenda, lembretes e perfil
- [x] Página pública de agendamento
- [x] Checkout Stripe (criação de sessão)
- [ ] Webhook persistindo assinatura no banco
- [ ] Portal do cliente Stripe (gerenciar/cancelar plano)

## Licença

Projeto privado — uso interno / educacional.
