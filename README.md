# ONGC Well Operations API

A submission-ready REST API that performs CRUD operations on ONGC well-operation records.

## Live deployment

- API: https://ongc-well-operations-api.onrender.com
- Swagger UI: https://ongc-well-operations-api.onrender.com/api-docs
- Health check: https://ongc-well-operations-api.onrender.com/health
- Source code: https://github.com/patel31/ongc-well-operations-api

Deployed on Render with a Neon PostgreSQL database. The complete live CRUD acceptance test passed on 21 November 2026.

Company and API consumers should start with the [complete integration guide](docs/API_DOCUMENTATION.md). A ready-to-import [Postman collection](docs/ONGC_Well_Operations.postman_collection.json) is also included.

## Fields

| API field | Type | Required | Rule |
|---|---|---:|---|
| `wellNo` | string | Yes | Unique, 1–50 characters |
| `job` | string | Yes | 1–200 characters |
| `purpose` | string | Yes | 1–2000 characters |
| `dateTime` | ISO 8601 date-time | Yes | Must include a timezone, for example `2026-11-07T10:30:00+05:30` |

The database also adds `id`, `createdAt`, and `updatedAt` automatically.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API information |
| GET | `/health` | API and database health |
| GET | `/api-docs` | Interactive Swagger UI |
| GET | `/openapi.json` | OpenAPI specification |
| POST | `/api/v1/well-operations` | Create a record |
| GET | `/api/v1/well-operations?page=1&limit=20` | List records |
| GET | `/api/v1/well-operations/:id` | Get one record |
| PUT | `/api/v1/well-operations/:id` | Replace a record |
| DELETE | `/api/v1/well-operations/:id` | Delete a record |

## Run locally

Requirements: Node.js 20+ and a PostgreSQL database.

```bash
npm install
copy .env.example .env
# Edit .env and insert your PostgreSQL DATABASE_URL
npm start
```

On macOS/Linux, use `cp .env.example .env`. Open `http://localhost:3000/api-docs` to test every endpoint in the browser. The table is created automatically when the API starts.

Run the automated tests with:

```bash
npm test
```

## Quick request example

```bash
curl -X POST http://localhost:3000/api/v1/well-operations \
  -H "Content-Type: application/json" \
  -d '{"wellNo":"ONGC-WELL-101","job":"Drilling","purpose":"Exploratory drilling operation","dateTime":"2026-11-07T10:30:00+05:30"}'
```

## Free deployment

The recommended setup is:

- API hosting: Render free web service
- Database: Neon free PostgreSQL
- Source control: GitHub

Complete account-by-account instructions are in [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md). The included `render.yaml` supplies the Render settings.

## Project structure

```text
src/                 API, validation, database and OpenAPI code
tests/               Automated API tests
database/schema.sql  Database design for review/manual setup
docs/                Submission and deployment documentation
render.yaml          Render deployment configuration
Dockerfile           Portable production container
```

## Important free-tier note

Render free web services sleep after inactivity, so the first request can take about a minute. This is suitable for a demonstration/college submission, not a production ONGC system. Do not store real confidential ONGC data in this student deployment.
