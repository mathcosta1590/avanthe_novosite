/**
 * Triagem de assunto no formulário de orçamento.
 *
 * O formulário de orçamento é o que dispara a conversão das campanhas. Um
 * currículo enviado ali não é só ruído na caixa de entrada: o Google Ads
 * aprende com o que recebe como conversão e passa a caçar mais gente parecida.
 * Uma conversão falsa custa duas vezes.
 *
 * A página de contato abre com o formulário de orçamento direto, sem perguntar
 * antes o que a pessoa quer. Isso tira um passo de todo cliente legítimo, que é
 * a maioria, mas transfere a filtragem inteira para cá.
 *
 * COMO FUNCIONA
 *
 * Quatro sinais, avaliados sobre o texto normalizado (sem acento, minúsculo):
 *
 *   FORTE    Termo que só existe nesse contexto. Uma ocorrência basta.
 *            "curriculo", "pretensao salarial", "somos fabricantes".
 *
 *   PADRAO   Expressão que depende da ordem das palavras, não da palavra
 *            solta. É o que separa "sou pedreiro" de "preciso de pedreiro" e
 *            "tenho mao de obra" de "preciso de mao de obra". Vale como forte.
 *
 *   FRACO    Levanta suspeita mas cabe em pedido de cliente. Precisa de duas
 *            ocorrências e nenhum sinal de cliente para barrar.
 *
 *   CLIENTE  Contrapeso. A versão anterior só procurava sinal ruim, então
 *            qualquer cliente que escrevesse "tenho experiência de obra ruim"
 *            ou "sou engenheiro e quero uma segunda opinião" era barrado. Aqui
 *            dois sinais de cliente derrubam até um FORTE, e um só já cancela
 *            os FRACOS.
 *
 * O QUE FICA DE FORA DE PROPÓSITO
 *
 * orçamento, cotação, preço, material, empresa, proposta, reforma, prazo,
 * serviço, valor. Todos aparecem em pedido legítimo o tempo todo. Barrar
 * qualquer um derrubaria cliente pagante, que é o erro caro. Escapar um
 * currículo custa um e-mail; barrar um cliente custa a obra.
 */

/** Sinais de que quem escreveu é o dono do problema, não alguém se oferecendo. */
const CLIENTE = {
  termos: [
    'infiltracao', 'infiltracoes', 'vazamento', 'trinca', 'trincas', 'rachadura',
    'rachaduras', 'fissura', 'fissuras', 'mofo', 'umidade', 'gotejando',
    'habite se', 'habitese', 'alvara', 'averbacao', 'regularizar', 'regularizacao',
    'laudo', 'vistoria', 'art', 'planta', 'plantas', 'projeto arquitetonico',
    'condominio', 'sindico', 'imobiliaria', 'escritura', 'financiamento',
    'reformar', 'reforma completa', 'construir', 'ampliar', 'ampliacao',
    'demolir', 'retrofit', 'acabamento', 'marcenaria', 'pe direito',
  ],
  padroes: [
    // posse do imóvel: o sinal mais forte que existe de que a pessoa é cliente
    /\b(meu|minha|nosso|nossa|meus|minhas)\s+(apartamento|apto|ap|casa|imovel|obra|terreno|lote|sala|escritorio|loja|predio|edificio|cozinha|banheiro|sacada|varanda|quarto|telhado|fachada|galpao|sitio|chacara|sobrado|kitnet|studio|comercio|clinica|consultorio|projeto|reforma)\b/,
    // intenção declarada de contratar
    /\b(preciso|quero|queria|gostaria|pretendo|penso|estou pensando|to pensando|estou querendo|to querendo|estamos|vamos)\s+(de\s+|em\s+)?(reformar|reforma|construir|construcao|ampliar|regularizar|orcar|orcamento|contratar|refazer|trocar|reformular)\b/,
    // contratar alguém para a obra (o inverso de se oferecer)
    /\b(preciso|procuro|quero|queria|gostaria|busco|estou procurando|to procurando|contratar)\s+(de\s+)?(um\s+|uma\s+|alguem\s+)?(engenheiro|arquiteto|empresa|profissional|pedreiro|eletricista|encanador|pintor|gesseiro|equipe|mao de obra|empreiteira|construtora)\b/,
    // pergunta de preço
    /\b(quanto|qual)\s+(custa|custaria|fica|ficaria|sai|sairia|seria|e o valor|o valor|e o preco)\b/,
    // metragem informada
    /\b\d+\s*(m2|metros quadrados|metros|m)\b/,
  ],
};

