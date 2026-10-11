// Cria o rascunho inicial do admin de curadoria (storage/curadoria.json) a
// partir dos dados publicados (v2/data/colecoes.json) e da lista de afirmações
// abaixo. Tudo nasce pendente: aprovação das notas, decisão das afirmações,
// data e conclusão da revisão. É o revisor quem marca isso no admin.
//
//   node tools/admin/seed.mjs            # cria, se o rascunho não existir
//   node tools/admin/seed.mjs --force    # sobrescreve (perde o trabalho feito no admin)
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const DESTINO = path.join(ROOT, 'storage/curadoria.json');
if (fs.existsSync(DESTINO) && !process.argv.includes('--force')) {
  console.error('storage/curadoria.json já existe. Use --force para sobrescrever (apaga o trabalho feito no admin).');
  process.exit(1);
}
const pub = JSON.parse(fs.readFileSync(path.join(ROOT, 'v2/data/colecoes.json'), 'utf8'));

const cl = (texto, certeza) => ({ texto, certeza, decisao: 'pendente', fonte: '' });
const CLAIMS = {
  '01': [cl('Nas igrejas coloniais brasileiras predominavam assoalho de madeira e campas; piso de ladrilho decorado era raro.', 'média'),
         cl('Barroco mineiro e nordestino como referência estética do período.', 'alta')],
  '02': [cl('O piso de caquinhos se popularizou em meados do século XX (décadas de 1940 a 1960).', 'média'),
         cl('Usava cacos descartados por fábricas; há registro em São Paulo com cerâmicas do ABC, como a Cerâmica São Caetano.', 'média'),
         cl('A prática se difundiu para Rio, Belém, Salvador, Recife e Fortaleza.', 'baixa')],
  '03': [cl('Azulejos florais industriais em banheiros e cozinhas, de 1950 a 1970.', 'média'),
         cl('Os bairros ligados às peças não têm relação documentada com cada motivo.', 'alta')],
  '04': [cl('Painéis de santo nas fachadas são tradição portuguesa trazida ao Brasil; em Portugal são chamados "registos".', 'média-alta'),
         cl('Nossa Senhora Aparecida é a padroeira do Brasil, com santuário em Aparecida/SP.', 'alta'),
         cl('São Jorge tem forte devoção no Rio de Janeiro; 23 de abril é feriado no estado.', 'alta'),
         cl('Recife, Salvador e Belém não têm associação específica documentada com as devoções das peças.', 'alta')],
  '05': [cl('O auge da azulejaria portuguesa no Brasil foi nos séculos XVII e XVIII.', 'média'),
         cl('O claustro do Convento de São Francisco, em Salvador, tem painéis de azulejos portugueses do século XVIII.', 'alta'),
         cl('Os painéis do claustro são atribuídos a Bartolomeu Antunes de Jesus (Lisboa).', 'baixa-média'),
         cl('A Igreja e o Convento de São Francisco são tombados pelo IPHAN.', 'alta')],
  '06': [cl('O Palácio Capanema (antigo MES) foi construído entre 1936 e 1945, no Rio de Janeiro.', 'alta'),
         cl('Os painéis de azulejo do Capanema foram desenhados por Candido Portinari.', 'alta'),
         cl('Foram executados pela Osirarte, ateliê de Paulo Rossi Osir.', 'média')],
  '07': [cl('Athos Bulcão nasceu em 1918 e morreu em 2008.', 'alta'),
         cl('Trabalhou com Oscar Niemeyer e João Filgueiras Lima (Lelé) em Brasília.', 'alta'),
         cl('Os azulejos da Igrejinha Nossa Senhora de Fátima (1958), em Brasília, são dele.', 'alta')],
  '08': [cl('Escadaria Selarón: obra do artista chileno Jorge Selarón, iniciada por volta de 1990, com azulejos de vários países.', 'alta'),
         cl('Casa da Flor: construída e decorada com cacos por Gabriel Joaquim dos Santos, a partir de 1912.', 'média'),
         cl('A Casa da Flor é tombada pelo INEPAC.', 'média'),
         cl('O calçadão de Copacabana é de pedra portuguesa, não de caquinho; o padrão de ondas remete ao calçamento de Lisboa.', 'alta')],
  '09': [cl('Técnica: cimento e pigmento, prensagem e cura em água, sem queima.', 'alta'),
         cl('Origem europeia, século XIX.', 'média-alta'),
         cl('Uso amplo no Brasil do fim do século XIX a meados do XX.', 'média')],
  '10': [],
};

const colecoes = pub.colecoes.map((c) => ({
  num: c.num, name: c.name, sub: c.sub, desc: c.desc, img: c.img,
  note: { texto: c.note || '', aprovacao: 'pendente' },
  claims: CLAIMS[c.num] || [],
  items: c.items,
  tees: c.tees,
}));
const estado = {
  versao: 1,
  atualizado: new Date().toISOString(),
  curadoria: { revisor: pub.curadoria?.revisor || '', orgao: pub.curadoria?.orgao || '', data: '', concluida: false },
  colecoes,
};
fs.mkdirSync(path.dirname(DESTINO), { recursive: true });
fs.writeFileSync(DESTINO, JSON.stringify(estado, null, 2) + '\n');
const n = colecoes.reduce((a, c) => a + c.claims.length, 0);
console.log('criado storage/curadoria.json: coleções', colecoes.length, '| afirmações', n, '| tudo pendente');
