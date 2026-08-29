# KrishiNayan

KrishiNayan is an AI-powered farming copilot that helps farmers detect crop problems early, check weather conditions, receive local-language advice, track recovery, and get nearby crop-risk alerts.

## Shipped Scope

- Active ML crops: Tomato, Maize, Rice
- ML model family: EfficientNetB0 with transfer learning
- Frontend: Next.js
- Backend: FastAPI
- Features: crop disease detection, Grad-CAM explainability, weather-aware advice, soil context, local-language guidance, recovery tracking, crop-health history, policy lookup, chatbot, and officer alerts.
- Product workflows: saved farm plots, plot-linked scans, persistent recovery tasks, scan-history outbreak alerts, and treatment cost estimates.

Wheat and Potato are intentionally not part of the shipped app.

## Quick Start

Backend:

```bash
cd backend
./.venv/bin/python -m uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

For production frontend deployments, set `NEXT_PUBLIC_API_BASE_URL` to the deployed FastAPI backend URL. For production backend deployments, set `KRISHINAYAN_JWT_SECRET` and `FRONTEND_ORIGINS`.

See `docs/deployment.md` for Render/Vercel deployment notes, Supabase
PostgreSQL migration, Supabase Storage settings, CI checks, rate-limit
behavior, and the model-readiness checklist.

## Validation

```bash
cd backend
./.venv/bin/python -m pytest -q

cd ../frontend
npm run lint
npm run build
```

## Folder Structure

- `frontend/` - farmer app and officer dashboard
- `backend/` - FastAPI backend
- `ml/` - model training and evaluation notebooks
- `data/` - dataset links and sample images
- `docs/` - research, PPT notes, and demo scripts
- `assets/` - UI assets, screenshots, and icons
