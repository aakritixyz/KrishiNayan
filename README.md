# 🌾 KrishiNayan

**KrishiNayan** is an AI farming assistant that helps farmers catch crop diseases early. A farmer takes a photo of a leaf, and the app tells them what's wrong, shows them exactly which part of the leaf led to that diagnosis, and gives advice based on the local weather and soil — all in Hindi or English.

Behind the diagnosis is real agronomic data: live weather, government soil health records, and scheme eligibility. Agriculture officers get their own dashboard to see disease trends across their district and send out advisories when needed.

---

## ✨ Key Features

### For Farmers
- **Instant disease diagnosis** — snap or upload a leaf photo and get a diagnosis in seconds, powered by EfficientNetB0 transfer-learning models trained on real disease datasets.
- **Explainable AI (Grad-CAM)** — a heatmap overlay shows *why* the model made its call, highlighting the diseased regions of the leaf.
- **Multi-crop support** — Tomato, Maize, and Rice are live today, each with its own trained model.
- **Weather-aware advisory** — live weather data (via Open-Meteo) is factored into treatment and timing recommendations.
- **Soil context** — soil profile lookups (pH, N-P-K, moisture, organic carbon) by state/district, sourced from real Soil Health Card data for select regions, layered on top of the visual diagnosis without ever overriding it.
- **Hindi language support** — disease names, advisory text, and text-to-speech playback in Hindi, alongside English.
- **AI farmer chatbot** — a retrieval-augmented chatbot answering agronomy questions, grounded in a curated knowledge base (with an optional Claude-powered response layer, and a fully offline fallback).
- **Government scheme lookup** — a policy dashboard that checks a farmer's eligibility for relevant government schemes.
- **Recovery tracking** — persistent, plot-linked recovery task plans and reminders after a diagnosis.
- **Farm plots** — farmers can save multiple plots (crop, growth stage, sowing date, location) and link scans to them.
- **Crop health history** — a running record of past scans and health trends per farmer.
- **Nearby crop alerts** — community-level outbreak alerts built from real scan history, with privacy-preserving location jitter on the public map.

### For Agriculture Officers
- **Officer dashboard** — a scoped view (by assigned state/district) of scan activity, disease hotspots, and farmer outreach.
- **Advisory broadcast** — officers can publish targeted advisories to farmers in their jurisdiction.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React 19), TypeScript, Tailwind CSS, Leaflet/OpenStreetMap for maps |
| Backend | FastAPI (Python), SQLAlchemy ORM |
| ML | TensorFlow / Keras — EfficientNetB0 transfer learning, Grad-CAM explainability |
| Database | SQLite (local dev) / PostgreSQL via Supabase (production) |
| Auth | JWT-based, role-aware (farmer / officer) |
| Storage | Local disk or Supabase Storage (for scan images) |
| External APIs | Open-Meteo (weather), OpenStreetMap Nominatim (reverse geocoding), Anthropic API (optional, for chatbot responses) |

---

## 📂 Project Structure

```
KrishiNayan/
├── frontend/           # Next.js farmer app + officer dashboard
│   └── src/app/        # scan, result, alerts, chatbot, policies, plots,
│                        # recovery, health, profile, officer, auth pages
├── backend/            # FastAPI backend
│   ├── app/
│   │   ├── routes/     # API endpoints (see below)
│   │   ├── services/   # business logic (ML inference, soil, chatbot, etc.)
│   │   ├── models/     # SQLAlchemy models (users, plots, scans, recovery...)
│   │   └── core/       # config, database, auth/security, dependencies
│   ├── models/         # trained .keras models + class name files, per crop
│   └── tests/          # pytest suite
├── ml/                 # training notebooks, dataset prep, evaluation scripts
├── data/                # dataset links / sample images
├── docs/                # deployment notes, training guides
├── supabase/            # Postgres schema + RLS migrations for production
└── assets/              # screenshots, confusion matrix, demo images
```

---

## 🔌 API Overview

