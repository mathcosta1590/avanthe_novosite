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
    status: 'complete',
    featured: false,
    name: 'Apartamento Bigorrilho',
    client: null,
    positioning:
      'Reforma residencial completa em 60 m², com as instalações elétricas e hidráulicas refeitas, em um mês.',
    type: 'Reforma residencial',
    facts: [
      { label: 'Área', value: '60 m²' },
      { label: 'Intervenção', value: 'Reforma residencial completa' },
      { label: 'Prazo', value: '1 mês' },
      { label: 'Local', value: 'Bigorrilho, Curitiba' },
    ],
    challenge:
      'Um apartamento que pedia mais do que acabamento novo: as instalações elétricas e hidráulicas precisavam ser atualizadas por baixo do que se via, sem estender a obra além do mês combinado.',
    body: [
      'Reforma residencial completa em 60 m², com pintura, acabamentos e atualização das instalações elétricas e hidráulicas. A obra foi entregue em um mês, no prazo combinado.',
    ],
    scope: ['Instalações elétricas atualizadas', 'Instalações hidráulicas atualizadas', 'Acabamentos', 'Pintura'],
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
    status: 'complete',
    featured: false,
    name: 'Apartamento Centro',
    client: null,
    positioning:
      'Um apartamento no centro de Curitiba entregue pronto para morar, do piso à marcenaria.',
    type: 'Reforma residencial',
    // PENDENTE: área e prazo desta obra ainda não foram levantados. Assim que
    // vierem, entram aqui e aparecem na página.
    facts: [
      { label: 'Intervenção', value: 'Reforma residencial completa' },
      { label: 'Local', value: 'Centro, Curitiba' },
      { label: 'Status', value: 'Concluída' },
    ],
    challenge:
      'Um apartamento compacto, onde cada ambiente precisava ser resolvido por inteiro: piso, iluminação, revestimento e marcenaria entregues em conjunto, sem sobra de acabamento pela metade.',
    body: [
      'Reforma residencial completa em apartamento no centro de Curitiba. Sala, dormitório e banheiro refeitos, com piso novo em toda a área, iluminação embutida, revestimento de parede no banheiro e marcenaria sob medida.',
    ],
    scope: [
      'Piso novo em toda a área',
      'Iluminação embutida e sanca',
      'Revestimento de parede no banheiro',
      'Marcenaria sob medida',
      'Pintura geral',
    ],
    gallery: [
      { src: '/obras/apartamento-centro-01.jpg', alt: 'Sala do apartamento após a reforma' },
      { src: '/obras/apartamento-centro-02.jpg', alt: 'Dormitório com piso e iluminação novos' },
      { src: '/obras/apartamento-centro-03.jpg', alt: 'Banheiro com revestimento e nichos' },
      { src: '/obras/apartamento-centro-04.jpg', alt: 'Sala em outro ângulo, com a marcenaria' },
    ],
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
