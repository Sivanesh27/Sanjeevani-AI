/* ---------- Global state ---------- */
const state = {
  lang: "en",
  patient: { name: "", age: "" },
  catalog: [],
  interactionRules: [],
  cabinet: [], // array of drug ids
};

const els = {};

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  cacheEls();
  bindStaticEvents();
  await loadData();
  renderLangGrid();
  showScreen("lang");
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  maybeRunDebugPreset();
});

/* ---------- Debug/demo preset (used for QA screenshots & quick demos) ----------
   Append ?demo=home|schedule|pharmacist&lang=en|hi|ta to index.html to jump
   straight into a populated screen with sample data. Not part of normal UX. */
function maybeRunDebugPreset() {
  const params = new URLSearchParams(window.location.search);
  const demo = params.get("demo");
  if (!demo) return;
  state.lang = params.get("lang") || "en";
  currentLang = state.lang;
  applyTranslations();
  state.patient.name = params.get("name") || "Lakshmi Ammal";
  state.patient.age = params.get("age") || "68";
  els.patientBadge.textContent = state.patient.name + ", " + state.patient.age;
  const sample = (params.get("meds") || "ramipril,spironolactone,atorvastatin,metformin").split(",");
  state.cabinet = sample;
  showScreen(demo);
}

function cacheEls() {
  document.querySelectorAll("[data-screen]").forEach(s => (els[s.dataset.screen] = s));
  els.langGrid = document.getElementById("langGrid");
  els.onboardName = document.getElementById("onboardName");
  els.onboardAge = document.getElementById("onboardAge");
  els.searchInput = document.getElementById("searchInput");
  els.searchResults = document.getElementById("searchResults");
  els.cabinetList = document.getElementById("cabinetList");
  els.cabinetEmpty = document.getElementById("cabinetEmpty");
  els.riskPanel = document.getElementById("riskPanel");
  els.scheduleBody = document.getElementById("scheduleBody");
  els.pharmacistBody = document.getElementById("pharmacistBody");
  els.scanInput = document.getElementById("scanInput");
  els.scanStatus = document.getElementById("scanStatus");
  els.navBar = document.getElementById("navBar");
  els.patientBadge = document.getElementById("patientBadge");
}

async function loadData() {
  // Data ships as plain JS globals (data/drugs.js, data/interactions.js) rather
  // than fetch()-ed JSON, so the app works when opened straight from disk
  // (file://) with no local server and no CORS/fetch restrictions. Classic
  // top-level scripts share one global lexical scope, so these identifiers
  // (declared with `const` in the data files) are reachable here directly —
  // note they are NOT properties of window.
  state.catalog = typeof DRUGS_DATA !== "undefined" ? DRUGS_DATA : [];
  state.interactionRules = typeof INTERACTIONS_DATA !== "undefined" ? INTERACTIONS_DATA : [];
}

/* ---------- Screen management ---------- */
function showScreen(name) {
  document.querySelectorAll("[data-screen]").forEach(el => el.classList.add("hidden"));
  if (els[name]) els[name].classList.remove("hidden");
  const isAppScreen = ["home", "schedule", "pharmacist"].includes(name);
  document.getElementById("topBarWrap").classList.toggle("hidden", !isAppScreen);
  els.navBar.classList.toggle("hidden", !isAppScreen);
  document.querySelectorAll(".navBtn").forEach(b => b.classList.toggle("active", b.dataset.target === name));
  if (name === "home") renderCabinet();
  if (name === "schedule") renderSchedule();
  if (name === "pharmacist") renderPharmacist();
}

/* ---------- Language step ---------- */
const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
];

function renderLangGrid() {
  els.langGrid.innerHTML = LANGS.map(
    l => `<button class="langCard" data-lang="${l.code}">${l.label}</button>`
  ).join("");
  els.langGrid.querySelectorAll(".langCard").forEach(btn => {
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      currentLang = state.lang;
      applyTranslations();
      showScreen("onboard");
    });
  });
}

