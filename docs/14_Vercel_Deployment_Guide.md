# Vercel Deployment Guide (Step by Step)

## AI-Driven Adaptive Learning Platform

| Field | Detail |
|---|---|
| **Document ID** | 14_Vercel_Deployment_Guide |
| **Version** | 1.1 |
| **Date** | 2026-09-03 |
| **Author** | Syed Azan Mehdi Shah |
| **Audience** | Developers and technical operators |

---

## 1. What gets deployed

The platform ships as **one Vercel project** so the frontend and API share a
single domain (no CORS setup needed):

| Piece | Where it lives | What Vercel does with it |
|---|---|---|
| React client | `client/` (Vite) | Built to static files (`client/dist`) and served from the edge |
| Express API | `server/` + `api/index.ts` | Bundled as a single Node.js serverless function behind `/api/*` |
| Shared schemas | `shared/` (`@edu/shared`) | Bundled into the API function automatically |
| Database | MongoDB Atlas (external) | Connected via the `MONGO_URI` environment variable |

The repository already contains the deployment wiring:

- `vercel.json` — build command, static output, `/api/*` routing, SPA fallback, 60s function timeout.
- `api/index.ts` — serverless entry point: connects to MongoDB on first request, runs the idempotent seed (admin + canonical lessons), then hands requests to Express.
- `.vercelignore` — keeps local secrets (`server/.env`, `client/.env`) out of the upload.

---

## 2. Prerequisites

1. A **Vercel account** (free Hobby plan is enough) — https://vercel.com/signup
2. A **MongoDB Atlas** free cluster with a connection string (Section 3).
3. Your **Gemini API keys** (`GEMINI_API_KEY`, optional `GEMINI_API_KEY_2`).
4. Node.js 20+ installed locally (only needed for the CLI method).

---

## 3. Create the MongoDB Atlas database (one-time, ~5 min)

The embedded in-memory MongoDB is for local development only — production must
use a real database.

1. Go to https://cloud.mongodb.com and sign in (Google/GitHub login works).
2. Click **Create** → choose the **Free (M0)** tier → pick the region closest
   to your users → **Deploy Deployment**.
3. When prompted, create a **database user** (e.g. `appuser`) with a strong
   auto-generated password. **Copy the password** — it is shown only once.
4. Under **Network Access**, add IP address `0.0.0.0/0` (allow connections
   from anywhere — required because Vercel function IPs rotate).
5. Click **Connect → Drivers**, select your driver version, and copy the
   connection string. It looks like:

   ```
   mongodb+srv://appuser:<password>@cluster0.ab12c.mongodb.net/adaptive_learning
   ```

   Replace `<password>` with the database user password. This value is your
   `MONGO_URI`.

---

## 4. Method A — Deploy via Vercel Dashboard + GitHub (recommended)

This gives you continuous deployment: every `git push` to the main branch
rebuilds and redeploys automatically.

### 4.1 Push the repository to GitHub

```bash
cd "Educative Ai"
git init
git add .
git commit -m "AI-Driven Adaptive Learning Platform"
```

Create an empty repository on https://github.com (no README), then:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

> The `.env` files are git-ignored; your secrets stay local.

### 4.2 Import the project in Vercel

1. Go to https://vercel.com/new (or **Dashboard → Add New… → Project**).
2. Choose **Import Third-Party Git Repository** → authorize Vercel on GitHub
   → select your repository.
3. On the **Configure Project** screen set:

   | Setting | Value |
   |---|---|
   | Project name | `adaptive-learning-platform` (any name) |
   | Framework preset | **Other** |
   | Root directory | *(leave empty)* |
   | Build command | `npm run build -w @edu/client` |
   | Output directory | `client/dist` |
   | Install command | *(leave default)* |

   The repository's `vercel.json` is picked up automatically and provides the
   API routing — do not add conflicting settings.

### 4.3 Add environment variables (same screen, expand "Environment Variables")

Add each variable for **Production, Preview and Development**:

| Variable | Value | Notes |
|---|---|---|
| `MONGO_URI` | your Atlas connection string | required — the API refuses to start without it |
| `JWT_SECRET` | any long random string (40+ chars) | e.g. output of a password generator |
| `GEMINI_API_KEY` | your Google AI Studio key | powers **Ask AI**; fallback credential for every other AI feature |
| `GEMINI_API_KEY_2` | optional second key | powers diagnostics, evaluations, adaptation, Dojo, Autopilot, Freelance — keeps bulk generation off the chat key |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | primary model |
| `GEMINI_FALLBACK_MODELS` | `gemini-flash-lite-latest,gemini-3-flash-preview` | rollover list on quota/overload |
| `AI_TIMEOUT_MS` | `10000` | per-attempt Gemini timeout |
| `SEED_ADMIN_EMAIL` | e.g. `admin@example.com` | admin account created on first boot |
| `SEED_ADMIN_PASSWORD` | strong password of your choice | for that admin account |
| `MONGOMS_DISABLE_POSTINSTALL` | `1` | stops a dev-only MongoDB binary download during build |

