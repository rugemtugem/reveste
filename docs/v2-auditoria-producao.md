# Reveste v2: auditoria de prontidão (UI/UX + full-stack)

- Data: 2026-10-03
- Superfície: `reveste/v2/` (manual de identidade visual, página única com 9 abas + modal "Ver camisa")
- Stack: HTML estático, CSS próprio, JS vanilla, Bootstrap 5.3.3 (CSS + bundle JS via jsDelivr), Google Fonts (4 famílias)
- Skills aplicadas: `ui-ux-production-reality`, `full-stack-production-reality`
- Método: leitura de `index.html`, `css/styles.css`, `js/main.js` e do PDF do manual; Chrome headless (Playwright) em 375/768/1024/1440 px nas 9 abas, sonda de teclado/foco, abertura do modal, cálculo de contraste WCAG.

## Direção (registrada, não alterada)

- Objetivo: documentar a marca para quem aplica a identidade (fornecedores, gráfica, marketing) e apresentar as coleções.
- Tom: patrimonial, clássico, sóbrio. Azul Colonial #1A3A5C + Off-White #F0EAE0, Playfair + Lato.
- Signature element: a grade de azulejo (linhas 48px no header, 24px no modal) e o ícone 2×2.
- Hipótese: o público é interno/parceiros, não consumidor final. Se for público, os itens de SEO sobem de prioridade.

## Achados

### High

- [ ] **H1. Imagens das camisas são recortes do painel da coleção.** Os 46 arquivos `assets/img/shirts/coll-XX-piece-N.jpeg` (~400×395 px) saem com texto cortado ("RO PRETO/MG"), pedaços do painel vizinho e a legenda do painel. No modal, a imagem é ampliada e fica borrada. Evidência: modal em 1440 px, peça 01 da coleção 01. Impacto: a única funcionalidade interativa do site mostra o produto mal. Correção: fotos/mockups individuais de cada camisa, ≥ 1200 px no lado maior, fundo limpo. Regressão: abrir todas as peças e conferir se não há texto cortado.
- [ ] **H2. Erros factuais nos dados das coleções** (`js/main.js`, array `COLLECTIONS`). Para uma marca "patrimonial", erro de patrimônio é erro de marca:
  - Coleção 05: "Palácio da Bolsa – Rio de Janeiro/RJ". O Palácio da Bolsa fica no Porto, em Portugal.
  - Coleção 06: "Conj. Residencial Pedregulho – Campinas/SP". O Pedregulho fica no Rio de Janeiro (São Cristóvão), e os painéis de lá não são "Bauhaus".
  - Coleção 07: "Igrejinha da Pampulha – Belo Horizonte/MG" como obra de Athos Bulcão. Os azulejos da Pampulha são de Portinari. A "Igrejinha" com azulejos de Athos é a de Nossa Senhora de Fátima, em Brasília.
  - Coleções 02 e 08 têm o mesmo nome ("Caquinhos do Brasil"), o que confunde na grade.
  - Outros itens merecem checagem curatorial (Copan e MES como "Bauhaus", Inhotim e São Francisco/Salvador como "caquinhos").
  Correção: revisão por alguém com repertório de patrimônio antes de publicar. Esses dados não estão no PDF, então a fonte deles também precisa ser revista.
- [ ] **H3. Teclado e leitor de tela.** 0 de 14 miniaturas clicáveis (`.coll-piece-thumb` e `.coll-grid-thumb`) são focáveis: são `<img>`/`<div>` com `click`. Ao fechar o modal, o foco vai para `<body>` (Bootstrap só devolve o foco quando o modal é aberto via `data-bs-toggle`, e aqui ele é aberto por `.show()`). A navegação por abas não expõe estado (sem `aria-current`, `role=tab` ou `aria-pressed`) e o `.coll-btn` mostra só "01".."08" para o leitor de tela. Não há skip link. Correção: trocar os cards e miniaturas por `<button>`, guardar e devolver o foco no `hidden.bs.modal`, aplicar `aria-current="page"` (ou o padrão tablist) nas abas e dar `aria-label` com o nome da coleção.

### Medium