function applyTranslations() {
  document.querySelectorAll("[data-t]").forEach(el => (el.textContent = t(el.dataset.t)));
  document.querySelectorAll("[data-t-ph]").forEach(el => (el.placeholder = t(el.dataset.tPh)));
  document.documentElement.lang = state.lang;
}

/* ---------- Onboarding ---------- */
function bindStaticEvents() {
  document.getElementById("onboardForm").addEventListener("submit", e => {
    e.preventDefault();
    state.patient.name = els.onboardName.value.trim() || (state.lang === "hi" ? "रोगी" : state.lang === "ta" ? "நோயாளி" : "Patient");
    state.patient.age = els.onboardAge.value.trim();
    els.patientBadge.textContent = state.patient.name + (state.patient.age ? `, ${state.patient.age}` : "");
    showScreen("home");
  });

  els.searchInput.addEventListener("input", () => {
    const q = els.searchInput.value;
    if (!q) { els.searchResults.innerHTML = ""; return; }
    const matches = fuzzySearchDrugs(q, state.catalog);
    renderSearchResults(matches, q);
  });

  els.scanInput.addEventListener("change", handleScan);

  document.querySelectorAll(".navBtn").forEach(btn => {
    btn.addEventListener("click", () => showScreen(btn.dataset.target));
  });

  document.querySelectorAll(".langSwitch").forEach(btn => {
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      currentLang = state.lang;
      applyTranslations();
      renderCabinet();
      const active = document.querySelector(".navBtn.active");
      if (active) showScreen(active.dataset.target);
    });
  });

  document.getElementById("printBtn").addEventListener("click", () => window.print());
}

function renderSearchResults(matches, query) {
  if (!matches.length) {
    els.searchResults.innerHTML = `<div class="noMatch">${t("noMatch")}</div>`;
    return;
  }
  els.searchResults.innerHTML = matches.map(d => resultRow(d)).join("");
  els.searchResults.querySelectorAll(".resultRow").forEach(row => {
    row.querySelector(".addBtn").addEventListener("click", () => {
      addToCabinet(row.dataset.id);
      els.searchInput.value = "";
      els.searchResults.innerHTML = "";
    });
  });
}

function resultRow(d) {
  const localName = state.lang === "hi" ? d.hi : state.lang === "ta" ? d.ta : "";
  return `<div class="resultRow" data-id="${d.id}">
    <div class="resultIcon">${d.icon}</div>
    <div class="resultInfo">
      <div class="resultName">${d.generic}${localName ? ` · ${localName}` : ""}</div>
      <div class="resultMeta">${d.category} · ${(d.brands || []).join(", ")}</div>
    </div>
    <button class="addBtn">${t("add")}</button>
  </div>`;
}

function addToCabinet(id) {
  if (!state.cabinet.includes(id)) state.cabinet.push(id);
  renderCabinet();
}

function removeFromCabinet(id) {
  state.cabinet = state.cabinet.filter(x => x !== id);
  renderCabinet();
}

/* ---------- Cabinet + risk check ---------- */
function renderCabinet() {
  const drugs = state.cabinet.map(id => state.catalog.find(d => d.id === id)).filter(Boolean);
  els.cabinetEmpty.classList.toggle("hidden", drugs.length > 0);
  els.cabinetList.innerHTML = drugs.map(d => {
    const localName = state.lang === "hi" ? d.hi : state.lang === "ta" ? d.ta : "";
    return `<div class="pillChip">
      <span class="pillIcon">${d.icon}</span>
      <span class="pillName">${d.generic}${localName ? ` · ${localName}` : ""}</span>
      <button class="pillRemove" data-id="${d.id}" title="${t("remove")}">✕</button>
    </div>`;
  }).join("");
  els.cabinetList.querySelectorAll(".pillRemove").forEach(btn => {
    btn.addEventListener("click", () => removeFromCabinet(btn.dataset.id));
  });
  renderRiskPanel(drugs);
}

