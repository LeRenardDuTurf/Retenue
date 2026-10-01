const $ = (id) => document.getElementById(id);
const form = $("generator-form");
const HISTORY_KEY = "retenue-ai-history-v2";
let lastPayload = null;
let lastData = null;
let editMode = false;

const reasonSelect = $("reason");
const customReasonWrap = $("custom-reason-wrap");
const durationSelect = $("duration");
const customDurationWrap = $("custom-duration-wrap");

reasonSelect.addEventListener("change", () => {
  customReasonWrap.classList.toggle("hidden", reasonSelect.value !== "Autre");
});
durationSelect.addEventListener("change", () => {
  customDurationWrap.classList.toggle("hidden", durationSelect.value !== "custom");
});
$("context").addEventListener("input", () => {
  $("context-count").textContent = $("context").value.length;
});
$("additional-info").addEventListener("input", () => {
  $("additional-info-count").textContent = $("additional-info").value.length;
});

document.querySelectorAll(".segment").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    $("style").value = btn.dataset.style;
  });
});

function actualDuration() {
  const raw = durationSelect.value;
  if (raw === "custom") return Math.max(10, Math.min(120, Number($("custom-duration").value) || 30));
  return Number(raw) || 30;
}

function getPayload() {
  const reason = reasonSelect.value === "Autre"
    ? ($("custom-reason").value.trim() || "Comportement à analyser")
    : reasonSelect.value;
  return {
    level: $("level").value,
    reason,
    duration: actualDuration(),
    context: $("context").value.trim(),
    additionalInfo: $("additional-info").value.trim(),
    style: $("style").value,
    correction: $("correction").checked
  };
}

