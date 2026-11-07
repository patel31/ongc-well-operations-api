# ONGC Well Operations Management API

## Project documentation and deployment guide

**Project type:** College project / ONGC submission  
**Version:** 1.0.0  
**Prepared:** 7 November 2026  
**Technology:** Node.js, Express.js, PostgreSQL

---

## 1. Abstract

The ONGC Well Operations Management API is a RESTful web service for storing and managing operational information associated with wells. It provides Create, Read, Update, and Delete (CRUD) operations for four business fields: Well Number, Job, Purpose, and Date/Time. PostgreSQL provides persistent storage, while input validation, error handling, rate limiting, and HTTP security headers improve reliability and safety.

The project can be hosted at no cost for academic demonstration using a Render free web service and a Neon free PostgreSQL database.

## 2. Objectives

- Store structured well-operation records in a relational database.
- Expose standard REST endpoints for all CRUD operations.
- Validate all incoming data and return clear HTTP responses.
- Provide interactive Swagger documentation for reviewers.
- Make the system simple to deploy and reproduce.

## 3. Scope

This version is designed for a college demonstration. It manages operation records only. User login, role-based access, audit history, file attachments, and integration with internal ONGC systems are outside the current scope. Authentication must be added before any real organizational use.

## 4. System architecture

```text
Client / Swagger / Postman
           |
        HTTPS
           |
  Render Web Service
  Node.js + Express API
           |
   Encrypted PostgreSQL connection
           |
    Neon PostgreSQL
```

### Components

- **Express.js:** HTTP routing and middleware.
- **Zod:** request validation.
- **node-postgres (`pg`):** parameterized PostgreSQL queries.
- **Swagger UI/OpenAPI:** interactive API documentation.
- **Helmet/CORS/rate limiter:** baseline HTTP security controls.
- **Render:** public API hosting.
- **Neon:** persistent managed PostgreSQL database.

## 5. Data design

### Table: `well_operations`

| Column | PostgreSQL type | Constraint | Description |
|---|---|---|---|
| `id` | UUID | Primary key | System-generated identifier |
| `well_no` | VARCHAR(50) | Required, unique | Well number |
| `job` | VARCHAR(200) | Required | Work/job name |
| `purpose` | TEXT | Required | Reason for the operation |
| `operation_at` | TIMESTAMPTZ | Required | Operation date and time with timezone |
| `created_at` | TIMESTAMPTZ | Required | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Required | Last-update timestamp |

`TIMESTAMPTZ` is used so timestamps remain unambiguous. The API accepts ISO 8601 values such as `2026-11-07T10:30:00+05:30`.

## 6. API contract

Base path: `/api/v1`

### Create

`POST /api/v1/well-operations`

Request body:

```json
{
  "wellNo": "ONGC-WELL-101",
  "job": "Drilling",
  "purpose": "Exploratory drilling operation",
  "dateTime": "2026-11-07T10:30:00+05:30"
}
```

Successful response: `201 Created`. A duplicate `wellNo` returns `409 Conflict`.

### Read all

`GET /api/v1/well-operations?page=1&limit=20`

Records are returned newest-operation first. `limit` can be 1–100.

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### Read one

`GET /api/v1/well-operations/{id}`

Successful response: `200 OK`. An unknown UUID returns `404 Not Found`.

### Update

`PUT /api/v1/well-operations/{id}`

Supply all four business fields using the same format as Create. Successful response: `200 OK`.

### Delete

`DELETE /api/v1/well-operations/{id}`

Successful response: `204 No Content`.

### Supporting endpoints

- `/health` checks API/database availability.
- `/api-docs` displays Swagger UI.
- `/openapi.json` supplies the machine-readable API description.

## 7. HTTP status codes

| Code | Meaning |
|---:|---|
| 200 | Request successful |
| 201 | Record created |
| 204 | Record deleted |
| 400 | Validation or malformed JSON error |
| 404 | Record or route not found |
| 409 | Duplicate well number |
| 429 | Too many requests |
| 500 | Unexpected server error |
| 503 | Database unavailable during health check |

## 8. Local setup

1. Install Node.js 20 or newer.
2. Create a PostgreSQL database (a Neon database can also be used locally).
3. Run `npm install` in the project directory.
4. Copy `.env.example` to `.env`.
5. Put the PostgreSQL connection string in `DATABASE_URL`.
6. Run `npm start`.
7. Visit `http://localhost:3000/api-docs`.

