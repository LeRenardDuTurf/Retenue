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
  return String(value ?? "").replace(/[&<>'"]/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"
  }[c]));
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function localProfile(reason) {
  const r = normalize(reason);

  if (/retard/.test(r)) {
    return {
      title: "Comprendre les retards répétés et mieux s'organiser",
      intro: "Arriver à l'heure permet de commencer le cours dans de bonnes conditions, de ne pas manquer les premières consignes et de respecter le travail du groupe. Des retards répétés peuvent avoir plusieurs causes : préparation trop tardive, trajet mal anticipé, réveil difficile ou imprévu. L'objectif de ce travail est d'identifier les causes sur lesquelles on peut agir et de construire des solutions concrètes.",
      sections: [
        ["1. Comprendre les conséquences", "Réponds avec des exemples précis.", [
          "Qu'est-ce qu'un élève peut manquer lorsqu'il arrive après le début d'un cours ?",
          "En quoi un retard peut-il perturber son propre travail ?",
          "En quoi des arrivées répétées après le début du cours peuvent-elles gêner la classe ?"
        ]],
        ["2. Identifier les causes", "Cherche des causes concrètes et réalistes.", [
          "Quelles sont trois causes possibles de retard sur lesquelles un élève peut agir ?",
          "Quelle différence fais-tu entre un imprévu et un manque d'anticipation ?"
        ]],
        ["3. Construire un plan d'organisation", "Propose des solutions que l'on peut réellement appliquer.", [
          "Que peut-on préparer la veille pour gagner du temps le matin ?",
          "Pourquoi prévoir une petite marge avant l'heure de départ peut-il être utile ?",
          "Écris un mini-plan en trois étapes pour arriver à l'heure cette semaine."
        ]]
      ],
      takeaway: "La ponctualité repose souvent sur l'anticipation. Préparer ses affaires, connaître son heure de départ et garder une petite marge permettent de réduire les retards."
    };
  }

  if (/violence|frapp|bagarre|coup|bouscul/.test(r)) {
    return {
      title: "Comprendre la violence physique et apprendre à réagir autrement",
      intro: "Un conflit peut provoquer de la colère, de la frustration ou un sentiment d'injustice. Ces émotions peuvent être fortes, mais elles ne justifient pas de frapper ou de mettre quelqu'un en danger. Lorsqu'une situation devient tendue, il faut chercher à stopper l'escalade, se mettre en sécurité et demander l'aide d'un adulte.",
      sections: [
        ["1. Comprendre les risques", "Réponds avec des phrases complètes.", [
          "Quelles conséquences un coup peut-il avoir pour la personne touchée ?",
          "Comment une bagarre peut-elle rendre un conflit plus grave ?",
          "Pourquoi une provocation ne justifie-t-elle pas de répondre par la violence ?"
        ]],
        ["2. Réagir autrement", "Propose des réactions concrètes.", [
          "Cite trois choses que l'on peut faire lorsqu'on sent que la colère monte.",
          "Pourquoi s'éloigner quelques instants peut-il être utile ?",
          "À quels adultes du collège peut-on demander de l'aide ?"
        ]],
        ["3. Se préparer pour la prochaine fois", "Construis une réponse réaliste.", [
          "Imagine qu'un camarade te provoque : décris étape par étape une réaction sans violence.",
          "Pourquoi prévenir un adulte est-il préférable à vouloir régler le problème soi-même par un coup ?"
        ]]
      ],
      takeaway: "Être en colère n'autorise pas à frapper. S'éloigner, se calmer et prévenir un adulte permettent d'éviter qu'un conflit ne devienne plus grave."
    };
  }

  if (/telephone|portable|smartphone/.test(r)) {
    return {
      title: "Mieux gérer l'usage du téléphone au collège",
      intro: "Un téléphone peut être utile dans la vie quotidienne, mais au collège son usage peut détourner l'attention, interrompre le travail et créer des difficultés lorsqu'il est utilisé au mauvais moment. Ce travail porte sur les habitudes qui permettent de rester concentré et de respecter le cadre collectif.",
      sections: [
        ["1. Comprendre l'impact sur l'attention", "Réponds avec des exemples.", [
          "Pourquoi une notification peut-elle faire perdre le fil d'un cours ?",
          "En quoi regarder son téléphone peut-il aussi distraire les élèves proches ?"
        ]],
        ["2. Identifier les moments à risque", "Réfléchis à des situations concrètes.", [
          "À quels moments peut-on être tenté de consulter son téléphone au collège ?",
          "Quelles solutions permettent d'éviter cette tentation ?"
        ]],
        ["3. Mettre en place une stratégie", "Propose un plan simple.", [
          "Où et comment peux-tu ranger ton téléphone pour ne pas être tenté de l'utiliser ?",
          "Que peux-tu faire si tu attends une information réellement urgente ?"
        ]]
      ],
      takeaway: "Gérer son téléphone, c'est aussi gérer son attention. Le ranger et respecter le cadre permet de rester disponible pour le travail."
    };
  }

  if (/travail non fait|devoir|travail.*fait/.test(r)) {
    return {
      title: "Comprendre le travail non fait et mieux s'organiser",
      intro: "Un travail non fait peut venir d'un oubli, d'un manque d'organisation, d'une difficulté ou d'une consigne mal comprise. L'important est d'identifier la cause réelle et de mettre en place une méthode pour éviter que la situation se répète.",
      sections: [
        ["1. Identifier les causes", "Analyse plusieurs possibilités.", [
          "Quelles sont quatre raisons possibles pour lesquelles un travail peut ne pas être fait ?",
          "Quelle différence y a-t-il entre ne pas comprendre un travail et oublier de le faire ?"
        ]],
        ["2. Comprendre les conséquences", "Relie tes réponses aux apprentissages.", [
          "Qu'est-ce qu'un élève risque de moins bien comprendre s'il ne fait pas régulièrement le travail demandé ?",
          "Pourquoi attendre le dernier moment peut-il rendre le travail plus difficile ?"
        ]],
        ["3. Construire une méthode", "Propose une organisation simple.", [
          "Quel outil peux-tu utiliser pour noter les devoirs et les échéances ?",
          "Quand faut-il demander de l'aide si une consigne n'est pas comprise ?",
          "Écris un plan en trois étapes pour vérifier ton travail avant la prochaine échéance."
        ]]
      ],
      takeaway: "S'organiser, vérifier ses échéances et demander de l'aide à temps permettent d'éviter qu'une difficulté ponctuelle se transforme en retard durable."
    };
  }

  if (/bavard/.test(r)) {
    return {
      title: "Comprendre l'impact des bavardages et mieux gérer sa prise de parole",
      intro: "Parler avec ses camarades est normal, mais les bavardages répétés pendant le travail peuvent faire perdre des informations, gêner les autres et ralentir la classe. L'objectif est d'apprendre à choisir le bon moment pour parler.",
      sections: [
        ["1. Comprendre les effets", "Pense à ton propre travail et à celui du groupe.", [
          "Que peut-on manquer lorsqu'on discute pendant une explication ?",
          "Comment des bavardages répétés peuvent-ils gêner les élèves autour ?"
        ]],
        ["2. Faire la différence", "Compare plusieurs situations.", [
          "Quelle différence y a-t-il entre participer au cours et bavarder hors sujet ?",
          "Dans quelles situations faut-il attendre avant de parler à un camarade ?"
        ]],
        ["3. Trouver des stratégies", "Choisis des solutions réalistes.", [
          "Que peux-tu faire lorsqu'une remarque te vient pendant une explication ?",
          "Quelle règle personnelle pourrais-tu essayer dès le prochain cours ?"
        ]]
      ],
      takeaway: "Participer n'est pas bavarder. Savoir choisir le bon moment pour parler aide à apprendre et respecte le travail des autres."
    };
  }

  return {
    title: `Comprendre la situation : ${reason}`,
    intro: `Ce travail porte sur « ${reason} ». L'objectif est de comprendre les conséquences possibles de cette situation, d'identifier ce qui peut être amélioré et de proposer des solutions réalistes pour la suite.`,
    sections: [
      ["1. Comprendre", "Explique avec tes propres mots.", [
        `Explique ce que signifie « ${reason} » dans le cadre du collège.`,
        "Quelles conséquences concrètes ce comportement ou cette difficulté peut-il avoir ?"
      ]],
      ["2. Chercher des solutions", "Propose des solutions adaptées au motif.", [
        "Qu'est-ce qui pourrait être fait différemment la prochaine fois ?",
        "Quelle solution te paraît la plus réaliste ? Explique pourquoi."
      ]],
      ["3. Construire un objectif", "Formule un engagement simple et vérifiable.", [
        "Quel comportement concret peux-tu essayer d'adopter dès cette semaine ?"
      ]]
    ],
    takeaway: "Comprendre les conséquences de ses choix permet de préparer une réaction plus adaptée et plus efficace pour la suite."
  };
}

