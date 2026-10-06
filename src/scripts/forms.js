import { classificar, sinaisDeCliente } from '../data/triagem.js';
import {
  digitos,
  mascararTelefone,
  cursorDepoisDaMascara,
} from '../data/validacao.js';

/**
 * Comportamento compartilhado pelos formulários do site.
 *
 * Regra central do funil: o evento de conversão do Google Ads dispara
 * exclusivamente no envio bem-sucedido do formulário de orçamento
 * (data-conversion="true"), nunca no clique do WhatsApp e nunca nos
 * formulários de recrutamento e de fornecedor.
 */

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'gbraid',
  'wbraid',
];

const STORAGE_KEY = 'avanthe:campanha';

/* -------------------------------------------------------------------------
   Origem de campanha
   ------------------------------------------------------------------------- */

/**
 * Lê UTM/gclid da URL e guarda na sessão, para que a origem sobreviva à
 * navegação entre a landing e o formulário.
 */
function readCampaign() {
  let stored = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    stored = {};
  }

  const params = new URLSearchParams(window.location.search);
  const incoming = {};
  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) incoming[key] = value;
  });

  const campaign = Object.keys(incoming).length ? incoming : stored;

  if (Object.keys(incoming).length) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(incoming));
    } catch {
      /* sessionStorage indisponível: seguimos sem persistir. */
    }
  }

  return campaign;
}

function fillContext(form) {
  const campaign = readCampaign();
  const set = (name, value) => {
    const input = form.querySelector(`input[name="${name}"]`);
    if (input && value) input.value = value;
  };

  set('utm_source', campaign.utm_source);
  set('utm_medium', campaign.utm_medium);
  set('utm_campaign', campaign.utm_campaign);
  set('utm_term', campaign.utm_term);
  set('utm_content', campaign.utm_content);
  set('gclid', campaign.gclid || campaign.gbraid || campaign.wbraid);
  set('pagina_origem', window.location.pathname + window.location.search);
  set('referrer', document.referrer || 'direto');
}

/* -------------------------------------------------------------------------
   Validação
   ------------------------------------------------------------------------- */

/*
 * Só confere se o campo obrigatório foi preenchido.
 *
 * As regras rígidas saíram: exigir sobrenome, validar DDD e nono dígito,
 * conferir domínio de e-mail, limitar links. Elas barravam gente real com
 * pressa — alguém que digitou só o primeiro nome, ou um e-mail de domínio
 * próprio — e esse custo é maior que o do lead ruim, que dá para descartar
 * lendo. Quem quiser escrever errado, escreve: é problema de quem atende,
 * não de quem está tentando contratar.
 *
 * O honeypot continua, porque ele não incomoda ninguém: é um campo invisível
 * que só robô preenche.
 */
function validateField(field) {
  const value = (field.value || '').trim();
  const errorEl = field.parentElement?.querySelector('.field__error');
  const message = field.required && !value ? 'Preencha este campo.' : '';

  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (errorEl) errorEl.textContent = message;
  return !message;
}

