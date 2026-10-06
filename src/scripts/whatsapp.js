/**
 * Conversão no clique do WhatsApp.
 *
 * Com o formulário fora, o lead não passa mais por uma página de sucesso onde
 * dava para disparar o evento. O clique no botão é o último momento em que o
 * site ainda está no ar, então é nele que a conversão é contada.
 *
 * O evento só sai quando os IDs reais da conta estiverem em site.js. Enquanto
 * estiverem com XXX, o Ads sequer carrega e a função não faz nada — o push no
 * dataLayer continua, para quem quiser ler por Tag Manager.
 */
export function initWhatsapp() {
  const links = document.querySelectorAll('[data-conversao]');
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener('click', () => {
      const alvo = link.dataset.conversao;

      if (typeof window.gtag === 'function' && alvo) {
        window.gtag('event', 'conversion', { send_to: alvo });
        window.gtag('event', 'generate_lead', {
          event_category: 'whatsapp',
          event_label: link.dataset.origem || 'site',
        });
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'whatsapp_clicado',
        origem: link.dataset.origem || 'site',
      });
    });
  });
}
