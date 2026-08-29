# KrishiNayan Deployment Notes

## Backend on Render

Use the `backend/` directory as the service root.

Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Required environment variables:

```bash
KRISHINAYAN_ENV=production
KRISHINAYAN_JWT_SECRET=<long-random-secret>
FRONTEND_ORIGINS=https://your-frontend.vercel.app
KRISHINAYAN_DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME
KRISHINAYAN_LOG_LEVEL=INFO
```

Optional environment variables:

```bash
ANTHROPIC_API_KEY=<optional-llm-key>
KRISHINAYAN_STORAGE_BACKEND=local
KRISHINAYAN_UPLOAD_DIR=/var/data/uploads
KRISHINAYAN_MODEL_PATH=/var/data/models/KrishiNayan_Tomato_EfficientNetB0.keras
```

## Frontend on Vercel

Use the `frontend/` directory as the project root.

Required environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-render-backend.onrender.com
```

## Model Readiness Checklist

The shipped crop set is Tomato, Maize, and Rice. Before a public demo, confirm
the backend health response shows `model_available=true` and
`classes_available=true` for all three:

```bash
curl https://your-backend.example.com/health
```

Expected model files:

- `backend/models/KrishiNayan_Tomato_EfficientNetB0.keras`
- `backend/models/class_names.json`
- `backend/models/maize/KrishiNayan_Maize_EfficientNetB0.keras`
- `backend/models/maize/class_names.json`
- `backend/models/rice/KrishiNayan_Rice_EfficientNetB0.keras`
- `backend/models/rice/class_names.json`

## Production Notes

- SQLite is fine for local demos. Use PostgreSQL for a shared deployment.
- The app stores image paths through `storage_service.py`. Local storage is the
  only configured adapter today; keep uploaded files on a persistent disk or add
  an object-storage adapter before high-volume use.
- Rate limiting is enabled in app code for auth, chatbot, and prediction routes.
  Tests disable it with `KRISHINAYAN_DISABLE_RATE_LIMIT=true`.
- `/health` checks database connectivity and active model-file availability.
