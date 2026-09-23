import { classificar } from '../src/data/triagem.js';

// deve PASSAR: pedido legítimo de obra
const clientes = [
  'Preciso reformar uma sala comercial de 120 m2 no Batel.',
  'Quero um orçamento para reforma do meu apartamento, 80m2.',
  'Tenho um imóvel no centro e preciso de mão de obra para trocar o piso.',
  'Minha empresa vai mudar de sede e precisamos reformar o escritório.',
  'Gostaria de uma cotação para construção de uma casa em Curitiba.',
  'Preciso de um pedreiro para levantar um muro nos fundos.',
  'Qual o preço médio de uma reforma de cozinha?',
  'Preciso regularizar a obra, o engenheiro anterior abandonou o serviço.',
  'Bom dia, quero fazer um retrofit na fachada do prédio.',
  'Tenho projeto aprovado e preciso de uma empresa para executar.',
  'Quanto custa impermeabilizar uma laje de 60m2?',
  'Vocês atendem em São José dos Pinhais? Quero reformar meu banheiro.',
  'Preciso de orçamento para refazer a elétrica e a hidráulica do apartamento.',
  'Comprei um apartamento antigo e quero reformar tudo antes de mudar.',
  'Preciso trocar o piso e pintar as paredes. Qual o prazo de vocês?',
  'Gostaria de falar sobre a gestão da obra da minha casa.',
  'Tenho uma equipe própria mas preciso de acompanhamento técnico.',
  'Preciso de mão de obra e material para uma reforma pequena.',
  'Meu escritório tem 200m2 e quero fazer um retrofit completo.',
  'Preciso de laudo técnico e regularização junto à prefeitura.',
];

// deve BARRAR: currículo / vaga
const vagas = [
  'Gostaria de enviar meu currículo para vaga de pedreiro.',
  'Tenho experiência como eletricista, procuro trabalho.',
  'Boa tarde, vocês estão contratando?',
  'Sou pedreiro com 15 anos de experiência.',
  'Tenho interesse em trabalhar com vocês, segue meu CV.',
  'Procuro emprego na área da construção civil.',
  'Sou estudante de engenharia e busco estágio.',
  'Qual a pretensão salarial para ajudante de obra?',
  'Tenho disponibilidade imediata e experiência em acabamento.',
  'Gostaria de fazer parte da equipe de vocês.',
  'Tenho certificado NR35 e experiência em trabalho em altura.',
  'Trabalho como pintor há 10 anos, tem oportunidade aí?',
  'Meu currículo está atualizado, posso mandar?',
  'Sou mestre de obras e estou disponível para início imediato.',
];

// deve BARRAR: fornecedor / abordagem comercial
const fornecedores = [
  'Somos fornecedores de material elétrico e queremos ser parceiros.',
  'Sou representante comercial de uma fábrica de esquadrias.',
  'Gostaria de apresentar nossa empresa e nosso catálogo.',
  'Trabalhamos com locação de equipamentos, temos interesse em parceria.',
  'Somos uma agência de marketing e podemos aumentar suas vendas.',
  'Temos a melhor tabela de preços em material hidráulico.',
  'Nossa empresa fornece argamassa, gostaria de enviar uma proposta.',
  'Sou distribuidor de tintas na região de Curitiba.',
  'Posso apresentar nossos produtos para a equipe de compras?',
  'Faço gestão de tráfego pago e coloco vocês na primeira página do Google.',
];

let falsoPositivo = 0, falsoNegativo = 0;
const erros = [];

for (const m of clientes) {
  const r = classificar(m);
  if (r) { falsoPositivo++; erros.push(`FALSO POSITIVO  "${m}"\n     barrado por [${r.nivel}]: ${r.motivo.join(', ')}`); }
}
for (const [nome, lista] of [['vaga', vagas], ['fornecedor', fornecedores]]) {
  for (const m of lista) {
    const r = classificar(m);
    if (!r) { falsoNegativo++; erros.push(`ESCAPOU (${nome})  "${m}"`); }
  }
}

const totalBarrar = vagas.length + fornecedores.length;
console.log(`clientes legítimos testados : ${clientes.length}`);
console.log(`mensagens a barrar          : ${totalBarrar}`);
console.log('');
console.log(`falsos positivos (cliente barrado)  : ${falsoPositivo}  <- erro caro`);
console.log(`escapou (assunto errado passou)     : ${falsoNegativo}`);
console.log(`taxa de captura                     : ${(100*(totalBarrar-falsoNegativo)/totalBarrar).toFixed(0)}%`);
console.log('');
if (erros.length) { console.log('PROBLEMAS:'); erros.forEach(e=>console.log(' - '+e)); }
else console.log('nenhum erro');
process.exit(falsoPositivo > 0 ? 1 : 0);