The application creates its table and index automatically. The SQL is also available in `database/schema.sql` for review.

## 9. Free cloud deployment procedure

### Step A — Create the free PostgreSQL database on Neon

1. Create an account at `https://console.neon.tech`.
2. Create a project named `ongc-well-operations`.
3. Choose a region near the users when available.
4. On the project dashboard, select **Connect**.
5. Copy the pooled PostgreSQL connection string. It begins with `postgresql://` and normally ends with `?sslmode=require`.
6. Keep this string private. Never commit it to GitHub.

No manual SQL is required because the API initializes the schema on startup. If desired, execute `database/schema.sql` in Neon's SQL Editor.

### Step B — Push the source code to GitHub

Create an empty repository on GitHub, then run from this project folder:

```bash
git init
git add .
git commit -m "Initial ONGC CRUD API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ongc-well-operations-api.git
git push -u origin main
```

Confirm that `.env` is not visible in GitHub.

### Step C — Deploy the API on Render

1. Create/sign in to an account at `https://dashboard.render.com`.
2. Select **New → Blueprint**.
3. Connect the GitHub repository.
4. Render reads `render.yaml` and displays the `ongc-well-operations-api` service.
5. For the secret `DATABASE_URL`, paste the Neon connection string.
6. Leave `CORS_ORIGIN` empty for the project demo, or set it to the frontend URL.
7. Select the free instance and deploy.
8. Wait for the log to show `ONGC API listening on port ...`.

Render assigns a URL similar to:

```text
https://ongc-well-operations-api.onrender.com
```

Verify these URLs:

```text
https://YOUR-SERVICE.onrender.com/health
https://YOUR-SERVICE.onrender.com/api-docs
```

### Alternative manual Render settings

If Blueprint deployment is unavailable:

| Setting | Value |
|---|---|
| Service type | Web Service |
| Runtime | Node |
| Build command | `npm install` |
| Start command | `npm start` |
| Health check | `/health` |
| Environment | `NODE_ENV=production` |
| Secret | `DATABASE_URL=<Neon connection string>` |

## 10. Testing procedure

### Automated tests

```bash
npm install
npm test
```

The suite verifies list pagination, creation, validation, not-found behavior, deletion, and UUID validation.

### Manual acceptance test

1. Open `/api-docs` on the deployed service.
2. Use `POST` to create one record and copy its returned `id`.
3. Use `GET /{id}` and verify all fields.
4. Use `PUT /{id}` and change the job or purpose.
5. Use the list endpoint and confirm the updated record appears.
6. Use `DELETE /{id}`.
7. Repeat `GET /{id}` and confirm a `404` response.

## 11. Security and reliability

- Queries are parameterized to prevent SQL injection.
- Strict schema validation rejects missing, malformed, and unexpected fields.
- Rate limiting allows 200 requests per 15 minutes per source address.
- Helmet supplies common security headers.
- Request bodies are limited to 100 KB.
- Database credentials are loaded only from environment variables.
- The application handles graceful shutdown and closes database connections.
- `wellNo` is unique at the database level.

For real use, add authentication, authorization roles, audit logging, backups, monitoring, a paid availability plan, and an organizational security review.

## 12. Free-tier limitations

- A Render free service sleeps after 15 minutes without incoming traffic. Its next request may take approximately one minute while it starts.
- Free services have usage limits and no production uptime guarantee.
- Neon free usage has storage and compute allowances.
- Free-plan conditions can change; confirm provider terms before the final demonstration.

These constraints are acceptable for an academic demonstration but not for a production ONGC workload.

## 13. Future enhancements

- User authentication and administrator/operator roles.
- Search and filtering by well number, date range, job, and purpose.
- Partial updates using `PATCH`.
- Immutable audit logs.
- CSV/PDF report generation.
- Frontend dashboard and charts.
- Automated database migrations and backups.
- CI/CD test execution before deployment.

## 14. Conclusion

The project satisfies the required CRUD functionality for Well Number, Job, Purpose, and Date/Time. It uses a normalized, persistent PostgreSQL data store and exposes a documented, testable REST interface. The deployment configuration makes the demonstration reproducible on free cloud services while clearly separating the student system from production use.
