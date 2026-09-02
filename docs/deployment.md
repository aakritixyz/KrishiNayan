# KrishiNayan Deployment Notes

## Backend on Render

Use the `backend/` directory as the service root.

Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Required environment variables:

```bash
PYTHON_VERSION=3.11.11
KRISHINAYAN_ENV=production
KRISHINAYAN_JWT_SECRET=<long-random-secret>
FRONTEND_ORIGINS=https://your-frontend.vercel.app
KRISHINAYAN_DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME
KRISHINAYAN_LOG_LEVEL=INFO
```

Optional environment variables:

```bash
ANTHROPIC_API_KEY=<optional-llm-key>
KRISHINAYAN_STORAGE_BACKEND=supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
SUPABASE_STORAGE_BUCKET=crop-scans
SUPABASE_STORAGE_PUBLIC=false
KRISHINAYAN_MODEL_PATH=/var/data/models/KrishiNayan_Tomato_EfficientNetB0.keras
```

For local-only runs, keep `KRISHINAYAN_STORAGE_BACKEND=local` and set
`KRISHINAYAN_UPLOAD_DIR=/var/data/uploads` on a persistent disk.

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

- SQLite is fine for local demos. Use Supabase PostgreSQL for a shared
  deployment. The Supabase schema/index/RLS migration lives in
  `supabase/migrations/202608290001_initial_schema_and_rls.sql`.
- Render's Python default can move ahead of TensorFlow support. Keep
  `PYTHON_VERSION=3.11.11` set on the backend service; `backend/.python-version`
  is committed as a second guardrail.
- To push migrations through the CLI, run:

```bash
npx supabase link --project-ref tmsjzxzknfjcomivmpjk
npx supabase db push
```

- If you need to migrate old local SQLite data into Supabase, run from
  `backend/`:

```bash
KRISHINAYAN_SOURCE_SQLITE=./storage/krishinayan.db \
KRISHINAYAN_DATABASE_URL='postgresql+psycopg://USER:PASSWORD@HOST:5432/postgres?sslmode=require' \
python scripts/migrate_sqlite_to_postgres.py
```

- For demo environments that start with an empty database, seed a few real
  backend scan records for the Nearby Crop Alerts page:

```bash
python scripts/seed_demo_alerts.py
```

- Supabase Storage is supported by setting
  `KRISHINAYAN_STORAGE_BACKEND=supabase`. Create a private bucket named
  `crop-scans`, then provide `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and
  `SUPABASE_STORAGE_BUCKET`.
- Rate limiting is enabled in app code for auth, chatbot, and prediction routes.
  Successful responses include `X-RateLimit-Limit`,
  `X-RateLimit-Remaining`, and `X-RateLimit-Reset`. Limited responses include
  `Retry-After`. Tests disable limiting with
  `KRISHINAYAN_DISABLE_RATE_LIMIT=true`.
- `/health` checks database connectivity and active model-file availability.
  It also reports whether the configured storage backend is ready.
