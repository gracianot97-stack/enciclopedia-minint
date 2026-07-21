import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createApiRouter, attachJsonErrorHandling } from "./src/server/apiRoutes.ts";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Express Middleware for JSON body parsing
app.use(express.json());

// Todas as rotas da API (autenticação, sessões, administração, diagnóstico, etc.)
// vivem em src/server/apiRoutes.ts para que possam ser reutilizadas tanto por
// este servidor Node persistente (Cloud Run / npm run dev) como pela Função
// Netlify em netlify/functions/api.ts — garantindo o mesmo comportamento em
// qualquer sítio onde o aplicativo seja publicado.
app.use("/api", createApiRouter());
attachJsonErrorHandling(app);

// --- VITE DEV / PRODUCTION HANDLERS ---

async function startServer() {
  // Mount Vite development middleware in non-production environments
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