function demoWorksheet(p) {
  const profile = localProfile(p.reason);

  let sections = profile.sections.map(([heading, instructions, questions]) => ({
    heading,
    instructions,
    questions: [...questions]
  }));

  if (p.additionalInfo) {
    const target = sections[Math.min(1, sections.length - 1)];
    target.questions.push(
      `En tenant compte de la consigne suivante donnée par l'adulte — « ${p.additionalInfo} » — quelle action concrète peux-tu mettre en place ?`
    );
  }

  if (p.duration <= 15) {
    sections = sections.slice(0, 2);
    sections.forEach(s => { s.questions = s.questions.slice(0, 2); });
  }

  if (p.duration >= 45) {
    sections.push({
      heading: `${sections.length + 1}. Rédaction`,
      instructions: "Rédige un paragraphe organisé de 8 à 12 lignes.",
      questions: [
        `Explique pourquoi le motif « ${p.reason} » peut poser problème au collège, puis présente deux solutions précises pour éviter qu'il se reproduise.`
      ]
    });
  }

  if (p.duration >= 60) {
    sections.push({
      heading: `${sections.length + 1}. Bilan`,
      instructions: "Termine par un objectif personnel concret.",
      questions: [
        "Quelles sont les deux idées les plus importantes que tu retiens de ce travail ?",
        "Quel changement précis peux-tu essayer dès cette semaine ?"
      ]
    });
  }

  const correction = p.correction ? [
    "Les réponses doivent être directement liées au motif choisi.",
    "Les solutions proposées doivent être concrètes, réalistes et adaptées à la vie au collège.",
    "Le bilan final doit faire apparaître un objectif personnel simple et vérifiable."
  ] : [];

  return {
    title: profile.title,
    subtitle: `Travail éducatif — ${p.level}`,
    estimatedMinutes: p.duration,
    intro: profile.intro,
    sections,
    takeaway: profile.takeaway,
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
    setStatus(
      forceDemo ? "Exemple local généré" : "IA indisponible — exemple local généré",
      forceDemo ? "success" : "error"
    );
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
      questions: [...section.querySelectorAll(".question")].map(q =>
        q.textContent.replace(/^\d+\.\s*/, "").trim()
      )
    })),
    correction: [...document.querySelectorAll("#doc-correction li")].map(li => li.textContent.trim())
  };
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(data, payload) {
  const items = loadHistory();

  items.unshift({
    id: Date.now(),
    createdAt: new Date().toISOString(),
    data,
    payload: { ...payload, context: "", additionalInfo: "" }
  });

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
    const when = Number.isNaN(d.getTime()) ? "" : d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });

    return `<div class="history-item" data-history-id="${item.id}">
      <strong>${escapeHtml(item.payload.reason)}</strong>
      <span>${escapeHtml(item.payload.level)} · ${escapeHtml(item.payload.duration)} min · ${escapeHtml(when)}</span>
    </div>`;
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

  document.querySelectorAll(".segment").forEach((x, i) => {
    x.classList.toggle("active", i === 0);
  });

  $("empty-state").classList.remove("hidden");
  $("worksheet").classList.add("hidden");
  ["edit-btn","regen-btn","pdf-btn"].forEach(id => $(id).classList.add("hidden"));

  lastData = null;
  lastPayload = null;
  editMode = false;

  setStatus("Prêt à générer", "idle");
}

form.addEventListener("submit", e => {
  e.preventDefault();
  generate(getPayload());
});

$("demo-btn").addEventListener("click", () => generate(getPayload(), true));
$("regen-btn").addEventListener("click", () => generate(lastPayload || getPayload()));
$("pdf-btn").addEventListener("click", () => {
  if (editMode) setEditMode(false);
  window.print();
});

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
