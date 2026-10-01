# Publicação do site

## Onde o site vive

- Repositório: `mathcosta1590/avanthe_novosite`
- Branch de produção: **`main`**
- Build: `npm run build` (a Netlify lê isso do `netlify.toml`, não precisa digitar)
- Pasta publicada: `dist`

O `netlify.toml` na raiz já carrega comando de build, versão do Node,
cabeçalhos de segurança, cache dos assets e os redirects do site antigo.
Não há nada a configurar à mão no painel além do branch.

## Se o build falhar

**"unrecognized Git contributor"** — o plano gratuito da Netlify conta
contribuidores Git, e em repositório privado permite um só. Duas coisas
disparam isso: commits assinados por outra identidade, e pushes feitos por
outra identidade. O repositório é público, então o limite não se aplica;
se o erro voltar, é registro antigo da Netlify e exige um deploy novo, não
um "Retry deploy" — use **Trigger deploy → Clear cache and deploy site**.

**"git ref refs/heads/... does not exist"** — o branch de produção no painel
não bate com o que existe no GitHub. Deve ser `main`.

Em qualquer falha, confira no topo do log qual commit está sendo construído.
Se não for o último de `main`, o problema é o ref, não o código.

## Antes de apontar o domínio

O domínio `avanthe.com.br` já aponta para a Netlify e serve o site antigo.
Valide o novo na URL `*.netlify.app` antes de trocar, porque três coisas só
funcionam depois do deploy e nunca foram exercitadas de verdade:

1. **Os três formulários.** O Netlify Forms não roda localmente. Teste um
   envio de cada: cliente, fornecedor e candidatura a vaga. O de cliente deve
   disparar a conversão do Google Ads; os outros dois, não.
2. **A notificação de lead.** Depende das variáveis de ambiente descritas em
   `notificacao-de-lead.md`. Sem elas a função roda e não notifica ninguém.
3. **A medição.** Enquanto `conversionId`, `conversionLabel` e `ga4` em
   `src/data/site.js` estiverem com `XXX`, nenhum script de medição é
   emitido: nenhum lead do Ads é contabilizado e o GA4 não registra nada.

## Pendências de conteúdo

- Durações do cronograma em `src/data/services-content.js` (marcadas
  `PENDENTE DE VALIDAÇÃO`): são média de setor, não medição de obra nossa.
  Alimentam `/reforma-retrofit` e a landing `/reforma-comercial`.
- Área e prazo faltando em The Best Coffee, Apartamento 301, Apartamento
  Centro e Apartamento Mercês.
- Uma obra em andamento ainda fora do portfólio.
