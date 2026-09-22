# Site da Avanthe Engenharia

Site institucional e de captação da Avanthe Engenharia, construído em
[Astro](https://astro.build): HTML estático, zero JavaScript por padrão, e o
mínimo de JS onde ele é realmente necessário (menu mobile e formulários).

## Rodar localmente

```bash
npm install
npm run dev      # servidor de desenvolvimento em http://localhost:4321
npm run build    # gera o site estático em dist/
npm run preview  # serve o build de dist/
```

Node 22 (ver `.nvmrc`).

## Estrutura

```
src/
  data/
    site.js              dados da empresa, navegação, números, IDs do Google Ads
    services-content.js  texto completo das quatro páginas de serviço
    projects.js          portfólio (obras publicadas e obras em levantamento)
  layouts/
    Base.astro           <head>, header, footer, meta tags e canonical
    ServicePage.astro    molde compartilhado das quatro páginas de serviço
  components/
    form/                formulários e suas peças compartilhadas
  scripts/forms.js       validação, captura de UTM, envio e conversão
  styles/                sistema visual (tokens, tipografia, formulários)
  pages/                 uma página por rota
```

## Páginas

| Rota | O que é |
| --- | --- |
| `/` | Home |
| `/sobre` | Sobre |
| `/construcao-do-zero` | Serviço institucional |
| `/reforma-retrofit` | Serviço institucional |
| `/regularizacao-tecnica` | Serviço institucional |
| `/gestao-de-obras` | Serviço institucional |
| `/reforma-comercial` | **Landing de campanha** (Google Ads) |
| `/portfolio` e `/portfolio/[obra]` | Portfólio |
| `/contato` | Formulário de orçamento |
| `/recrutamento` | Trabalhe conosco |
| `/fornecedores` | Fornecedor parceiro |
| `/politica-de-privacidade` | Política de privacidade |

## Antes de publicar

Três valores em `src/data/site.js` são placeholders e precisam ser
preenchidos com os dados reais da conta:

```js
whatsapp: { number: '5541999999999', display: '(41) 99999-9999' },
ads: { conversionId: 'AW-XXXXXXXXX', conversionLabel: 'XXXXXXXXXXXXXXXXXX' },
```

Enquanto `conversionId` contiver `XXX`, o gtag **não é carregado** e o evento de
conversão **não dispara** — é uma trava proposital, para não subir tag quebrada.
Preencha os dois valores e a medição passa a funcionar sozinha.

Confira também `netlify.toml`: os redirects do site antigo estão como exemplo e
devem refletir os endereços realmente indexados hoje, para não perder SEO.

## Os três formulários

São isolados entre si, cada um com nome próprio no Netlify Forms:

| Formulário | Rota | Dispara conversão? |
| --- | --- | --- |
| Orçamento | `/contato` e `/reforma-comercial` | **Sim** |
| Trabalhe conosco | `/recrutamento` | Não |
| Fornecedor parceiro | `/fornecedores` | Não |

**A regra que sustenta a medição do Google Ads:** o evento de conversão dispara
exclusivamente no envio bem-sucedido do formulário de orçamento — nunca no
clique do WhatsApp, nunca nos outros dois formulários. Misturar candidatura de
vaga ou contato de fornecedor na métrica de conversão mascara o CPA real das
campanhas. Na prática isso é o atributo `data-conversion="true"`, presente só no
formulário de orçamento, e lido por `src/scripts/forms.js`.

O CTA "Solicitar orçamento" aponta sempre para o formulário, nunca direto para o
WhatsApp: é o que filtra vaga e fornecedor do funil. O WhatsApp aparece só
**depois** do envio, no overlay de sucesso, com mensagem pré-preenchida.

Outros comportamentos já implementados:

- **Captura de origem.** UTMs e `gclid` são lidos da URL e guardados na sessão,
  então a origem sobrevive à navegação da landing até `/contato`. Vão junto no
  envio, com a página de origem e o referrer.
- **Gate de triagem** em `/contato`: antes dos campos, a pergunta "O que você
  precisa?" encaminha vaga e fornecedor para os formulários certos. Fica
  desligado na landing, onde não pode haver link de saída.
- **Aviso reativo** no campo de mensagem: palavras como "vaga" ou "fornecedor"
  mostram um aviso inline sugerindo o formulário correto. É aviso, nunca
  bloqueio — um falso positivo não pode derrubar um lead real.
- **Antispam** por honeypot, sem fricção visível.
- **Anexo** de projeto ou planta (PDF ou imagem, até 8 MB) no orçamento.

### Landing de campanha

`/reforma-comercial` segue a regra de página: sem menu, sem rodapé de navegação,
sem links para serviços ou portfólio, e a marca no topo não é link. O único
destino é o formulário de orçamento, no topo e no fim. A única exceção é o link
da política de privacidade no rodapé legal, exigido para veicular anúncios que
coletam dados. A landing também fica fora do `sitemap.xml` de propósito: ela
existe para tráfego pago, e indexá-la concorreria com `/reforma-retrofit`.

## Direção visual

- **Paleta.** Navy `#12213D` é a base (header, texto, títulos, botões).
  Quase-preto `#16151A` aparece em no máximo um ou dois momentos de contraste por
  página, nunca como cor de base. Fundo branco levemente acinzentado `#F5F5F3`.
  Não há terceira cor de acento.
- **Tipografia.** Work Sans em todo o site, auto-hospedada como fonte variável
  (`public/fonts/`, um arquivo cobre os pesos 300 a 700). A hierarquia é feita
  por peso e escala, não por troca de fonte. Negrito é usado com intenção em
  palavras-chave dentro de frases, não em frases inteiras.
- **Header** sólido e não fixo no scroll.
- **Fotografia.** As fotos de obra saem **em cor**. O briefing previa preto e
  branco para unificar material de celular com material profissional, mas em
  obra de reforma o acabamento é o argumento de venda — o tom da madeira, o
  mármore, o revestimento — e dessaturar joga fora justamente o que convence.
  Decisão revista com o cliente. Onde ainda falta foto, entra um bloco de cor
  sólida com legenda `[ foto — nome da obra ]`, em vez de banco de imagens
  genérico.

### Publicar uma foto real

Coloque o arquivo em `public/obras/` e preencha `gallery` na obra, em
`src/data/projects.js`:

```js
gallery: [{ src: '/obras/ruffino-01.jpg', alt: 'Área administrativa concluída' }],
```

## Conteúdo pendente

Estes pontos ficaram em aberto no briefing e estão marcados no código:

- **Fotos da obra "The Best Coffee"** (em produção). Quando o texto e as fotos
  ficarem prontos, a obra assume o destaque: em `src/data/projects.js`, troque
  seu `status` para `'complete'` e seu `featured` para `true`, e remova o
  `featured` da Ruffino. Home e portfólio se atualizam sozinhos.
- **Portfólio das demais obras** (SOHO, AP301). Aparecem hoje como "em
  registro", sem página própria. Preencha `facts`, `challenge`, `body` e `scope`
  e mude `status` para `'complete'` — a página individual passa a ser gerada.
- **Modelo de administração** em linguagem de benefício: ainda não escrito, e
  por decisão de briefing não entra na página Sobre. Destino provável: página
  própria ("Como trabalhamos") ou FAQ.
- ~~Foto do responsável técnico~~ — feita, em `public/equipe/`.
- **Logotipo em vetor.** O componente `src/components/Logo.astro` reproduz o
  lockup da marca ("avanthe." com o ponto, "engenharia" embaixo) desenhado em
  Work Sans. O logotipo original usa um sans geométrico, de "a" circular, então
  as letras ainda não batem. Com o arquivo vetorial em mãos, troque o
  componente por um `<svg>` inline com `fill="currentColor"`: assim ele herda a
  cor do contexto e serve fundo claro e escuro com um arquivo só, sem precisar
  de uma versão branca e outra escura. Mesma coisa para o favicon, hoje um
  desenho provisório em `public/favicon.svg`.
- **Fotos das obras já publicadas** (Ruffino e as do portfólio do site antigo),
  para substituir os blocos de cor.

## Deploy

Netlify, configurado em `netlify.toml` (build `npm run build`, publish `dist`).
Os formulários usam Netlify Forms: o build estático já contém a marcação que o
Netlify detecta, e o envio é feito por `fetch`, o que permite o overlay de
sucesso sem sair da página.