| Area | Endpoints |
|---|---|
| Diagnosis | `POST /predict` |
| Crops | `GET /crops` |
| Weather | `GET /weather` |
| Soil | `GET /soil/states`, `/soil/districts`, `/soil/profile` |
| Crop + soil advisory | `GET /crop-soil-advisory/crops`, `/districts`, `""` |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/officer-login`, `/auth/logout`, `GET /auth/me` |
| Profile | `GET/PUT /profile` |
| Farm plots | `GET/POST /plots`, `PUT/DELETE /plots/{id}` |
| Recovery | `GET /recovery/latest`, `/recovery/reminders/upcoming`, `/recovery/{plan_id}`, `PATCH /recovery/tasks/{id}` |
| Crop health | `GET /crop-health/overview` |
| Alerts | `GET /alerts/nearby`, `GET /advisories/nearby` |
| Chatbot | `POST /chatbot/ask` |
| Policy | `GET /policies`, `POST /policies/eligible`, `GET /policies/eligible/me` |
| Voice | `POST /voice/session` |
| Officer | `GET /officer/overview`, `/hotspots`, `/advisories`, `POST /officer/advisories` |
| Ops | `GET /health` |

---

## 🚀 Getting Started

### Backend

```bash
cd backend
python -m venv .venv
./.venv/bin/pip install -r requirements.txt
./.venv/bin/python -m uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8000` by default. For a custom backend URL (e.g. in production), set:

```bash
NEXT_PUBLIC_API_BASE_URL=<your-backend-url>
```

For production backend deployments, also set `KRISHINAYAN_JWT_SECRET` and `FRONTEND_ORIGINS`. See `docs/deployment.md` for full Render/Vercel deployment steps, Supabase migration, and the model-readiness checklist.

### Running Tests

```bash
cd backend
./.venv/bin/python -m pytest -q

cd ../frontend
npm run lint
npm run build
```

---

## 🧠 Machine Learning

- **Architecture**: EfficientNetB0 (transfer learning) fine-tuned per crop.
- **Crops shipped**: Tomato, Maize, Rice (each with its own model + class list; Wheat and Potato were explored during development but are not part of the current shipped app).
- **Explainability**: Grad-CAM heatmaps generated from the model's final convolutional layers, overlaid on the input image.
- **Training artifacts**: notebooks, dataset prep scripts, and evaluation results (confusion matrix, training curves) live in `ml/`.

---

## 🔒 Good to Know Before Deploying

- **Database**: the app uses SQLite while you're developing on your own machine, and switches to Supabase (PostgreSQL) once deployed, with row-level security rules already written in `supabase/migrations/`.
- **Farmer privacy**: the public Nearby Alerts map never shows a farmer's exact location — it nudges every point slightly so nearby outbreaks are visible without exposing anyone's precise field.
- **Chatbot works without internet**: by default it answers from its own knowledge base, no API needed. If you add an `ANTHROPIC_API_KEY`, it upgrades to more natural, conversational answers automatically.

---

## 💡 Why This Exists

A lot of crop damage happens simply because a farmer doesn't know what's wrong with their plant until it's too late, or doesn't know who to ask. KrishiNayan tries to close that gap: point a phone camera at a leaf, and within seconds get a diagnosis, a plain-language explanation of what the AI is actually seeing on the leaf (not just a guess), and next steps that account for the local soil and weather — all in the farmer's own language. Agriculture officers get a bird's-eye view of the same data, so they can spot an outbreak spreading across a district before it's too late to act.

---

## 🗺️ Where This Can Go Next

- **More crops trained end-to-end** — Wheat and Potato already have working data pipelines; they just need models trained and plugged in the same way Tomato, Maize, and Rice already are.
- **Wider soil data coverage** — real government soil data currently covers a handful of states and districts; more can be added over time.
- **Voice-first mode** — for farmers who find reading difficult, letting them ask questions and hear answers by voice instead of typing.
- **Richer chatbot knowledge** — expanding what the AI assistant knows beyond tomato agronomy to cover every crop the app supports.

---

