# eSurat - Pelayanan Publik

Monorepo minimal: `backend/` (Node.js + Express) dan `frontend/` (React + Vite).

Quick start (backend):

1. Copy `backend/.env.example` to `backend/.env` dan isi variabel.
2. Buat database MySQL dan jalankan `backend/models/schema.sql` untuk membuat tabel.
3. Install dependencies dan jalankan:

```bash
cd backend
npm install
npm run dev
```

Quick start (frontend):

```bash
cd frontend
npm install
npm run dev
```

Untuk produksi: build frontend (`npm run build`) dan deploy backend container ke ECS/ECR atau server pilihan.

## GitHub Actions deployment

Workflow deploy otomatis ada di [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Required GitHub Secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Workflow ini akan:

1. Build dan push backend image ke ECR `repo-esurat`
2. Build dan push frontend image ke ECR `repo-esurat-frontend`
3. Force new deployment untuk ECS service backend `esurat-task-service`
4. Force new deployment untuk ECS service frontend `esurat-task-fe-service`

Trigger:

- Push ke branch `main`
- Manual lewat tab Actions
