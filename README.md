# Retenue AI — V2

Application web pour générer des travaux de retenue pédagogiques adaptés au niveau, au motif et à la durée.

## Fonctions

- Niveaux 6e, 5e, 4e et 3e
- Durées 15, 30, 45, 60 minutes ou personnalisées
- Motifs prédéfinis ou personnalisés
- Contexte facultatif et anonyme
- Plusieurs styles de travaux
- Corrigé enseignant facultatif
- Modification du document avant impression
- Impression / export PDF via le navigateur
- Historique local des 12 dernières fiches
- Mode de démonstration sans API
- Génération OpenAI côté serveur uniquement

## Lancer en local

1. Installer Node.js 20+.
2. Dans le dossier du projet :

```bash
npm install
```

3. Pour activer l'IA, définir la clé OpenAI dans l'environnement :

```bash
export OPENAI_API_KEY="votre-cle"
export OPENAI_MODEL="gpt-5.6-luna"
```

Sous Windows PowerShell :

```powershell
$env:OPENAI_API_KEY="votre-cle"
$env:OPENAI_MODEL="gpt-5.6-luna"
```

4. Lancer :

```bash
npm start
```

Puis ouvrir `http://localhost:3000`.

Sans clé API, l'application reste testable avec le bouton **Générer un exemple sans IA**. Si une génération IA échoue, elle bascule automatiquement sur le moteur local.

## Déploiement Vercel

1. Importer ce dossier dans un dépôt GitHub.
2. Importer le dépôt sur Vercel.
3. Ajouter `OPENAI_API_KEY` dans **Project Settings > Environment Variables**.
4. Ajouter éventuellement `OPENAI_MODEL=gpt-5.6-luna`.
5. Déployer.

Le navigateur appelle `/api/generate`; la clé API reste côté serveur et n'est jamais intégrée au JavaScript public.

## Données personnelles

L'application ne demande pas le nom de l'élève pour générer le travail. Le document imprimé contient seulement une ligne vide à remplir à la main. Le contexte facultatif doit rester anonyme. L'historique est enregistré dans `localStorage`, donc uniquement dans le navigateur utilisé.