function setStatus(message, type = "idle") {
  $("status").textContent = message;
  const dot = $("status-dot");
  dot.className = `status-dot ${type}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

function demoWorksheet(p) {
  const sourceText = `${p.reason} ${p.context} ${p.additionalInfo || ""}`;
  const violence = /violence|frapp|bagarre|coup/i.test(sourceText);
  const respect = /insult|insolen|respect|moquer|harc/i.test(sourceText);
  const work = /travail|bavard|téléphone|retard|consigne/i.test(sourceText);

  let intro = `Une retenue n'est pas seulement un temps de sanction : elle doit permettre de comprendre ce qui s'est passé et de réfléchir à une manière plus adaptée d'agir. Ce travail porte sur « ${p.reason} ». Lis chaque consigne attentivement et réponds avec des phrases complètes. Il ne s'agit pas de chercher une excuse, mais d'identifier les conséquences possibles d'un comportement et les solutions qui peuvent éviter que la même situation se reproduise.`;
  let takeaway = "Prendre le temps de réfléchir avant d'agir permet souvent d'éviter qu'une situation ne s'aggrave. Demander de l'aide à un adulte est une solution responsable lorsqu'un problème devient difficile à gérer seul.";
  let sections = [
    { heading: "1. Comprendre la situation", instructions: "Réponds précisément et avec tes propres mots.", questions: [
      `Explique ce que signifie le motif « ${p.reason} » dans le cadre du collège.`,
      "Quelles conséquences ce type de comportement peut-il avoir pour les autres élèves ?",
      "Quelles conséquences peut-il avoir pour le fonctionnement de la classe ou du collège ?"
    ]},
    { heading: "2. Prendre du recul", instructions: "Essaie de regarder la situation depuis plusieurs points de vue.", questions: [
      "Quelles émotions peuvent pousser quelqu'un à réagir trop vite ?",
      "Pourquoi une réaction prise sous le coup de la colère ou de l'agacement peut-elle aggraver le problème ?",
      "Que pourrait ressentir une autre personne présente dans cette situation ?"
    ]},
    { heading: "3. Trouver des alternatives", instructions: "Propose des solutions concrètes et réalistes.", questions: [
      "Donne trois façons de réagir autrement pour éviter que la situation ne se reproduise.",
      "À quel moment faut-il demander l'aide d'un adulte ?",
      "Quelle solution te paraît la plus facile à mettre en pratique ? Explique pourquoi."
    ]},
    { heading: "4. Engagement personnel", instructions: "Formule un objectif simple que tu pourrais réellement appliquer.", questions: [
      "La prochaine fois qu'une situation semblable se présente, quelle sera ta première réaction ?",
      "Quelle phrase pourrais-tu te dire pour prendre quelques secondes avant d'agir ?"
    ]}
  ];

  if (violence) {
    intro = "Un conflit peut provoquer de la colère, de la frustration ou un sentiment d'injustice. Ressentir ces émotions est normal, mais utiliser la violence physique peut blesser quelqu'un et rendre le conflit plus grave. Lorsqu'une situation devient tendue, la priorité est de se mettre en sécurité, de s'éloigner si possible et de prévenir un adulte du collège. Demander de l'aide n'est pas une faiblesse : c'est une manière responsable d'éviter l'escalade. Ce travail te demande de réfléchir aux conséquences d'un geste violent et aux solutions possibles pour agir autrement.";
    takeaway = "Être en colère n'autorise pas à frapper. S'éloigner, se calmer et prévenir un adulte permettent d'éviter qu'un conflit ne devienne plus grave. Demander de l'aide est une réaction responsable.";
    sections[2].questions = [
      "Cite trois réactions possibles lorsqu'un conflit commence, sans utiliser la violence.",
      "À quels adultes du collège peut-on demander de l'aide ?",
      "Pourquoi prévenir un adulte est-il préférable à vouloir régler le problème soi-même par un coup ?"
    ];
  } else if (respect) {
    takeaway = "Le respect ne signifie pas être d'accord avec tout le monde. Il consiste à exprimer un désaccord sans humilier, insulter ou mettre quelqu'un en difficulté. Un adulte peut aider lorsque le conflit ne se règle pas calmement.";
  } else if (work) {
    takeaway = "Respecter les règles de travail permet à chacun d'apprendre dans de bonnes conditions. Lorsqu'une difficulté empêche de respecter une consigne, il vaut mieux l'expliquer et demander de l'aide plutôt que laisser le problème s'installer.";
  }

  if (p.additionalInfo) {
    sections.splice(Math.min(3, sections.length), 0, {
      heading: "Approfondissement demandé",
      instructions: "Réponds à cette partie en tenant compte de la consigne complémentaire donnée par l’adulte.",
      questions: [
        "Quelle idée importante dois-tu retenir en lien avec cette consigne complémentaire ?",
        "Donne un exemple concret de la manière dont tu pourrais l’appliquer au collège."
      ]
    });
  }

  if (p.duration <= 15) sections = sections.slice(0, 2);
  if (p.duration >= 45) sections.push({ heading: "5. Rédaction", instructions: "Rédige un paragraphe organisé de 8 à 12 lignes.", questions: ["Explique comment un petit problème peut devenir plus grave lorsqu'on réagit sans réfléchir, puis propose une manière de l'éviter."] });
  if (p.duration >= 60) sections.push({ heading: "6. Bilan", instructions: "Prends du recul sur l'ensemble du travail.", questions: ["Quelles sont les deux idées les plus importantes que tu retiens ?", "Quel comportement concret peux-tu essayer d'adopter dès cette semaine ?"] });

  const correction = p.correction ? [
    "Les réponses doivent identifier des conséquences concrètes pour l'élève, les autres et le groupe.",
    "Les alternatives attendues privilégient le calme, la prise de distance, le dialogue et le recours à un adulte.",
    "La réflexion personnelle peut varier : l'essentiel est qu'elle soit cohérente, respectueuse et réalisable."
  ] : [];

  return {
    title: `Réfléchir à son comportement : ${p.reason}`,
    subtitle: `Travail de réflexion — ${p.level}`,
    estimatedMinutes: p.duration,
    intro,
    sections,
    takeaway,
    correction
  };
}

function render(data, payload, opts = {}) {
  lastData = data;
  lastPayload = payload;
  $("empty-state").classList.add("hidden");
  $("worksheet").classList.remove("hidden");
  ["edit-btn","regen-btn","pdf-btn"].forEach(id => $(id).classList.remove("hidden"));

  $("doc-title").textContent = data.title || "Travail de retenue";
  $("doc-subtitle").textContent = data.subtitle || payload.reason;
  $("doc-level").textContent = payload.level;
  $("doc-duration").textContent = `${data.estimatedMinutes || payload.duration} min`;
  $("doc-intro").textContent = data.intro || "";
  $("doc-takeaway").textContent = data.takeaway || "";

  const sections = Array.isArray(data.sections) ? data.sections : [];
  $("doc-sections").innerHTML = sections.map((section, sIndex) => {
    const qs = Array.isArray(section.questions) ? section.questions : [];
    const linesPerQuestion = payload.duration >= 45 ? 3 : 2;
    return `<section class="section">
      <h3 class="editable" contenteditable="false">${escapeHtml(section.heading || `Partie ${sIndex + 1}`)}</h3>
      <p class="instructions editable" contenteditable="false">${escapeHtml(section.instructions || "")}</p>
      ${qs.map((q, i) => `<div class="question editable" contenteditable="false">${i + 1}. ${escapeHtml(q)}</div><div class="answer-lines">${Array.from({length: linesPerQuestion}, () => '<div class="answer-line"></div>').join("")}</div>`).join("")}
    </section>`;
  }).join("");

  const corrEl = $("doc-correction");
  const corr = Array.isArray(data.correction) ? data.correction : [];
  if (payload.correction && corr.length) {
    corrEl.classList.remove("hidden");
    corrEl.innerHTML = `<h3>Corrigé / éléments attendus</h3><ul>${corr.map(x => `<li class="editable" contenteditable="false">${escapeHtml(x)}</li>`).join("")}</ul>`;
  } else {
    corrEl.classList.add("hidden");
    corrEl.innerHTML = "";
  }

  setEditMode(false);
  if (!opts.fromHistory && $("save-history").checked) saveHistory(data, payload);
}

async function generate(payload, forceDemo = false) {
  lastPayload = payload;
  $("generate-btn").disabled = true;
  $("generate-label").textContent = "Génération…";
  setStatus("Génération du travail…", "loading");

  try {
    if (forceDemo) throw new Error("DEMO");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("API indisponible");
    const data = await res.json();
    render(data, payload);
    setStatus("Travail généré par l’IA", "success");
  } catch (error) {
    render(demoWorksheet(payload), payload);
    setStatus(forceDemo ? "Exemple local généré" : "IA indisponible — exemple local généré", forceDemo ? "success" : "error");
  } finally {
    $("generate-btn").disabled = false;
    $("generate-label").textContent = "Générer le travail";
  }
}

function setEditMode(enabled) {
  editMode = enabled;
  $("worksheet").classList.toggle("edit-mode", enabled);
  $("edit-btn").textContent = enabled ? "Terminer" : "Modifier";
  document.querySelectorAll("#worksheet .editable, #doc-title, #doc-subtitle").forEach(el => {
    el.setAttribute("contenteditable", enabled ? "true" : "false");
  });
  if (enabled) setStatus("Mode modification activé", "idle");
  else if (lastData) setStatus("Document prêt", "success");
}

function collectEditedData() {
  if (!lastData) return null;
  const sectionEls = [...document.querySelectorAll("#doc-sections .section")];
  return {
    ...lastData,
    title: $("doc-title").textContent.trim(),
    subtitle: $("doc-subtitle").textContent.trim(),
    intro: $("doc-intro").textContent.trim(),
    takeaway: $("doc-takeaway").textContent.trim(),
    sections: sectionEls.map(section => ({
      heading: section.querySelector("h3")?.textContent.trim() || "",
      instructions: section.querySelector(".instructions")?.textContent.trim() || "",
      questions: [...section.querySelectorAll(".question")].map(q => q.textContent.replace(/^\d+\.\s*/, "").trim())
    })),
    correction: [...document.querySelectorAll("#doc-correction li")].map(li => li.textContent.trim())
  };
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(data, payload) {
  const items = loadHistory();
  items.unshift({ id: Date.now(), createdAt: new Date().toISOString(), data, payload: { ...payload, context: "", additionalInfo: "" } });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 12)));
  updateHistoryUI();
}
function updateHistoryUI() {
  const items = loadHistory();
  $("history-count").textContent = items.length;
  const list = $("history-list");
  if (!items.length) {
    list.innerHTML = '<div class="history-empty">Aucune fiche enregistrée pour le moment.</div>';
    return;
  }
  list.innerHTML = items.map(item => {
    const d = new Date(item.createdAt);
    const when = Number.isNaN(d.getTime()) ? "" : d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    return `<div class="history-item" data-history-id="${item.id}"><strong>${escapeHtml(item.payload.reason)}</strong><span>${escapeHtml(item.payload.level)} · ${escapeHtml(item.payload.duration)} min · ${escapeHtml(when)}</span></div>`;
  }).join("");
  list.querySelectorAll(".history-item").forEach(el => {
    el.addEventListener("click", () => {
      const item = items.find(x => String(x.id) === el.dataset.historyId);
      if (!item) return;
      render(item.data, item.payload, { fromHistory: true });
      setStatus("Fiche chargée depuis l’historique", "success");
      closeHistory();
    });
  });
}

function openHistory() {
  updateHistoryUI();
  $("history-drawer").classList.add("open");
  $("history-drawer").setAttribute("aria-hidden", "false");
  $("backdrop").classList.remove("hidden");
}
function closeHistory() {
  $("history-drawer").classList.remove("open");
  $("history-drawer").setAttribute("aria-hidden", "true");
  $("backdrop").classList.add("hidden");
}
function resetApp() {
  form.reset();
  reasonSelect.dispatchEvent(new Event("change"));
  durationSelect.dispatchEvent(new Event("change"));
  $("context-count").textContent = "0";
  $("additional-info-count").textContent = "0";
  $("style").value = "mixte";
  document.querySelectorAll(".segment").forEach((x, i) => x.classList.toggle("active", i === 0));
  $("empty-state").classList.remove("hidden");
  $("worksheet").classList.add("hidden");
  ["edit-btn","regen-btn","pdf-btn"].forEach(id => $(id).classList.add("hidden"));
  lastData = null; lastPayload = null; editMode = false;
  setStatus("Prêt à générer", "idle");
}

form.addEventListener("submit", e => { e.preventDefault(); generate(getPayload()); });
$("demo-btn").addEventListener("click", () => generate(getPayload(), true));
$("regen-btn").addEventListener("click", () => generate(lastPayload || getPayload()));
$("pdf-btn").addEventListener("click", () => { if (editMode) setEditMode(false); window.print(); });
$("edit-btn").addEventListener("click", () => {
  if (editMode) lastData = collectEditedData() || lastData;
  setEditMode(!editMode);
});
$("history-btn").addEventListener("click", openHistory);
$("close-history").addEventListener("click", closeHistory);
$("backdrop").addEventListener("click", closeHistory);
$("clear-history").addEventListener("click", () => {
  if (!confirm("Effacer tout l’historique local ?")) return;
  localStorage.removeItem(HISTORY_KEY);
  updateHistoryUI();
});
$("reset-btn").addEventListener("click", resetApp);

updateHistoryUI();
