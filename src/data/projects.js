/**
 * Portfólio.
 *
 * `status: 'complete'` — texto validado, publicável.
 * `status: 'draft'`    — dados de obra ainda não levantados (metragem, tipo de
 *                        intervenção, prazo). O layout usa placeholder até lá.
 *
 * `stage: 'andamento'` — obra em execução. Aparece no portfólio com selo, para
 *                        não vender como entregue o que ainda está em obra.
 *                        Ausente ou 'entregue' significa concluída.
 *
 * Imagens: a primeira foto de `gallery` é a capa da obra e alimenta o topo da
 * página, o card do portfólio e o destaque da home. Onde ainda não há foto,
 * entra um bloco de cor sólida com legenda, em vez de banco de imagens
 * genérico. Para publicar, aponte { src, alt } para arquivos em /public/obras/.
 */

export const projects = [
  {
    /**
     * Destaque principal do site, conforme previsto no briefing: a obra assume
     * o posto assim que as fotos profissionais ficam prontas.
     *
     * ATENÇÃO: o texto abaixo é rascunho, escrito a partir das fotos. O
     * briefing registrava que o texto desta obra ainda não havia sido escrito.
     * Precisa de validação antes de ir ao ar em produção.
     */
    slug: 'the-best-coffee',
    status: 'complete',
    featured: true,
    name: 'The Best Coffee',
    client: 'The Best Coffee',
    positioning:
      'Um ponto comercial entregue pronto para operar, da obra bruta ao balcão servindo o primeiro café.',
    type: 'Franquia comercial',
    // PENDENTE: área e prazo desta obra.
    facts: [
      { label: 'Intervenção', value: 'Reforma comercial completa' },
      { label: 'Segmento', value: 'Franquia de cafeteria' },
      { label: 'Local', value: 'Curitiba' },
      { label: 'Status', value: 'Concluída' },
    ],
    challenge:
      'Obra de franquia tem um prazo que não é só do cliente. É o aluguel que já corre, a data de inauguração anunciada e um padrão de marca que a franqueadora não negocia. O ponto precisava sair de espaço bruto para cafeteria operando, sem que nenhum desses três cedesse.',
    body: [
      'Reforma completa de ponto comercial para a franquia The Best Coffee. As instalações elétricas e hidráulicas foram dimensionadas para o uso real de uma cafeteria, com os pontos de força que máquina de café, balcão refrigerado e cozinha exigem em operação contínua.',
      'O acabamento seguiu o manual da marca: iluminação em trilho, revestimentos, marcenaria sob medida no balcão, nas mesas e nos bancos, e a comunicação visual de parede. O resultado é um ponto pronto para abrir na data combinada.',
    ],
    scope: [
      'Instalações elétricas dimensionadas para operação de cafeteria',
      'Instalações hidráulicas',
      'Forro e iluminação em trilho',
      'Revestimentos e pisos',
      'Marcenaria sob medida do balcão, mesas e bancos',
      'Comunicação visual e fachada no padrão da franquia',
    ],
    gallery: [
      { src: '/obras/the-best-coffee-01.jpg', alt: 'Salão da cafeteria com painel verde, balcão e mesas' },
      { src: '/obras/the-best-coffee-02.jpg', alt: 'Vista do salão a partir da entrada, com marcenaria sob medida' },
      { src: '/obras/the-best-coffee-03.jpg', alt: 'Área de atendimento e balcão refrigerado' },
      { src: '/obras/the-best-coffee-04.jpg', alt: 'Ambiente de mesas com comunicação visual de parede' },
      { src: '/obras/the-best-coffee-05.jpg', alt: 'Fachada da cafeteria concluída' },
    ],
  },

  {
    slug: 'reforma-comercial-ruffino',
    status: 'complete',
    featured: false,
    name: 'Comercial Ruffino',
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
    gallery: [
      { src: '/obras/ruffino-01.jpg', alt: 'Área administrativa concluída, com piso, forro modular e parede de destaque' },
      { src: '/obras/ruffino-02.jpg', alt: 'Salão administrativo aberto, com iluminação embutida e climatização' },
      { src: '/obras/ruffino-03.jpg', alt: 'Ambiente de trabalho após a reforma' },
      { src: '/obras/ruffino-04.jpg', alt: 'Sala com parede de destaque e pontos elétricos novos' },
      { src: '/obras/ruffino-05.jpg', alt: 'Bloco de sanitários executado na reforma' },
      // A confirmar: piso e forro desta foto diferem do restante do conjunto.
      { src: '/obras/ruffino-06.jpg', alt: 'Área ampla com piso cerâmico e iluminação nova' },
    ],
  },

  {
    slug: 'apartamento-301',
    status: 'complete',
    featured: false,
    name: 'Apartamento 301',
    client: null,
    positioning:
      'Um apartamento entregue no ponto de morar, com marcenaria sob medida e iluminação desenhada ambiente a ambiente.',
    type: 'Reforma residencial',
    // PENDENTE: área e prazo desta obra.
    facts: [
      { label: 'Intervenção', value: 'Reforma residencial completa' },
      { label: 'Local', value: 'Curitiba' },
      { label: 'Status', value: 'Concluída' },
    ],
    challenge:
      'Integrar sala, cozinha e varanda num só ambiente contínuo exige que marcenaria, forro e iluminação sejam pensados juntos desde o começo. Cada sanca, cada ponto de luz e cada encontro de material precisa estar resolvido em projeto, porque em acabamento desse nível o erro aparece.',
    body: [
      'Reforma residencial completa, com integração entre sala, cozinha e varanda. A obra incluiu marcenaria sob medida em todos os ambientes, forro com sanca e iluminação embutida, revestimentos e pintura geral.',
    ],
    scope: [
      'Integração entre sala, cozinha e varanda',
      'Marcenaria sob medida',
      'Forro com sanca e iluminação embutida',
      'Revestimentos e pisos',
      'Pintura geral',
    ],
    gallery: [
      { src: '/obras/apartamento-301-01.jpg', alt: 'Sala integrada à cozinha após a reforma' },
      { src: '/obras/apartamento-301-02.jpg', alt: 'Estar com iluminação embutida e marcenaria sob medida' },
      { src: '/obras/apartamento-301-03.jpg', alt: 'Cozinha com ilha e bancada' },
      { src: '/obras/apartamento-301-04.jpg', alt: 'Varanda integrada, com bancada e vista' },
    ],
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
    // PENDENTE: área e prazo desta obra.
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
    scope: [
      'Instalações elétricas atualizadas',
      'Instalações hidráulicas atualizadas',
      'Acabamentos',
      'Pintura',
    ],
    gallery: [
      { src: '/obras/apartamento-bigorrilho-01.jpg', alt: 'Ambiente integrado após a reforma, com piso novo' },
    ],
  },

  {
    slug: 'apartamento-merces',
    status: 'complete',
    stage: 'andamento',
    featured: false,
    name: 'Apartamento Mercês',
    client: null,
    positioning:
      'Um pavimento inteiro sendo refeito em Curitiba, da pintura ao piso, com a obra acompanhada semana a semana.',
    type: 'Reforma residencial',
    // PENDENTE: área e prazo desta obra.
    facts: [
      { label: 'Status', value: 'Em andamento' },
      { label: 'Local', value: 'Curitiba' },
    ],
    challenge:
      'Um pavimento amplo, de pé-direito alto e janelas corridas, refeito por inteiro: alvenaria, pintura e piso executados em sequência, com o cronograma reportado semana a semana enquanto a obra corre.',
    body: [
      'Obra em execução. As paredes já receberam pintura e o piso está sendo assentado por etapas. O registro completo, com área, prazo e escopo final, entra aqui na entrega.',
    ],
    scope: ['Alvenaria e divisórias', 'Pintura', 'Piso'],
    gallery: [
      { src: '/obras/dns-01.jpg', alt: 'Ambiente com pintura concluída e janelas corridas' },
      { src: '/obras/dns-02.jpg', alt: 'Vista do pavimento em obra' },
      { src: '/obras/dns-03.jpg', alt: 'Ambiente com parede em azul profundo' },
      { src: '/obras/dns-04.jpg', alt: 'Circulação entre os ambientes' },
      { src: '/obras/dns-05.jpg', alt: 'Piso de madeira já assentado' },
      { src: '/obras/dns-06.jpg', alt: 'Equipe da Avanthe em campo' },
    ],
  },
];

export const featuredProject =
  projects.find((p) => p.featured) ?? projects.find((p) => p.status === 'complete');

export const publishedProjects = projects.filter((p) => p.status === 'complete');