function renderRiskPanel(drugs) {
  if (drugs.length < 2) {
    els.riskPanel.innerHTML = "";
    return;
  }
  const flagged = checkInteractions(state.cabinet, state.interactionRules);
  const risk = overallRisk(flagged);
  if (!flagged.length) {
    els.riskPanel.innerHTML = `<div class="riskCard allClear">${t("allClear")}<div class="demoNote">${t("demoNote")}</div></div>`;
    return;
  }
  const cards = flagged.map(f => {
    const nameA = drugNameOf(f.pair[0]);
    const nameB = drugNameOf(f.pair[1]);
    const sevClass = f.severity;
    const sevLabel = t(f.severity);
    const spoken = `${sevLabel}. ${nameA} ${state.lang === "en" ? "and" : "+"} ${nameB}. ${f.title[state.lang] || f.title.en}. ${f.explain[state.lang] || f.explain.en}. ${f.advice[state.lang] || f.advice.en}`;
    return `<div class="riskCard ${sevClass}">
      <div class="riskHeader">
        <span class="sevBadge ${sevClass}">${sevLabel}</span>
        <span class="riskPair">${nameA} + ${nameB}</span>
      </div>
      <div class="riskTitle">${f.title[state.lang] || f.title.en}</div>
      <div class="riskRow"><b>${t("why")}:</b> ${f.explain[state.lang] || f.explain.en}</div>
      <div class="riskRow"><b>${t("advice")}:</b> ${f.advice[state.lang] || f.advice.en}</div>
      <button class="speakBtn" data-text="${escapeAttr(spoken)}">${t("speakThis")}</button>
    </div>`;
  }).join("");
  els.riskPanel.innerHTML = `<div class="riskSummary ${risk}">${flagged.length} ${t("risksFound")}</div>${cards}<div class="demoNote">${t("demoNote")}</div>`;
  els.riskPanel.querySelectorAll(".speakBtn").forEach(btn => {
    btn.addEventListener("click", () => speak(btn.dataset.text));
  });
}

function drugNameOf(id) {
  const d = state.catalog.find(x => x.id === id);
  if (!d) return id;
  const localName = state.lang === "hi" ? d.hi : state.lang === "ta" ? d.ta : "";
  return localName ? `${d.generic} (${localName})` : d.generic;
}

