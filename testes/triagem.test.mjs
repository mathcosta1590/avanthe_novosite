/**
 * Corpo de teste da triagem do formulário de orçamento.
 *
 * O erro caro é o FALSO POSITIVO: cliente pagante barrado. Ele derruba o teste.
 * Escapar um currículo custa um e-mail; barrar um cliente custa a obra.
 *
 * Os clientes incluem de propósito mensagens com palavras que denunciam os
 * outros dois assuntos — "experiência", "pedreiro", "mão de obra", "parceria",
 * "sou engenheiro" — porque é exatamente aí que a triagem anterior errava.
 */
import { classificar } from '../src/data/triagem.js';

// ---------------------------------------------------------------- deve PASSAR
const clientes = [
  // pedidos diretos
  'Preciso reformar uma sala comercial de 120 m2 no Batel.',
  'Quero um orçamento para reforma do meu apartamento, 80m2.',
  'Gostaria de uma cotação para construção de uma casa em Curitiba.',
  'Bom dia, quero fazer um retrofit na fachada do prédio.',
  'Comprei um apartamento antigo e quero reformar tudo antes de mudar.',
  'Meu escritório tem 200m2 e quero fazer um retrofit completo.',
  'Vocês atendem em São José dos Pinhais? Quero reformar meu banheiro.',
  'Preciso de orçamento para refazer a elétrica e a hidráulica do apartamento.',
  'Quanto custa impermeabilizar uma laje de 60m2?',
  'Qual o preço médio de uma reforma de cozinha?',
  'Preciso trocar o piso e pintar as paredes. Qual o prazo de vocês?',
  'Quero ampliar a área de serviço da minha casa, cabe mais uns 12 m2.',
  'Estou pensando em demolir uma parede para integrar sala e cozinha.',
  'Minha loja no shopping precisa de reforma na semana de recesso.',
  'Preciso de um orçamento para forro de gesso e iluminação em trilho.',
  'Tenho uma chácara em Campo Largo e quero construir um galpão.',

  // contratação de profissionais (o inverso de se oferecer)
  'Preciso de um pedreiro para levantar um muro nos fundos.',
  'Tenho um imóvel no centro e preciso de mão de obra para trocar o piso.',
  'Preciso de mão de obra e material para uma reforma pequena.',
  'Procuro um engenheiro para acompanhar a obra da minha casa.',
  'Quero contratar uma empresa séria, já me queimei com empreiteiro.',
  'Preciso de eletricista e encanador para o meu apartamento.',
  'Estou procurando uma equipe para tocar a reforma do meu sobrado.',

  // problemas técnicos
  'Preciso regularizar a obra, o engenheiro anterior abandonou o serviço.',
  'Preciso de laudo técnico e regularização junto à prefeitura.',
  'Tenho infiltração na laje do meu apartamento há dois anos.',
  'Apareceram trincas na parede da sala depois da obra do vizinho.',
  'O síndico pediu laudo estrutural do prédio, vocês fazem?',
  'Preciso do habite-se do meu sobrado, a obra é antiga.',
  'Tenho vazamento no banheiro e não acho de onde vem.',

  // armadilhas: contêm palavras dos outros dois assuntos
  'Sou engenheiro e quero reformar meu apartamento, preciso de uma segunda opinião.',
  'Sou arquiteta e procuro uma construtora para executar meu projeto.',
  'Tenho experiência ruim com obra, por isso quero alguém com RT.',
  'Já tive péssima experiência com empreiteiro, quero reformar minha casa direito.',
  'Tenho uma equipe própria mas preciso de acompanhamento técnico.',
  'Minha empresa vai mudar de sede e precisamos reformar o escritório.',
  'Tenho projeto aprovado e preciso de uma empresa para executar.',
  'Gostaria de falar sobre a gestão da obra da minha casa.',
  'Quero uma parceria de longo prazo para as reformas das minhas lojas.',
  'Sou proprietário de várias salas comerciais e preciso reformar duas.',
  'Trabalho com imóveis e preciso reformar um apartamento para locação.',
  'Meu pedreiro sumiu no meio da obra, preciso de alguém para terminar.',
  'A empresa que contratei era terceirizada e fez um serviço ruim na minha casa.',
  'Preciso de um profissional de verdade, com CNPJ e nota fiscal.',
  'Quanto fica o m2 de reforma? Tenho 95 m2 para refazer.',
  'Vocês têm disponibilidade para começar minha obra em janeiro?',
];