### 4.4 Deploy

Click **Deploy**. The first build takes ~2–4 minutes. When it finishes,
Vercel shows your live URL, e.g. `https://adaptive-learning-platform.vercel.app`.

---

## 5. Method B — Deploy via Vercel CLI (no GitHub needed)

1. **Install the CLI** (one-time):

   ```bash
   npm install -g vercel
   ```

2. **Log in** (one-time — opens your browser):

   ```bash
   vercel login
   ```

   Alternatively create a token at https://vercel.com/account/tokens and use
   `vercel --token <token>` on every command.

3. **Deploy a preview** from the project root:

   ```bash
   cd "Educative Ai"
   vercel
   ```

   Accept the prompts: Set up and deploy? **Y** · Which scope? *your
   account* · Link to existing project? **N** · Project name?
   `adaptive-learning-platform` · Directory? **./ (current)** · Override
   settings? **N** (the `vercel.json` is used).

4. **Add environment variables** — repeat for each row in the table in 4.3
   (the command prompts for the value so it never appears in shell history):

   ```bash
   vercel env add MONGO_URI production
   vercel env add JWT_SECRET production
   vercel env add GEMINI_API_KEY production
   # …and so on
   ```

5. **Deploy to production:**

   ```bash
   vercel --prod
   ```

   Vercel prints the production URL when the build finishes.

---

## 6. Verify the deployment

Work through this checklist against your Vercel URL (replace the domain):

1. **API health** — open `https://<your-app>.vercel.app/api/v1/health`.
   Expected: `{"status":"ok","db":"up","aiMode":"gemini"}`.
   - `aiMode:"mock"` means no Gemini key is set.
   - `db:"down"` or a 503 means `MONGO_URI` is missing/wrong.
2. **Landing page** — open the root URL; the monochrome landing page renders.
3. **Register** — create a student account on `/register`.
4. **Diagnostic** — start the adaptive diagnostic (a Gemini-generated
   multiple-choice question appears when a key is configured).
5. **Lessons** — open a lesson; adaptive rewrite loads for your tier/style.
6. **Practice** — submit code for an exercise; the evaluation panel shows
   AI feedback (source `ai`) within a few seconds.
7. **Ask AI** — send a chat message; the reply arrives from Gemini.
8. **Admin** — sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` on
   `/admin`; the console shows users and submissions.

> First requests after a quiet period can take a few extra seconds (serverless
> cold start + MongoDB connection); warm requests are fast.

---

## 7. Updating the site later

- **Dashboard method:** `git push` — Vercel rebuilds and redeploys
  automatically. Preview deployments are created for branches/PRs.
- **CLI method:** run `vercel --prod` again from the project root.
- **Custom domain:** Vercel dashboard → project → **Settings → Domains** →
  add your domain and follow the DNS instructions. If the frontend and API
  ever live on *different* domains, set `CORS_ORIGIN` on the API project to
  the frontend's exact origin.

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| 503 `SERVICE_UNAVAILABLE` on `/api/*` | `MONGO_URI` missing, wrong password, or Atlas IP allowlist too narrow | Re-check the connection string; ensure network access includes `0.0.0.0/0` |
| `aiMode:"mock"` in health | No Gemini key in the environment | Add `GEMINI_API_KEY` and redeploy |
| AI answers fall back to mock/knowledge intermittently | Free-tier quota or latency spike | Add `GEMINI_API_KEY_2`; the key × model cascade handles the rest |
| Build fails downloading a MongoDB binary | mongodb-memory-server postinstall | Set `MONGOMS_DISABLE_POSTINSTALL=1` |
| Function timeout on AI endpoints | Free-tier Gemini latency bursts | Already mitigated: 60s `maxDuration` in `vercel.json` + bounded cascade |
| Secret leaked by mistake | `.env` committed or uploaded | Verify `.gitignore` / `.vercelignore`; rotate the exposed key immediately |

---

## 9. Cost notes

- **Vercel Hobby**: free — 100 GB bandwidth/month, serverless functions up to
  60 s. Plenty for a hackathon demo and early users.
- **MongoDB Atlas M0**: free — 512 MB storage, shared cluster.
- **Gemini free tier**: per-key, per-model daily request limits. The AI layer
  cascades across both keys and three models, and degrades gracefully to the
  deterministic providers when every option is exhausted, so the site never
  breaks — it only gets less "AI" until quota resets.

---

*Created by Syed Azan Mehdi Shah — AI-Driven Adaptive Learning Platform.*