function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/* ---------- Voice (Web Speech API) ---------- */
function speak(text) {
  if (!("speechSynthesis" in window)) {
    alert(t("voiceUnavailable"));
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = state.lang === "hi" ? "hi-IN" : state.lang === "ta" ? "ta-IN" : "en-IN";
  utter.rate = 0.92;
  window.speechSynthesis.speak(utter);
}

/* ---------- Simulated / real OCR scan ---------- */
async function handleScan(e) {
  const file = e.target.files[0];
  if (!file) return;
  els.scanStatus.textContent = t("scanning");
  els.scanStatus.classList.remove("hidden");
  try {
    if (window.Tesseract) {
      const { data } = await Tesseract.recognize(file, "eng");
      const text = (data && data.text || "").trim();
      els.scanStatus.classList.add("hidden");
      if (text) {
        const bestLine = text.split(/\n/).map(s => s.trim()).filter(Boolean)[0] || text;
        els.searchInput.value = bestLine.slice(0, 40);
        renderSearchResults(fuzzySearchDrugs(bestLine, state.catalog), bestLine);
        return;
      }
    }
  } catch (err) {
    console.warn("OCR failed, falling back:", err);
  }
  els.scanStatus.classList.add("hidden");
  els.searchResults.innerHTML = `<div class="noMatch">${t("noMatch")}</div>`;
}

/* ---------- Schedule ---------- */
function renderSchedule() {
  const drugs = state.cabinet.map(id => state.catalog.find(d => d.id === id)).filter(Boolean);
  if (!drugs.length) {
    els.scheduleBody.innerHTML = `<div class="emptyState">${t("emptyCabinet")}</div>`;
    return;
  }
  const slots = buildSchedule(drugs);
  els.scheduleBody.innerHTML = ["morning", "afternoon", "night"].map(slot => {
    const items = slots[slot];
    if (!items.length) return "";
    return `<div class="scheduleSlot">
      <div class="slotHeader">${slotIcon(slot)} ${t(slot)}</div>
      <div class="slotItems">
        ${items.map(it => `<div class="slotItem">
          <span class="pillIcon">${it.drug.icon}</span>
          <span class="slotName">${it.drug.generic}</span>
          <span class="foodTag">${t(it.food)}</span>
        </div>`).join("")}
      </div>
    </div>`;
  }).join("") + `<button class="primaryBtn" id="remindBtn">${t("remindMe")}</button>`;

  const remindBtn = document.getElementById("remindBtn");
  if (remindBtn) {
    remindBtn.addEventListener("click", () => {
      const lines = drugs.map(d => `${d.generic}`).join(", ");
      const msg = state.lang === "hi"
        ? `${state.patient.name} जी, आपकी दवा का समय हो गया है: ${lines}`
        : state.lang === "ta"
        ? `${state.patient.name}, உங்கள் மருந்து நேரம்: ${lines}`
        : `${state.patient.name}, it's time for your medicines: ${lines}`;
      speak(msg);
    });
  }
}

function slotIcon(slot) {
  return slot === "morning" ? "🌅" : slot === "afternoon" ? "☀️" : "🌙";
}

// Deterministic demo schedule: category-driven common-sense timing.
function buildSchedule(drugs) {
  const slots = { morning: [], afternoon: [], night: [] };
  drugs.forEach(d => {
    let slot = "morning", food = "afterFood";
    if (d.category.includes("Thyroid")) { slot = "morning"; food = "beforeFood"; }
    else if (d.category.includes("Antidiabetic")) { slot = "morning"; food = "beforeFood"; }
    else if (d.category.includes("Statin")) { slot = "night"; food = "afterFood"; }
    else if (d.category.includes("PPI") || d.category.includes("Proton")) { slot = "morning"; food = "beforeFood"; }
    else if (d.category.includes("Diuretic")) { slot = "morning"; food = "afterFood"; }
    else if (d.category.includes("Antibiotic")) { slot = "afternoon"; food = "afterFood"; }
    slots[slot].push({ drug: d, food });
  });
  return slots;
}

/* ---------- Pharmacist dashboard ---------- */
function renderPharmacist() {
  const drugs = state.cabinet.map(id => state.catalog.find(d => d.id === id)).filter(Boolean);
  const flagged = checkInteractions(state.cabinet, state.interactionRules);
  const risk = overallRisk(flagged);
  const riskLabel = risk === "none" ? "—" : t(risk);
  els.pharmacistBody.innerHTML = `
    <div class="statRow">
      <div class="statCard"><div class="statNum">${drugs.length}</div><div class="statLabel">${t("totalMeds")}</div></div>
      <div class="statCard"><div class="statNum">${flagged.length}</div><div class="statLabel">${t("flaggedPairs")}</div></div>
      <div class="statCard ${risk}"><div class="statNum">${riskLabel}</div><div class="statLabel">${t("riskLevel")}</div></div>
    </div>
    <div class="pharmMedList">
      ${drugs.map(d => `<div class="pharmMedRow"><span class="pillIcon">${d.icon}</span> ${d.generic} <span class="resultMeta">(${d.category})</span></div>`).join("") || `<div class="emptyState">${t("emptyCabinet")}</div>`}
    </div>
    ${flagged.length ? `<div class="pharmFlags">${flagged.map(f => `
      <div class="riskCard ${f.severity}">
        <div class="riskHeader"><span class="sevBadge ${f.severity}">${t(f.severity)}</span>
        <span class="riskPair">${drugNameOf(f.pair[0])} + ${drugNameOf(f.pair[1])}</span></div>
        <div class="riskTitle">${f.title[state.lang] || f.title.en}</div>
        <div class="riskRow"><b>${t("why")}:</b> ${f.explain[state.lang] || f.explain.en}</div>
        <div class="riskRow"><b>${t("advice")}:</b> ${f.advice[state.lang] || f.advice.en}</div>
      </div>`).join("")}</div>` : ""}
  `;
}
