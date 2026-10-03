/* ════════════════════════════════════════════════
   REVESTE v2 — Manual de Identidade Visual
   Navegação por abas, home, coleções (galeria de camisas e camisetas) e modal.
═══════════════════════════════════════════════════ */

// ── DADOS DAS COLEÇÕES ────────────────────────────
const COLLECTIONS = [
  { num: "01", name: "Ladrilhos de Cerâmica", sub: "Igrejas Históricas do Brasil",
    desc: "Geometria e fé em pisos do século XVIII — onde o barroco e o artesanal caminham juntos. As igrejas que dão nome às peças são homenagens criadas pela Reveste, inspiradas na arte sacra de cada cidade.",
    img: "assets/img/collections/collection-01-ceramica.jpeg",
    items: ["Capela do Ouro Velho – Ouro Preto/MG","Igreja das Estrelas Azuis – Olinda/PE","Matriz da Luz Dourada – Sabará/MG","Capela do Jardim Sagrado – Salvador/BA","Igreja dos Arabescos – Congonhas/MG","Capela do Mar e da Terra – João Pessoa/PB"] },
  { num: "02", name: "Caquinhos do Brasil", sub: "Pisos de Casas de Subúrbios Históricas",
    desc: "Fragmentos de pisos antigos que carregam memórias de gerações que construíram seus lares com criatividade. As casas que dão nome às peças são homenagens criadas pela Reveste, inspiradas no subúrbio de cada cidade.",
    img: "assets/img/collections/collection-02-caquinhos-suburbio.jpeg",
    items: ["Casa da Esquina – Rio de Janeiro/RJ","Casa do Quintal – Belém/PA","Casa da Ladeira – Salvador/BA","Casa do Corredor – Recife/PE","Casa do Portão – São Paulo/SP","Casa do Sol – Fortaleza/CE"] },
  { num: "03", name: "Cultivos Flores de Banheiro", sub: "Memória que Floresce",
    desc: "Estampas que nasceram para enfeitar banheiros do subúrbio e atravessaram paredes, gerações e modas.",
    img: "assets/img/collections/collection-03-flores.jpeg",
    items: ["Orquídeas – Madureira/RJ","Rosas e Arabescos – Subúrbio Carioca/RJ","Margaridas – Iracema/Fortaleza/CE","Tomates – Penha/RJ","Flores do Campo – Cachoeirinha/PE"] },
  { num: "04", name: "Azulejos Devocionais", sub: "Fé que Protege o Lar",
    desc: "Herdados da tradição portuguesa, os azulejos devocionais trazem proteção, fé e beleza às fachadas do subúrbio.",
    img: "assets/img/collections/collection-04-devocionais.jpeg",
    items: ["Nossa Senhora Aparecida – Aparecida/SP","Sagrado Coração de Jesus – Recife/PE","São Jorge – Rio de Janeiro/RJ","Santo Antônio – Salvador/BA","Anjo da Guarda – Belém/PA"],
    tees: [{}] },
  { num: "05", name: "Azulejos Portugueses no Brasil", sub: "História que Reveste",
    desc: "Trazidos desde o século XVI, os azulejos contam histórias de fé, cultura e arte que ainda decoram igrejas e palácios. Com exceção da Igreja de São Francisco, em Salvador, os lugares que dão nome às peças são homenagens criadas pela Reveste.",
    img: "assets/img/collections/collection-05-portugueses.jpeg",
    items: ["Igreja de São Francisco – Salvador/BA","Solar da Moldura Dourada – Rio de Janeiro/RJ","Mirante Verde-Mar – Vila Velha/ES","Casa das Rosáceas Azuis – Olinda/PE","Solar das Folhagens – Salvador/BA"],
    tees: [
      { style: "lateral", label: "Estampa lateral" },
      { style: "canto", label: "Estampa de canto", extra: ["Azulejo Português Clássico"] },
      { style: "quadro", label: "Quadro central", extra: ["Azulejo Português Clássico"] },
    ] },
  { num: "06", name: "Azulejos Modernistas no Brasil", sub: "Design que Constrói História",
    desc: "A partir dos anos 1930, a arquitetura moderna brasileira reinventou o azulejo em painéis geométricos e figurativos, como os de Portinari no Palácio Capanema. As estampas levam para a camisa a geometria desse período; os edifícios que dão nome às peças são homenagens criadas pela Reveste.",
    img: "assets/img/collections/collection-06-bauhaus.jpeg",
    items: ["Edifício Meia-Lua – São Paulo/SP","Pavilhão Sol e Mar – Rio de Janeiro/RJ","Marquise das Cores – São Paulo/SP","Casa dos Volumes – São Paulo/SP","Conjunto Morro Alegre – Rio de Janeiro/RJ"],
    tees: [{}] },
  { num: "07", name: "Azulejos Athos Bulcão no Brasil", sub: "Arte que Integra",
    desc: "Composições geométricas marcadas pela precisão, ritmo e harmonia — presentes nos ícones da arquitetura moderna brasileira. As estampas são inspiradas no estilo de Athos Bulcão; os painéis que dão nome às peças são criações da Reveste, não obras do artista.",
    img: "assets/img/collections/collection-07-athos.jpeg",
    items: ["Painel Meia-Lua – Brasília/DF","Painel Cruz do Planalto – Brasília/DF","Painel Asas do Eixo – Brasília/DF","Painel Vento Norte – Brasília/DF","Painel Concreto e Sombra – Brasília/DF","Painel Cerrado Verde – Brasília/DF"],
    tees: [{}] },
  { num: "08", name: "Caquinhos do Brasil", sub: "Arte Popular que Reveste",
    desc: "Caquinhos são cacos de azulejo, louça e cerâmica reaproveitados à mão, uma arte popular que transformou escadarias, casas e calçadas pelo Brasil. Nesta coleção, a técnica reinterpreta paisagens e monumentos brasileiros em estampas.",
    img: "assets/img/collections/collection-08-caquinhos-pop.jpeg",
    items: ["Escadaria Selarón – Rio de Janeiro/RJ","Museu do Inhotim – Brumadinho/MG","Calçadão de Copacabana – Rio de Janeiro/RJ","Igreja de São Francisco – Salvador/BA","Casa da Flor – São Pedro da Aldeia/RJ","Orla de Boa Viagem – Recife/PE"] },
  { num: "09", name: "Ladrilhos Hidráulicos", sub: "Tradição que Dura e Encanta",
    desc: "Feitos de cimento, areia e pigmentos, prensados à mão e curados na água, os ladrilhos hidráulicos chegaram ao Brasil no século XIX e coloriram pisos de casas e casarões por gerações. Cada estampa homenageia um desses pisos. As casas que dão nome às peças são homenagens criadas pela Reveste, inspiradas em pisos típicos de cada cidade.",
    img: "assets/img/collections/collection-09-ladrilhos.jpeg",
    items: [],
    tees: [{ names: ["Casa da Nonna – Santa Teresa/RJ","Villa Miriam – Olinda/PE","Solar do Café – Vassouras/RJ","Casarão do Brás – São Paulo/SP","Jardim da Vovó – Campinas/SP","Pátio das Cores – Salvador/BA"] }] },
  { num: "10", name: "Caquinhos Suburbanos do Brasil", sub: "Memória que Pisa Forte",
    desc: "Pisos montados à mão com cacos de azulejo e lajota nos quintais, varandas e calçadas do subúrbio. Feitos de cacos, mas cheios de identidade: cada estampa é um retrato desse chão brasileiro. Os lugares que dão nome às peças são homenagens criadas pela Reveste, inspiradas no subúrbio de cada cidade.",
    img: "assets/img/collections/collection-10-caquinhos-suburbanos.jpeg",
    items: [],
    tees: [{ names: ["Casa de Vó – Irajá/RJ","Quintal da Tia – Cachoeirinha/PE","Varanda do Samba – Madureira/RJ","Salão do Baile – Olinda/PE","Calçada da Esquina – Penha/RJ","Ladeira das Cores – Salvador/BA"] }] },
];

