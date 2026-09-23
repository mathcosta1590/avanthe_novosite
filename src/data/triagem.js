/**
 * Triagem de assunto no formulário de orçamento.
 *
 * O formulário de orçamento alimenta a métrica de conversão das campanhas.
 * Currículo e oferta de fornecedor entrando ali contaminam o CPA, então o
 * envio é barrado e a pessoa é mandada para o formulário certo.
 *
 * O problema: metade dos termos que denunciam esses assuntos também aparece em
 * pedido legítimo. "Preciso de mão de obra para reformar minha sala" é cliente.
 * "Tenho mão de obra disponível" é fornecedor. A palavra é a mesma.
 *
 * Por isso a lista tem dois níveis:
 *
 *   FORTE — só existe nesse contexto. Uma ocorrência basta para barrar.
 *           "currículo", "pretensão salarial", "sou pedreiro".
 *
 *   FRACO — levanta suspeita mas cabe em mensagem de cliente. Barra só com
 *           duas ou mais. "experiência", "eletricista", "disponibilidade".
 *
 * Termos comuns em pedido de obra ficam de fora de propósito: orçamento,
 * cotação, preço, material, empresa, proposta, reforma, prazo. Bloquear
 * qualquer um deles derrubaria cliente pagante.
 */

export const TRIAGEM = [
  {
    alvo: '/recrutamento',
    rotulo: 'Trabalhe conosco',
    forte: [
      // documento e candidatura
      'curriculo', 'curriculum', 'cv', 'candidatura', 'me candidatar', 'candidatar-me',
      'candidato a vaga', 'anexo meu curriculo', 'envio meu curriculo', 'segue meu curriculo',
      // vaga e processo
      'vaga', 'vagas', 'emprego', 'empregos', 'processo seletivo', 'selecao de pessoal',
      'recrutamento', 'recrutador', 'recursos humanos', 'banco de talentos',
      'contratacao de pessoal', 'estao contratando', 'esta contratando', 'contratando',
      // estágio e formação
      'estagio', 'estagiario', 'estagiaria', 'estagiar', 'trainee', 'jovem aprendiz', 'aprendiz',
      // condições de trabalho
      'pretensao salarial', 'salario', 'remuneracao', 'carteira assinada', 'clt',
      'registro em carteira', 'vale transporte', 'vale alimentacao', 'periodo de experiencia',
      // intenção declarada
      'procuro emprego', 'procuro trabalho', 'procuro vaga', 'busco emprego',
      'busco oportunidade', 'em busca de oportunidade', 'a procura de emprego',
      'gostaria de trabalhar', 'quero trabalhar', 'trabalhar com voces',
      'trabalhar na avanthe', 'fazer parte da equipe', 'fazer parte do time',
      'me colocar a disposicao', 'a disposicao da empresa',
      // identidade profissional declarada
      'sou pedreiro', 'sou servente', 'sou ajudante', 'sou eletricista', 'sou encanador',
      'sou pintor', 'sou gesseiro', 'sou azulejista', 'sou carpinteiro', 'sou soldador',
      'sou armador', 'sou mestre de obras', 'sou encarregado', 'sou tecnico em edificacoes',
      'sou engenheiro', 'sou arquiteto', 'sou estagiario', 'sou auxiliar',
      'trabalho como pedreiro', 'trabalho como eletricista', 'trabalho como pintor',
      'atuo como pedreiro', 'atuo como eletricista', 'atuo na area da construcao',
      'tenho experiencia como', 'trabalhei como', 'ja trabalhei na area',
    ],
    fraco: [
      'experiencia', 'experiencias', 'anos de experiencia', 'oportunidade', 'oportunidades',
      'disponibilidade', 'disponivel para inicio', 'imediato', 'curriculo atualizado',
      'qualificacao', 'certificado', 'nr35', 'nr 35', 'nr18', 'nr 18',
      'pedreiro', 'servente', 'ajudante', 'meio oficial', 'mestre de obras', 'encarregado',
      'eletricista', 'encanador', 'bombeiro hidraulico', 'pintor', 'gesseiro', 'azulejista',
      'carpinteiro', 'soldador', 'armador', 'marceneiro', 'auxiliar de obra',
      'mao de obra', 'profissional', 'equipe', 'linkedin', 'portfolio profissional',
    ],
  },
  {
    alvo: '/fornecedores',
    rotulo: 'Fornecedor parceiro',
    forte: [
      // identidade de fornecedor
      'fornecedor', 'fornecedora', 'fornecedores', 'fornecimento', 'ser fornecedor',
      'nos fornecemos', 'nossa empresa fornece', 'gostaria de fornecer',
      'representante comercial', 'representacao comercial', 'sou representante',
      'distribuidor', 'distribuidora', 'somos distribuidores', 'revendedor', 'revenda',
      'somos fabricante', 'somos fabricantes', 'fabricamos', 'industria de',
      'atacado', 'atacadista',
      // abordagem comercial
      'tabela de precos', 'lista de precos', 'nosso catalogo', 'envio o catalogo',
      'catalogo de produtos', 'condicoes especiais', 'parceria comercial',
      'proposta de parceria', 'apresentar nossos produtos', 'apresentar nossa empresa',
      'nossos produtos', 'nossa linha de produtos', 'trabalhamos com a linha',
      'prospeccao', 'prospectar',
      // ofertas de serviço que chegam como spam
      'agencia de marketing', 'marketing digital', 'trafego pago', 'gestao de trafego',
      'criacao de site', 'desenvolvimento de site', 'consultoria de marketing',
      'assessoria de imprensa', 'aumentar suas vendas', 'gerar mais leads',
      'primeira pagina do google', 'otimizacao para google',
    ],
    fraco: [
      'representante', 'representacao', 'catalogo', 'distribuir', 'fabricante',
      'vendedor', 'vendas', 'comercializamos', 'locacao de equipamentos',
      'terceirizada', 'terceirizado', 'empreiteiro', 'prestador de servico',
      'parceria', 'condicoes de pagamento', 'melhor preco do mercado', 'descontos',
    ],
  },
];

/** Remove acentos e normaliza, para "currículo" e "CURRICULO" baterem igual. */
export function normalizar(texto) {
  return ` ${(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')} `;
}

/** Casa termo inteiro, para "cv" não bater dentro de outra palavra. */
function contem(texto, termo) {
  return texto.includes(` ${termo} `) || texto.includes(` ${termo}s `);
}

/**
 * Classifica a mensagem.
 * Devolve null quando o assunto é orçamento de obra, ou a categoria detectada
 * junto com os termos que a denunciaram.
 */
export function classificar(texto) {
  const t = normalizar(texto);

  for (const grupo of TRIAGEM) {
    const fortes = grupo.forte.filter((termo) => contem(t, termo));
    if (fortes.length > 0) {
      return { alvo: grupo.alvo, rotulo: grupo.rotulo, motivo: fortes, nivel: 'forte' };
    }
  }

  for (const grupo of TRIAGEM) {
    const fracos = grupo.fraco.filter((termo) => contem(t, termo));
    if (fracos.length >= 2) {
      return { alvo: grupo.alvo, rotulo: grupo.rotulo, motivo: fracos, nivel: 'fraco' };
    }
  }

  return null;
}
