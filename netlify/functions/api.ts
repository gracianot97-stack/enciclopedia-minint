import express from "express";
import serverless from "serverless-http";
import { createApiRouter, attachJsonErrorHandling } from "../../src/server/apiRoutes.ts";

// Esta Função Netlify substitui o servidor Express persistente (que a
// Netlify não consegue executar, por ser uma plataforma "serverless") e
// reutiliza EXATAMENTE as mesmas rotas de autenticação, sessões e
// administração definidas em src/server/apiRoutes.ts.
//
// É esta função que resolve o problema de "o login não funciona para
// todos": antes, as sessões eram guardadas em memória dentro do processo
// do servidor. Numa Função Netlify, cada pedido pode ser atendido por uma
// instância diferente (ou reiniciar a qualquer momento), pelo que uma
// sessão guardada em memória "desaparece" de forma imprevisível. Agora, as
// sessões são guardadas na base de dados (ver src/db/schema.ts, tabela
// "sessions"), por isso o login funciona de forma consistente para
// qualquer utilizador, em qualquer instância, mesmo depois de reinícios.
const app = express();
app.use(express.json());
app.use("/api", createApiRouter());
attachJsonErrorHandling(app);

export const handler = serverless(app);
