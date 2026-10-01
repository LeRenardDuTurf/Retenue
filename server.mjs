import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 3000);
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const mime = {
  ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}
function cleanText(value, max = 1000) { return String(value ?? "").trim().slice(0, max); }
function buildPrompt(payload) {
  const level = cleanText(payload.level, 20);
  const reason = cleanText(payload.reason, 140);
  const duration = Math.max(10, Math.min(120, Number(payload.duration) || 30));
  const context = cleanText(payload.context, 700);
  const additionalInfo = cleanText(payload.additionalInfo, 1000);
  const style = cleanText(payload.style, 60) || "mixte";
  const correction = Boolean(payload.correction);
  return `Tu es un assistant pédagogique pour un collège français. Crée un travail de retenue éducatif adapté à un élève de ${level} et prévu pour environ ${duration} minutes réelles de travail.
Motif : ${reason}. Contexte anonyme : ${context || "aucun"}. Informations complémentaires de l’adulte : ${additionalInfo || "aucune"}. Format : ${style}. Corrigé : ${correction ? "oui" : "non"}.
Le ton doit être calme, éducatif, non humiliant et adapté au niveau. Si des informations complémentaires sont fournies, intègre-les réellement comme objectif, thème, situation ou consigne du travail, sans les recopier mécaniquement ni inventer de nouveaux faits. Ne demande jamais d'aveux et n'invente pas de faits. Pour conflit, violence, insultes, intimidation ou harcèlement, rappeler de se mettre en sécurité, s'éloigner si possible et prévenir un adulte plutôt que se faire justice soi-même. La quantité de travail doit correspondre à la durée.
Réponds uniquement en JSON valide sans markdown : {"title":"...","subtitle":"...","estimatedMinutes":${duration},"intro":"80 à 180 mots","sections":[{"heading":"...","instructions":"...","questions":["...","..."]}],"takeaway":"2 à 4 phrases","correction":${correction ? "[\"...\"]" : "[]"}}`;
}
async function parseJsonBody(req) {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => { data += chunk; if (data.length > 20000) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}
function extractJson(text) {
  const raw = String(text || "").trim();
  try { return JSON.parse(raw); } catch {}
  const start = raw.indexOf("{"); const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
  throw new Error("Réponse non JSON");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === "POST" && url.pathname === "/api/generate") {
    if (!client) return send(res, 503, JSON.stringify({ error: "IA_NON_CONFIGUREE" }));
    try {
      const payload = await parseJsonBody(req);
      const response = await client.responses.create({ model: process.env.OPENAI_MODEL || "gpt-5.6-luna", input: buildPrompt(payload), store: false });
      return send(res, 200, JSON.stringify(extractJson(response.output_text)));
    } catch (error) {
      console.error(error);
      return send(res, 500, JSON.stringify({ error: "GENERATION_FAILED" }));
    }
  }
  if (req.method === "GET") {
    let filePath = url.pathname === "/" ? path.join(publicDir, "index.html") : path.join(publicDir, url.pathname);
    filePath = path.normalize(filePath);
    if (!filePath.startsWith(publicDir)) return send(res, 403, "Forbidden", "text/plain");
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream" });
      return fs.createReadStream(filePath).pipe(res);
    }
  }
  send(res, 404, "Not found", "text/plain; charset=utf-8");
});
server.listen(port, () => console.log(`Retenue AI V2 : http://localhost:${port}`));
