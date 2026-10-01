import OpenAI from "openai";

function cleanText(value, max = 1000) {
  return String(value ?? "").trim().slice(0, max);
}

function buildPrompt(payload) {
  const level = cleanText(payload.level, 20);
  const reason = cleanText(payload.reason, 140);
  const duration = Math.max(10, Math.min(120, Number(payload.duration) || 30));
  const context = cleanText(payload.context, 700);
  const additionalInfo = cleanText(payload.additionalInfo, 1000);
  const style = cleanText(payload.style, 60) || "mixte";
  const correction = Boolean(payload.correction);

  return `Tu es un assistant pédagogique pour un collège français. Crée un travail de retenue éducatif adapté à un élève de ${level} et prévu pour environ ${duration} minutes réelles de travail.

Motif : ${reason}
Contexte anonyme : ${context || "aucun"}
Informations complémentaires de l’adulte : ${additionalInfo || "aucune"}
Format : ${style}
Corrigé enseignant : ${correction ? "oui" : "non"}

Contraintes :
- ton calme, éducatif, non humiliant et adapté au niveau ;
- ne demande jamais d'aveux et n'invente pas de faits ;
- n'utilise aucune donnée personnelle ;
- si le sujet concerne conflit, violence, insultes, intimidation ou harcèlement, rappelle qu'il faut se mettre en sécurité, s'éloigner si possible et prévenir un adulte plutôt que se faire justice soi-même ;
- adapte réellement la quantité de travail à la durée ;
- intègre les informations complémentaires comme objectifs ou consignes utiles sans les recopier mécaniquement.

Réponds uniquement en JSON valide sans markdown, avec cette structure :
{"title":"...","subtitle":"...","estimatedMinutes":${duration},"intro":"...","sections":[{"heading":"...","instructions":"...","questions":["..."]}],"takeaway":"...","correction":${correction ? '["..."]' : "[]"}}`;
}

function extractJson(text) {
  const raw = String(text || "").trim();
  try { return JSON.parse(raw); } catch {}
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
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

    return res.status(200).json(extractJson(response.output_text));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "GENERATION_FAILED" });
  }
}
