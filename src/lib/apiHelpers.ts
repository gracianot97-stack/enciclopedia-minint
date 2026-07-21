// Lê a resposta de uma chamada à API de forma segura.
//
// Se a API devolver algo que não seja JSON válido — o que acontece quando
// a Função da Netlify não está publicada/configurada corretamente e o
// pedido "cai" na página inicial do site (HTML) — isto lança uma mensagem
// clara e compreensível, em vez do erro técnico
// "Unexpected token '<' ... is not valid JSON".
export async function parseApiResponse(res: Response): Promise<any> {
  const text = await res.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Não foi possível ligar corretamente ao servidor (a resposta recebida não é válida). " +
      "Isto normalmente acontece quando o aplicativo foi publicado sem as Funções da API " +
      "activas, ou sem as variáveis de ambiente da base de dados configuradas. " +
      "Consulte o ficheiro NETLIFY.md para corrigir a publicação."
    );
  }
}