// Peças de uma coleção: camisas (items) + camisetas (tees, por estilo).
function collPieces(c) {
  const camisas = c.items.map((name, j) => ({
    type: "camisa", name, num: j + 1, label: "",
    img: `assets/img/shirts/coll-${c.num}-piece-${j + 1}.jpeg`,
    thumb: `assets/img/thumbs/shirts/coll-${c.num}-piece-${j + 1}.jpeg`,
  }));
  const camisetas = (c.tees || []).flatMap((g) => {
    const names = (g.names || c.items).concat(g.extra || []);
    return names.map((name, j) => ({
      type: "camiseta", name, num: j + 1, label: g.label || "",
      img: `assets/img/camisetas/coll-${c.num}-${g.style ? g.style + "-" : ""}piece-${j + 1}.jpeg`,
      thumb: `assets/img/thumbs/camisetas/coll-${c.num}-${g.style ? g.style + "-" : ""}piece-${j + 1}.jpeg`,
    }));
  });
  return camisas.concat(camisetas);
}
const TYPE_LABEL = { camisa: "Camisa", camiseta: "Camiseta" };

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
function scrollBehavior() { return reduceMotion.matches ? "auto" : "smooth"; }

function esc(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── NAVEGAÇÃO POR ABAS ────────────────────────────
// Abas: inicio, marca, logo, cores, colecoes, contato. O hash guarda a aba
// (#cores) ou uma seção dentro dela (#usos, #tipografia, #construcao), ou uma
// coleção (#colecoes-07). Os nomes antigos das 9 abas continuam funcionando.
const SECTION_PANE = { construcao: "logo", usos: "logo", tipografia: "cores" };

function initTabs() {
  const menu = document.getElementById("navMenu");
  const toggle = document.getElementById("navToggle");

  function closeMenu() {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
  }

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });

  const baseTitle = document.title;
  const panes = [...document.querySelectorAll(".pane")].map((p) => p.id.slice(5));
  const labels = Object.fromEntries([...document.querySelectorAll(".nav-btn")].map((b) => [b.dataset.pane, b.textContent.trim()]));

  // "Próximo: …" no fim de cada aba (menos a inicial)
  panes.slice(1).forEach((id, i) => {
    const next = panes[i + 2];
    const body = document.querySelector(`#pane-${id} .pane-body`);
    const div = document.createElement("div");
    div.className = "pane-next";
    // seta em SVG: o glifo da Playfair para ↑ e → sai desalinhado
    const arrow = (up) => `<svg class="pane-next-arrow" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${up ? '<path d="M12 19V5M6 11l6-6 6 6"/>' : '<path d="M5 12h14M13 6l6 6-6 6"/>'}</svg>`;
    div.innerHTML = next
      ? `<a href="#${next}"><small>Próximo</small> ${esc(labels[next])} ${arrow(false)}</a>`
      : `<a href="#inicio"><small>Voltar</small> Início ${arrow(true)}</a>`;
    body.appendChild(div);
  });

  function parseHash() {
    const h = location.hash.slice(1);
    const coll = h.match(/^colecoes-(\d{2})$/);
    if (coll) return { pane: "colecoes", coll: coll[1] };
    if (SECTION_PANE[h]) return { pane: SECTION_PANE[h], section: h };
    if (panes.includes(h)) return { pane: h };
    return h ? null : { pane: "inicio" };     // null: hash que não é de aba (ex.: #conteudo)
  }

  function show(target, { focus }) {
    const { pane: id, section, coll } = target;
    document.querySelectorAll(".nav-btn").forEach((b) => {
      const on = b.dataset.pane === id;
      b.classList.toggle("active", on);
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    document.querySelectorAll(".pane").forEach((p) => p.classList.toggle("active", p.id === "pane-" + id));
    const pane = document.getElementById("pane-" + id);
    if (id === "cores") loadSupportFonts();
    document.title = id === "inicio" ? baseTitle : `${labels[id]} · ${baseTitle}`;
    closeMenu();
    if (coll) {
      const idx = COLLECTIONS.findIndex((c) => c.num === coll);
      if (idx >= 0) { selectCollection(idx, { scroll: false }); }
    }
    if (section) {
      const el = document.getElementById("sec-" + section);
      el.scrollIntoView({ behavior: focus ? scrollBehavior() : "auto", block: "start" });
      el.focus({ preventScroll: true });
    } else if (coll) {
      scrollToCollDetail();
      document.querySelector("#collDetail .coll-hero-title").focus({ preventScroll: true });
    } else if (focus) {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
      // leva o foco ao conteúdo novo, para teclado e leitor de tela
      pane.focus({ preventScroll: true });
    }
  }

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (location.hash.slice(1) === btn.dataset.pane) show({ pane: btn.dataset.pane }, { focus: true });
      else location.hash = btn.dataset.pane; // dispara hashchange
    });
  });

  window.addEventListener("hashchange", () => {
    const t = parseHash();
    if (t) show(t, { focus: true });
  });
  show(parseHash() || { pane: "inicio" }, { focus: false });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".brand-nav")) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });
}

