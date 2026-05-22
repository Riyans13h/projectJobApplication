# JobFlow Docker Setup

This project has two Docker modes:

- PostgreSQL mode: full stack with PostgreSQL, backend, and frontend.
- SQLite fallback mode: backend uses a persistent SQLite volume when you do not want to run PostgreSQL.

## Full Stack With PostgreSQL

Create a local Docker env file:

```bash
cp .env.example .env
```

Start everything:

```bash
docker compose up --build
```

Open:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8080/api
Swagger:  http://localhost:8080/api/swagger-ui/index.html
```

## SQLite Fallback

Use this if PostgreSQL is not available or you want a simpler local run:

```bash
docker compose -f docker-compose.sqlite.yml up --build
```

SQLite data is stored in the `jobflow_sqlite_data` Docker volume. Uploaded files are stored in the `jobflow_uploads` Docker volume.

## Build Images Only

```bash
docker compose build
```

This creates:

```text
jobflow-backend:latest
jobflow-frontend:latest
```

SQLite fallback build:

```bash
docker compose -f docker-compose.sqlite.yml build
```

This creates:

```text
jobflow-backend:sqlite
jobflow-frontend:sqlite
```

## Environment Notes

For local Docker, the frontend should use:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

For deployment, replace it with your public backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend-host.com/api
```

Cloudinary and AI are optional. If Cloudinary env values are empty, files are saved locally inside the Docker volume.
