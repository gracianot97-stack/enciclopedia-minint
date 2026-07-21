import { db } from "./src/db/index.ts";
import { users, simulations, systemSettings, sessions, loginAttempts } from "./src/db/schema.ts";
import { eq, desc, and, gt, sql } from "drizzle-orm";

export function initializeDatabase() {
  return { db: null, isFirebaseActive: false };
}

// Generic Database Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface Simulation {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  correct: number;
  total: number;
  percent: number;
  timeSpent: number;
  date: string;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  invitedDeputies: string[];
}

export interface Session {
  token: string;
  userId: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: number;
  kicked: boolean;
}

// Unified Data APIs pointing to Cloud SQL
export const dbAPI = {
  isCloudMode(): boolean {
    return true;
  },

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    try {
      const results = await db.select().from(users);
      return results.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt
      }));
    } catch (error) {
      console.error("Failed to get users from Cloud SQL:", error);
      throw new Error("Erro ao obter utilizadores do banco de dados.", { cause: error });
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (results.length === 0) return null;
      const u = results[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt
      };
    } catch (error) {
      console.error(`Failed to get user by id ${id} from Cloud SQL:`, error);
      throw new Error("Erro ao obter utilizador por ID.", { cause: error });
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const results = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
      if (results.length === 0) return null;
      const u = results[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt
      };
    } catch (error) {
      console.error(`Failed to get user by email ${normalizedEmail} from Cloud SQL:`, error);
      throw new Error("Erro ao obter utilizador por email.", { cause: error });
    }
  },

  async saveUser(user: User): Promise<void> {
    const normalizedEmail = user.email.trim().toLowerCase();
    try {
      await db.insert(users)
        .values({
          id: user.id,
          name: user.name,
          email: normalizedEmail,
          passwordHash: user.passwordHash,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: user.name,
            email: normalizedEmail,
            passwordHash: user.passwordHash,
            role: user.role,
            status: user.status,
          }
        });
    } catch (error) {
      console.error("Failed to save user to Cloud SQL:", error);
      throw new Error("Erro ao salvar utilizador.", { cause: error });
    }
  },

  // --- SIMULATIONS ---
  async getSimulations(): Promise<Simulation[]> {
    try {
      const results = await db.select().from(simulations);
      return results;
    } catch (error) {
      console.error("Failed to get simulations from Cloud SQL:", error);
      throw new Error("Erro ao obter simulações.", { cause: error });
    }
  },

  async getUserSimulations(userId: string): Promise<Simulation[]> {
    try {
      const results = await db.select()
        .from(simulations)
        .where(eq(simulations.userId, userId))
        .orderBy(desc(simulations.date))
        .limit(10);
      return results;
    } catch (error) {
      console.error(`Failed to get simulations for user ${userId} from Cloud SQL:`, error);
      throw new Error("Erro ao obter simulações do utilizador.", { cause: error });
    }
  },

  async saveSimulation(simulation: Simulation): Promise<void> {
    try {
      await db.insert(simulations)
        .values({
          id: simulation.id,
          userId: simulation.userId,
          userEmail: simulation.userEmail,
          userName: simulation.userName,
          correct: simulation.correct,
          total: simulation.total,
          percent: simulation.percent,
          timeSpent: simulation.timeSpent,
          date: simulation.date
        });
    } catch (error) {
      console.error("Failed to save simulation to Cloud SQL:", error);
      throw new Error("Erro ao salvar simulação.", { cause: error });
    }
  },

  // --- SESSÕES (login persistente, rastreamento e bloqueio de contas) ---
  // Guardadas na base de dados (e não em memória) para que o login continue
  // a funcionar normalmente para todos os utilizadores mesmo que o servidor
  // reinicie, o telemóvel reinicie, ou o pedido seja tratado por outra
  // instância de função (essencial em hospedagem serverless como a Netlify).
  async createSession(session: Session): Promise<void> {
    try {
      await db.insert(sessions).values({
        token: session.token,
        userId: session.userId,
        email: session.email,
        role: session.role,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        kicked: session.kicked,
      });
    } catch (error) {
      console.error("Failed to create session in Cloud SQL:", error);
      throw new Error("Erro ao iniciar sessão no banco de dados.", { cause: error });
    }
  },

  async getSessionByToken(token: string): Promise<Session | null> {
    try {
      const results = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
      if (results.length === 0) return null;
      const s = results[0];

      // Limpeza automática: sessões expiradas são removidas ao serem encontradas
      if (Date.now() > s.expiresAt) {
        await db.delete(sessions).where(eq(sessions.token, token));
        return null;
      }

      return {
        token: s.token,
        userId: s.userId,
        email: s.email,
        role: s.role,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        kicked: s.kicked,
      };
    } catch (error) {
      console.error("Failed to get session from Cloud SQL:", error);
      throw new Error("Erro ao obter sessão do banco de dados.", { cause: error });
    }
  },

  async deleteSession(token: string): Promise<void> {
    try {
      await db.delete(sessions).where(eq(sessions.token, token));
    } catch (error) {
      console.error("Failed to delete session from Cloud SQL:", error);
      throw new Error("Erro ao terminar sessão no banco de dados.", { cause: error });
    }
  },

  async hasActiveSessionForUser(userId: string): Promise<boolean> {
    try {
      const results = await db.select()
        .from(sessions)
        .where(and(
          eq(sessions.userId, userId),
          eq(sessions.kicked, false),
          gt(sessions.expiresAt, Date.now())
        ))
        .limit(1);
      return results.length > 0;
    } catch (error) {
      console.error("Failed to check active session in Cloud SQL:", error);
      throw new Error("Erro ao verificar sessão activa do utilizador.", { cause: error });
    }
  },

  // Verifica se já existe uma sessão activa E cria a nova sessão numa única
  // transacção atómica, usando um bloqueio consultivo (advisory lock) do
  // PostgreSQL, exclusivo para este userId. Isto elimina a pequena janela de
  // corrida em que dois pedidos de login em simultâneo (ex: dois toques
  // rápidos no botão "Entrar") poderiam, em teoria, passar ambos na
  // verificação antes de qualquer sessão ser criada. Com o bloqueio, o
  // segundo pedido espera o primeiro terminar, e só depois faz a sua
  // própria verificação — garantindo sempre, no máximo, uma sessão activa
  // por conta.
  async createSessionIfNoneActive(session: Session): Promise<{ created: boolean }> {
    try {
      return await db.transaction(async (tx) => {
        // Bloqueio exclusivo por utilizador, libertado automaticamente no
        // final da transacção (commit ou rollback).
        await tx.execute(
          sql`SELECT pg_advisory_xact_lock(hashtext(${session.userId}))`
        );

        const existing = await tx.select()
          .from(sessions)
          .where(and(
            eq(sessions.userId, session.userId),
            eq(sessions.kicked, false),
            gt(sessions.expiresAt, Date.now())
          ))
          .limit(1);

        if (existing.length > 0) {
          return { created: false };
        }

        await tx.insert(sessions).values({
          token: session.token,
          userId: session.userId,
          email: session.email,
          role: session.role,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          kicked: session.kicked,
        });

        return { created: true };
      });
    } catch (error) {
      console.error("Failed to atomically create session in Cloud SQL:", error);
      throw new Error("Erro ao iniciar sessão no banco de dados.", { cause: error });
    }
  },

  async getActiveSessions(): Promise<Session[]> {
    try {
      const results = await db.select()
        .from(sessions)
        .where(and(
          eq(sessions.kicked, false),
          gt(sessions.expiresAt, Date.now())
        ))
        .orderBy(desc(sessions.createdAt));
      return results.map(s => ({
        token: s.token,
        userId: s.userId,
        email: s.email,
        role: s.role,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        kicked: s.kicked,
      }));
    } catch (error) {
      console.error("Failed to list active sessions from Cloud SQL:", error);
      throw new Error("Erro ao listar sessões activas.", { cause: error });
    }
  },

  async terminateSessionsForUser(userId: string): Promise<void> {
    try {
      await db.delete(sessions).where(eq(sessions.userId, userId));
    } catch (error) {
      console.error("Failed to terminate sessions for user in Cloud SQL:", error);
      throw new Error("Erro ao encerrar sessões do utilizador.", { cause: error });
    }
  },

  // --- PROTEÇÃO CONTRA FORÇA BRUTA NO LOGIN ---
  // Guardada na base de dados (não em memória) para funcionar de forma
  // consistente em qualquer instância serverless — a mesma razão que levou
  // as sessões de login a deixar de viver em memória.
  //
  // Regras: após MAX_FAILED_ATTEMPTS tentativas falhadas dentro de uma
  // janela de ATTEMPT_WINDOW_MS, a conta fica bloqueada durante
  // LOCKOUT_DURATION_MS. Um login bem-sucedido limpa imediatamente o
  // histórico de tentativas falhadas.

  async getLoginLockStatus(email: string): Promise<number | null> {
    try {
      const results = await db.select().from(loginAttempts).where(eq(loginAttempts.email, email)).limit(1);
      const row = results[0];
      if (row && row.lockedUntil && row.lockedUntil > Date.now()) {
        return row.lockedUntil;
      }
      return null;
    } catch (error) {
      console.error("Failed to read login attempt state from Cloud SQL:", error);
      throw new Error("Erro ao verificar tentativas de login.", { cause: error });
    }
  },

  async registerFailedLogin(email: string): Promise<{ lockedUntil: number | null }> {
    const MAX_FAILED_ATTEMPTS = 5;
    const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
    const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

    try {
      const now = Date.now();
      const results = await db.select().from(loginAttempts).where(eq(loginAttempts.email, email)).limit(1);
      const row = results[0];

      let failedCount = 1;
      if (row && row.lastFailedAt && (now - row.lastFailedAt) < ATTEMPT_WINDOW_MS) {
        failedCount = row.failedCount + 1;
      }

      const lockedUntil = failedCount >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_DURATION_MS : null;

      await db.insert(loginAttempts)
        .values({ email, failedCount, lastFailedAt: now, lockedUntil })
        .onConflictDoUpdate({
          target: loginAttempts.email,
          set: { failedCount, lastFailedAt: now, lockedUntil },
        });

      return { lockedUntil };
    } catch (error) {
      console.error("Failed to register failed login in Cloud SQL:", error);
      throw new Error("Erro ao registar tentativa de login.", { cause: error });
    }
  },

  async clearLoginAttempts(email: string): Promise<void> {
    try {
      await db.delete(loginAttempts).where(eq(loginAttempts.email, email));
    } catch (error) {
      console.error("Failed to clear login attempts in Cloud SQL:", error);
      throw new Error("Erro ao limpar tentativas de login.", { cause: error });
    }
  },

  async countCurrentlyLockedAccounts(): Promise<number> {
    try {
      const results = await db.select()
        .from(loginAttempts)
        .where(gt(loginAttempts.lockedUntil, Date.now()));
      return results.length;
    } catch (error) {
      console.error("Failed to count locked accounts in Cloud SQL:", error);
      throw new Error("Erro ao contar contas bloqueadas.", { cause: error });
    }
  },

  // --- SYSTEM SETTINGS ---
  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const results = await db.select().from(systemSettings).where(eq(systemSettings.id, "settings")).limit(1);
      if (results.length === 0) {
        const defaultSettings = {
          maintenanceMode: false,
          invitedDeputies: [] as string[]
        };
        await db.insert(systemSettings)
          .values({
            id: "settings",
            maintenanceMode: defaultSettings.maintenanceMode,
            invitedDeputies: defaultSettings.invitedDeputies
          })
          .onConflictDoNothing();
        return defaultSettings;
      }
      return {
        maintenanceMode: results[0].maintenanceMode,
        invitedDeputies: results[0].invitedDeputies
      };
    } catch (error) {
      console.error("Failed to get system settings from Cloud SQL:", error);
      throw new Error("Erro ao obter configurações do sistema.", { cause: error });
    }
  },

  async saveSystemSettings(settings: SystemSettings): Promise<void> {
    try {
      await db.insert(systemSettings)
        .values({
          id: "settings",
          maintenanceMode: settings.maintenanceMode,
          invitedDeputies: settings.invitedDeputies
        })
        .onConflictDoUpdate({
          target: systemSettings.id,
          set: {
            maintenanceMode: settings.maintenanceMode,
            invitedDeputies: settings.invitedDeputies
          }
        });
    } catch (error) {
      console.error("Failed to save system settings to Cloud SQL:", error);
      throw new Error("Erro ao salvar configurações do sistema.", { cause: error });
    }
  }
};
