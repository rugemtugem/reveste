/* ════════════════════════════════════════════════
   REVESTE v2 — Manual de Identidade Visual
   Navegação por abas, coleções e modal "Ver camisa".
═══════════════════════════════════════════════════ */

// ── DADOS DAS COLEÇÕES ────────────────────────────
const COLLECTIONS = [
  { num: "01", name: "Ladrilhos de Cerâmica", sub: "Igrejas Históricas do Brasil",
    desc: "Geometria e fé em pisos do século XVIII — onde o barroco e o artesanal caminham juntos.",
    img: "assets/img/collections/collection-01-ceramica.jpeg",
    items: ["Igreja de São Francisco de Assis – Ouro Preto/MG","Igreja do Carmo – Olinda/PE","Igreja de Nossa Senhora do Rosário – Sabará/MG","Igreja de São Pedro dos Clérigos – Salvador/BA","Igreja do Bom Jesus de Matosinhos – Congonhas/MG","Igreja de São Francisco – João Pessoa/PB"] },
  { num: "02", name: "Caquinhos do Brasil", sub: "Pisos de Casas de Subúrbios Históricas",
    desc: "Fragmentos de pisos antigos que carregam memórias de gerações que construíram seus lares com criatividade.",
    img: "assets/img/collections/collection-02-caquinhos-suburbio.jpeg",
    items: ["Casa da Esquina – Rio de Janeiro/RJ","Casa do Quintal – Belém/PA","Casa da Ladeira – Salvador/BA","Casa do Corredor – Recife/PE","Casa do Portão – São Paulo/SP","Casa do Sol – Fortaleza/CE"] },
  { num: "03", name: "Cultivos Flores de Banheiro", sub: "Memória que Floresce",
    desc: "Estampas que nasceram para enfeitar banheiros do subúrbio e atravessaram paredes, gerações e modas.",
    img: "assets/img/collections/collection-03-flores.jpeg",
    items: ["Orquídeas – Madureira/RJ","Rosas e Arabescos – Subúrbio Carioca/RJ","Margaridas – Iracema/Fortaleza/CE","Tomates – Penha/RJ","Flores do Campo – Cachoeirinha/PE"] },
  { num: "04", name: "Azulejos Devocionais", sub: "Fé que Protege o Lar",
    desc: "Herdados da tradição portuguesa, os azulejos devocionais trazem proteção, fé e beleza às fachadas do subúrbio.",
    img: "assets/img/collections/collection-04-devocionais.jpeg",
    items: ["Nossa Senhora Aparecida – Aparecida/SP","Sagrado Coração de Jesus – Recife/PE","São Jorge – Rio de Janeiro/RJ","Santo Antônio – Salvador/BA","Anjo da Guarda – Belém/PA"] },
  { num: "05", name: "Azulejos Portugueses no Brasil", sub: "História que Reveste",
    desc: "Trazidos desde o século XVI, os azulejos contam histórias de fé, cultura e arte que ainda decoram igrejas e palácios.",
    img: "assets/img/collections/collection-05-portugueses.jpeg",
    items: ["Igreja de São Francisco – Salvador/BA","Palácio da Bolsa – Rio de Janeiro/RJ","Convento da Penha – Vitória/ES","Igreja do Carmo – Olinda/PE","Solar do Unhão – Salvador/BA"] },
  { num: "06", name: "Azulejos Bauhaus no Brasil", sub: "Design que Constrói História",
    desc: "Inspirados na escola Bauhaus, representam a presença do movimento moderno em importantes obras arquitetônicas brasileiras.",
    img: "assets/img/collections/collection-06-bauhaus.jpeg",
    items: ["Edifício Copan – São Paulo/SP","Ministério da Educação e Saúde – Rio de Janeiro/RJ","Parque do Ibirapuera – São Paulo/SP","Residência Gregori Warchavchik – São Paulo/SP","Conj. Residencial Pedregulho – Campinas/SP"] },
  { num: "07", name: "Azulejos Athos Bulcão no Brasil", sub: "Arte que Integra",
    desc: "Composições geométricas marcadas pela precisão, ritmo e harmonia — presentes nos ícones da arquitetura moderna brasileira.",
    img: "assets/img/collections/collection-07-athos.jpeg",
    items: ["Palácio da Alvorada – Brasília/DF","Igrejinha da Pampulha – Belo Horizonte/MG","Ministério das Relações Exteriores – Brasília/DF","Teatro Nacional – Brasília/DF","Memorial JK – Brasília/DF","Câmara dos Deputados – Brasília/DF"] },
  { num: "08", name: "Caquinhos do Brasil", sub: "Arte Popular que Reveste",
    desc: "Feitos de fragmentos de azulejos, cerâmicas e vidros — transformando fachadas e espaços públicos em obras de arte.",
    img: "assets/img/collections/collection-08-caquinhos-pop.jpeg",
    items: ["Escadaria Selarón – Rio de Janeiro/RJ","Museu do Inhotim – Brumadinho/MG","Parque do Ibirapuera – São Paulo/SP","Igreja de São Francisco – Salvador/BA","Casa de Cora Coralina – Goiás/GO","Orla de Boa Viagem – Recife/PE"] },
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
function scrollBehavior() { return reduceMotion.matches ? "auto" : "smooth"; }

function pieceImg(coll, pieceIdx) {
  return `assets/img/shirts/coll-${coll.num}-piece-${pieceIdx + 1}.jpeg`;
}
function esc(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── NAVEGAÇÃO POR ABAS ────────────────────────────
function initTabs() {
  const menu = document.getElementById("navMenu");
  const toggle = document.getElementById("navToggle");
  const current = document.getElementById("navCurrent");

  function closeMenu() {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  const baseTitle = document.title;
  const paneIds = [...document.querySelectorAll(".nav-btn")].map((b) => b.dataset.pane);

  // A aba aberta vive no hash (#cores, #colecoes...): dá para mandar o link
  // de uma aba e o botão voltar do navegador funciona.
  function showPane(id, { focus }) {
    const btn = document.querySelector(`.nav-btn[data-pane="${id}"]`);
    document.querySelectorAll(".nav-btn").forEach((b) => {
      b.classList.remove("active");
      b.removeAttribute("aria-current");
    });
    document.querySelectorAll(".pane").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    btn.setAttribute("aria-current", "page");
    const pane = document.getElementById("pane-" + id);
    pane.classList.add("active");
    const label = btn.textContent.trim();
    current.textContent = label;
    document.title = id === paneIds[0] ? baseTitle : `${label} · ${baseTitle}`;
    closeMenu();
    if (focus) {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
      // leva o foco ao conteúdo novo, para teclado e leitor de tela
      pane.focus({ preventScroll: true });
    }
  }

  function paneFromHash() {
    const id = location.hash.slice(1);
    return paneIds.includes(id) ? id : paneIds[0];
  }

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (paneFromHash() === btn.dataset.pane) showPane(btn.dataset.pane, { focus: true });
      else location.hash = btn.dataset.pane; // dispara hashchange
    });
  });

  window.addEventListener("hashchange", () => {
    const id = location.hash.slice(1);
    if (id && !paneIds.includes(id)) return; // ex.: #conteudo do skip link
    showPane(paneFromHash(), { focus: true });
  });
  showPane(paneFromHash(), { focus: false });

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

