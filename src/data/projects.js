/**
 * Portfólio.
 *
 * `status: 'complete'` — texto validado, publicável.
 * `status: 'draft'`    — dados de obra ainda não levantados (metragem, tipo de
 *                        intervenção, prazo). O layout usa placeholder até lá.
 *
 * Imagens: enquanto a nova produção fotográfica não fica pronta, cada obra usa
 * blocos de cor sólida com legenda, em vez de banco de imagens genérico. Para
 * publicar uma foto real, preencha `gallery` com { src, alt } apontando para
 * arquivos em /public/obras/.
 */

export const projects = [
  {
    slug: 'reforma-comercial-ruffino',
    status: 'complete',
    featured: true,
    name: 'Reforma Comercial Ruffino',
    client: 'Ruffino',
    positioning:
      'Um galpão dos anos 70, décadas sem uso, virou o centro administrativo da Ruffino em sete semanas.',
    type: 'Reforma e retrofit comercial',
    facts: [
      { label: 'Área', value: '300+ m²' },
      { label: 'Intervenção', value: 'Retrofit comercial completo' },
      { label: 'Prazo', value: '7 semanas' },
      { label: 'Ocupação', value: '20+ colaboradores' },
    ],
    challenge:
      'Um galpão com mais de 30 anos, décadas sem uso, e um prazo que não deixava margem para erro. Nem tudo estava visível antes da obra abrir: o escopo real só se definiu com o diagnóstico em campo, não com um orçamento à distância.',
    body: [
      'Um galpão dos anos 70, décadas sem uso, virou o centro administrativo da Ruffino em sete semanas. Mais de 300 m² completamente refeitos: elétrica nova do zero, com troca de quadro e disjuntores; hidráulica revisada; infraestrutura de TI com cabeamento CAT6; forro modular com lã de rocha para conforto acústico; contrapiso, piso e pintura renovados por completo.',
      'O resultado é um espaço pronto para mais de 20 colaboradores trabalharem todos os dias, num prazo que não deixava margem para erro.',
    ],
    scope: [
      'Elétrica nova do zero, com troca de quadro e disjuntores',
      'Hidráulica revisada',
      'Infraestrutura de TI com cabeamento CAT6',
      'Forro modular com lã de rocha para conforto acústico',
      'Contrapiso, piso e pintura renovados por completo',
    ],
    gallery: [],
  },
  {
    slug: 'apartamento-bigorrilho',
    status: 'draft',
    featured: false,
    name: 'Apartamento Bigorrilho',
    client: null,
    positioning: null,
    type: 'Reforma residencial',
    facts: [],
    challenge: null,
    body: [],
    scope: [],
    gallery: [],
  },
  {
    slug: 'apartamento-301',
    status: 'draft',
    featured: false,
    name: 'Apartamento 301',
    client: null,
    positioning: null,
    type: 'Reforma residencial',
    facts: [],
    challenge: null,
    body: [],
    scope: [],
    gallery: [],
  },
  {
    slug: 'apartamento-centro',
    status: 'draft',
    featured: false,
    name: 'Apartamento Centro',
    client: null,
    positioning: null,
    type: 'Reforma residencial',
    facts: [],
    challenge: null,
    body: [],
    scope: [],
    gallery: [],
  },
  {
    /**
     * Assume o posto de destaque principal da home e do portfólio assim que as
     * fotos profissionais ficarem prontas e o texto for escrito: basta trocar
     * status para 'complete' e featured para true (e remover featured da Ruffino).
     */
    slug: 'the-best-coffee',
    status: 'draft',
    featured: false,
    name: 'The Best Coffee',
    client: 'The Best Coffee',
    positioning: null,
    type: 'Franquia comercial',
    facts: [],
    challenge: null,
    body: [],
    scope: [],
    gallery: [],
  },
];

export const featuredProject =
  projects.find((p) => p.featured) ?? projects.find((p) => p.status === 'complete');

export const publishedProjects = projects.filter((p) => p.status === 'complete');