- [ ] **M1. Overflow horizontal em 375 px na aba Logo.** O lockup horizontal (ícone 76 px + "REVESTE" 38 px com tracking de 8 px) mede 380 px e o wordmark sai da tela. Correção: no breakpoint de 640 px, reduzir `font-size`/`letter-spacing` ou empilhar.
- [ ] **M2. Sem deep link.** As abas não mudam a URL: não dá para enviar "veja a aba Cores" a um fornecedor, o botão voltar sai do site e o reload volta para Início. Correção: `location.hash` + `hashchange`, mantendo as seções como `<section id>`.
- [ ] **M3. O site viola o próprio manual.** "Usos incorretos" proíbe "adicionar efeitos ou sombras", mas o selo em Contato tem `box-shadow` (`styles.css:564`). O hero da coleção também põe título em cima de um painel cheio de texto (ilegível em 375 px).
- [ ] **M4. Falta o conteúdo que um manual precisa entregar.** Não há download dos arquivos da logo (SVG/PNG/PDF), valores de área de proteção e tamanho mínimo, Pantone, nem canal de contato real ("entre em contato com a equipe de marketing" sem e-mail). O CMYK 72·37·0·64 parece conversão direta de RGB, não perfil de impressão: a gráfica vai errar a cor.
- [ ] **M5. Sem `prefers-reduced-motion`.** Existe fade + translate em toda troca de aba, `scroll-behavior: smooth` e transforms no hover.
- [ ] **M6. Metadados.** Sem `meta description`, Open Graph e favicon (404 no console). Se o manual for interno, faltam `noindex` e algum controle de acesso.

### Nit

- Texto de dica do modal `#a99` sobre `#F0EAE0`: contraste 2,27:1 (AA pede 4,5:1). Os demais pares passam (muted/cream 4,73; nav 5,63; footer 4,81).
- As 27 `<img>` não têm `width/height`, o que gera CLS. `icon.png` tem 190 KB e aparece a 44 px.
- Bootstrap completo (CSS + JS) usado só para grid + modal. As 4 famílias de fonte com 9 pesos pesam no primeiro carregamento.
- Em abas curtas, o rodapé não encosta no fim da viewport (sobra uma faixa creme em 1440 px na Início).
- `reveste_brand_identity_refined.png` (3 MB), o PDF (3,2 MB), o `.pptx` e os `.DS_Store` estão dentro da pasta publicável.

## Inventário full-stack (15 camadas)

| # | Camada | Status | Evidência / justificativa |
|---|---|---|---|
| 1 | Frontend | parcial | Achados H1–M6 acima |
| 2 | APIs & backend | não aplicável | Sem formulário, sem dados de usuário, sem endpoint |
| 3 | Database & storage | não aplicável | Dados das coleções são estáticos em `main.js` |
| 4 | Auth & permissions | **a decidir** | Se o manual for confidencial (parceiros), precisa de pelo menos Basic Auth/link privado. Hoje é aberto |
| 5 | Hosting & deploy | bloqueada | Nenhum destino, script ou domínio configurado. `reveste.com.br` é citado mas não verificado |
| 6 | Cloud & compute | não aplicável | Estático |
| 7 | CI/CD & versionamento | a criar | Sem Git. `v2/` convive com uma v1 na pasta-pai sem histórico |
| 8 | Security | parcial | Bootstrap via jsDelivr **sem `integrity`/SRI**. Faltam headers (CSP, HSTS), que dependem do host |
| 9 | Rate limiting | não aplicável | Sem endpoint |
| 10 | Cache & CDN | a criar | Sem versionamento `?v=` em `styles.css`/`main.js`: depois de um deploy, o visitante pode ver CSS velho |
| 11 | Scaling | não aplicável | Estático |
| 12 | Error tracking & logs | não aplicável (justificado) | Sem lógica crítica. Logs de acesso do host bastam |
| 13 | Availability | parcial | Se o jsDelivr falhar, `bootstrap` fica indefinido e o "Ver camisa" quebra sem aviso. Considerar servir o Bootstrap localmente |
| 14 | Observabilidade | a decidir | Analytics só se o manual for público, e com consentimento |
| 15 | Documentação | a criar | Sem README (como rodar, onde publicar, de onde vêm os dados das coleções) |

## Handoffs

- **[R-01] Fotos individuais das camisas** · Frontend · P1 · Responsável: design/fotografia · Aceite: 46 imagens ≥ 1200 px, sem texto ou painel vizinho · Bloqueia produção? sim
- **[R-02] Revisão curatorial das coleções** · Conteúdo · P0 · Responsável: curadoria/fundador · Aceite: cada obra com cidade/autor conferidos em fonte (IPHAN, acervo) · Bloqueia produção? sim
- **[R-03] Definir público e acesso** · Auth · P1 · Responsável: dono da marca · Aceite: decisão registrada (público com SEO ou privado com noindex + acesso) · Bloqueia produção? sim
- **[R-04] Hosting + Git** · Deploy/CI · P1 · Responsável: dev · Aceite: repositório, deploy reproduzível e rollback documentados · Bloqueia produção? sim
- **[R-05] Specs de impressão** · Conteúdo · P2 · Responsável: designer/gráfica · Aceite: Pantone + CMYK por perfil (ex.: Coated FOGRA39), área de proteção e tamanho mínimo em mm/px · Bloqueia produção? não

