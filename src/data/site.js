export const site = {
  name: 'Avanthe Engenharia',
  legalName: 'Avanthe Engenharia Ltda',
  cnpj: '64.676.692/0001-75',
  url: 'https://avanthe.com.br',
  description:
    'Construção, reforma e retrofit em Curitiba com responsabilidade técnica direta, cronograma e prazo cumprido. 8 obras entregues, 100% no prazo.',
  address: {
    street: 'Av. Visc. de Guarapuava, 4628',
    district: 'Batel',
    city: 'Curitiba',
    state: 'PR',
  },
  responsible: {
    name: 'Matheus Costa',
    title: 'Responsável técnico',
    crea: 'CREA-PR PR-234653/D',
  },
  whatsapp: {
    // Número em formato internacional, sem símbolos (usado no link wa.me).
    number: '5541984468168',
    display: '(41) 98446-8168',
  },
  instagram: 'https://www.instagram.com/avanthe.engenharia',
  tagline: 'com você, seguimos avanthe.',
  email: 'contato@avanthe.com.br',
  // ID de conversão do Google Ads. Preencher com os valores reais da conta
  // antes de publicar: o evento só dispara no envio do formulário de orçamento.
  ads: {
    conversionId: 'AW-XXXXXXXXX',
    conversionLabel: 'XXXXXXXXXXXXXXXXXX',
  },
};

export const stats = [
  { value: '8', label: 'obras entregues' },
  { value: '100%', label: 'no prazo' },
  { value: '~1.000', label: 'm² de área executada', unit: 'm²' },
  { value: '2', label: 'obras em andamento' },
];

export const nav = [
  { label: 'Sobre', href: '/sobre' },
  {
    label: 'Serviços',
    href: '/construcao-do-zero',
    children: [
      { label: 'Construção do zero', href: '/construcao-do-zero' },
      { label: 'Reformas e retrofits', href: '/reforma-retrofit' },
      { label: 'Regularização técnica', href: '/regularizacao-tecnica' },
      { label: 'Gestão de obras', href: '/gestao-de-obras' },
    ],
  },
  { label: 'Portfólio', href: '/portfolio' },
  { label: 'Contato', href: '/contato' },
];

export const footerLinks = [
  {
    title: 'Serviços',
    links: [
      { label: 'Construção do zero', href: '/construcao-do-zero' },
      { label: 'Reformas e retrofits', href: '/reforma-retrofit' },
      { label: 'Regularização técnica', href: '/regularizacao-tecnica' },
      { label: 'Gestão de obras', href: '/gestao-de-obras' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Portfólio', href: '/portfolio' },
      { label: 'Trabalhe conosco', href: '/recrutamento' },
      { label: 'Fornecedor parceiro', href: '/fornecedores' },
    ],
  },
];

export const services = [
  {
    slug: 'construcao-do-zero',
    title: 'Construção do zero',
    short:
      'Construir do zero é dar forma a um sonho: o endereço que vai abrigar uma vida inteira. Conduzimos cada projeto como parceiros, comprometidos em entregar uma obra sólida, bem pensada e sem falhas.',
    metaDescription:
      'Construção residencial e comercial em Curitiba, pensada a partir de como a obra se comporta ao longo do tempo. Rigor de execução e responsabilidade técnica direta.',
  },
  {
    slug: 'reforma-retrofit',
    title: 'Reformas e retrofits',
    short:
      'Reformar é mais exigente do que construir. Poucos admitem isso. É a experiência real que transforma o imprevisto inevitável de uma reforma em algo sob controle.',
    metaDescription:
      'Reforma e retrofit em Curitiba com diagnóstico técnico presencial, escopo definido em contrato, RT e seguro de obra emitidos antes da execução.',
  },
  {
    slug: 'regularizacao-tecnica',
    title: 'Regularização técnica',
    short:
      'Regularizar é corrigir um caminho que não foi seguido, ou que nunca existiu. Um trabalho para quem já percorreu esse caminho antes.',
    metaDescription:
      'Regularização de obra em Curitiba: transição de responsabilidade técnica, memoriais, adequação de projeto e alvará junto a SMU, Sanepar e Copel.',
  },
  {
    slug: 'gestao-de-obras',
    title: 'Gestão de obras',
    short:
      'No fim, gestão de obra é uma questão de confiança, e a confiança se constrói com transparência: fluxo financeiro visível e relatório semanal, etapa por etapa.',
    metaDescription:
      'Gestão de obras com três orçamentos por compra, pagamento mensal consolidado e relatório semanal de avanço físico previsto versus realizado.',
  },
];

export const serviceOptions = services.map((s) => s.title);