export const TRIAGEM = [
  {
    alvo: '/recrutamento',
    rotulo: 'Trabalhe conosco',
    assunto: 'uma vaga de trabalho',
    forte: [
      // documento e candidatura
      'curriculo', 'curriculum', 'cv', 'candidatura', 'me candidatar', 'candidatar me',
      'candidato a vaga', 'curriculo em anexo', 'curriculo anexo',
      // vaga e processo
      'vaga', 'vagas', 'emprego', 'empregos', 'processo seletivo', 'selecao de pessoal',
      'recrutamento', 'recrutador', 'recursos humanos', 'banco de talentos',
      'estao contratando', 'esta contratando', 'estao precisando de funcionario',
      // estágio e formação
      'estagio', 'estagiario', 'estagiaria', 'estagiar', 'trainee', 'jovem aprendiz',
      // condições de trabalho
      'pretensao salarial', 'salario', 'remuneracao', 'carteira assinada', 'clt',
      'registro em carteira', 'vale transporte', 'vale alimentacao', 'periodo de experiencia',
      'regime de contratacao', 'diaria', 'diarias',
      // intenção declarada
      'procuro emprego', 'procuro trabalho', 'procuro vaga', 'busco emprego',
      'busco oportunidade', 'em busca de oportunidade', 'a procura de emprego',
      'estou desempregado', 'estou desempregada', 'preciso de um emprego',
      'trabalhar com voces', 'trabalhar na avanthe', 'trabalhar ai',
      'fazer parte da equipe', 'fazer parte do time', 'fazer parte do quadro',
      'me colocar a disposicao', 'a disposicao da empresa', 'me colocando a disposicao',
      'a disposicao para uma oportunidade',
    ],
    padroes: [
      // identidade profissional declarada em primeira pessoa
      /\b(sou|era|fui|sou o|sou a|sou um|sou uma)\s+(pedreiro|pedreira|servente|ajudante|meio oficial|eletricista|encanador|bombeiro hidraulico|pintor|pintora|gesseiro|azulejista|ladrilheiro|carpinteiro|marceneiro|soldador|armador|mestre de obras|encarregado|encarregada|auxiliar|tecnico em edificacoes|tecnica em edificacoes|engenheiro|engenheira|arquiteto|arquiteta|estagiario|estagiaria|topografo|desenhista|projetista|orcamentista|almoxarife|apontador)\b/,
      // histórico de trabalho
      /\b(trabalho|trabalhei|atuo|atuei|atuava|trabalhava)\s+(como|na area|no ramo|no setor|em obras|com obras|na construcao)\b/,
      /\b(tenho|possuo)\s+(\d+\s+)?(anos?|meses)\s+(de\s+)?(experiencia|atuacao|carreira)\b/,
      /\b(tenho|possuo|tenho muita|tenho bastante)\s+experiencia\s+(em|na|com|como)\b/,
      // desejo de ingressar
      /\b(gostaria|queria|quero|tenho interesse|teria interesse|adoraria)\s+(de\s+|em\s+)?(trabalhar|fazer parte|integrar|compor|atuar|participar da equipe)\b/,
      // pergunta por vaga
      /\b(tem|tem alguma|ha|possuem|existe|existem|abriram|abriu|estao abrindo)\s+(alguma\s+)?(vaga|vagas|oportunidade|oportunidades|contratacao)\b/,
      // envio de currículo
      /\b(envio|enviei|mando|mandei|segue|seguem|anexo|anexei|encaminho|encaminhei|estou enviando|gostaria de enviar|gostaria de mandar|posso enviar)\b[^.]{0,30}\b(curriculo|cv|curriculum)\b/,
      // mão de obra oferecida, não procurada
      /\b(tenho|possuo|disponho de|ofereco|oferecemos|disponibilizo)\s+(a\s+)?(mao de obra|equipe|equipes|pessoal|profissionais)\b/,
      // disponibilidade pessoal
      /\b(estou|to|me encontro)\s+(a\s+)?(disponivel|disposicao|procura de trabalho|procura de emprego)\b/,
    ],
    fraco: [
      'experiencia', 'experiencias', 'anos de experiencia', 'oportunidade', 'oportunidades',
      'disponibilidade', 'disponivel para inicio', 'imediato', 'curriculo atualizado',
      'qualificacao', 'certificado', 'certificados', 'nr35', 'nr 35', 'nr18', 'nr 18',
      'nr10', 'nr 10', 'curso tecnico', 'formacao', 'formado em', 'cursando',
      'pedreiro', 'servente', 'ajudante', 'meio oficial', 'mestre de obras', 'encarregado',
      'eletricista', 'encanador', 'bombeiro hidraulico', 'pintor', 'gesseiro', 'azulejista',
      'carpinteiro', 'soldador', 'armador', 'marceneiro', 'auxiliar de obra', 'operador',
      'mao de obra', 'profissional', 'profissionais', 'equipe', 'linkedin',
      'portfolio profissional', 'referencias', 'capacitado', 'habilidades',
    ],
  },
  {
    alvo: '/fornecedores',
    rotulo: 'Fornecedor parceiro',
    assunto: 'oferta de produto ou serviço',
    forte: [
      // identidade de fornecedor
      'fornecedor', 'fornecedora', 'fornecedores', 'fornecimento', 'ser fornecedor',
      'nos fornecemos', 'nossa empresa fornece', 'gostaria de fornecer',
      'representante comercial', 'representacao comercial', 'sou representante',
      'distribuidor', 'distribuidora', 'somos distribuidores', 'revendedor', 'revenda',
      'somos fabricante', 'somos fabricantes', 'fabricamos', 'industria de',
      'atacado', 'atacadista', 'homologacao de fornecedor', 'cadastro de fornecedor',
      // abordagem comercial
      'tabela de precos', 'lista de precos', 'nosso catalogo', 'envio o catalogo',
      'catalogo de produtos', 'condicoes especiais', 'parceria comercial',
      'proposta de parceria', 'apresentar nossos produtos', 'apresentar nossa empresa',
      'nossos produtos', 'nossa linha de produtos', 'trabalhamos com a linha',
      'prospeccao', 'prospectar', 'carteira de clientes', 'nossos clientes sao',
      // ofertas de serviço que chegam como spam
      'agencia de marketing', 'marketing digital', 'trafego pago', 'gestao de trafego',
      'criacao de site', 'desenvolvimento de site', 'consultoria de marketing',
      'assessoria de imprensa', 'aumentar suas vendas', 'gerar mais leads',
      'primeira pagina do google', 'otimizacao para google', 'seo', 'social media',
      'disparo de whatsapp', 'automacao de vendas', 'aumentar seu faturamento',
      'consultoria empresarial', 'credito para empresas', 'antecipacao de recebiveis',
      'maquininha de cartao', 'plano de saude empresarial', 'assessoria contabil',
    ],
    padroes: [
      // identidade da empresa que escreve
      /\b(somos|sou|represento|represento a|trabalho na|trabalho para)\s+(a\s+|uma\s+|um\s+|da\s+)?(empresa|fabrica|industria|distribuidor|distribuidora|fornecedor|fornecedora|revenda|representante|transportadora|agencia|loja de materiais|deposito)\b/,
      // ramo de atuação da empresa
      /\b(trabalhamos|atuamos|atendemos|somos especializados)\s+(com|no ramo|no segmento|na area|no mercado)\b/,
      // posse comercial
      /\b(nossa|nosso|nossos|nossas)\s+(empresa|catalogo|linha|portfolio|fabrica|industria|produto|produtos|solucao|solucoes|servico|servicos|marca|equipe comercial)\b/,
      // oferta declarada
      /\b(gostaria|queria|quero|venho|vim|entro em contato|estou entrando em contato)\s+(de\s+|para\s+)?(apresentar|oferecer|propor|ofertar|divulgar)\b/,
      /\b(oferecemos|fornecemos|fabricamos|produzimos|comercializamos|distribuimos|vendemos|locamos|alugamos)\b/,
      // proposta de parceria vinda de fora
      /\b(parceria|parceiro|parceiros)\s+(comercial|de negocios|estrategico|estrategica)\b/,
      // spam de marketing endereçado ao site do cliente
      /\b(site|instagram|google|redes sociais|trafego|anuncios)\b[^.]{0,60}\b(melhorar|aumentar|otimizar|posicionar|crescer|dobrar|alavancar|ajudar)\b/,
      /\b(melhorar|aumentar|otimizar|posicionar|dobrar|alavancar)\b[^.]{0,60}\b(site|instagram|google|redes sociais|trafego|anuncios|suas vendas|seu faturamento)\b/,
    ],
    fraco: [
      'representante', 'representacao', 'catalogo', 'distribuir', 'fabricante',
      'vendedor', 'vendas', 'comercializamos', 'locacao de equipamentos',
      'terceirizada', 'terceirizado', 'empreiteiro', 'prestador de servico',
      'parceria', 'condicoes de pagamento', 'melhor preco do mercado', 'descontos',
      'frete', 'pronta entrega', 'estoque', 'nota fiscal propria', 'cnpj',
    ],
  },
];