## Atualização 2026-10-03 (branch `melhorias/v2-acessibilidade-e-robustez`)

Resolvidos no código e verificados no Chrome headless:

- [x] H3 teclado e leitor de tela (skip link, aria-current, botões reais, foco do modal, menu mobile fora do Tab)
- [x] M1 overflow em 375 px (cabe a partir de 320 px)
- [x] M2 deep link por aba (`#cores`), voltar do navegador e título por aba
- [x] M3 sombra no selo removida (o hero da coleção depende das imagens novas, H1)
- [x] M5 prefers-reduced-motion
- [x] M6 description, Open Graph (sem og:image até haver domínio), favicon
- [x] Nits: SRI no Bootstrap, `?v=`, dimensões das imagens, ícone de 82 KB, contraste da dica, rodapé
- [x] Camada 7: Git criado (github.com/rugemtugem/reveste). Camada 15: README

H1 parcial: as peças das 8 coleções foram recortadas de novo dos painéis originais em alta (`reveste/originais/`, fora do Git), sem texto nem painel vizinho e sem ampliação. As camisas continuam sendo parte de um painel (~400 px), não fotos de produto.

Rodada de 2026-10-03 (tarde):

- [x] H2 dados corrigidos: Glória do Outeiro no lugar do Palácio da Bolsa (decisão do dono), Convento da Penha em Vila Velha/ES, Pedregulho no Rio de Janeiro/RJ, Igrejinha N. Sra. de Fátima (Brasília) no lugar da Pampulha. A grade mostra o subtítulo (02 e 08 têm o mesmo nome)
- [x] Banners das coleções sem o texto dos painéis
- [x] M4 parcial: download do ícone e do selo em PNG
- [x] R-03 decidido: o manual é **público**

Rodada de 2026-10-03 (noite), sem designer: a marca veio de imagens geradas por IA, então os vetores e as cores de impressão foram gerados a partir dela.

- [x] M4 vetores: 9 versões em SVG/PDF/PNG (vertical, horizontal, negativas, sem tagline, ícone, ícone 1 cor, selo) em `v2/assets/marca/` + zip. Ícone traçado do PNG corrigido; "REVESTE" e tagline em contorno (Playfair Display/Lato); selo reconstruído. Reproduzível por `tools/marca/` (saída idêntica byte a byte)
- [x] M4 cores: CMYK por perfil (FOGRA39 couché 84·54·11·59; FOGRA52 100·63·8·41); Pantone TCX 19-4029 Navy Peony (ΔE 2,2) e 11-0103 Egret (ΔE 1,0); gráfico 540 C (ΔE 3,0, tabela de terceiros). **Confirmar no guia físico e com prova impressa**
- [x] M4 área de proteção e tamanho mínimo publicados na aba Usos; e-mail e WhatsApp na aba Contato
- [x] R do elemento e do ícone sem as manchas das serifas

Ainda dependem do dono: hosting (R-04) e, com o domínio, og:image/canonical/sitemap; prova impressa das cores.

- [x] Coleção 06 renomeada para "Azulejos Modernistas no Brasil" (as obras são do modernismo brasileiro, não da Bauhaus); texto reescrito; MES como Palácio Capanema
- [x] Coleção 08: texto passa a tratar as estampas como reinterpretação em caquinhos (não afirma que os lugares são revestidos de caquinhos); Ibirapuera (repetido da 06) virou Calçadão de Copacabana, que é o padrão da estampa; Casa de Cora Coralina virou Casa da Flor (São Pedro da Aldeia/RJ), referência real de caquinhos
- [x] Coleção 07: dúvida sobre Alvorada e Memorial JK resolvida, os painéis passaram a ter nomes criados Com o domínio definido: og:image, canonical e sitemap. Itens das coleções 06 e 08 ainda merecem checagem curatorial (Copan/MES como "Bauhaus"; Inhotim, Ibirapuera, São Francisco/Salvador e Cora Coralina como "caquinhos").

Continuam abertos (histórico): H1 (fotos individuais de produto), H2 (revisão curatorial), M4 (arquivos da logo, Pantone, contato), R-03 (público/acesso), R-04 (hosting).