function validateForm(form) {
  const fields = [...form.querySelectorAll('[data-validate], [required]')].filter(
    (f) => f.type !== 'file' && !f.closest('.honeypot')
  );
  let firstInvalid = null;
  fields.forEach((field) => {
    if (!validateField(field) && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    firstInvalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  return !firstInvalid;
}

/* -------------------------------------------------------------------------
   Máscara de telefone
   -------------------------------------------------------------------------

   Formata enquanto a pessoa digita, e devolve o cursor para onde ele estava.
   Sem isso, reescrever o campo joga o cursor para o fim e quem volta corrigir
   um dígito do meio digita o resto no lugar errado.

   O campo "telefone ou e-mail" só é mascarado quando o conteúdo é só número:
   quem começa a escrever um e-mail não pode ver parênteses aparecendo.
   ------------------------------------------------------------------------- */

function wirePhoneMask(form) {
  form.querySelectorAll('[data-validate="phone"], [data-validate="contact"]').forEach((field) => {
    const soTelefone = field.dataset.validate === 'phone';

    field.addEventListener('input', () => {
      const valor = field.value;
      if (!soTelefone && /[a-z@]/i.test(valor)) return;
      if (!valor) return;

      const posicao = field.selectionStart ?? valor.length;
      const digitosAntes = (valor.slice(0, posicao).match(/\d/g) || []).length;
      const formatado = mascararTelefone(valor);
      if (formatado === valor) return;

      field.value = formatado;
      const novaPos = cursorDepoisDaMascara(formatado, digitosAntes);
      field.setSelectionRange(novaPos, novaPos);
    });
  });
}

/* -------------------------------------------------------------------------
   Roteamento silencioso no envio
   -------------------------------------------------------------------------

   Antes isto era um aviso que aparecia no meio do formulário e travava o
   botão. Funcionava e era grosseiro: a pessoa escrevia, era repreendida e
   mandada embora para outra página, onde recomeçava do zero.

   Agora ninguém é barrado. A triagem roda no envio, decide para qual caixa a
   mensagem vai, e o visitante só vê que deu certo.

   O que muda conforme a decisão:

     cliente     → vai para a caixa de orçamento e dispara a conversão do Ads.
     vaga        → vai para a caixa de candidaturas, sem conversão.
     fornecedor  → vai para a caixa de fornecedores, sem conversão.

   A conversão é o motivo de tudo isto existir: o Google Ads aprende com o que
   recebe como conversão, então currículo contado ali ensina a campanha a
   procurar mais currículos.

   O que a pessoa escreveu e o que a triagem decidiu vão juntos no envio
   (assunto_detectado e assunto_motivo), para dar para auditar uma decisão
   errada em vez de descobrir meses depois que leads sumiram.
   ------------------------------------------------------------------------- */

const CAIXA = {
  '/recrutamento': 'recrutamento',
  '/fornecedores': 'fornecedores',
};

function rotear(form, dados) {
  const campo = form.querySelector('[data-misroute-source]');
  if (!campo) return null;

  const achado = classificar(campo.value);
  if (!achado) {
    dados.set('assunto_detectado', 'orcamento');
    return null;
  }

  const caixa = CAIXA[achado.alvo];
  if (!caixa) return null;

  dados.set('form-name', caixa);
  dados.set('assunto_detectado', caixa);
  dados.set('assunto_motivo', `${achado.nivel}: ${achado.motivo.slice(0, 3).join(' | ')}`);
  return achado;
}

/* -------------------------------------------------------------------------
   Triagem inversa: cliente no formulário errado
   -------------------------------------------------------------------------

   Nos formulários de vaga e de fornecedor o risco é o oposto do formulário de
   orçamento: quem se perde ali é cliente, e cliente parado na caixa de
   currículos é lead perdido sem ninguém perceber.

   Aqui o aviso SUGERE e não barra. No orçamento barrar é certo, porque o erro
   contamina a conversão do Ads. Aqui um engano meu bloquearia um fornecedor de
   verdade sem ganhar nada em troca, então a pessoa continua livre para enviar.
   ------------------------------------------------------------------------- */

function wireClienteNotice(form) {
  const field = form.querySelector('[data-cliente-source]');
  const notice = form.querySelector('[data-cliente-notice]');
  if (!field || !notice) return;

  const check = () => {
    // dois sinais de cliente e nenhum sinal do assunto desta página
    const ehCliente = sinaisDeCliente(field.value).length >= 2 && !classificar(field.value);
    notice.hidden = !ehCliente;
  };

  field.addEventListener('blur', check);
  field.addEventListener('input', () => {
    if (!notice.hidden) check();
  });
}

/* -------------------------------------------------------------------------
   Upload
   ------------------------------------------------------------------------- */

const MAX_FILE_BYTES = 8 * 1024 * 1024;

function wireFileInput(form) {
  const input = form.querySelector('input[type="file"]');
  if (!input) return;

  const trigger = form.querySelector('[data-file-trigger]');
  const nameEl = form.querySelector('[data-file-name]');
  const errorEl = input.closest('.field')?.querySelector('.field__error');

  trigger?.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) {
      if (nameEl) nameEl.textContent = 'Nenhum arquivo selecionado';
      if (errorEl) errorEl.textContent = '';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      if (errorEl) errorEl.textContent = 'Arquivo acima de 8 MB. Envie uma versão mais leve.';
      input.value = '';
      if (nameEl) nameEl.textContent = 'Nenhum arquivo selecionado';
      return;
    }
    if (errorEl) errorEl.textContent = '';
    if (nameEl) nameEl.textContent = file.name;
  });
}

/* -------------------------------------------------------------------------
   Conversão (Google Ads)
   ------------------------------------------------------------------------- */

function fireConversion(form) {
  if (form.dataset.conversion !== 'true') return;

  const sendTo = form.dataset.conversionTarget;
  if (typeof window.gtag === 'function' && sendTo && !sendTo.includes('XXX')) {
    window.gtag('event', 'conversion', { send_to: sendTo });
    window.gtag('event', 'generate_lead', {
      event_category: 'formulario',
      event_label: 'orcamento',
    });
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'orcamento_enviado' });
}

/* -------------------------------------------------------------------------
   Overlay de sucesso
   ------------------------------------------------------------------------- */

