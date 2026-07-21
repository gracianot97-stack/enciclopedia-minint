import { pgTable, text, boolean, integer, jsonb, bigint } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
});

export const simulations = pgTable("simulations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userEmail: text("user_email").notNull(),
  userName: text("user_name").notNull(),
  correct: integer("correct").notNull(),
  total: integer("total").notNull(),
  percent: integer("percent").notNull(),
  timeSpent: integer("time_spent").notNull(),
  date: text("date").notNull(),
});

// Sessões de login persistidas na base de dados.
// Isto garante que o login, o rastreamento de sessões e o bloqueio/desbloqueio
// de contas continuam a funcionar mesmo que o servidor reinicie, o telemóvel
// reinicie, ou o pedido seja atendido por uma instância de função diferente
// (essencial para hospedagem serverless, como a Netlify).
export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull(),
  createdAt: text("created_at").notNull(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  kicked: boolean("kicked").notNull().default(false),
});

export const systemSettings = pgTable("system_settings", {
  id: text("id").primaryKey(),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  invitedDeputies: jsonb("invited_deputies").$type<string[]>().notNull().default([]),
});

// Tentativas de login falhadas, por email — persistidas na base de dados
// (e não em memória) para que a proteção contra força bruta funcione de
// forma consistente em qualquer instância serverless, exatamente pela mesma
// razão que as sessões precisaram de deixar de viver em memória.
export const loginAttempts = pgTable("login_attempts", {
  email: text("email").primaryKey(),
  failedCount: integer("failed_count").notNull().default(0),
  lastFailedAt: bigint("last_failed_at", { mode: "number" }),
  lockedUntil: bigint("locked_until", { mode: "number" }),
});
