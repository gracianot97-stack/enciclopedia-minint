import bcrypt from "bcryptjs";
import crypto from "crypto";

// --- Segurança de Palavras-passe ---
//
// As contas novas passam a usar bcrypt (com "salt" único por senha), muito
// mais resistente a ataques do que o hash SHA-256 simples usado
// anteriormente. As contas já existentes, criadas antes desta atualização,
// continuam a conseguir iniciar sessão normalmente com o formato antigo —
// e são automaticamente migradas para bcrypt no momento em que fazem login
// com sucesso. Não é necessário pedir a ninguém para redefinir a senha.

const BCRYPT_SALT_ROUNDS = 10;

// Formato legado (SHA-256 sem salt), mantido apenas para permitir o login
// de contas antigas antes de serem migradas automaticamente.
function legacySha256(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function isBcryptHash(hash: string): boolean {
  return /^\$2[aby]\$/.test(hash);
}

// Cria um novo hash (sempre em bcrypt) — usado em registos novos, alteração
// de senha e redefinição de senha pelo administrador.
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS);
}

// Verifica uma senha contra o hash guardado, suportando tanto o formato
// novo (bcrypt) como o antigo (SHA-256). Devolve também "needsRehash": true
// quando a verificação foi feita com o formato antigo, para que a rota de
// login possa migrar silenciosamente essa conta para bcrypt.
export function verifyPassword(password: string, storedHash: string): { valid: boolean; needsRehash: boolean } {
  if (isBcryptHash(storedHash)) {
    return { valid: bcrypt.compareSync(password, storedHash), needsRehash: false };
  }
  const valid = legacySha256(password) === storedHash;
  return { valid, needsRehash: valid };
}