/** Remove acentos e pontuação, para "currículo" e "CURRÍCULO." baterem igual. */
export function normalizar(texto) {
  return ` ${(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

/** Casa termo inteiro, para "cv" não bater dentro de "cvc" ou "curriculum". */
function contem(texto, termo) {
  return texto.includes(` ${termo} `) || texto.includes(` ${termo}s `);
}

/** Quantos sinais distintos de cliente a mensagem carrega. */
export function sinaisDeCliente(texto) {
  const t = typeof texto === 'string' && texto.includes(' ') ? texto : normalizar(texto);
  const achados = CLIENTE.termos.filter((termo) => contem(t, termo));
  CLIENTE.padroes.forEach((re, i) => {
    if (re.test(t)) achados.push(`padrao-cliente-${i}`);
  });
  return achados;
}

/**
 * Classifica a mensagem.
 *
 * Devolve null quando o assunto é orçamento de obra — o caso que precisa passar
 * sempre — ou a categoria detectada junto com os sinais que a denunciaram.
 */
export function classificar(texto) {
  const t = normalizar(texto);
  const cliente = sinaisDeCliente(t);

  // Dois sinais de cliente derrubam até um FORTE. É o caso do engenheiro que
  // quer reformar o próprio apartamento e escreve "sou engenheiro".
  const blindado = cliente.length >= 2;

  for (const grupo of TRIAGEM) {
    const fortes = grupo.forte.filter((termo) => contem(t, termo));
    const padroes = grupo.padroes.filter((re) => re.test(t));
    if ((fortes.length > 0 || padroes.length > 0) && !blindado) {
      return {
        alvo: grupo.alvo,
        rotulo: grupo.rotulo,
        assunto: grupo.assunto,
        motivo: fortes.concat(padroes.map((re) => re.source.slice(0, 40))),
        nivel: 'forte',
        cliente,
      };
    }
  }

  // Um sinal de cliente já basta para cancelar os FRACOS, que são ambíguos
  // por definição.
  if (cliente.length === 0) {
    for (const grupo of TRIAGEM) {
      const fracos = grupo.fraco.filter((termo) => contem(t, termo));
      if (fracos.length >= 2) {
        return {
          alvo: grupo.alvo,
          rotulo: grupo.rotulo,
          motivo: fracos,
          nivel: 'fraco',
          cliente,
        };
      }
    }
  }

  return null;
}