## Decisão

- [ ] Pronto
- [ ] Pronto com pendências aceitas
- [x] **Bloqueado**: H2 (dados factuais), H1 (imagens do produto) e R-03/R-04 (público, acesso e hosting indefinidos). H3, M1, M2, M3 e M5 são correções de código que cabem num ciclo curto.

Galeria de camisas e camisetas (2026-10-03):

- [x] Cada coleção mostra as peças em grade com filtro Todos / Camisas / Camisetas (só quando há os dois tipos); o modal navega dentro do filtro
- [x] 45 camisetas recortadas de 8 painéis (`originais/camisetas/`, fora do Git): 04, 05 (3 estilos: lateral, canto, quadro central, +"Azulejo Português Clássico"), 06, 07
- [x] Novas coleções 09 Ladrilhos Hidráulicos e 10 Caquinhos Suburbanos do Brasil (só camisetas); "Pátio das Cores" repetido na 10 virou "Ladeira das Cores – Salvador/BA"
- [x] Coleções 09 e 10 dizem no texto que os lugares que dão nome às peças são homenagens criadas pela Reveste ; a 02 também

Conferência imagem x lugar (2026-10-03). Critério: o nome real fica só quando a imagem tem ligação reconhecível com o lugar (padrão, técnica ou devoção que existem lá); o resto vira homenagem com nome criado, e o texto da coleção avisa.

- Mantidos: 03 (motivos, não lugares), 04 (devoções), 05-1 Igreja de São Francisco/Salvador (azulejo azul e branco), 08 inteira (reinterpretação de paisagens; Selarón, Copacabana e Casa da Flor batem)
- 01: Capela do Ouro Velho, Igreja das Estrelas Azuis, Matriz da Luz Dourada, Capela do Jardim Sagrado, Igreja dos Arabescos, Capela do Mar e da Terra (interiores genéricos de IA, com pisos que as igrejas reais não têm)
- 05-2..5: Solar da Moldura Dourada, Mirante Verde-Mar, Casa das Rosáceas Azuis, Solar das Folhagens
- 06: Edifício Meia-Lua, Pavilhão Sol e Mar, Marquise das Cores, Casa dos Volumes, Conjunto Morro Alegre (o Capanema tem azulejos figurativos de Portinari; Copan e Ibirapuera não têm azulejaria)
- 07: Painel Meia-Lua, Cruz do Planalto, Asas do Eixo, Vento Norte, Concreto e Sombra, Cerrado Verde (estilo de Athos Bulcão, sem atribuir obras a ele; isso também resolve a dúvida sobre Alvorada e Memorial JK)

Revisão de UX (crítica + mockups "Nova Home"), etapas 1 e 2:

- [x] Amostra do Off-White com moldura navy e "Aa"; códigos em tabela; HEX copiável; cores de interface (#14283F, #B23A3A) viraram tokens e estão documentadas na aba Cores
- [x] Linhas órfãs: galeria em 3 colunas, coleções em 5 (5+5), valores 5 por linha (no celular o último ocupa a linha)
- [x] Texto mínimo de 12 px (exceto a tagline dentro da arte da logo, que vira SVG na etapa 4)
- [x] Barra única (logo + 5 abas): no celular, 182 → 62 px; "Manual de identidade visual" aparece 2 vezes
- [x] 5 abas: A Marca · Logo e Usos (com Construção e Usos) · Cores e Tipografia · Coleções · Contato; #construcao, #usos e #tipografia continuam funcionando
- [x] Home com produto (hero com 4 coleções, "Ver as coleções", "Baixar a marca") e "Explore o manual"; link direto por coleção (#colecoes-07); "Próximo" no fim de cada aba

Etapa 3:

- [x] "Do lugar à peça" na home: tríptico da coleção 01 separado em três imagens com legenda (Lugar · Estampa · Peça), sem citar lugar real
- [x] Miniaturas da galeria só com a peça, quadradas (89, `tools/marca/thumbs.py`); a imagem completa (peça + azulejo) fica no modal
- [x] Modal de 680 px com a imagem ampliada no máximo 1,5× (as peças têm ~400 px; maior que isso só borra). A solução definitiva continua sendo foto de produto
- [x] Amostra do Off-White ocupa o quadrado todo, como a do azul (pedido do dono)

Etapas 4 e 5:

- [x] Coleções: uma grade única de 10 cards (5+5) que abre o detalhe; o seletor 01…10 e a "Visão Geral" repetida saíram
- [x] Logo: uma galeria só, cada versão com seu palco e os botões SVG/PDF/PNG embaixo; palcos da mesma altura por linha (legendas alinhadas); os logos agora são os SVGs oficiais, não HTML imitando a logo
- [x] Usos: diagrama da área de proteção (x = ¼ do ícone) e 6 exemplos visuais de uso incorreto
- [x] Tipografia: espécime de Playfair e Lato (alfabeto, pesos), escala de hierarquia e fontes de apoio, que só baixam quando a aba Cores e Tipografia abre

Segunda revisão (contra-análise aceita pelo autor da crítica):

- [x] Índice fixo Logo · Construção · Usos abaixo da barra, com aria-current="location" + sublinhado; âncoras com scroll-margin = barra + índice
- [x] Logo no celular: 9 versões em 2 colunas (selo na linha inteira), palco de 72 px e botões de 40 px de altura (alvo ≥ 24 px, WCAG 2.2); aba de 8.431 → 6.420 px, galeria de 3.182 → 957 px
- [x] Coleções no celular: grade compacta 5×2 (miniatura da 1ª peça + número), aria-label com o nome, aria-pressed + fundo azul na escolhida; detalhe sobe de 1.630 → 583 px. Tablet também 5×2 (sem linha sobrando)
- Refutado: "o detalhe não rola ao tocar" (já rolava, título a 75–81 px do topo); "fonte de ~400 px" (a miniatura é um recorte de 188 px; fica mais suave no celular, 2,4×). Só foto de produto resolve (H1)

Recomendações v2.1 (`originais/modificações/recomendacoes-v2-ui-ux.md`), decisões do dono em 2026-10-03:
coleções são apresentação da marca, sem venda por ora; prazo de contato ainda não definido; fotos de produto seguem com o dono.

- [x] Imagens marcadas como ilustração (alt e legenda do modal: "Imagem ilustrativa… Não é foto de produto")
- [x] Status do nome em cada peça: Homenagem ou Reinterpretação (texto, não só cor), e glossário na aba Coleções
- [x] Menu com a seção atual no nome acessível; botão "Baixar kit" na barra (no menu, no celular)
- [x] "Qual arquivo usar" na aba Logo; ZIP como ação principal; RGB/CMYK/Pantone copiáveis
- [x] Versão e data (v2.1 · outubro de 2026) no rodapé e no LEIA-ME
- [x] Contagem de peças nos cards (desktop); "Explore por coleção"; "+ 8 coleções" no hero do celular; título da home 36 px no celular
- [x] Bootstrap servido localmente (`v2/vendor/bootstrap`, mesmos hashes SRI do CDN); coleção inexistente corrige o endereço; `404.html` (vale quando houver hospedagem)
- [x] **Revisão curatorial: Luan Crespo (Departamento de Patrimônio Histórico)**, concluída em 2026-10-03. Itens com status Reinterpretação a confirmar e documentar com fonte: Igreja de São Francisco (Salvador), as cinco devoções da coleção 04, Escadaria Selarón, Calçadão de Copacabana, Casa da Flor, Museu do Inhotim, Orla de Boa Viagem e os motivos da coleção 03. Crédito publicado na aba Coleções (autorizado pelo dono em 2026-10-03), como revisão em andamento
- Refutados (medidos): grade de coleções em 2 colunas no celular, 4 colunas no desktop, "linguagem de compra", lazy-load no hero, indicador de sequência no modal, alvo de 44 px como requisito, hash de build, AVIF/srcset agora, reestruturar o menu em "Kit da marca"

Rodada seguinte (2026-10-03):

- [x] A Marca: manifesto curto, missão em destaque e visão secundária, valores com uma frase e "No manual: …", blocos "Para quem é" e "Como usar este manual"
- [x] Nome e cidade/UF em campos separados no card e no modal
- [x] Contato: link de correção de informação patrimonial (e-mail com assunto preenchido)
- [x] Zoom 200% (1280×800 → 640×400), reflow em 320 px e espaçamento de texto (WCAG 1.4.12) em 6 abas: sem overflow nem texto cortado. Corrigidos: título da home quebrando com espaçamento ampliado, "reveste.com.br" no card de Contato, tabelas da aba Logo viram lista no celular, índice deixa de ser fixo em tela baixa
- [x] Curadoria validada por Luan Crespo em 2026-10-03 e aplicada (detalhes em `docs/curadoria-para-validacao.md`)
- [ ] Questão de direitos da coleção 07 (nome de Athos Bulcão no título): consultar a Fundação Athos Bulcão
