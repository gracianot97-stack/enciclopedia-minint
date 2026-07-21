# Guia de Publicação na Netlify — Enciclopédia MININT (Ivany Tomás Multivendas)

## ⚠️ Já teve o erro "Unexpected token '<' ... is not valid JSON"?

Este erro significa que o seu telemóvel/navegador pediu dados à API (ex:
`/api/auth/register`) mas recebeu de volta a página HTML do site, em vez de
uma resposta de dados. Há apenas duas causas possíveis:

1. **A forma como publicou o site não inclui as Funções da API.**
   Isto acontece quase sempre quando se publica **arrastando apenas a pasta
   `dist`** para a Netlify ("drag & drop"). Esse método só publica ficheiros
   estáticos — nunca inclui as Funções (pasta `netlify/functions`) nem lê o
   `netlify.toml`, porque esses ficheiros estão fora da pasta `dist`.
   → **Solução:** publique ligando o repositório do projeto (GitHub/GitLab/
   Bitbucket) diretamente nas definições do site na Netlify, ou use o
   comando `netlify deploy --prod` a partir da pasta principal do projeto
   (nunca de dentro de `dist`).

2. **As variáveis de ambiente da base de dados não estão configuradas na
   Netlify** (`SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME`).
   → **Solução:** configure-as em *Site settings → Environment variables*
   (ver secção 3 abaixo) e volte a publicar (*Trigger deploy*).

### Como confirmar qual é o problema

Depois de publicar, abra esta hiperligação diretamente no navegador do
telemóvel (substituindo pelo domínio real do seu site):

```
https://o-seu-site.netlify.app/api/status
```

- Se aparecer texto como `{"maintenanceMode":false}` → as Funções estão a
  funcionar. O problema seria então as variáveis da base de dados.
- Se aparecer a página normal do aplicativo (HTML) → as Funções não foram
  publicadas. Reveja a secção 4 (Configurações de compilação) abaixo.

---

Este guia explica os passos necessários para publicar corretamente o aplicativo
na Netlify, de forma que o **login funcione normalmente para todos os
utilizadores** e os dados fiquem **guardados de forma permanente**.

## 1. Porque é que o login falhava antes

O aplicativo original corria como um servidor Node/Express que guardava as
sessões de login **em memória**. A Netlify não executa servidores
persistentes — publica ficheiros estáticos e "Funções" que só existem
durante o tempo de um pedido. Isso fazia com que as sessões desaparecessem
de forma imprevisível, causando falhas de login para alguns utilizadores.

**A correção:** as sessões de login (bem como utilizadores, estados de
bloqueio/ativação e simulados) já não vivem em memória — vivem na base de
dados PostgreSQL, na nova tabela `sessions`. Por isso, mesmo que a Netlify
troque de instância a cada pedido, ou que o telemóvel do estudante
reinicie, o login continua válido e todos os dados continuam lá.

## 2. Configurar a base de dados

Este aplicativo **precisa sempre** de uma base de dados PostgreSQL acessível
pela Internet (a Netlify não tem base de dados própria). Pode continuar a
usar a mesma base de dados que já tinha configurada, desde que ela aceite
ligações externas.

### 2.1. Criar a nova tabela `sessions`

Se conseguir correr `npx drizzle-kit push` a partir do seu computador (com as
variáveis de ambiente abaixo definidas num ficheiro `.env`), isso cria a
tabela automaticamente. Caso contrário, execute este SQL diretamente na sua
base de dados (ex: através do painel do seu fornecedor de PostgreSQL):

```sql
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  kicked BOOLEAN NOT NULL DEFAULT false
);
```

Não é preciso mais nenhuma tabela: a proteção contra dois logins em
simultâneo na mesma conta usa um recurso nativo do PostgreSQL (bloqueio
consultivo/"advisory lock"), sem necessidade de configuração adicional.

Também é necessária esta tabela adicional, usada para bloquear
temporariamente contas após várias tentativas de login falhadas seguidas
(proteção contra força bruta):

```sql
CREATE TABLE IF NOT EXISTS login_attempts (
  email TEXT PRIMARY KEY,
  failed_count INTEGER NOT NULL DEFAULT 0,
  last_failed_at BIGINT,
  locked_until BIGINT
);
```

### 2.2. Se a base de dados atual não aceitar ligações externas

Se a sua base de dados foi criada dentro do Google Cloud (ligada apenas ao
Cloud Run), pode ser necessário ativar um IP público com regras de firewall,
ou migrar os dados para um fornecedor pensado para acesso externo/serverless,
como **Neon** ou **Supabase** (ambos têm planos gratuitos e compatíveis com
PostgreSQL, exigindo apenas alterar as variáveis de ligação abaixo).

## 3. Variáveis de ambiente a configurar na Netlify

No painel da Netlify: **Site settings → Environment variables**, adicione:

| Variável | Valor |
|---|---|
| `SQL_HOST` | o mesmo anfitrião (host) da sua base de dados |
| `SQL_USER` | o utilizador da base de dados |
| `SQL_PASSWORD` | a palavra-passe da base de dados |
| `SQL_DB_NAME` | o nome da base de dados |
| `SQL_PORT` | normalmente `5432` |
| `SQL_SSL` | `true` (recomendado para a maioria das bases de dados externas) |

Sem estas variáveis, o site publica mas o login e o registo devolvem sempre
erro — porque a Função da Netlify não consegue ligar-se à base de dados.

## 4. Configurações de compilação (Build)

Se ligar o repositório do projeto diretamente à Netlify (recomendado), o
ficheiro `netlify.toml` incluído já configura tudo automaticamente:

- **Comando de build:** `npm run build:netlify`
- **Pasta publicada:** `dist`
- **Pasta de funções:** `netlify/functions`

Se preferir publicar arrastando uma pasta manualmente (drag & drop), **as
Funções não seriam incluídas** e o login não funcionaria — por isso, para
este aplicativo, publique sempre ligando o repositório Git à Netlify (ou
utilizando o comando `netlify deploy` da CLI, que também respeita o
`netlify.toml`).

## 5. Depois de publicar

1. Aceda ao site publicado e experimente registar uma conta nova.
2. Inicie sessão com a conta `gracianot97@gmail.com` (administrador
   principal) e abra o **Painel Admin**.
3. Clique em **"Diagnóstico do Sistema"** para confirmar que a base de dados,
   o rastreamento de estudantes, o bloqueio de contas e as sessões iniciadas
   estão todos operacionais.

Se algum item aparecer com erro, o diagnóstico mostra a mensagem exata do
problema (normalmente relacionada com as variáveis de ambiente da base de
dados).

## 6. Segurança adicional já incluída

- **Senhas com bcrypt:** contas novas usam bcrypt (mais seguro). Contas
  criadas antes desta atualização continuam a funcionar normalmente e são
  migradas automaticamente para bcrypt assim que iniciam sessão com sucesso
  — não precisa de pedir a ninguém para redefinir a palavra-passe.
- **Proteção contra força bruta:** após 5 tentativas de login falhadas
  numa janela de 15 minutos, a conta fica temporariamente bloqueada por 15
  minutos. Isto é visível no Diagnóstico do Sistema.
- **Uma sessão por conta, sem falhas de corrida:** dois pedidos de login em
  simultâneo na mesma conta nunca resultam em duas sessões activas.
