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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function digits(value) {
  return (value || '').replace(/\D/g, '');
}

function validateField(field) {
  const value = (field.value || '').trim();
  const errorEl = field.parentElement?.querySelector('.field__error');
  let message = '';

  if (field.required && !value) {
    message = 'Preencha este campo.';
  } else if (value && field.type === 'email' && !EMAIL_RE.test(value)) {
    message = 'Confira o e-mail digitado.';
  } else if (value && field.dataset.validate === 'phone' && digits(value).length < 10) {
    message = 'Informe o DDD e o número completo.';
  } else if (value && field.dataset.validate === 'contact') {
    const looksEmail = value.includes('@');
    if (looksEmail ? !EMAIL_RE.test(value) : digits(value).length < 10) {
      message = 'Informe um telefone com DDD ou um e-mail válido.';
    }
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

const MISROUTE_PATTERNS = [
  {
    target: '/recrutamento',
    label: 'Trabalhe conosco',
    words: [
      'vaga',
      'vagas',
      'emprego',
      'currículo',
      'curriculo',
      'curriculum',
      ' cv ',
      'contratação',
      'contratacao',
      'estágio',
      'estagio',
      'trabalhar com voc',
      'oportunidade de trabalho',
    ],
  },
  {
    target: '/fornecedores',
    label: 'Fornecedor parceiro',
    words: [
      'fornecedor',
      'fornecimento',
      'representante comercial',
      'representante de vendas',
      'parceria comercial',
      'catálogo de produtos',
      'catalogo de produtos',
      'tabela de preços',
      'tabela de precos',
    ],
  },
];

function detectMisroute(text) {
  const haystack = ` ${(text || '').toLowerCase()} `;
  return MISROUTE_PATTERNS.find((p) => p.words.some((w) => haystack.includes(w))) || null;
}

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
    const match = detectMisroute(field.value);
    if (match) {
      text.textContent = link
        ? `Sua mensagem é sobre ${match.label.toLowerCase()}. Esse assunto não é tratado por aqui, e tem um formulário próprio onde a resposta chega mais rápido.`
        : `Sua mensagem é sobre ${match.label.toLowerCase()}. Este formulário é só para orçamento de obra; escreva para contato@avanthe.com.br se o assunto for outro.`;
      if (link) {
        link.setAttribute('href', match.target);
        link.textContent = `Ir para ${match.label}`;
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

  field.addEventListener('input', check);
  field.addEventListener('blur', check);
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
    fillContext(form);
    wireFileInput(form);
    wireMisrouteNotice(form);

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
