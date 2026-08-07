# OdontoPro

SaaS para gestão de clínicas odontológicas. Profissionais gerenciam agenda, serviços, perfil e assinaturas; pacientes agendam pela página pública da clínica.

## Stack

- **Next.js 16** (App Router) + **React 19** + TypeScript
- **PostgreSQL** + **Prisma 7** (client gerado em `src/generated/prisma`)
- **Auth.js / NextAuth v5** (login com **Google**; GitHub em standby)
- **Stripe** (assinaturas, Checkout e Customer Portal)
- **Cloudinary** (imagens; no banco fica só a URL em `User.image`)
- **Tailwind CSS 4** + shadcn/ui + Sonner

## Funcionalidades

### Área pública
- Landing page com clínicas/profissionais disponíveis
- Login com **Google** (OAuth)
- Agendamento público em `/clinica/[id]` (data, horários e dados do paciente)

### Painel da clínica (`/dashboard`)
- **Agenda** — listar, filtrar por data e cancelar agendamentos
- **Lembretes** — criar e gerenciar lembretes
- **Serviços** — CRUD de serviços (nome, preço, duração) com limite por plano
- **Perfil** — dados da clínica, telefone, endereço, fuso e horários
- **Avatar** — upload para Cloudinary; sincroniza foto do Google no login (sem sobrescrever avatar customizado)
- **Planos** — checkout Stripe (Básico / Profissional) e portal do cliente
- **Relatórios** — rota protegida (plano Professional)

### Assinaturas (Stripe)
- Criação de customer e sessão de Checkout
- Planos `BASIC` e `PROFESSIONAL` via Price IDs no `.env`
- Webhook em `/api/webhook` persiste assinatura no banco (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`)
- Portal do cliente Stripe para gerenciar/cancelar plano
- Permissões por plano (ex.: limite de serviços ativos)

### Imagens (Cloudinary)
- Upload autenticado em `POST /api/image/upload`
- Arquivo fica no Cloudinary; PostgreSQL guarda apenas a `secure_url`
- Upload preset unsigned recomendado: `odontopro_avatars`
- Domínios liberados no `next/image`: Cloudinary, Google (`lh*.googleusercontent.com`) e GitHub Avatars

## Estrutura principal

```text
src/
├── app/
│   ├── (public)/                 # landing + agendamento público
│   ├── (panel)/dashboard/        # painel autenticado
│   │   ├── services/
│   │   ├── profile/
│   │   ├── plans/
│   │   ├── reports/
│   │   └── _components/          # agenda, lembretes, sidebar
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── image/upload/         # Cloudinary → User.image (URL)
│       ├── webhook/              # Stripe
│       ├── clinic/
│       └── schedule/
├── lib/                          # auth, prisma, cloudinary
├── utils/                        # stripe, permissions, plans
└── generated/prisma/             # client Prisma (gerado; não versionar)
```

## Começando

### Pré-requisitos

- Node.js 20+
- PostgreSQL 17+ (ex.: Neon)
- Conta Stripe (modo teste)
- Projeto OAuth no **Google Cloud Console**
- Conta Cloudinary (upload preset unsigned)

### Instalação

```bash
npm install
```

Gere o client e aplique o schema/migrations:

```bash
npx prisma generate
npx prisma migrate deploy
# ou, em desenvolvimento:
npx prisma db push
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
# Auth
AUTH_SECRET=
AUTH_URL=http://localhost:3000

# Google (login ativo)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# GitHub (standby — opcional)
# AUTH_GITHUB_ID=
# AUTH_GITHUB_SECRET=

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

# Cloudinary (arquivo no Cloudinary; User.image = URL)
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=
CLOUDINARY_UPLOAD_PRESET=odontopro_avatars
```

### Cloudinary — Upload Preset

1. Cloudinary → **Settings → Upload → Upload presets**
2. Crie o preset `odontopro_avatars`
3. **Signing mode:** Unsigned
4. Reinicie o servidor após alterar o `.env`

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → Credenciais OAuth
2. URIs de redirecionamento autorizados:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Produção: `https://SEU-DOMINIO/api/auth/callback/google`
3. Em modo *Testing*, adicione e-mails em **Usuários de teste**

### Rodar em desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Webhook Stripe (local)

Em outro terminal, com a [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
npm run stripe:listen
```

Encaminha eventos para `localhost:3000/api/webhook`. Use o `whsec_...` gerado em `STRIPE_WEBHOOK_SECRET`.

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | `prisma generate` + `migrate deploy` + `next build` |
| `npm start` | Servidor de produção |
| `npm run postinstall` | Gera o client Prisma |
| `npm run stripe:listen` | Encaminha webhooks Stripe para o app local |

## Planos

| Plano | Limite de serviços | Uso |
|-------|--------------------|-----|
| **BASIC** | até 3 | Clínicas menores |
| **PROFESSIONAL** | até 50 | Clínicas em crescimento + relatórios |

Os Price IDs vêm de `STRIPE_PLAN_BASIC` e `STRIPE_PLAN_PRO`.

## Deploy (Vercel)

1. Conecte o repositório na Vercel
2. Configure **todas** as variáveis de ambiente (incluindo `AUTH_URL` e `NEXT_PUBLIC_URL` com o domínio de produção)
3. Atualize as URIs de callback do Google e os webhooks do Stripe para o domínio de produção
4. O build roda `prisma generate` e `prisma migrate deploy` antes do `next build`

> O client Prisma é gerado em `src/generated/prisma` (listado no `.gitignore`). Não importe de `@prisma/client` diretamente — use `@/generated/prisma/client` ou `@/lib/prisma`.

## Status atual

- [x] Auth Google + painel protegido (GitHub em standby)
- [x] Serviços, agenda, lembretes e perfil
- [x] Avatar no Cloudinary (banco guarda só a URL)
- [x] Foto do Google no login (sem sobrescrever avatar Cloudinary)
- [x] Página pública de agendamento
- [x] Checkout Stripe + webhook persistindo assinatura
- [x] Portal do cliente Stripe
- [x] Limites/permissões por plano
- [x] Rota de relatórios (Professional)
- [ ] Relatórios com dados/visualizações completas

## Licença

Projeto privado — uso interno / educacional.
