# KrishiNayan Backend

FastAPI backend for KrishiNayan crop diagnosis, advisories, plot memory,
recovery plans, officer dashboards, and nearby alert summaries.

## Run Locally

```bash
./.venv/bin/python -m uvicorn main:app --reload
```

## Test

```bash
./.venv/bin/python -m pytest -q
```

## Main Endpoints

- `POST /predict` - crop image diagnosis with weather, soil, cost, health, and recovery context
- `GET /crops` - active shipped ML crops
- `GET/POST/PUT/DELETE /plots` - farmer plot records
- `GET /recovery/latest` and `PATCH /recovery/tasks/{task_id}` - persistent treatment workflow
- `GET /alerts/nearby` - scan-history based nearby disease alerts
- `GET /officer/overview` and `GET /officer/hotspots` - officer monitoring dashboard
- `GET /health` - database and active model readiness

See `../docs/deployment.md` for production environment variables and hosting
notes.
