/**
 * Entrada suave de blocos ao entrar na tela.
 *
 * Três garantias:
 *
 * 1. Sem JS, nada some. O estado inicial só é aplicado quando a raiz recebe
 *    data-reveal, e quem põe essa marca é este script.
 * 2. Quem pediu menos movimento no sistema não recebe animação nenhuma: a marca
 *    não é aplicada.
 * 3. Só opacidade e transform, que o navegador compõe sem recalcular layout.
 *    Nenhum deslocamento de conteúdo, nenhum custo em CLS.
 */
const querMovimento = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (querMovimento && 'IntersectionObserver' in window) {
  document.documentElement.setAttribute('data-reveal', '');

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.setAttribute('data-revealed', '');
        observador.unobserve(entrada.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
  );

  const marcar = () => {
    document.querySelectorAll('[data-reveal-item]:not([data-revealed])').forEach((el, i) => {
      // Escalona irmãos próximos, para o grupo entrar em cascata e não em bloco.
      el.style.setProperty('--reveal-delay', `${Math.min(i, 5) * 70}ms`);
      observador.observe(el);
    });
  };

  marcar();

  /**
   * Rede de segurança. Se o observador falhar por qualquer motivo, um bloco
   * ficaria invisível para sempre. Num site que recebe tráfego pago, conteúdo
   * que não aparece é dinheiro perdido, então depois de alguns segundos tudo
   * é revelado de qualquer forma.
   */
  window.setTimeout(() => {
    document.querySelectorAll('[data-reveal-item]:not([data-revealed])').forEach((el) => {
      el.setAttribute('data-revealed', '');
    });
  }, 4000);

  // O que já está visível no primeiro quadro entra de imediato, sem esperar scroll.
  requestAnimationFrame(() => {
    document.querySelectorAll('[data-reveal-item]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) el.setAttribute('data-revealed', '');
    });
  });
}
