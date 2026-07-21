// Constantes partilhadas entre o frontend (React) e o backend (API/Netlify).
// Manter estes valores num único sítio evita inconsistências quando algo
// precisa de ser alterado (ex: trocar o administrador principal).

// E-mail do administrador principal (dono absoluto da plataforma).
// Esta é a única conta que pode: activar/desactivar o modo de manutenção,
// convidar/revogar administradores adjuntos, e aceder ao Diagnóstico do Sistema.
export const MAIN_ADMIN_EMAIL = "gracianot97@gmail.com";
