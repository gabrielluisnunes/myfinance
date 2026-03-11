# 💰 MyFinance

Aplicativo mobile de **gestão financeira pessoal** desenvolvido com React Native (Expo) e uma API REST em Node.js. Permite controlar receitas, despesas, orçamentos, metas financeiras e transferências entre contas — tudo em um só lugar.

---

## ✨ Funcionalidades

- **Dashboard** — visão geral do saldo, receitas e despesas do mês
- **Transações** — registro e histórico de receitas e despesas com categorias e tags
- **Transferências** — movimentação entre contas próprias
- **Orçamentos** — limites mensais por categoria com acompanhamento de progresso
- **Metas Financeiras** — criação e acompanhamento de objetivos de poupança
- **Contas** — suporte a conta corrente, poupança, dinheiro, cartão de crédito e investimentos
- **Categorias** — categorizadas automaticamente ao criar conta (Mercado, Salário, Saúde, etc.)
- **Autenticação segura** — JWT com expiração, rate limiting, proteção contra timing attack e complexidade de senha obrigatória

---

## 🛠️ Tecnologias

### Frontend

| Tecnologia        | Versão | Uso                               |
| ----------------- | ------ | --------------------------------- |
| React Native      | 0.83   | Interface mobile                  |
| Expo SDK          | 55     | Plataforma e ferramentas mobile   |
| expo-router       | 55     | Navegação baseada em arquivos     |
| TypeScript        | 5.5    | Tipagem estática                  |
| Zustand           | 5      | Gerenciamento de estado (auth)    |
| TanStack Query    | 5      | Cache e sincronização de dados    |
| React Hook Form   | 7      | Formulários                       |
| Zod               | 3      | Validação de schemas              |
| Axios             | 1.7    | Cliente HTTP com interceptors     |
| expo-secure-store | 55     | Armazenamento seguro do token JWT |

### Backend

| Tecnologia          | Versão | Uso                             |
| ------------------- | ------ | ------------------------------- |
| Node.js             | 22     | Runtime                         |
| Fastify             | 5      | Framework HTTP                  |
| TypeScript          | 5.5    | Tipagem estática                |
| Prisma ORM          | —      | Acesso ao banco de dados        |
| MariaDB / MySQL     | —      | Banco de dados relacional       |
| JSON Web Token      | —      | Autenticação via `@fastify/jwt` |
| bcryptjs            | 2.4    | Hash de senhas                  |
| Zod                 | 3      | Validação de entrada            |
| @fastify/helmet     | 13     | Headers de segurança HTTP       |
| @fastify/rate-limit | 10     | Proteção contra força bruta     |
| @fastify/cors       | 11     | Controle de origens permitidas  |

### Monorepo & Infra

| Tecnologia     | Uso                                     |
| -------------- | --------------------------------------- |
| Turborepo      | Orquestração de tarefas no monorepo     |
| npm Workspaces | Gerenciamento de pacotes compartilhados |

### Pacotes internos (`packages/`)

| Pacote             | Responsabilidade                     |
| ------------------ | ------------------------------------ |
| `@myfinance/db`    | Client Prisma e schema compartilhado |
| `@myfinance/types` | Tipos TypeScript compartilhados      |
| `@myfinance/utils` | Utilitários compartilhados           |

---

## 🗂️ Estrutura do Projeto

```
myfinance/
├── apps/
│   ├── backend/          # API REST (Fastify)
│   │   └── src/
│   │       ├── modules/  # auth, transactions, budgets, goals...
│   │       ├── plugins/  # jwt, cors
│   │       ├── middlewares/
│   │       └── utils/
│   └── frontend/         # App React Native (Expo)
│       └── app/
│           ├── (auth)/   # login, register
│           └── (app)/    # dashboard, transações, orçamentos, metas, perfil
├── packages/
│   ├── db/               # Prisma schema + client
│   ├── types/            # Tipos compartilhados
│   └── utils/            # Utilitários compartilhados
└── turbo.json
```

---

## 🚀 Como rodar

### Pré-requisitos

- Node.js 22+
- MariaDB / MySQL rodando na porta 3307
- Expo CLI (`npm install -g expo-cli`)

### 1. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

Principais variáveis:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3307/myfinance"
JWT_SECRET="sua-chave-secreta-com-no-minimo-32-caracteres"
CORS_ORIGIN="http://localhost:8081"
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Criar e migrar o banco de dados

```bash
npm run db:migrate
```

### 4. Rodar em desenvolvimento

**Tudo junto (recomendado):**

```bash
npm run dev
```

**Separadamente:**

```bash
# Backend (porta 3000)
cd apps/backend && npm run dev

# Frontend
cd apps/frontend && npm run dev
```

---

## 🔒 Segurança

- Senhas com hash bcrypt (custo 12)
- JWT com expiração de 2 dias
- Rate limiting: 10 req/min no login, 5 req/15min no registro
- Headers de segurança via Helmet (X-Frame-Options, HSTS, etc.)
- CORS restrito por origem — sem wildcard `*` em produção
- Proteção contra timing attack no login (bcrypt sempre executado)
- Validação de domínio de e-mail via DNS MX no cadastro
- Senha obrigatoriamente com maiúscula, minúscula e número

---

## 📱 Telas do App

| Tela       | Descrição                                     |
| ---------- | --------------------------------------------- |
| Login      | Autenticação com e-mail e senha               |
| Cadastro   | Criação de conta com validação de e-mail real |
| Início     | Dashboard com saldo total e resumo mensal     |
| Transações | Histórico e registro de receitas/despesas     |
| Orçamentos | Limites por categoria com barra de progresso  |
| Metas      | Objetivos financeiros com acompanhamento      |
| Perfil     | Dados do usuário e configurações              |

---

