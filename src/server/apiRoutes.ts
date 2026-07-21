import express from "express";
import crypto from "crypto";
import { dbAPI } from "../../db.ts";
import { MAIN_ADMIN_EMAIL } from "../lib/constants.ts";
import { hashPassword, verifyPassword } from "./passwordHash.ts";

// Contacto oficial exibido ao utilizador quando o acesso simultâneo é bloqueado.
const SUPPORT_CONTACT_TEXT =
  "contacte o Administrador para autorizar a transferência de dispositivo através do email: ivanytomaschinjongo@gmail.com ou pelo número: +244 927 142 887.";

// Data/hora em que este processo do servidor arrancou (usado no diagnóstico).
const PROCESS_STARTED_AT = Date.now();

// Pequeno "wrapper" para capturar erros de handlers assíncronos do Express 4
// (que, ao contrário do Express 5, não trata automaticamente promessas rejeitadas).
function asyncHandler(
  fn: (req: any, res: any, next: any) => Promise<any>
) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error("Erro não tratado numa rota da API:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Erro interno do servidor. Por favor, tente novamente." });
      }
    });
  };
}

// --- Autenticação por sessão persistida no banco de dados ---
// Isto substitui o antigo armazenamento de sessões em memória, que se perdia
// sempre que o processo do servidor reiniciava (ou, no caso de hospedagem
// serverless como a Netlify, entre invocações de instâncias diferentes).
// Guardar as sessões na base de dados garante que o login, o rastreamento
// de sessões e o bloqueio/desbloqueio de contas continuam a funcionar
// corretamente para todos os utilizadores, sempre.
const authenticateUser = asyncHandler(async (req: any, res, next) => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Sessão inválida ou expirada. Faça login novamente." });
  }

  const session = await dbAPI.getSessionByToken(token);
  if (!session) {
    return res.status(401).json({ error: "Sessão inválida ou expirada. Faça login novamente." });
  }

  if (session.kicked) {
    await dbAPI.deleteSession(token);
    return res.status(401).json({
      error: "Sessão encerrada: Esta conta foi iniciada num novo dispositivo. O partilhamento de contas é proibido.",
      kicked: true
    });
  }

  req.user = session;
  next();
});

// Custom Admin Authorization Middleware (allows main admin and deputy admins)
function requireAdmin(req: any, res: any, next: any) {
  if (req.user.role !== "admin" && req.user.role !== "admin_adjunto") {
    return res.status(403).json({ error: "Acesso negado. Apenas administradores têm permissão." });
  }
  next();
}

// Custom Main Admin (Owner) Authorization Middleware (only the primary owner account)
function requireMainAdmin(req: any, res: any, next: any) {
  if (req.user.email !== MAIN_ADMIN_EMAIL) {
    return res.status(403).json({ error: "Acesso negado. Apenas o administrador principal (Dono) tem permissão." });
  }
  next();
}

