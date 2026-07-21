import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// --- Configuração robusta e "preguiçosa" (lazy) da ligação à base de dados ---
//
// IMPORTANTE: nada aqui pode ser executado (nem lançar erros) no momento em
// que este ficheiro é importado. Em ambiente serverless (Funções Netlify),
// qualquer erro lançado durante o carregamento do módulo faz a função
// falhar por completo ANTES de o Express conseguir responder — e a Netlify
// devolve uma página de erro em HTML em vez de JSON, o que faz o
// aplicativo mostrar o erro "Unexpected token '<' ... is not valid JSON".
//
// Por isso, o pool de ligações só é criado (e só pode falhar) quando uma
// rota da API tenta mesmo usar a base de dados — e nessa altura o erro é
// sempre apanhado pelos blocos try/catch em db.ts, devolvendo sempre uma
// resposta JSON limpa ao utilizador.

function getEnvOrEmpty(name: string): string {
  return process.env[name] || '';
}

export const createPool = () => {
  const host = getEnvOrEmpty('SQL_HOST');
  const user = getEnvOrEmpty('SQL_USER');
  const password = getEnvOrEmpty('SQL_PASSWORD');
  const database = getEnvOrEmpty('SQL_DB_NAME');
  const port = process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432;

  if (!host || !user || !database) {
    console.error(
      'Aviso: faltam variáveis de ambiente da base de dados (SQL_HOST, SQL_USER, SQL_DB_NAME). ' +
      'Configure-as nas variáveis de ambiente do seu serviço de hospedagem (ex: Netlify).'
    );
  }

  // SQL_SSL=true é normalmente necessário para bases de dados externas
  // acedidas a partir de Funções Netlify (ex: Neon, Supabase, Cloud SQL com IP público).
  const useSSL = process.env.SQL_SSL === 'true';

  return new Pool({
    host,
    user,
    password,
    database,
    port,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 15000,
    // Poucas ligações simultâneas por instância: evita esgotar a base de
    // dados quando corre em múltiplas instâncias de função serverless.
    max: process.env.NETLIFY ? 3 : 10,
    idleTimeoutMillis: 30000,
  });
};

// Pool e instância drizzle criados apenas na primeira utilização real
// (nunca no carregamento do módulo), e reutilizados depois entre pedidos
// (mesmo em "warm starts" serverless).
let poolInstance: Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

export const getPool = (): Pool => {
  if (!poolInstance) {
    poolInstance = createPool();
    poolInstance.on('error', (err) => {
      console.error('Erro inesperado numa ligação em espera do pool SQL:', err);
    });
  }
  return poolInstance;
};

function getDb(): NodePgDatabase<typeof schema> {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance;
}

// `db` mantém-se com a mesma API de sempre (db.select(), db.insert(),
// db.transaction(), ...), mas cada acesso passa por este Proxy, que só cria
// a ligação real da primeira vez que for efetivamente utilizada — dentro de
// um pedido, dentro de um try/catch, nunca durante o arranque do módulo.
//
// IMPORTANTE: os métodos devolvidos são explicitamente vinculados ("bind")
// à instância real (e não à Proxy), porque o drizzle usa "this"
// internamente nesses métodos (ex: select(), transaction()). Sem este
// bind, uma chamada como `db.transaction(...)` executaria com "this" a
// apontar para a Proxy vazia em vez da ligação real, causando erros.
export const db: NodePgDatabase<typeof schema> = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop, _receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, real);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});
