/**
 * Avisa na hora que um formulário chegou.
 *
 * O Netlify chama esta função sozinho a cada envio de formulário, no evento
 * `submission-created`. Nada no site precisa saber que ela existe.
 *
 * Por que isso importa mais que parece: o site promete resposta em um dia
 * útil, mas quem contrata obra pede orçamento para três ou quatro empresas na
 * mesma tarde. Quem responde primeiro conversa com um cliente ainda decidindo;
 * quem responde no dia seguinte conversa com alguém que já tem duas propostas
 * na mão.
 *
 * TRÊS CAMINHOS, todos opcionais e ligados por variável de ambiente no painel
 * do Netlify. Sem nenhuma variável preenchida a função não faz nada e não
 * quebra o envio — a mensagem continua guardada no painel do Netlify de
 * qualquer forma.
 *
 *   WHATSAPP_TOKEN + WHATSAPP_PHONE_ID + WHATSAPP_DESTINO
 *       API oficial da Meta (WhatsApp Cloud API). Exige um modelo de mensagem
 *       aprovado, cujo nome vai em WHATSAPP_TEMPLATE.
 *
 *   CALLMEBOT_PHONE + CALLMEBOT_APIKEY
 *       Atalho sem burocracia para avisar um número só. Serve para começar
 *       hoje; não é serviço de empresa e pode sair do ar.
 *
 *   WEBHOOK_URL
 *       Qualquer gancho — Make, Zapier, n8n, Slack. Recebe o lead em JSON e
 *       decide o que fazer.
 */

const ORIGEM = {
  orcamento: 'ORÇAMENTO',
  recrutamento: 'Candidatura',
  fornecedores: 'Fornecedor',
};

function montarTexto(dados, formulario) {
  const rotulo = ORIGEM[formulario] || formulario;
  const campo = (nome) => (dados[nome] || '').toString().trim();

  // Linha vazia é separador de propósito e não pode cair no filtro junto com
  // os campos ausentes, então o que não existe vira null, não string vazia.
  const se = (valor, texto) => (valor ? texto : null);
  const linhas = [
    `*${rotulo}* — avanthe.com.br`,
    '',
    se(campo('nome'), `Nome: ${campo('nome')}`),
    se(campo('empresa'), `Empresa: ${campo('empresa')}`),
    se(campo('telefone'), `Telefone: ${campo('telefone')}`),
    se(campo('email'), `E-mail: ${campo('email')}`),
    se(campo('contato'), `Contato: ${campo('contato')}`),
    se(campo('tipo_servico'), `Serviço: ${campo('tipo_servico')}`),
    se(campo('tipo_imovel'), `Imóvel: ${campo('tipo_imovel')}`),
    se(campo('categoria'), `Categoria: ${campo('categoria')}`),
    se(campo('area'), `Área de interesse: ${campo('area')}`),
    se(campo('mensagem'), `\n"${campo('mensagem')}"`),
  ].filter((l) => l !== null);

  // De onde veio o clique: é o que liga o lead à campanha que o pagou.
  const campanha = [campo('utm_source'), campo('utm_campaign')].filter(Boolean).join(' / ');
  if (campanha) linhas.push('', `Origem: ${campanha}`);
  if (campo('gclid')) linhas.push('Veio de anúncio pago.');

  return linhas.join('\n');
}

async function porWhatsAppOficial(texto) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const destino = process.env.WHATSAPP_DESTINO;
  const template = process.env.WHATSAPP_TEMPLATE;
  if (!token || !phoneId || !destino || !template) return null;

  const resposta = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: destino,
      type: 'template',
      template: {
        name: template,
        language: { code: 'pt_BR' },
        components: [{ type: 'body', parameters: [{ type: 'text', text: texto.slice(0, 1000) }] }],
      },
    }),
  });
  return `whatsapp-oficial:${resposta.status}`;
}

async function porCallmebot(texto) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return null;

  const url =
    'https://api.callmebot.com/whatsapp.php' +
    `?phone=${encodeURIComponent(phone)}` +
    `&apikey=${encodeURIComponent(apikey)}` +
    `&text=${encodeURIComponent(texto.slice(0, 900))}`;
  const resposta = await fetch(url);
  return `callmebot:${resposta.status}`;
}

async function porWebhook(payload) {
  const url = process.env.WEBHOOK_URL;
  if (!url) return null;

  const resposta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return `webhook:${resposta.status}`;
}

export default async (request) => {
  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return new Response('corpo ilegível', { status: 400 });
  }

  const envio = corpo.payload || corpo;
  const dados = envio.data || {};
  const formulario = envio.form_name || dados['form-name'] || 'desconhecido';
  const texto = montarTexto(dados, formulario);

  /*
   * Nunca falhar o envio por causa do aviso. A mensagem já está guardada no
   * Netlify quando esta função roda; se o WhatsApp estiver fora do ar, o lead
   * não pode se perder junto.
   */
  const resultados = await Promise.allSettled([
    porWhatsAppOficial(texto),
    porCallmebot(texto),
    porWebhook({ formulario, dados, texto, recebido_em: new Date().toISOString() }),
  ]);

  const enviados = resultados
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value);
  const falhas = resultados.filter((r) => r.status === 'rejected').map((r) => String(r.reason));

  // Distinguir "nenhum canal ligado" de "o canal caiu" é o que permite
  // descobrir, olhando o log, que o aviso parou de chegar.
  if (enviados.length) console.log(`aviso de lead (${formulario}): ${enviados.join(', ')}`);
  if (falhas.length) console.error(`canal de aviso falhou (${formulario}): ${falhas.join(' | ')}`);
  if (!enviados.length && !falhas.length) {
    console.log(`lead (${formulario}) recebido, nenhum canal de aviso configurado`);
  }

  return new Response('ok', { status: 200 });
};
