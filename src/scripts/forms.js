import { classificar, sinaisDeCliente } from '../data/triagem.js';
import {
  digitos,
  validarTelefone,
  validarEmail,
  validarNome,
  validarTexto,
  rapidoDemais,
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

function validateField(field) {
  const value = (field.value || '').trim();
  const errorEl = field.parentElement?.querySelector('.field__error');
  const tipo = field.dataset.validate;
  let message = '';

  if (field.required && !value) {
    message = 'Preencha este campo.';
  } else if (value && field.type === 'email') {
    message = validarEmail(value);
  } else if (value && tipo === 'phone') {
    message = validarTelefone(value);
  } else if (value && tipo === 'name') {
    message = validarNome(value);
  } else if (value && tipo === 'contact') {
    // campo que aceita telefone OU e-mail: decide pelo arroba
    message = value.includes('@') ? validarEmail(value) : validarTelefone(value);
  } else if (value && field.tagName === 'TEXTAREA') {
    message = validarTexto(value);
  }

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
   Triagem reativa no campo de mensagem
   ------------------------------------------------------------------------- */

/**
 * Triagem por palavra-chave no campo de mensagem.
 *
 * Quando o assunto é vaga ou fornecedor, o envio é barrado e o formulário
 * correto é oferecido: assunto errado neste formulário contamina a métrica de
 * conversão das campanhas, que é o que sustenta a medição do Ads.
 *
 * O bloqueio some assim que o termo sai do texto, então quem escreveu por
 * engano corrige e envia. Não existe caminho de "continuar mesmo assim".
 */
function wireMisrouteNotice(form) {
  const field = form.querySelector('[data-misroute-source]');
  const notice = form.querySelector('[data-misroute-notice]');
  if (!field || !notice) return;

  const link = notice.querySelector('[data-misroute-link]');
  const text = notice.querySelector('[data-misroute-text]');
  const submit = form.querySelector('[type="submit"]');

  const check = () => {
    const match = classificar(field.value);
    if (match) {
      text.textContent = link
        ? `Isso parece ser sobre ${match.assunto}. Esse assunto tem formulário próprio, e por lá a resposta chega mais rápido.`
        : `Isso parece ser sobre ${match.assunto}. Este formulário é só para orçamento de obra; escreva para contato@avanthe.com.br se o assunto for outro.`;
      if (link) {
        link.setAttribute('href', match.alvo);
        link.textContent = `Ir para ${match.rotulo}`;
      }
      notice.hidden = false;
      form.dataset.misrouted = 'true';
      if (submit) submit.disabled = true;
    } else {
      notice.hidden = true;
      delete form.dataset.misrouted;
      if (submit) submit.disabled = false;
    }
  };

  /*
   * A checagem roda quando a pessoa termina de escrever — ao sair do campo e
   * ao enviar — e não a cada tecla. Validar durante a digitação faz o aviso
   * piscar no meio de uma frase que ainda não terminou, e desabilitar o botão
   * enquanto alguém escreve é hostil.
   *
   * A exceção é quando o aviso já está na tela: aí vale reavaliar a cada tecla,
   * para a pessoa ver o bloqueio sair assim que corrigir, sem precisar sair do
   * campo para descobrir.
   */
  field.addEventListener('blur', check);
  field.addEventListener('input', () => {
    if (form.dataset.misrouted === 'true') check();
  });
  form.revisarAssunto = check;
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

function showSuccess(form, data) {
  const overlay = document.querySelector(`#${form.dataset.success}`);
  if (!overlay) return;

  const whatsapp = overlay.querySelector('[data-whatsapp]');
  if (whatsapp) {
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

  try {
    const response = await fetch(form.getAttribute('action') || window.location.pathname, {
      method: 'POST',
      body: data,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    fireConversion(form);
    showSuccess(form, data);
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
    wireMisrouteNotice(form);
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
      // Preenchido rápido demais para ser gente lendo os campos. Bot não
      // recebe erro, para não aprender o que travou: some em silêncio.
      if (rapidoDemais(form.abertoEm)) return;
      if (typeof form.revisarAssunto === 'function') form.revisarAssunto();
      if (form.dataset.misrouted === 'true') {
        form.querySelector('[data-misroute-notice]')?.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
        return;
      }
      if (!validateForm(form)) return;
      submit(form);
    });
  });
}

initForms();
