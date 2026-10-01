import OpenAI from "openai";

function cleanText(value, max = 1000) {
  return String(value ?? "").trim().slice(0, max);
}

function normalize(value) {
  return cleanText(value, 500)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getReasonProfile(reason) {
  const r = normalize(reason);

  if (/violence|frapp|bagarre|coup|bouscul/.test(r)) {
    return {
      category: "violence_physique",
      titleDirection: "Comprendre la violence physique et apprendre à réagir autrement",
      objectives: [
        "identifier les émotions et les déclencheurs possibles sans les présenter comme des excuses",
        "comprendre les risques physiques, relationnels et scolaires d'un geste violent",
        "distinguer se défendre, se mettre en sécurité et se faire justice soi-même",
        "savoir s'éloigner, interrompre l'escalade et prévenir rapidement un adulte",
        "préparer une réaction concrète pour un prochain conflit"
      ],
      avoid: [
        "banaliser les coups",
        "faire croire que prévenir un adulte revient à rapporter",
        "demander à l'élève d'avouer des faits",
        "présenter la provocation comme une justification de la violence"
      ],
      takeaway: "La colère ou la provocation n'autorisent pas à frapper. Se mettre en sécurité, s'éloigner si possible et prévenir un adulte sont des réactions responsables."
    };
  }

  if (/retard/.test(r)) {
    return {
      category: "retards",
      titleDirection: "Comprendre les retards répétés et mieux s'organiser",
      objectives: [
        "identifier des causes concrètes de retard : réveil, préparation, trajet, imprévu, mauvaise anticipation",
        "comprendre ce que l'élève manque en arrivant après le début du cours",
        "mesurer l'effet des retards sur la classe, l'enseignant et sa propre scolarité",
        "construire une routine réaliste : sac, réveil, heure de départ, marge de sécurité",
        "prévoir quoi faire et qui prévenir en cas d'imprévu réel"
      ],
      avoid: [
        "questions génériques sur la colère ou les conflits",
        "parler d'insultes, de violence ou de désaccord sauf si le contexte fourni le justifie",
        "demander systématiquement d'aller voir un adulte sans lien avec la ponctualité"
      ],
      takeaway: "Être à l'heure se prépare souvent avant le départ. Anticiper, organiser ses affaires et prévoir une marge permettent de limiter les retards."
    };
  }

  if (/telephone|portable|smartphone/.test(r)) {
    return {
      category: "telephone",
      titleDirection: "Comprendre l'usage du téléphone au collège et mieux gérer son attention",
      objectives: [
        "comprendre pourquoi l'usage du téléphone peut gêner l'attention et le déroulement d'un cours",
        "identifier les moments où la tentation d'utiliser le téléphone apparaît",
        "réfléchir aux règles du collège et à leur utilité",
        "proposer des stratégies simples : téléphone éteint, rangé, mode silencieux, hors de portée",
        "prévoir une conduite adaptée en cas d'urgence"
      ],
      avoid: [
        "transformer le travail en débat général pour ou contre les smartphones",
        "parler de violence ou de conflit sauf si le contexte le demande",
        "inventer une confiscation ou une sanction précise"
      ],
      takeaway: "Gérer son téléphone, c'est aussi gérer son attention. Le ranger et respecter les règles permet de rester disponible pour le travail."
    };
  }

  if (/travail non fait|devoir|travail.*fait|oubli.*travail/.test(r)) {
    return {
      category: "travail_non_fait",
      titleDirection: "Comprendre le travail non fait et retrouver une organisation efficace",
      objectives: [
        "identifier les causes possibles : oubli, difficulté, manque de temps, mauvaise organisation, consigne mal comprise",
        "distinguer une difficulté réelle d'un manque d'anticipation",
        "comprendre les conséquences sur les apprentissages et le suivi en classe",
        "construire une méthode simple de planification et de vérification",
        "savoir demander de l'aide avant l'échéance lorsque le travail pose problème"
      ],
      avoid: [
        "moraliser sans proposer de méthode",
        "supposer que l'élève n'a pas voulu travailler",
        "parler de conflit ou de violence sans lien avec le contexte"
      ],
      takeaway: "Un travail non fait peut avoir plusieurs causes. S'organiser, vérifier ses échéances et demander de l'aide à temps permet d'éviter que la difficulté s'installe."
    };
  }

  if (/bavard/.test(r)) {
    return {
      category: "bavardages",
      titleDirection: "Comprendre l'impact des bavardages et mieux gérer sa prise de parole",
      objectives: [
        "comprendre comment les bavardages nuisent à sa propre attention",
        "mesurer l'effet sur les camarades et sur le déroulement du cours",
        "identifier les moments où l'envie de parler est la plus forte",
        "trouver des stratégies pour différer une remarque ou une discussion",
        "distinguer participer au cours et discuter hors sujet"
      ],
      avoid: [
        "présenter toute prise de parole comme un problème",
        "parler de colère ou de conflit sans raison",
        "poser uniquement des questions morales"
      ],
      takeaway: "Participer n'est pas bavarder. Savoir choisir le bon moment pour parler aide à apprendre et respecte le travail des autres."
    };
  }

  if (/insulte|propos irrespectueux|irrespect|moquerie/.test(r) && !/harcel/.test(r)) {
    return {
      category: "paroles_irrespectueuses",
      titleDirection: "Mesurer l'impact des paroles et apprendre à exprimer un désaccord autrement",
      objectives: [
        "comprendre que des mots peuvent blesser, humilier ou déclencher une escalade",
        "distinguer désaccord, critique, moquerie et insulte",
        "reformuler une phrase agressive de manière acceptable",
        "réfléchir aux conséquences pour la relation et le climat du groupe",
        "savoir interrompre un échange tendu et demander l'aide d'un adulte si nécessaire"
      ],
      avoid: [
        "demander des excuses forcées",
        "demander de reproduire des insultes précises",
        "inventer l'intention de l'élève"
      ],
      takeaway: "On peut être en désaccord sans humilier ni insulter. Choisir ses mots et interrompre un échange qui s'envenime permet d'éviter l'escalade."
    };
  }

  if (/insolence|adulte|professeur|enseignant/.test(r)) {
    return {
      category: "insolence",
      titleDirection: "Exprimer un désaccord avec un adulte de manière respectueuse",
      objectives: [
        "comprendre qu'un désaccord peut être exprimé sans défi, provocation ni parole blessante",
        "identifier la différence entre contester calmement et manquer de respect",
        "réfléchir au rôle des adultes et au cadre collectif du collège",
        "s'entraîner à reformuler une réponse de manière respectueuse",
        "prévoir comment revenir sur une situation tendue après s'être calmé"
      ],
      avoid: [
        "exiger une soumission aveugle",
        "interdire toute contestation ou toute question",
        "demander des aveux"
      ],
      takeaway: "Respecter un adulte n'empêche pas d'exprimer un désaccord. Le faire calmement et avec des mots adaptés permet d'être entendu sans aggraver la situation."
    };
  }

  if (/harcel|intimid/.test(r)) {
    return {
      category: "harcelement",
      titleDirection: "Comprendre les mécanismes des moqueries répétées et savoir demander de l'aide",
      objectives: [
        "comprendre l'effet de la répétition, de l'isolement et du rapport de force",
        "mesurer l'impact possible sur la personne visée",
        "réfléchir au rôle des témoins",
        "identifier les comportements qui doivent cesser",
        "savoir prévenir un adulte et rechercher de l'aide rapidement"
      ],
      avoid: [
        "faire porter à la victime la responsabilité de régler seule la situation",
        "demander de raconter des éléments personnels inutiles",
        "minimiser par l'humour"
      ],
      takeaway: "Des moqueries répétées ne sont pas anodines. La personne visée et les témoins peuvent demander de l'aide à un adulte afin que la situation soit prise en charge."
    };
  }

  if (/degradation|materiel|casse|abim/.test(r)) {
    return {
      category: "degradation",
      titleDirection: "Comprendre la responsabilité liée au matériel collectif",
      objectives: [
        "comprendre pourquoi le matériel du collège est un bien collectif",
        "identifier les conséquences d'une dégradation pour les autres utilisateurs",
        "réfléchir au coût, au temps de remplacement et aux perturbations possibles sans inventer de montants",
        "chercher des moyens d'éviter qu'un geste impulsif ou négligent se reproduise",
        "réfléchir à des formes de réparation adaptées sans inventer de sanction"
      ],
      avoid: [
        "inventer un prix ou une sanction",
        "présenter toute casse comme volontaire",
        "parler de conflit si le contexte ne l'indique pas"
      ],
      takeaway: "Prendre soin du matériel collectif permet à chacun de l'utiliser. En cas de problème, il faut le signaler et chercher une solution responsable."
    };
  }

  if (/consigne|regle|refus/.test(r)) {
    return {
      category: "consignes",
      titleDirection: "Comprendre l'utilité des consignes et apprendre à réagir en cas de désaccord",
      objectives: [
        "identifier à quoi servent les consignes dans un cadre collectif",
        "comprendre les conséquences possibles d'un refus ou d'un non-respect",
        "distinguer ne pas comprendre, ne pas être d'accord et refuser d'appliquer",
        "savoir demander une explication ou exprimer un désaccord calmement",
        "prévoir une stratégie concrète pour respecter la consigne la prochaine fois"
      ],
      avoid: [
        "présenter toutes les règles comme incontestables",
        "inventer un danger si la consigne n'en comporte pas",
        "parler de violence sans lien avec le contexte"
      ],
      takeaway: "Une consigne peut être questionnée ou expliquée, mais dans un cadre collectif il faut savoir demander des précisions et exprimer un désaccord sans perturber le fonctionnement du groupe."
    };
  }

  return {
    category: "autre",
    titleDirection: `Comprendre la situation liée à « ${cleanText(reason, 140)} » et trouver des solutions adaptées`,
    objectives: [
      "comprendre précisément le comportement ou la difficulté décrite",
      "identifier ses conséquences concrètes pour l'élève, les autres ou le fonctionnement du collège",
      "chercher des alternatives réalistes adaptées au contexte",
      "formuler un objectif personnel simple et vérifiable"
    ],
    avoid: [
      "ajouter automatiquement des thèmes de colère, violence, conflit ou recours à un adulte s'ils ne sont pas liés au motif",
      "inventer des faits ou des intentions"
    ],
    takeaway: "L'objectif est de comprendre les conséquences de ses choix et de préparer une manière plus adaptée d'agir dans une situation similaire."
  };
}

function durationPlan(duration) {
  if (duration <= 15) {
    return "2 sections, 4 à 5 questions au total, réponses courtes mais réfléchies. Pas de longue rédaction.";
  }
  if (duration <= 30) {
    return "3 sections, 7 à 9 questions au total. Prévoir une courte mise en situation ou un mini-plan d'action.";
  }
  if (duration <= 45) {
    return "4 sections, 9 à 12 questions au total, avec une courte rédaction ou une mise en situation développée.";
  }
  return "5 sections, 12 à 15 questions au total, avec une rédaction organisée de 8 à 12 lignes et un bilan concret final.";
}

function stylePlan(style) {
  if (style === "reflexion") {
    return "Privilégie les questions ouvertes, l'analyse des conséquences et un engagement personnel concret.";
  }
  if (style === "situations") {
    return "Utilise plusieurs mises en situation réalistes et demande à l'élève de choisir puis justifier une réaction adaptée.";
  }
  if (style === "texte_questions") {
    return "Commence par un court texte documentaire ou explicatif adapté au niveau, puis pose des questions de compréhension et d'application.";
  }
  return "Mélange compréhension, réflexion, mise en situation et plan d'action concret.";
}

function buildPrompt(payload) {
  const level = cleanText(payload.level, 20);
  const reason = cleanText(payload.reason, 140);
  const duration = Math.max(10, Math.min(120, Number(payload.duration) || 30));
  const context = cleanText(payload.context, 700);
  const additionalInfo = cleanText(payload.additionalInfo, 1000);
  const style = cleanText(payload.style, 60) || "mixte";
  const correction = Boolean(payload.correction);
  const profile = getReasonProfile(reason);

  return `Tu es un concepteur de travaux éducatifs pour un collège français.

Crée une fiche de retenue réellement spécifique au motif indiqué. Le motif doit déterminer le fond du travail : objectifs, vocabulaire, questions, mises en situation, rédaction et conclusion. Ne produis pas un canevas générique auquel tu changes seulement le titre.

ÉLÈVE
- Niveau : ${level}
- Motif : ${reason}
- Durée réelle visée : ${duration} minutes
- Type de travail : ${style}
- Contexte factuel et anonyme fourni par l'adulte : ${context || "aucun"}
- Informations complémentaires / objectif particulier : ${additionalInfo || "aucun"}
- Corrigé enseignant demandé : ${correction ? "oui" : "non"}

CADRE PÉDAGOGIQUE SPÉCIFIQUE AU MOTIF
Catégorie : ${profile.category}
Orientation du titre : ${profile.titleDirection}
Objectifs à faire travailler :
${profile.objectives.map(x => `- ${x}`).join("\n")}

Éléments à éviter :
${profile.avoid.map(x => `- ${x}`).join("\n")}

Idée générale pour la conclusion :
${profile.takeaway}

CALIBRAGE
${durationPlan(duration)}
${stylePlan(style)}

RÈGLES IMPORTANTES
- Le ton doit être calme, éducatif, non humiliant et adapté à ${level}.
- Ne demande jamais d'aveux.
- N'affirme jamais que l'élève a fait quelque chose que le contexte ne dit pas.
- N'invente ni sanction, ni règle précise, ni montant, ni conséquence disciplinaire.
- N'utilise aucune donnée personnelle.
- Ne parle PAS automatiquement de colère, conflit, violence ou recours à un adulte si le motif ne le justifie pas.
- Pour violence, intimidation, harcèlement ou conflit qui dégénère, indique qu'il faut se mettre en sécurité, s'éloigner si possible et prévenir un adulte plutôt que se faire justice soi-même.
- Pour les retards, parle surtout de ponctualité, anticipation, préparation, trajet et conséquences scolaires.
- Pour le téléphone, parle surtout d'attention, règlement, habitudes et stratégies de rangement.
- Pour le travail non fait, parle surtout d'organisation, difficulté, échéances et demande d'aide.
- Les informations complémentaires doivent être fondues naturellement dans 1 à 3 questions ou consignes. N'ajoute jamais une section appelée "Approfondissement demandé", "Consigne complémentaire" ou équivalent.
- Les questions doivent être variées, concrètes et différentes d'un motif à l'autre.
- La dernière partie doit déboucher sur un comportement concret et réaliste à essayer.

TITRE
Choisis un titre spécifique au motif. Évite la formule générique "Réfléchir à son comportement : [motif]" si tu peux faire plus précis.

SORTIE
Réponds uniquement en JSON valide, sans markdown, exactement avec cette structure :
{
  "title": "...",
  "subtitle": "Travail éducatif — ${level}",
  "estimatedMinutes": ${duration},
  "intro": "...",
  "sections": [
    {
      "heading": "...",
      "instructions": "...",
      "questions": ["...", "..."]
    }
  ],
  "takeaway": "...",
  "correction": ${correction ? '["...", "..."]' : "[]"}
}`;
}

function extractJson(text) {
  const raw = String(text || "").trim();
  try {
    return JSON.parse(raw);
  } catch {}

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start >= 0 && end > start) {
    return JSON.parse(raw.slice(start, end + 1));
  }

  throw new Error("Réponse non JSON");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "IA_NON_CONFIGUREE" });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      input: buildPrompt(req.body || {}),
      store: false
    });

    const data = extractJson(response.output_text);

    if (!data || !Array.isArray(data.sections) || !data.sections.length) {
      throw new Error("Structure de réponse invalide");
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "GENERATION_FAILED" });
  }
}