// ── COLEÇÕES ──────────────────────────────────────
let activeColl = 0;

function scrollToCollDetail() {
  const el = document.getElementById("collDetail");
  if (el) el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
}

function selectCollection(idx) {
  activeColl = idx;
  renderCollSelector();
  renderCollDetail();
  renderCollGrid();
  scrollToCollDetail();
  // os botões clicados foram recriados; o foco vai para o título da coleção
  document.querySelector("#collDetail .coll-hero-title").focus({ preventScroll: true });
}

function renderCollSelector() {
  const sel = document.getElementById("collSelector");
  sel.innerHTML = COLLECTIONS.map((c, i) => `
    <button type="button" class="coll-btn ${i === activeColl ? "active" : ""}" data-idx="${i}"
      aria-pressed="${i === activeColl}" aria-label="Coleção ${c.num}: ${esc(c.name)}, ${esc(c.sub)}">${c.num}</button>
  `).join("");
  sel.querySelectorAll(".coll-btn").forEach((btn) => {
    btn.addEventListener("click", () => selectCollection(parseInt(btn.dataset.idx, 10)));
  });
}

function renderCollDetail() {
  const c = COLLECTIONS[activeColl];
  const piecesHtml = c.items.map((item, j) => `
    <li class="coll-piece">
      <img class="coll-piece-thumb" src="${pieceImg(c, j)}" alt="" aria-hidden="true"
        loading="lazy" data-coll="${activeColl}" data-item="${j}" />
      <span class="coll-piece-name">
        <span class="coll-piece-num">${String(j + 1).padStart(2, "0")}</span>${esc(item)}
      </span>
      <button type="button" class="ver-camisa-btn" data-coll="${activeColl}" data-item="${j}"
        aria-label="Ver camisa: ${esc(item)}">Ver camisa</button>
    </li>
  `).join("");

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
      <div class="coll-list-box">
        <span class="coll-box-label">Peças da Coleção</span>
        <ul>${piecesHtml}</ul>
      </div>
    </div>
  `;

  document.querySelectorAll("#collDetail .ver-camisa-btn").forEach((btn) => {
    btn.addEventListener("click", () => openShirtModal(parseInt(btn.dataset.coll, 10), parseInt(btn.dataset.item, 10)));
  });
  document.querySelectorAll("#collDetail .coll-piece-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => openShirtModal(parseInt(thumb.dataset.coll, 10), parseInt(thumb.dataset.item, 10)));
  });
}

function renderCollGrid() {
  document.getElementById("collGrid").innerHTML = COLLECTIONS.map((c, i) => `
    <div class="col-6 col-md-3">
      <button type="button" class="coll-grid-thumb ${i === activeColl ? "active" : ""}" data-idx="${i}"
        aria-pressed="${i === activeColl}">
        <img src="${c.img}" alt="" loading="lazy" />
        <span class="body">
          <span class="num">${c.num}</span>
          <span class="nm">${esc(c.name)}</span>
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
let modalColl = 0;
let modalItem = 0;

function renderShirtModal() {
  const c = COLLECTIONS[modalColl];
  const total = c.items.length;
  const name = c.items[modalItem];

  document.getElementById("shirtModalColl").textContent = c.num + " · " + c.name;
  document.getElementById("shirtModalTitle").textContent = name;

  const img = document.getElementById("shirtModalImg");
  img.src = pieceImg(c, modalItem);
  img.alt = "Camisa Reveste — " + name;

  document.getElementById("shirtModalCaption").innerHTML =
    `<strong>Peça ${String(modalItem + 1).padStart(2, "0")} de ${String(total).padStart(2, "0")}</strong> · ` +
    `Camisa da coleção <strong>${esc(c.name)}</strong> — ${esc(c.sub)}. ` +
    `Estampa inspirada em <strong>${esc(name)}</strong>.`;

  document.getElementById("shirtModalPrev").disabled = modalItem === 0;
  document.getElementById("shirtModalNext").disabled = modalItem === total - 1;
}

function goPrevShirt() { if (modalItem > 0) { modalItem--; renderShirtModal(); } }
function goNextShirt() { if (modalItem < COLLECTIONS[modalColl].items.length - 1) { modalItem++; renderShirtModal(); } }

let shirtModalTrigger = null;

function openShirtModal(collIdx, itemIdx) {
  // o Bootstrap só devolve o foco quando o modal abre por data-bs-toggle
  shirtModalTrigger = document.activeElement;
  modalColl = collIdx;
  modalItem = itemIdx;
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
  initTabs();
  initShirtModalNav();
  renderCollSelector();
  renderCollDetail();
  renderCollGrid();
});
