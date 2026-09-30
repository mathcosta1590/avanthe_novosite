/**
 * Validação rígida e travas de spam dos formulários.
 *
 * A régua é proposital: telefone e e-mail que não existem custam mais caro que
 * um formulário a menos. Lead com telefone errado é lead perdido de qualquer
 * jeito, e ainda entra na conta de conversão do Ads como se fosse bom.
 *
 * O que NÃO é rígido: o tamanho do texto livre. Cliente sério que escreve
 * cinco palavras continua sendo cliente sério.
 */

/** DDDs que existem no Brasil. Fora desta lista, o número é digitação errada. */
const DDD = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export function digitos(valor) {
  return (valor || '').replace(/\D/g, '');
}

/**
 * Telefone brasileiro. Aceita fixo (10 dígitos) e celular (11, com 9 na
 * frente). Recusa DDD inexistente e sequência repetida, que é o que bot
 * preenche.
 */
export function validarTelefone(valor) {
  let d = digitos(valor);
  if (d.startsWith('55') && d.length > 11) d = d.slice(2);

  if (d.length < 10) return 'Informe o DDD e o número completo.';
  if (d.length > 11) return 'Número muito longo. Use DDD e número.';
  if (!DDD.has(Number(d.slice(0, 2)))) return 'Esse DDD não existe.';
  if (d.length === 11 && d[2] !== '9') return 'Celular com 9 dígitos começa com 9 depois do DDD.';
  if (d.length === 10 && d[2] === '9') return 'Celular tem 9 dígitos. Falta um número.';
  if (/^(\d)\1+$/.test(d.slice(2))) return 'Confira o número digitado.';
  return '';
}

/** Domínios digitados errado com mais frequência do que qualquer outro. */
const ERROS_DE_DOMINIO = {
  'gmail.con': 'gmail.com', 'gmail.co': 'gmail.com', 'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmail.cm': 'gmail.com',
  'hotmail.con': 'hotmail.com', 'hotmial.com': 'hotmail.com', 'hotmail.co': 'hotmail.com',
  'outlok.com': 'outlook.com', 'yaho.com': 'yahoo.com', 'uol.com': 'uol.com.br',
  'bol.com': 'bol.com.br', 'terra.com': 'terra.com.br',
};

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function validarEmail(valor) {
  const v = (valor || '').trim().toLowerCase();
  if (!EMAIL_RE.test(v)) return 'Confira o e-mail digitado.';

  const dominio = v.split('@')[1];
  if (ERROS_DE_DOMINIO[dominio]) return `Você quis dizer @${ERROS_DE_DOMINIO[dominio]}?`;
  if (dominio.includes('..') || dominio.startsWith('-')) return 'Confira o e-mail digitado.';
  return '';
}

/** Nome de gente tem sobrenome. É a trava que mais pega preenchimento de bot. */
export function validarNome(valor) {
  const v = (valor || '').trim().replace(/\s+/g, ' ');
  if (v.length < 5) return 'Escreva seu nome completo.';
  if (!v.includes(' ')) return 'Escreva nome e sobrenome.';
  if (!/^[a-zà-ÿ'\s.-]+$/i.test(v)) return 'Use apenas letras no nome.';
  if (/(.)\1{3,}/.test(v)) return 'Confira o nome digitado.';
  if (!/[aeiouà-ÿ]/i.test(v.replace(/\s/g, ''))) return 'Confira o nome digitado.';
  return '';
}

/**
 * Texto livre. Não exige tamanho, exige que seja texto: bot cola link e
 * teclado aleatório, e os dois caem aqui.
 */
export function validarTexto(valor) {
  const v = (valor || '').trim();
  if (!v) return '';
  const links = (v.match(/https?:\/\/|www\.|\.com\b|\.br\b/gi) || []).length;
  if (links >= 2) return 'Mensagem com links não é enviada por aqui.';
  if (/(.)\1{7,}/.test(v)) return 'Confira a mensagem digitada.';
  const letras = v.replace(/[^a-zà-ÿ]/gi, '');
  if (letras.length > 12 && !/[aeiouà-ÿ]/i.test(letras)) return 'Confira a mensagem digitada.';
  return '';
}

/**
 * Tempo mínimo de preenchimento.
 *
 * Humano leva pelo menos uns segundos para ler os campos e digitar. Bot
 * preenche e envia no mesmo instante. É a trava de spam mais eficaz que existe
 * sem pedir nada ao visitante — nada de captcha, nada de "clique nos
 * semáforos".
 */
export const SEGUNDOS_MINIMOS = 4;

export function rapidoDemais(abertoEm) {
  return (Date.now() - abertoEm) / 1000 < SEGUNDOS_MINIMOS;
}