// Fontes de apoio (Cormorant e EB Garamond) só aparecem na Tipografia:
// baixa quando a aba Cores e Tipografia abre, e não no carregamento do site.
let supportFontsLoaded = false;
function loadSupportFonts() {
  if (supportFontsLoaded) return;
  supportFontsLoaded = true;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond&family=EB+Garamond&display=swap";
  document.head.appendChild(l);
}

// ── COPIAR HEX (aba Cores) ────────────────────────
function initCopyHex() {
  document.querySelectorAll(".color-hex[data-copy]").forEach((btn) => {
    const hint = btn.querySelector(".copy-hint");
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add("copied"); hint.textContent = "copiado";
        btn.setAttribute("aria-label", btn.dataset.copy + " copiado");
        setTimeout(() => { btn.classList.remove("copied"); hint.textContent = "copiar"; btn.setAttribute("aria-label", "Copiar " + btn.dataset.copy); }, 1600);
      } catch (_) { /* sem permissão de área de transferência: o código continua visível */ }
    });
  });
}

// ── COLEÇÕES ──────────────────────────────────────
let activeColl = 0;

function scrollToCollDetail() {
  const el = document.getElementById("collDetail");
  if (el) el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
}

function selectCollection(idx, { scroll = true } = {}) {
  activeColl = idx;
  activeFilter = "todos";
  renderCollDetail();
  renderCollGrid();
  if (!scroll) return;
  scrollToCollDetail();
  // a grade foi recriada; o foco vai para o título da coleção aberta
  document.querySelector("#collDetail .coll-hero-title").focus({ preventScroll: true });
}