// ---------------------------------------- deve BARRAR: candidatura a vaga
const vagas = [
  'Segue meu currículo em anexo.',
  'Gostaria de enviar meu currículo para o banco de talentos.',
  'Tenho interesse em trabalhar com vocês, posso mandar meu CV?',
  'Sou pedreiro com 10 anos de experiência, procuro vaga.',
  'Sou servente e estou disponível para início imediato.',
  'Boa tarde, vocês estão contratando?',
  'Tem alguma vaga de ajudante de obra?',
  'Procuro emprego na área da construção civil.',
  'Sou eletricista, tenho NR10 e NR35, disponibilidade total.',
  'Trabalhei como mestre de obras por 8 anos, gostaria de uma oportunidade.',
  'Sou técnico em edificações recém-formado, busco estágio.',
  'Qual a pretensão salarial para a vaga de encarregado?',
  'Estou desempregado e preciso de um emprego urgente.',
  'Gostaria de fazer parte da equipe de vocês.',
  'Sou engenheiro civil e busco recolocação no mercado.',
  'Atuo como pintor há 15 anos, tenho referências.',
  'Tenho mão de obra disponível, equipe completa de pedreiros.',
  'Ofereço equipe de gesseiros, trabalhamos por metro quadrado.',
  'Meu nome é João, sou carpinteiro e estou à procura de trabalho.',
  'Vocês contratam por diária? Sou azulejista.',
  'Tenho 5 anos de experiência em obras e quero trabalhar aí.',
  'Sou estagiário de engenharia, tem vaga para estágio?',
  'Posso enviar meu curriculum para avaliação?',
  'Trabalho como armador, aceito registro em carteira.',
  'Estou à disposição para uma oportunidade na empresa.',
  'Sou jovem aprendiz e queria uma chance na construção.',
];

// ------------------------------- deve BARRAR: fornecedor, representante, spam
const fornecedores = [
  'Somos fabricantes de porcelanato e gostaria de apresentar nossa linha.',
  'Gostaria de ser fornecedor de vocês, trabalho com argamassa.',
  'Sou representante comercial de uma fábrica de esquadrias.',
  'Sou distribuidor de tintas na região de Curitiba.',
  'Posso apresentar nossos produtos para a equipe de compras?',
  'Segue nossa tabela de preços para materiais hidráulicos.',
  'Nossa empresa fornece andaimes e escoramento para obras.',
  'Somos distribuidores autorizados de louças e metais.',
  'Gostaria de enviar nosso catálogo de produtos.',
  'Temos interesse em parceria comercial com a Avanthe.',
  'Trabalhamos com locação de equipamentos, temos condições especiais.',
  'Faço gestão de tráfego pago e coloco vocês na primeira página do Google.',
  'Somos uma agência de marketing digital e podemos aumentar suas vendas.',
  'Fazemos criação de site e gestão de redes sociais para construtoras.',
  'Quero apresentar nossa solução de automação de vendas.',
  'Oferecemos crédito para empresas com taxas reduzidas.',
  'Comercializamos ferragens e temos pronta entrega para Curitiba.',
  'Represento a indústria de cerâmicas Portobello nesta região.',
  'Nossa linha de produtos atende construtoras de médio porte.',
  'Venho oferecer nossos serviços de assessoria contábil.',
  'Fabricamos móveis planejados e buscamos parceria com construtoras.',
  'Gostaria de fazer o cadastro de fornecedor na empresa de vocês.',
  'Alugamos betoneiras e compactadores, com frete incluso.',
  'Vi o site de vocês e posso melhorar o posicionamento no Google.',
];

// --------------------------------------------------------------------- roda
let falsoPositivo = 0;
let falsoNegativo = 0;
const erros = [];

for (const m of clientes) {
  const r = classificar(m);
  if (r) {
    falsoPositivo += 1;
    erros.push(`FALSO POSITIVO  "${m}"\n     barrado por [${r.nivel}] ${r.rotulo}: ${r.motivo.join(' | ')}`);
  }
}

for (const [nome, lista] of [
  ['vaga', vagas],
  ['fornecedor', fornecedores],
]) {
  for (const m of lista) {
    const r = classificar(m);
    if (!r) {
      falsoNegativo += 1;
      erros.push(`ESCAPOU (${nome})  "${m}"`);
    }
  }
}

const totalBarrar = vagas.length + fornecedores.length;
const total = clientes.length + totalBarrar;

console.log(`mensagens no corpo de teste : ${total}`);
console.log(`  clientes legítimos        : ${clientes.length}`);
console.log(`  candidaturas a vaga       : ${vagas.length}`);
console.log(`  fornecedor e spam         : ${fornecedores.length}`);
console.log('');
console.log(`falsos positivos (cliente barrado)  : ${falsoPositivo}  <- erro caro, derruba o teste`);
console.log(`escapou (assunto errado passou)     : ${falsoNegativo}`);
console.log(`taxa de captura                     : ${((100 * (totalBarrar - falsoNegativo)) / totalBarrar).toFixed(0)}%`);
console.log('');

if (erros.length) {
  console.log('PROBLEMAS:');
  erros.forEach((e) => console.log(' - ' + e));
} else {
  console.log('nenhum erro');
}

process.exit(falsoPositivo > 0 ? 1 : 0);
