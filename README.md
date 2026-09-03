# KrishiNayan

Farmer-first crop care for Indian fields. KrishiNayan turns a leaf photo into
a practical crop-care workflow: diagnosis, confidence, weather and soil context,
treatment cost, recovery tasks, plot history, and nearby outbreak alerts for
officers.

Wheat and Potato are intentionally not part of the shipped app.

## What Is Shipped

- **Crops:** Tomato, Maize and Rice.
- **Disease model:** EfficientNetB0 transfer-learning models served by FastAPI.
- **Confidence guardrail:** predictions below `70%` are marked `uncertain`
  instead of being presented as a confident diagnosis.
- **Input guardrail:** obvious non-leaf uploads are rejected before inference
  with a clear retake message.
- **Explainability:** Grad-CAM support is wired for model-backed inference.
- **Weather:** Open-Meteo current weather with server cache and browser fallback.
- **Soil context:** state/district soil profile advisories.
- **Recovery:** persistent treatment tasks that survive refresh and can be
  marked complete.
- **Plot memory:** scans attach to saved farm plots with crop, stage, sowing
  date, acreage, district/state and GPS.
- **Outbreak alerts:** nearby disease cases are generated from stored scan
  records rather than static alert cards.
- **Officer mode:** regional scan overview, hotspots and advisory publishing.
- **Offline-ready shell:** installable PWA, cached app routes and recent
  weather, soil, profile, plot, recovery, policy, alert and crop-health reads
  where available.

## Why It Has An Edge

Most crop-scan demos stop at "this leaf has disease X." KrishiNayan connects
that diagnosis to the farmer's next week of decisions:

1. Should I trust this result, or is confidence too low?
2. Is the weather safe for spraying?
3. What does my soil/location context change?
4. What will treatment roughly cost?
5. Which plot is affected, and is it recovering?
6. Are nearby farmers seeing the same disease?

That end-to-end loop is the product edge: **diagnose, advise, track recovery,
and warn the community.**

## Model Evidence

The project separates clean training/validation performance from field-style
robustness. This is important because lab datasets such as PlantVillage are
cleaner than phone photos taken in real farms.

| Metric | Crop / dataset | Result | Notes |
| --- | --- | ---: | --- |
| Independent field accuracy | Rice, `ml/data/rice_field`, 200-image balanced sample | **90.5%** | 50 images each from Leaf Blast, Narrow Brown Leaf Spot, Healthy Rice Leaf and Sheath Blight |
| Answered share | Same field sample | **86.0%** | Uses 70% confidence threshold; low-confidence outputs are surfaced as uncertain |
| Leaf Blast field accuracy | Rice field sample | 49 / 50 | Strongest field class in the sample |
| Narrow Brown Leaf Spot field accuracy | Rice field sample | 37 / 50 | Hardest class; called out instead of hidden |
| Healthy Rice Leaf field accuracy | Rice field sample | 49 / 50 | Field healthy-class robustness |
| Sheath Blight field accuracy | Rice field sample | 46 / 50 | Good field performance |

Reproduce the field evaluation:

```bash
cd /Users/Dell/Documents/KrishiNayan
KRISHINAYAN_ENV=development \
KRISHINAYAN_INFERENCE_BACKEND=tensorflow \
./backend/.venv/bin/python ml/evaluate_field_accuracy.py \
  --sample-per-class 50 \
  --seed 42 \
  --output ml/metrics/rice_field_eval_200_seed42.json
```

Existing visual artifacts:

- `assets/confusion_matrix.png`
- `assets/training_curves.png`
- `assets/gradcam_early_blight_demo.png`
- `assets/five_class_prediction_demo.png`

## Honest Inference Modes

KrishiNayan has two backend inference modes:

- `KRISHINAYAN_INFERENCE_BACKEND=tensorflow`: real model inference.
- `KRISHINAYAN_INFERENCE_BACKEND=demo`: low-resource fallback for slow free
  Render demos. It keeps the product workflow responsive but is not a real
  model prediction.

For judging, use `tensorflow` on a host that can handle model cold start. If the
hosted demo is running `demo`, disclose that clearly and show local TensorFlow
inference during the technical walkthrough.

## Architecture

```text
Farmer / officer browser
        |
        v
Next.js PWA frontend
        |
        v
FastAPI backend
        |
        +--> EfficientNetB0 crop models
        +--> Open-Meteo weather
        +--> Soil advisory rules / local RAG corpus
        +--> Supabase PostgreSQL
        +--> Supabase Storage
```

## Quick Start

Backend on port `8001`:

```bash
cd /Users/Dell/Documents/KrishiNayan/backend
source .venv/bin/activate
export KRISHINAYAN_ENV=development
export KRISHINAYAN_DATABASE_URL="sqlite:///./krishinayan.db"
export KRISHINAYAN_JWT_SECRET="local-dev-secret-change-me-32-chars"
export FRONTEND_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

Frontend:

```bash
cd /Users/Dell/Documents/KrishiNayan/frontend
export NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8001"
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Deployment

- Frontend: Vercel, project root `frontend/`
- Backend: Render, service root `backend/`
- Database/storage: Supabase PostgreSQL + private `crop-scans` bucket
- Migration: `supabase/migrations/202608290001_initial_schema_and_rls.sql`

See `docs/deployment.md` for Render/Vercel/Supabase details, rate limits,
storage configuration, and model-readiness checklist.

## Validation

```bash
cd /Users/Dell/Documents/KrishiNayan/backend
KRISHINAYAN_TEST_STUB_TENSORFLOW=true ./.venv/bin/python -m pytest -q

cd /Users/Dell/Documents/KrishiNayan/frontend
npm run lint
npm run build
```

## Known Limitations

- Offline mode caches the app shell and recent reads. New crop scans still need
  backend inference unless a future on-device model is added.
  Set `NEXT_PUBLIC_ENABLE_OFFLINE_SW=true` to test the service worker locally.
- Tomato and maize need the same independent field-evaluation report that rice
  now has.
- Advisory content should be reviewed by a local agronomist before real farmer
  deployment, especially for chemical recommendations and dosage guidance.
- Grad-CAM adds CPU cost and is disabled by default on small production hosts.

## Project Structure

- `frontend/` - farmer app, officer dashboard, PWA shell
- `backend/` - FastAPI API, auth, models, services and tests
- `ml/` - training/evaluation notebooks, field evaluation script and metrics
- `supabase/` - database migration and RLS policies
- `assets/` - training curves, confusion matrix and demo visuals
- `docs/` - deployment and training notes
