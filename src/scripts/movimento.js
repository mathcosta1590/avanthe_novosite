/**
 * Movimento do site.
 *
 * Quatro comportamentos de site inteiro, num arquivo só porque dependem uns
 * dos outros: a rolagem amortecida muda o que o cabeçalho e os reveladores
 * enxergam como "posição da página".
 *
 * Tudo aqui é desligado por `prefers-reduced-motion` e nada é obrigatório para
 * o site funcionar: sem JavaScript, o texto aparece, o cabeçalho fica fixo e
 * os números já estão escritos no HTML.
 */

const PARADO = window.matchMedia('(prefers-reduced-motion: reduce)');
const TOQUE = window.matchMedia('(hover: none)');

/* -------------------------------------------------------------------------
   1. Rolagem amortecida
   -------------------------------------------------------------------------

   Cancela a rolagem do navegador na roda do mouse e caminha até o destino um
   pedaço por quadro. É o que dá peso à página.

   Fica fora do celular de propósito: lá a rolagem é por dedo, o sistema já tem
   a própria inércia, e substituí-la deixa a página com atraso em vez de
   suave. Teclado, barra de rolagem e âncoras continuam nativos — só a roda é
   interceptada, então quem navega por teclado não perde nada.
   ------------------------------------------------------------------------- */

function rolagemAmortecida() {
  if (PARADO.matches || TOQUE.matches) return;

  let destino = window.scrollY;
  let raf = null;
  let ativo = false;

  const limite = () =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const passo = () => {
    raf = null;
    const falta = destino - window.scrollY;
    if (Math.abs(falta) < 0.5) {
      ativo = false;
      window.scrollTo(0, destino);
      return;
    }
    window.scrollTo(0, window.scrollY + falta * 0.12);
    pedir();
  };

  const pedir = () => {
    if (raf === null) raf = requestAnimationFrame(passo);
  };

  window.addEventListener(
    'wheel',
    (e) => {
      // Ctrl+roda é zoom do navegador, não rolagem.
      if (e.ctrlKey) return;
      e.preventDefault();
      if (!ativo) {
        ativo = true;
        destino = window.scrollY;
      }
      destino = Math.max(0, Math.min(limite(), destino + e.deltaY));
      pedir();
    },
    { passive: false }
  );

  // Qualquer rolagem que não veio da roda reassume o controle.
  window.addEventListener(
    'scroll',
    () => {
      if (!ativo) destino = window.scrollY;
    },
    { passive: true }
  );
}

/* -------------------------------------------------------------------------
   2. Linhas que sobem
   -------------------------------------------------------------------------

   Troca os nós de texto por palavras embrulhadas, sem tocar nas tags que já
   existem — o <strong> do título continua de pé. A quebra de linha é lida do
   navegador depois do layout, então o efeito acompanha qualquer largura.

   Só em título: quebrar o corpo do texto em palavras atrapalha a seleção com
   o mouse e a cópia.
   ------------------------------------------------------------------------- */

function empalavrar(el) {
  const palavras = [];
  const andar = (no) => {
    [...no.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        if (!n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const w = document.createElement('span');
          w.className = 'palavra';
          const i = document.createElement('i');
          i.textContent = t;
          w.appendChild(i);
          frag.appendChild(w);
          palavras.push(w);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === Node.ELEMENT_NODE && !n.classList.contains('palavra')) {
        andar(n);
      }
    });
  };
  andar(el);
  return palavras;
}