let activeFilter = "todos";

function visiblePieces() {
  const all = collPieces(COLLECTIONS[activeColl]);
  return activeFilter === "todos" ? all : all.filter((p) => p.type === activeFilter);
}

function renderCollDetail() {
  const c = COLLECTIONS[activeColl];
  document.getElementById("collDetail").innerHTML = `
    <div class="coll-hero">
      <img src="${c.img}" alt="${esc(c.name)}" />
      <div class="coll-hero-overlay">
        <p class="coll-hero-sub">${c.num} · ${esc(c.sub)}</p>
        <h2 class="coll-hero-title" tabindex="-1">${esc(c.name)}</h2>
      </div>
    </div>
    <div class="coll-detail">
      <div class="coll-desc-box">
        <span class="coll-box-label">Sobre a Coleção</span>
        <p>${esc(c.desc)}</p>
      </div>
      <div class="coll-gallery-box">
        <div class="gal-head">
          <span class="coll-box-label" id="galLabel">Peças da Coleção</span>
          <div class="gal-filter" id="galFilter" role="group" aria-label="Filtrar peças"></div>
        </div>
        <ul class="gal-grid" id="galGrid" aria-labelledby="galLabel"></ul>
      </div>
    </div>
  `;
  renderGallery();
}

function renderGallery() {
  const all = collPieces(COLLECTIONS[activeColl]);
  const count = { camisa: 0, camiseta: 0 };
  all.forEach((p) => count[p.type]++);
  const filter = document.getElementById("galFilter");
  // o filtro só aparece quando a coleção tem os dois tipos
  if (count.camisa && count.camiseta) {
    const opts = [["todos", "Todos", all.length], ["camisa", "Camisas", count.camisa], ["camiseta", "Camisetas", count.camiseta]];
    filter.innerHTML = opts.map(([k, t, n]) => `
      <button type="button" class="gal-chip ${k === activeFilter ? "active" : ""}" data-filter="${k}"
        aria-pressed="${k === activeFilter}">${t} <span class="gal-count">${n}</span></button>`).join("");
    filter.querySelectorAll(".gal-chip").forEach((b) => b.addEventListener("click", () => {
      activeFilter = b.dataset.filter;
      renderGallery();
      document.querySelector(`.gal-chip[data-filter="${activeFilter}"]`).focus();
    }));
  } else {
    filter.innerHTML = `<span class="gal-only">${count.camisa ? "Camisas" : "Camisetas"} · ${all.length}</span>`;
  }
  document.getElementById("galGrid").innerHTML = visiblePieces().map((p, k) => {
    const tipo = TYPE_LABEL[p.type] + (p.label ? " · " + p.label : "");
    return `
    <li>
      <button type="button" class="gal-card" data-k="${k}"
        aria-label="Ver ${TYPE_LABEL[p.type].toLowerCase()}: ${esc(p.name)}${p.label ? " (" + esc(p.label) + ")" : ""}">
        <span class="gal-img"><img src="${p.thumb}" alt="" loading="lazy" /></span>
        <span class="gal-meta">
          <span class="gal-type">${esc(tipo)}</span>
          <span class="gal-name"><span class="gal-num">${String(p.num).padStart(2, "0")}</span>${esc(p.name)}</span>
        </span>
      </button>
    </li>`;
  }).join("");
  document.querySelectorAll("#galGrid .gal-card").forEach((b) => {
    b.addEventListener("click", () => openShirtModal(visiblePieces(), parseInt(b.dataset.k, 10)));
  });
}