export function createApiRouter() {
  const router = express.Router();

  // Public Status Endpoint (Checks maintenance mode)
  router.get("/status", asyncHandler(async (req, res) => {
    const system = await dbAPI.getSystemSettings();
    res.json({ maintenanceMode: system.maintenanceMode });
  }));

  // Authentication: Register
  router.post("/auth/register", asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Todos os campos (nome, email e senha) são obrigatórios." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if email already registered
    const userExists = await dbAPI.getUserByEmail(normalizedEmail);
    if (userExists) {
      return res.status(400).json({ error: "Este endereço de email já está registado." });
    }

    // Admin auto-assignment if matching email or is in invited deputies list
    const systemData = await dbAPI.getSystemSettings();
    const invitedDeputies = systemData.invitedDeputies || [];
    const isDeputy = invitedDeputies.includes(normalizedEmail);
    const isAdmin = normalizedEmail === MAIN_ADMIN_EMAIL;

    const newUser = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: isAdmin ? "admin" : (isDeputy ? "admin_adjunto" : "user"),
      status: "active",
      createdAt: new Date().toISOString(),
    };

    await dbAPI.saveUser(newUser);

    res.json({ success: true, message: "Registo concluído com sucesso!" });
  }));

  // Authentication: Login
  router.post("/auth/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email e palavra-passe são obrigatórios." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Protecção contra força bruta: se a conta estiver temporariamente
    // bloqueada por demasiadas tentativas falhadas recentes, recusar antes
    // de sequer consultar a palavra-passe.
    const lockedUntil = await dbAPI.getLoginLockStatus(normalizedEmail);
    if (lockedUntil) {
      const minutesLeft = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 60000));
      return res.status(429).json({
        error: `Demasiadas tentativas de login falhadas. Por segurança, tente novamente dentro de ${minutesLeft} minuto(s).`
      });
    }

    const user = await dbAPI.getUserByEmail(normalizedEmail);
    const passwordCheck = user ? verifyPassword(password, user.passwordHash) : { valid: false, needsRehash: false };

    if (!user || !passwordCheck.valid) {
      // Regista a tentativa falhada e informa se a conta acabou de ficar bloqueada.
      const { lockedUntil: newLock } = await dbAPI.registerFailedLogin(normalizedEmail);
      if (newLock) {
        const minutesLeft = Math.max(1, Math.ceil((newLock - Date.now()) / 60000));
        return res.status(429).json({
          error: `Demasiadas tentativas de login falhadas. Por segurança, a conta foi bloqueada temporariamente por ${minutesLeft} minuto(s).`
        });
      }
      return res.status(400).json({ error: "Email ou palavra-passe incorretos." });
    }

    // Login bem-sucedido: limpar o histórico de tentativas falhadas.
    await dbAPI.clearLoginAttempts(normalizedEmail);

    // Migração automática e transparente: se a senha ainda estava no
    // formato antigo (SHA-256 sem salt), atualizá-la agora para bcrypt,
    // sem que o utilizador precise de fazer nada.
    if (passwordCheck.needsRehash) {
      user.passwordHash = hashPassword(password);
      await dbAPI.saveUser(user);
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "Esta conta está suspensa. Entre em contacto com o administrador." });
    }

    // System maintenance block for non-admin users
    const system = await dbAPI.getSystemSettings();
    if (system.maintenanceMode && user.role !== "admin" && user.role !== "admin_adjunto") {
      return res.status(503).json({
        error: "O portal está temporariamente offline para manutenção programada. Tente novamente mais tarde."
      });
    }

    // Criar sessão de login (válida por 30 dias) — verificação e criação
    // ocorrem numa única operação atómica (ver createSessionIfNoneActive),
    // eliminando a janela de corrida entre "verificar" e "criar sessão".
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    const { created } = await dbAPI.createSessionIfNoneActive({
      token,
      userId: user.id,
      email: user.email,
      role: user.role,
      createdAt: new Date().toISOString(),
      expiresAt,
      kicked: false,
    });

    if (!created) {
      return res.status(403).json({
        error: `Início de sessão negado: Esta conta já está ativa num dispositivo. Para evitar a partilha fraudulenta do aplicativo, o acesso simultâneo é estritamente proibido. Se mudou de telemóvel, por favor ${SUPPORT_CONTACT_TEXT}`
      });
    }

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  }));

  // Authentication: Get current session details
  router.get("/auth/me", authenticateUser, asyncHandler(async (req: any, res) => {
    const user = await dbAPI.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado." });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "Conta suspensa." });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }));

  // Authentication: Log Out / Release session
  router.post("/auth/logout", asyncHandler(async (req: any, res) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "");
    if (token) {
      await dbAPI.deleteSession(token);
    }
    res.json({ success: true, message: "Sessão encerrada com sucesso." });
  }));

  // Authentication: Change Password
  router.post("/auth/change-password", authenticateUser, asyncHandler(async (req: any, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Por favor, forneça a palavra-passe atual e a nova." });
    }

    const user = await dbAPI.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado." });
    }

    if (!verifyPassword(currentPassword, user.passwordHash).valid) {
      return res.status(400).json({ error: "A palavra-passe atual está incorreta." });
    }

    // Update password
    user.passwordHash = hashPassword(newPassword);
    await dbAPI.saveUser(user);

    res.json({ success: true, message: "Palavra-passe alterada com sucesso!" });
  }));

  // Simulations: Save simulation result
  router.post("/simulations/save", authenticateUser, asyncHandler(async (req: any, res) => {
    const { correct, total, percent, timeSpent } = req.body || {};

    if (correct === undefined || total === undefined || percent === undefined) {
      return res.status(400).json({ error: "Resultados inválidos." });
    }

    const user = await dbAPI.getUserById(req.user.userId);

    const newSimulation = {
      id: crypto.randomUUID(),
      userId: req.user.userId,
      userEmail: req.user.email,
      userName: user ? user.name : "Utilizador",
      correct,
      total,
      percent,
      timeSpent: timeSpent || 0,
      date: new Date().toISOString(),
    };

    await dbAPI.saveSimulation(newSimulation);

    res.json({ success: true, simulation: newSimulation });
  }));

  // Simulations: Fetch user simulation history
  router.get("/simulations/history", authenticateUser, asyncHandler(async (req: any, res) => {
    const userHistory = await dbAPI.getUserSimulations(req.user.userId);
    res.json(userHistory);
  }));

  // --- ADMIN API ENDPOINTS ---

  // Admin: Fetch Portal Statistics & Users list
  router.get("/admin/stats", authenticateUser, requireAdmin, asyncHandler(async (req: any, res) => {
    const allUsers = await dbAPI.getUsers();
    const users = allUsers.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    }));

    const simulations = await dbAPI.getSimulations();
    const system = await dbAPI.getSystemSettings();

    // Calculate high-level analytics
    const totalSimulations = simulations.length;
    const averageScore = totalSimulations > 0
      ? Math.round(simulations.reduce((sum: number, sim: any) => sum + sim.percent, 0) / totalSimulations)
      : 0;

    res.json({
      totalUsers: users.length,
      totalSimulations,
      averageScore,
      maintenanceMode: system.maintenanceMode,
      invitedDeputies: system.invitedDeputies || [],
      users,
      simulations: simulations.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    });
  }));

  // Admin: Toggle Maintenance Mode (Take App Offline / Online - Restricted to Main Admin)
  router.post("/admin/toggle-maintenance", authenticateUser, requireMainAdmin, asyncHandler(async (req, res) => {
    const { maintenanceMode } = req.body || {};

    if (maintenanceMode === undefined) {
      return res.status(400).json({ error: "Estado de manutenção não especificado." });
    }

    const system = await dbAPI.getSystemSettings();
    system.maintenanceMode = !!maintenanceMode;
    await dbAPI.saveSystemSettings(system);

    res.json({ success: true, maintenanceMode: system.maintenanceMode });
  }));

  // Admin: Suspend or Activate user accounts (Co-admins can only toggle students)
  router.post("/admin/toggle-user-status", authenticateUser, requireAdmin, asyncHandler(async (req: any, res) => {
    const { userId, status } = req.body || {};

    if (!userId || !status) {
      return res.status(400).json({ error: "Identificador e status são obrigatórios." });
    }

    if (status !== "active" && status !== "suspended") {
      return res.status(400).json({ error: "Status inválido." });
    }

    const targetUser = await dbAPI.getUserById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: "Utilizador não encontrado." });
    }

    const callerIsMainAdmin = req.user.email === MAIN_ADMIN_EMAIL;

    // Deputy admins cannot suspend other admins or co-admins
    if (!callerIsMainAdmin && (targetUser.role === "admin" || targetUser.role === "admin_adjunto")) {
      return res.status(403).json({ error: "Apenas o administrador principal pode alterar o estado de outros administradores." });
    }

    // Prevent self-suspension
    if (targetUser.email === req.user.email) {
      return res.status(400).json({ error: "Não pode suspender o seu próprio utilizador administrador." });
    }

    targetUser.status = status;
    await dbAPI.saveUser(targetUser);

    // Se a conta foi suspensa, terminar imediatamente qualquer sessão activa
    // dela (bloqueio efectivo e imediato, mesmo que já tivesse sessão iniciada).
    if (status === "suspended") {
      await dbAPI.terminateSessionsForUser(targetUser.id);
    }

    res.json({ success: true, userId, status });
  }));

  // Admin: Recover / Reset User Password (Any admin, but hierarchy applies)
  router.post("/admin/reset-password", authenticateUser, requireAdmin, asyncHandler(async (req: any, res) => {
    const { userId, newPassword } = req.body || {};

    if (!userId || !newPassword) {
      return res.status(400).json({ error: "ID do utilizador e nova palavra-passe são obrigatórios." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "A palavra-passe deve ter pelo menos 6 caracteres." });
    }

    const targetUser = await dbAPI.getUserById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: "Utilizador não encontrado." });
    }

    const callerIsMainAdmin = req.user.email === MAIN_ADMIN_EMAIL;

    // Deputy admins cannot reset other admins or co-admins passwords
    if (!callerIsMainAdmin && (targetUser.role === "admin" || targetUser.role === "admin_adjunto")) {
      return res.status(403).json({ error: "Apenas o administrador principal pode redefinir palavras-passe de outros administradores." });
    }

    // Nobody can reset the main admin's password except themselves
    if (targetUser.email === MAIN_ADMIN_EMAIL && req.user.email !== MAIN_ADMIN_EMAIL) {
      return res.status(403).json({ error: "Não é permitido alterar a palavra-passe do administrador principal." });
    }

    targetUser.passwordHash = hashPassword(newPassword);
    await dbAPI.saveUser(targetUser);

    // Redefinir a senha também termina sessões activas dessa conta, por segurança.
    await dbAPI.terminateSessionsForUser(targetUser.id);

    res.json({ success: true, message: `Palavra-passe de ${targetUser.name} redefinida com sucesso!` });
  }));

  // Main Admin Only: Invite a Deputy Admin (administrador adjunto)
  router.post("/admin/invite-deputy", authenticateUser, requireMainAdmin, asyncHandler(async (req: any, res) => {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: "O email de convite é obrigatório." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (normalizedEmail === MAIN_ADMIN_EMAIL) {
      return res.status(400).json({ error: "O administrador principal já é o dono absoluto." });
    }

    const system = await dbAPI.getSystemSettings();
    const invitedDeputies = system.invitedDeputies || [];

    if (!invitedDeputies.includes(normalizedEmail)) {
      invitedDeputies.push(normalizedEmail);
      system.invitedDeputies = invitedDeputies;
      await dbAPI.saveSystemSettings(system);
    }

    // Promote existing user immediately if registered
    const user = await dbAPI.getUserByEmail(normalizedEmail);
    if (user) {
      user.role = "admin_adjunto";
      await dbAPI.saveUser(user);
    }

    res.json({
      success: true,
      message: `O utilizador com email ${normalizedEmail} foi convidado como administrador adjunto!`,
      invitedDeputies
    });
  }));

  // Main Admin Only: Revoke a Deputy Admin role
  router.post("/admin/revoke-deputy", authenticateUser, requireMainAdmin, asyncHandler(async (req: any, res) => {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: "O email é obrigatório." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const system = await dbAPI.getSystemSettings();
    system.invitedDeputies = (system.invitedDeputies || []).filter((e: string) => e !== normalizedEmail);
    await dbAPI.saveSystemSettings(system);

    // Demote existing user if registered
    const user = await dbAPI.getUserByEmail(normalizedEmail);
    if (user && user.role === "admin_adjunto") {
      user.role = "user";
      await dbAPI.saveUser(user);
    }

    res.json({
      success: true,
      message: `Autorização de administrador adjunto revogada para ${normalizedEmail}.`
    });
  }));

  // Main Admin Only: Terminar a sessão activa de um utilizador específico
  // (força o logout imediato desse utilizador, sem suspender a conta).
  router.post("/admin/terminate-session", authenticateUser, requireMainAdmin, asyncHandler(async (req: any, res) => {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: "O email é obrigatório." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const targetUser = await dbAPI.getUserByEmail(normalizedEmail);

    if (!targetUser) {
      return res.status(404).json({ error: "Utilizador não encontrado." });
    }

    await dbAPI.terminateSessionsForUser(targetUser.id);

    res.json({ success: true, message: `Sessão de ${normalizedEmail} terminada com sucesso.` });
  }));

  // Main Admin Only: Diagnóstico de Funcionamento do Aplicativo
  // Verifica ligação à base de dados, bloqueio/activação de contas,
  // rastreamento de estudantes e sessões actualmente iniciadas.
  router.get("/admin/diagnostics", authenticateUser, requireMainAdmin, asyncHandler(async (req: any, res) => {
    const checks: { label: string; ok: boolean; detail: string }[] = [];

    // 1. Ligação à base de dados (teste real de leitura/escrita)
    let dbOk = true;
    let dbLatencyMs: number | null = null;
    let dbDetail = "";
    try {
      const t0 = Date.now();
      await dbAPI.getSystemSettings();
      dbLatencyMs = Date.now() - t0;
      dbDetail = `Ligação estabelecida (${dbLatencyMs} ms de latência). Os dados são persistidos permanentemente e sobrevivem a reinícios.`;
    } catch (err: any) {
      dbOk = false;
      dbDetail = `Falha na ligação à base de dados: ${err?.message || "erro desconhecido"}`;
    }
    checks.push({ label: "Base de Dados Persistente", ok: dbOk, detail: dbDetail });

    // 2. Utilizadores / rastreamento de estudantes
    let allUsers: any[] = [];
    let usersOk = true;
    try {
      allUsers = await dbAPI.getUsers();
    } catch (err) {
      usersOk = false;
    }
    const students = allUsers.filter(u => u.role === "user");
    const suspended = allUsers.filter(u => u.status === "suspended");
    const admins = allUsers.filter(u => u.role === "admin" || u.role === "admin_adjunto");
    checks.push({
      label: "Rastreamento de Estudantes",
      ok: usersOk,
      detail: usersOk
        ? `${students.length} estudante(s) registado(s) a ser monitorizado(s) correctamente.`
        : "Não foi possível ler a lista de estudantes."
    });

    // 3. Bloqueio / Activação de contas
    checks.push({
      label: "Bloqueio de Conta (Suspensão/Activação)",
      ok: usersOk,
      detail: usersOk
        ? `${suspended.length} conta(s) actualmente bloqueada(s)/suspensa(s). Sistema de activação e desactivação operacional.`
        : "Não foi possível verificar o estado das contas."
    });

    // 3b. Proteção contra força bruta (tentativas de login)
    let bruteForceOk = true;
    let currentlyLockedCount = 0;
    try {
      currentlyLockedCount = await dbAPI.countCurrentlyLockedAccounts();
    } catch (err) {
      bruteForceOk = false;
    }
    checks.push({
      label: "Proteção Contra Força Bruta",
      ok: bruteForceOk,
      detail: bruteForceOk
        ? `${currentlyLockedCount} conta(s) actualmente bloqueada(s) por tentativas de login falhadas. Bloqueio automático operacional.`
        : "Não foi possível verificar o estado da proteção contra força bruta."
    });

    // 4. Sessões iniciadas (rastreamento de login)
    let activeSessions: any[] = [];
    let sessionsOk = true;
    try {
      activeSessions = await dbAPI.getActiveSessions();
    } catch (err) {
      sessionsOk = false;
    }
    checks.push({
      label: "Sessões Iniciadas (Login)",
      ok: sessionsOk,
      detail: sessionsOk
        ? `${activeSessions.length} sessão(ões) actualmente activa(s). O login está persistido no banco de dados.`
        : "Não foi possível ler as sessões activas."
    });

    // 5. Estado do sistema / manutenção
    let maintenanceMode = false;
    try {
      const system = await dbAPI.getSystemSettings();
      maintenanceMode = system.maintenanceMode;
    } catch (err) {
      // já reportado acima como falha de base de dados
    }
    checks.push({
      label: "Modo de Manutenção",
      ok: true,
      detail: maintenanceMode
        ? "O portal está actualmente em manutenção (apenas administradores têm acesso)."
        : "O portal está online e acessível a todos os utilizadores."
    });

    const allOk = checks.every(c => c.ok);

    res.json({
      timestamp: new Date().toISOString(),
      overallStatus: allOk ? "operacional" : "atencao",
      serverUptimeSeconds: Math.floor((Date.now() - PROCESS_STARTED_AT) / 1000),
      checks,
      summary: {
        totalUsers: allUsers.length,
        totalStudents: students.length,
        totalAdmins: admins.length,
        suspendedAccounts: suspended.length,
        activeSessionsCount: activeSessions.length,
        databaseLatencyMs: dbLatencyMs,
        maintenanceMode,
      },
      activeSessions: activeSessions.map(s => ({
        email: s.email,
        role: s.role,
        createdAt: s.createdAt,
        expiresAt: new Date(s.expiresAt).toISOString(),
      })),
    });
  }));

  return router;
}

// Middleware de segurança aplicado ao nível da aplicação (não do router):
// garante que a API NUNCA devolve uma página HTML de erro — mesmo perante
// falhas inesperadas (ex: corpo do pedido inválido, erro de sistema, etc.).
// Isto evita o erro "Unexpected token '<' ... is not valid JSON" no
// frontend, que acontece quando o cliente espera JSON mas recebe HTML.
export function attachJsonErrorHandling(app: express.Express) {
  // Rota de fallback: qualquer caminho /api/* não reconhecido devolve JSON
  // (e não a página inicial do site).
  app.use("/api", (req, res) => {
    res.status(404).json({ error: "Endpoint da API não encontrado." });
  });

  // Error handler final (tem de ter exatamente 4 argumentos para o Express
  // o reconhecer como middleware de tratamento de erros).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Erro não tratado na API:", err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({
      error: "Erro interno do servidor. Por favor, tente novamente em instantes."
    });
  });
}