/*
 * Retorno ao visitante.
 *
 * Quem foi desviado recebe o texto da caixa para onde foi, e não o do
 * orçamento: dizer "um engenheiro vai analisar o seu projeto" para quem mandou
 * currículo é pior do que não dizer nada. E ninguém fica sem resposta.
 */
const RETORNO = {
  recrutamento: {
    titulo: 'Recebemos sua mensagem.',
    texto:
      'Ela foi para quem cuida das contratações na Avanthe. Se o perfil encaixar em alguma frente, entramos em contato.',
  },
  fornecedores: {
    titulo: 'Recebemos sua mensagem.',
    texto:
      'Ela foi para quem cuida de compras e fornecedores na Avanthe. Se fizer sentido para alguma obra, entramos em contato.',
  },
};

function showSuccess(form, data, desviado) {
  const overlay = document.querySelector(`#${form.dataset.success}`);
  if (!overlay) return;

  const destino = desviado && RETORNO[(data.get('assunto_detectado') || '').toString()];
  const tituloEl = overlay.querySelector('[data-success-titulo]');
  const textoEl = overlay.querySelector('[data-success-texto]');
  if (tituloEl && textoEl) {
    if (destino) {
      if (!tituloEl.dataset.original) {
        tituloEl.dataset.original = tituloEl.textContent;
        textoEl.dataset.original = textoEl.textContent;
      }
      tituloEl.textContent = destino.titulo;
      textoEl.textContent = destino.texto;
    } else if (tituloEl.dataset.original) {
      tituloEl.textContent = tituloEl.dataset.original;
      textoEl.textContent = textoEl.dataset.original;
    }
  }

  // Quem não é cliente não recebe o atalho do WhatsApp comercial.
  const bloco = overlay.querySelector('[data-whatsapp-bloco]');
  if (bloco) bloco.hidden = Boolean(destino);

  const whatsapp = overlay.querySelector('[data-whatsapp]');
  if (whatsapp && !destino) {
    const nome = (data.get('nome') || '').toString().trim().split(' ')[0];
    const tipo = (data.get('tipo_servico') || '').toString().trim();
    const parts = ['Olá! Acabei de enviar o formulário no site da Avanthe.'];
    if (nome) parts.push(`Meu nome é ${nome}.`);
    if (tipo) parts.push(`Meu projeto é de ${tipo.toLowerCase()}.`);
    const base = whatsapp.dataset.whatsapp;
    whatsapp.setAttribute('href', `https://wa.me/${base}?text=${encodeURIComponent(parts.join(' '))}`);
  }

  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  overlay.querySelector('[data-success-close]')?.focus();
}

function wireSuccessOverlay() {
  document.querySelectorAll('[data-success-overlay]').forEach((overlay) => {
    const close = () => {
      overlay.hidden = true;
      document.body.style.overflow = '';
    };
    overlay.querySelector('[data-success-close]')?.addEventListener('click', close);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !overlay.hidden) close();
    });
  });
}

/* -------------------------------------------------------------------------
   Envio
   ------------------------------------------------------------------------- */

async function submit(form) {
  const button = form.querySelector('[type="submit"]');
  const status = form.querySelector('[data-form-status]');
  const original = button?.textContent;

  if (button) {
    button.disabled = true;
    button.textContent = 'Enviando…';
  }
  if (status) {
    status.textContent = '';
    status.classList.remove('form__status--error');
  }

  const data = new FormData(form);
  const desviado = rotear(form, data);

  try {
    const response = await fetch(form.getAttribute('action') || window.location.pathname, {
      method: 'POST',
      body: data,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // Conversão só quando a mensagem é mesmo de obra.
    if (!desviado) fireConversion(form);
    showSuccess(form, data, desviado);
    form.reset();
    const nameEl = form.querySelector('[data-file-name]');
    if (nameEl) nameEl.textContent = 'Nenhum arquivo selecionado';
    fillContext(form);
  } catch (error) {
    if (status) {
      status.textContent =
        'Não foi possível enviar agora. Tente novamente ou escreva para contato@avanthe.com.br.';
      status.classList.add('form__status--error');
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = original;
    }
  }
}

/* -------------------------------------------------------------------------
   Inicialização
   ------------------------------------------------------------------------- */

export function initForms() {
  wireSuccessOverlay();

  document.querySelectorAll('form[data-avanthe-form]').forEach((form) => {
    form.abertoEm = Date.now();
    fillContext(form);
    wireFileInput(form);
    wirePhoneMask(form);
    wireClienteNotice(form);

    form.querySelectorAll('[data-validate], [required]').forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      // Honeypot preenchido: bot. Simulamos sucesso sem enviar nada.
      const trap = form.querySelector('.honeypot input');
      if (trap && trap.value) return;
      if (!validateForm(form)) return;
      submit(form);
    });
  });
}

initForms();
