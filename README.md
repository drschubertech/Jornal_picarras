# Jornal de Balneário Piçarras

Site profissional de jornalismo regional para **Balneário Piçarras e região**
(Penha, Ilhota, Riqueza, Maracajá, Sombrio), com:

- **Site público** com home em manchetes, 8 editorias, página de matéria,
  busca, sitemap e SEO (OpenGraph, metadados, robots.txt).
- **Painel da redação** (`/admin`) com login, publicação manual no editor
  rich text e gestão de matérias (publicar, destacar, excluir).
- **IA que pesquisa na internet**: o Gemini com busca web levanta fatos,
  fontes e notícias da região (portais locais, sites oficiais, perfis
  públicos do Instagram/Facebook indexados na busca) e **produz a matéria**,
  que sempre entra como **rascunho para revisão humana** antes de publicar.
- **Banco Supabase** (Postgres) com RLS, auth e storage de capas.

## Stack

Next.js 16 (App Router + Turbopack) · React 19 · Tailwind CSS v4 ·
Supabase (Postgres/Auth/Storage) · Google Gemini · TipTap

---

## Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

```bash
copy .env.example .env.local   # Windows
```

Preencha o `.env.local`:

| Variável | Onde pegar |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey |
| `NEXT_PUBLIC_SITE_URL` | URL do site (ex.: https://seusite.com.br) |

### 3. Criar o banco (Supabase)

1. Crie um projeto em https://supabase.com (plano grátis atende).
2. Abra **SQL Editor → New query**, cole o conteúdo de
   `supabase/schema.sql` e clique em **Run**. Isso cria a tabela
   `articles`, as políticas de segurança e o bucket `covers` de imagens.
3. Crie o usuário da redação em **Authentication → Users → Add user**
   (e-mail + senha) — será o login do painel.

### 4. Rodar

```bash
npm run dev
```

- Site: http://localhost:3000
- Painel: http://localhost:3000/admin

Sem Supabase configurado o site mostra um aviso de configuração em vez de
quebrar — siga os passos 2 e 3 acima para liberar tudo.

---

## Fluxo da IA (passo a passo)

1. No painel: **Gerar com IA** (`/admin/nova?aba=ia`).
2. Descreva a pauta, escolha a editoria e (opcional) dê orientações.
3. **Pesquisar na internet** → o Gemini busca na web e devolve:
   resumo apurado, notas factuais e a lista de **fontes com link**.
4. **Gerar matéria com base na apuração** → título, linha fina, corpo em
   HTML e tags. A prévia aparece na tela.
5. **Abrir no editor e revisar** → a matéria salva como rascunho com as
   fontes anexadas. Corrija o que quiser no editor rich text e clique em
   **Salvar e publicar**.

Nada é publicado automaticamente: toda matéria de IA passa por revisão.

> Observação sobre redes sociais: Instagram e Facebook bloqueiam robôs, então
> a IA acessa o conteúdo público deles **através da busca web** (o que
> depende do que está indexado). Para fontes oficiais garantidas, cadastre
> os perfis/vídeos oficiais como links no manual do editor.

## Editoria manual

`/admin/nova` → aba **Escrever manualmente**: título, linha fina, editoria,
tags, autor, capa (upload para o storage ou URL), endereço customizado,
destaque na home e corpo no editor com subtítulos, listas, citações e links.

## Estrutura

```
src/
  app/
    page.tsx                home com manchetes
    [categoria]/            páginas de editoria (policiais, esportes…)
    materia/[slug]/         página da matéria (fontes, relacionadas)
    busca/ sobre/           busca e quem somos
    admin/                  painel (login + (painel)/ CRUD)
    api/
      articles/             CRUD de matérias (auth por cookie)
      ai/research/          pesquisa web com Gemini
      ai/generate/          geração da matéria (JSON estruturado)
      auth/                 login/logout
    sitemap.ts robots.ts    SEO
  components/               componentes do site e do painel
  lib/                      config do site, Supabase, Gemini, utilidades
supabase/schema.sql         schema + RLS + storage (execute no Supabase)
```

## Comandos

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # servir o build
npm run lint     # ESLint
```

## Deploy

Rode no **Vercel** (ou qualquer host Node):

1. Conecte o repositório na Vercel.
2. Cadastre as variáveis do `.env.local` em *Project Settings → Environment
   Variables*.
3. Deploy — as rotas de IA usam `maxDuration = 120` (plano Hobby da Vercel
   permite até 300s nas rotas com IA).

## Personalização

- **Nome do jornal, cidades e editorias**: `src/lib/site.ts`.
- **Cores e fontes**: `src/app/globals.css` (tokens `@theme`).
- **Modelo da IA**: variável `GEMINI_MODEL` (padrão `gemini-2.5-flash`).
- **Prompt editorial**: `src/lib/gemini.ts` (tom, tamanho, formato).
