/**
 * Entrada suave de blocos ao entrar na tela.
 *
 * Garantias:
 *
 * 1. Sem JS, nada some. O estado inicial só é aplicado quando a raiz recebe
 *    data-reveal, e quem põe essa marca é este script.
 * 2. Quem pediu menos movimento no sistema não recebe animação nenhuma.
 * 3. Só opacidade e transform, que o navegador compõe sem recalcular layout.
 *
 * Sobre o mecanismo: IntersectionObserver sozinho não basta. Numa rolagem
 * rápida o elemento pode atravessar a viewport inteira entre dois quadros e
 * nunca ser reportado, ficando invisível. Medido: seis blocos presos depois de
 * uma rolagem rápida até o fim. Por isso há também uma varredura barata no
 * scroll, que pega o que o observador deixou passar.
 */
const querMovimento = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (querMovimento && 'IntersectionObserver' in window) {
  document.documentElement.setAttribute('data-reveal', '');

  const revelar = (el) => el.setAttribute('data-revealed', '');
  const pendentes = () => document.querySelectorAll('[data-reveal-item]:not([data-revealed])');

  /** Revela tudo que já alcançou a área visível. */
  const varrer = () => {
    const limite = window.innerHeight * 0.92;
    pendentes().forEach((el) => {
      if (el.getBoundingClientRect().top < limite) revelar(el);
    });
  };

  // Primeira passada síncrona: o conteúdo acima da dobra nunca pisca em branco.
  varrer();

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          revelar(e.target);
          observador.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );

  pendentes().forEach((el, i) => {
    el.style.setProperty('--reveal-delay', `${Math.min(i, 5) * 70}ms`);
    observador.observe(el);
  });

  // Varredura no scroll, limitada a um quadro. Custa quase nada porque só
  // percorre o que ainda não foi revelado, e some quando não sobra nada.
  let agendado = false;
  const aoRolar = () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => {
      agendado = false;
      varrer();
      if (pendentes().length === 0) {
        window.removeEventListener('scroll', aoRolar);
        observador.disconnect();
      }
    });
  };
  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar, { passive: true });

  /**
   * Rede de segurança. Se tudo o mais falhar, um bloco ficaria invisível para
   * sempre. Num site com tráfego pago, conteúdo que não aparece é dinheiro
   * perdido.
   */
  window.setTimeout(() => pendentes().forEach(revelar), 2500);
}