function linhasQueSobem() {
  const alvos = [...document.querySelectorAll('[data-subir]')];
  if (!alvos.length) return;

  if (PARADO.matches) {
    alvos.forEach((el) => el.setAttribute('data-subiu', ''));
    return;
  }

  alvos.forEach((el) => {
    const palavras = empalavrar(el);
    let topo = null;
    let linha = -1;
    let naLinha = 0;
    palavras.forEach((w) => {
      const t = Math.round(w.offsetTop);
      if (t !== topo) {
        topo = t;
        linha += 1;
        naLinha = 0;
      }
      w.style.setProperty('--atraso', `${linha * 95 + naLinha * 14}ms`);
      naLinha += 1;
    });
  });

  const revelar = (el) => el.setAttribute('data-subiu', '');
  const pendentes = () => alvos.filter((el) => !el.hasAttribute('data-subiu'));

  // Primeira passada síncrona: o que já está na tela nunca fica em branco.
  const varrer = () => {
    const limite = window.innerHeight * 0.92;
    pendentes().forEach((el) => {
      if (el.getBoundingClientRect().top < limite) revelar(el);
    });
  };
  varrer();

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) return;
          revelar(e.target);
          obs.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    pendentes().forEach((el) => obs.observe(el));
  }

  // Rede de segurança: nada fica preso invisível se o observador falhar.
  window.setTimeout(() => alvos.forEach(revelar), 2500);
}

/* -------------------------------------------------------------------------
   3. Cabeçalho que se recolhe
   -------------------------------------------------------------------------

   Descendo, sai da frente e devolve a tela ao conteúdo. Subindo, volta na
   hora, porque quem sobe quer navegar. Não se esconde com o menu do celular
   aberto, nem perto do topo.
   ------------------------------------------------------------------------- */

function cabecalhoQueRecolhe() {
  const cab = document.querySelector('[data-cabecalho]');
  if (!cab || PARADO.matches) return;

  let ultimo = window.scrollY;
  let raf = null;

  const avaliar = () => {
    raf = null;
    const y = window.scrollY;
    const menuAberto = document.querySelector('[data-nav-panel]:not([hidden])');

    cab.toggleAttribute('data-compacto', y > 24);

    if (menuAberto) {
      cab.removeAttribute('data-oculto');
    } else if (y > cab.offsetHeight * 1.8 && y > ultimo + 4) {
      cab.setAttribute('data-oculto', '');
    } else if (y < ultimo - 4 || y <= 24) {
      cab.removeAttribute('data-oculto');
    }
    ultimo = y;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (raf === null) raf = requestAnimationFrame(avaliar);
    },
    { passive: true }
  );
  avaliar();
}

/* -------------------------------------------------------------------------
   4. Contagem até o número
   -------------------------------------------------------------------------

   Desacelera no fim, em vez de correr parelho: o número chega e assenta. Os
   dígitos usam largura fixa no CSS, então nada treme enquanto sobe.

   O valor final está escrito no HTML e é lido daqui, não duplicado: sem
   JavaScript, o número correto já está na tela.
   ------------------------------------------------------------------------- */

function contarNumeros() {
  const alvos = [...document.querySelectorAll('[data-contar]')];
  if (!alvos.length || PARADO.matches) return;

  const correr = (el, atraso) => {
    const final = el.textContent.trim();
    const casa = final.match(/[\d.,]+/);
    if (!casa) return;

    const bruto = casa[0].replace(/\./g, '').replace(',', '.');
    const alvo = parseFloat(bruto);
    if (!Number.isFinite(alvo)) return;

    const antes = final.slice(0, casa.index);
    const depois = final.slice(casa.index + casa[0].length);
    const escrever = (v) => {
      el.textContent = antes + Math.round(v).toLocaleString('pt-BR') + depois;
    };

    let inicio = null;
    escrever(0);
    const passo = (agora) => {
      if (inicio === null) inicio = agora;
      const t = (agora - inicio - atraso) / 1300;
      if (t < 0) {
        requestAnimationFrame(passo);
        return;
      }
      if (t >= 1) {
        el.textContent = final;
        return;
      }
      escrever(alvo * (1 - Math.pow(2, -10 * t)));
      requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  const disparar = (faixa) => {
    [...faixa.querySelectorAll('[data-contar]')].forEach((el, i) => correr(el, i * 110));
  };

  const faixas = [...new Set(alvos.map((el) => el.closest('[data-contagem]') || el.parentElement))];

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) return;
          disparar(e.target);
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.35 }
    );
    faixas.forEach((f) => obs.observe(f));
  } else {
    faixas.forEach(disparar);
  }
}

export function initMovimento() {
  rolagemAmortecida();
  linhasQueSobem();
  cabecalhoQueRecolhe();
  contarNumeros();
}
