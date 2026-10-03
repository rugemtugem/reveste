// Gera o estado inicial do admin de curadoria (storage/curadoria.json) a partir
// dos dados que estavam no main.js e das decisões do Luan (03/10/2026).
// Rodado uma vez; depois disso o admin é a fonte dos dados.
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const src = fs.readFileSync(path.join(ROOT, 'v2/js/main.js'), 'utf8');
const C = eval(src.match(/const COLLECTIONS = (\[[\s\S]*?\n\]);/)[1]);
const PIECE_STATUS = eval('(' + src.match(/const PIECE_STATUS = (\{[^\n]*\});/)[1] + ')');
const st = (name) => PIECE_STATUS[name] || 'homenagem';
const piece = (name) => ({ name, status: st(name) });

const cl = (texto, certeza, fonte = '') => ({ texto, certeza, decisao: 'confirmo', fonte });
const CLAIMS = {
  '01': [cl('Nas igrejas coloniais brasileiras predominavam assoalho de madeira e campas; piso de ladrilho decorado era raro.', 'média', 'Correto'),
         cl('Barroco mineiro e nordestino como referência estética do período.', 'alta')],
  '02': [cl('O piso de caquinhos se popularizou em meados do século XX (décadas de 1940 a 1960).', 'média'),
         cl('Usava cacos descartados por fábricas; há registro em São Paulo com cerâmicas do ABC, como a Cerâmica São Caetano.', 'média', 'Trocar lajota por ladrilho'),
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
         cl('O calçadão de Copacabana é de pedra portuguesa, não de caquinho; o padrão de ondas remete ao calçamento de Lisboa.', 'alta', 'Largo do Rossio')],
  '09': [cl('Técnica: cimento e pigmento, prensagem e cura em água, sem queima.', 'alta'),
         cl('Origem europeia, século XIX.', 'média-alta'),
         cl('Uso amplo no Brasil do fim do século XIX a meados do XX.', 'média')],
  '10': [],
};

const colecoes = C.map((c) => ({
  num: c.num, name: c.name, sub: c.sub, desc: c.desc, img: c.img,
  note: { texto: c.note || '', aprovacao: c.note ? 'aprovo' : 'pendente' },
  claims: CLAIMS[c.num],
  items: c.items.map(piece),
  tees: (c.tees || []).map((g) => {
    const t = {};
    if (g.style) t.style = g.style;
    if (g.label) t.label = g.label;
    if (g.names) t.names = g.names.map(piece);
    if (g.extra) t.extra = g.extra.map(piece);
    return t;
  }),
}));
const estado = {
  versao: 1,
  atualizado: new Date().toISOString(),
  curadoria: { revisor: 'Luan Crespo', orgao: 'Departamento de Patrimônio Histórico', data: '2026-10-03', concluida: true },
  colecoes,
};
fs.writeFileSync(path.join(ROOT, 'storage/curadoria.json'), JSON.stringify(estado, null, 2) + '\n');
const n = colecoes.reduce((a, c) => a + c.claims.length, 0);
console.log('coleções', colecoes.length, '| afirmações', n, '| peças', colecoes.reduce((a, c) => a + c.items.length + c.tees.reduce((b, t) => b + (t.names || []).length + (t.extra || []).length, 0), 0));