function renderCollGrid() {
  document.getElementById("collGrid").innerHTML = COLLECTIONS.map((c, i) => `
    <div>
      <button type="button" class="coll-grid-thumb ${i === activeColl ? "active" : ""}" data-idx="${i}"
        aria-pressed="${i === activeColl}">
        <img src="${c.img.replace(".jpeg", "-thumb.jpeg")}" alt="" loading="lazy" />
        <span class="body">
          <span class="num">${c.num}</span>
          <span class="nm">${esc(c.name)}</span>
          <span class="sb">${esc(c.sub)}</span>
        </span>
      </button>
    </div>
  `).join("");
  document.querySelectorAll(".coll-grid-thumb").forEach((t) => {
    t.addEventListener("click", () => selectCollection(parseInt(t.dataset.idx, 10)));
  });
}

// ── MODAL "VER CAMISA" ────────────────────────────
let shirtModalInstance = null;
let shirtModalOpen = false;
let modalList = [];
let modalItem = 0;

function renderShirtModal() {
  const c = COLLECTIONS[activeColl];
  const p = modalList[modalItem];
  const total = modalList.length;
  const tipo = TYPE_LABEL[p.type];

  document.getElementById("shirtModalColl").textContent = c.num + " · " + c.name;
  document.getElementById("shirtModalTitle").textContent = p.name;

  const img = document.getElementById("shirtModalImg");
  img.style.width = "";
  img.onload = () => { img.style.width = Math.round(img.naturalWidth * 1.5) + "px"; };
  img.src = p.img;
  img.alt = tipo + " Reveste — " + p.name;

  document.getElementById("shirtModalCaption").innerHTML =
    `<strong>Peça ${String(modalItem + 1).padStart(2, "0")} de ${String(total).padStart(2, "0")}</strong> · ` +
    `${tipo}${p.label ? " (" + esc(p.label.toLowerCase()) + ")" : ""} da coleção <strong>${esc(c.name)}</strong> — ${esc(c.sub)}. ` +
    `Estampa inspirada em <strong>${esc(p.name)}</strong>.`;

  document.getElementById("shirtModalPrev").disabled = modalItem === 0;
  document.getElementById("shirtModalNext").disabled = modalItem === total - 1;
}

function goPrevShirt() { if (modalItem > 0) { modalItem--; renderShirtModal(); } }
function goNextShirt() { if (modalItem < modalList.length - 1) { modalItem++; renderShirtModal(); } }

let shirtModalTrigger = null;

function openShirtModal(list, k) {
  // o Bootstrap só devolve o foco quando o modal abre por data-bs-toggle
  shirtModalTrigger = document.activeElement;
  modalList = list;
  modalItem = k;
  // sem o Bootstrap (CDN fora do ar ou bloqueado), abre a imagem direto
  if (!window.bootstrap) { window.location.href = list[k].img; return; }
  renderShirtModal();
  if (!shirtModalInstance) shirtModalInstance = new bootstrap.Modal(document.getElementById("shirtModal"));
  shirtModalInstance.show();
}

function initShirtModalNav() {
  const modalEl = document.getElementById("shirtModal");
  document.getElementById("shirtModalPrev").addEventListener("click", goPrevShirt);
  document.getElementById("shirtModalNext").addEventListener("click", goNextShirt);

  modalEl.addEventListener("shown.bs.modal", () => { shirtModalOpen = true; });
  modalEl.addEventListener("hidden.bs.modal", () => {
    shirtModalOpen = false;
    if (shirtModalTrigger && shirtModalTrigger.isConnected) shirtModalTrigger.focus();
    shirtModalTrigger = null;
  });

  document.addEventListener("keydown", (e) => {
    if (!shirtModalOpen) return;
    if (e.key === "ArrowLeft")  { e.preventDefault(); goPrevShirt(); }
    if (e.key === "ArrowRight") { e.preventDefault(); goNextShirt(); }
  });

  let sx = 0, sy = 0;
  const body = modalEl.querySelector(".modal-body");
  body.addEventListener("touchstart", (e) => { sx = e.changedTouches[0].clientX; sy = e.changedTouches[0].clientY; }, { passive: true });
  body.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNextShirt(); else goPrevShirt();
    }
  }, { passive: true });
}

// ── INICIALIZAÇÃO ─────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // coleções primeiro: o hash inicial pode abrir uma coleção (#colecoes-07)
  renderCollDetail();
  renderCollGrid();
  initShirtModalNav();
  initCopyHex();
  initTabs();
});
