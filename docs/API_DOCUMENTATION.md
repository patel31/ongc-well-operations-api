# ONGC Well Operations API — Integration Guide

**API version:** 1.0.0  
**Document date:** 21 November 2026  
**Project type:** College internship demonstration

## 1. Service links

| Resource | URL |
|---|---|
| Live API | `https://ongc-well-operations-api.onrender.com` |
| Interactive Swagger UI | `https://ongc-well-operations-api.onrender.com/api-docs/` |
| OpenAPI 3.0 JSON | `https://ongc-well-operations-api.onrender.com/openapi.json` |
| Health check | `https://ongc-well-operations-api.onrender.com/health` |
| Source repository | `https://github.com/patel31/ongc-well-operations-api` |

The API exchanges JSON over HTTPS and stores records in PostgreSQL.

> **Security notice:** The internship deployment currently has no authentication or authorization. Anyone with the URL can read or change its data. It must not receive confidential, personal, operational, or production ONGC information. Authentication, authorization, audit logging, backups, and a production hosting plan are required before organizational use.

## 2. Base URL and headers

```text
https://ongc-well-operations-api.onrender.com
```

For `POST` and `PUT`, send:

```http
Content-Type: application/json
```

No API key or authorization header is currently required.

## 3. Data model

### Client-supplied fields

| Field | JSON type | Required | Validation |
|---|---|---:|---|
| `wellNo` | string | Yes | Trimmed; 1–50 characters; unique; case-sensitive |
| `job` | string | Yes | Trimmed; 1–200 characters |
| `purpose` | string | Yes | Trimmed; 1–2000 characters |
| `dateTime` | string | Yes | ISO 8601 date-time including timezone |

Valid `dateTime` examples:

```text
2026-11-21T10:30:00+05:30
2026-11-21T05:00:00Z
```

### Server-generated fields

| Field | JSON type | Description |
|---|---|---|
| `id` | UUID string | Permanent record identifier |
| `createdAt` | ISO 8601 string | Creation timestamp returned in UTC |
| `updatedAt` | ISO 8601 string | Last update timestamp returned in UTC |

Complete record example:

```json
{
  "id": "19d501f4-dccf-4f4a-9808-dd7d44eaa477",
  "wellNo": "ONGC-WELL-101",
  "job": "Drilling",
  "purpose": "Exploratory drilling operation",
  "dateTime": "2026-11-21T05:00:00.000Z",
  "createdAt": "2026-11-21T05:05:00.000Z",
  "updatedAt": "2026-11-21T05:05:00.000Z"
}
```

## 4. Endpoint summary

| Method | Path | Success | Description |
|---|---|---:|---|
| `GET` | `/` | 200 | API information |
| `GET` | `/health` | 200 | API and database health |
| `GET` | `/api/v1/well-operations` | 200 | Paginated record list |
| `POST` | `/api/v1/well-operations` | 201 | Create a record |
| `GET` | `/api/v1/well-operations/{id}` | 200 | Retrieve one record |
| `PUT` | `/api/v1/well-operations/{id}` | 200 | Replace one record |
| `DELETE` | `/api/v1/well-operations/{id}` | 204 | Delete one record |

## 5. Create a record

```http
POST /api/v1/well-operations
Content-Type: application/json
```

Request:

```json
{
  "wellNo": "ONGC-WELL-101",
  "job": "Drilling",
  "purpose": "Exploratory drilling operation",
  "dateTime": "2026-11-21T10:30:00+05:30"
}
```

cURL:

```bash
curl -X POST "https://ongc-well-operations-api.onrender.com/api/v1/well-operations" \
  -H "Content-Type: application/json" \
  -d '{"wellNo":"ONGC-WELL-101","job":"Drilling","purpose":"Exploratory drilling operation","dateTime":"2026-11-21T10:30:00+05:30"}'
```

Response: `201 Created`

```json
{
  "data": {
    "id": "19d501f4-dccf-4f4a-9808-dd7d44eaa477",
    "wellNo": "ONGC-WELL-101",
    "job": "Drilling",
    "purpose": "Exploratory drilling operation",
    "dateTime": "2026-11-21T05:00:00.000Z",
    "createdAt": "2026-11-21T05:05:00.000Z",
    "updatedAt": "2026-11-21T05:05:00.000Z"
  }
}
```

The response also includes:

```http
Location: /api/v1/well-operations/19d501f4-dccf-4f4a-9808-dd7d44eaa477
```

Possible errors: `400`, `409`, `429`, `500`.

## 6. List records

```http
GET /api/v1/well-operations?page=1&limit=20
```

| Query parameter | Default | Allowed | Description |
|---|---:|---:|---|
| `page` | 1 | Integer ≥ 1 | Page number |
| `limit` | 20 | Integer 1–100 | Records per page |

Records are ordered by `dateTime` descending. Records with the same operation time are ordered by creation time descending.

```bash
curl "https://ongc-well-operations-api.onrender.com/api/v1/well-operations?page=1&limit=20"
```

Response: `200 OK`

```json
{
  "data": [
    {
      "id": "19d501f4-dccf-4f4a-9808-dd7d44eaa477",
      "wellNo": "ONGC-WELL-101",
      "job": "Drilling",
      "purpose": "Exploratory drilling operation",
      "dateTime": "2026-11-21T05:00:00.000Z",
      "createdAt": "2026-11-21T05:05:00.000Z",
      "updatedAt": "2026-11-21T05:05:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

An empty database returns `data: []`, `total: 0`, and `totalPages: 0`.

## 7. Retrieve one record

```http
GET /api/v1/well-operations/{id}
```

```bash
curl "https://ongc-well-operations-api.onrender.com/api/v1/well-operations/19d501f4-dccf-4f4a-9808-dd7d44eaa477"
```

Response: `200 OK`, with the requested record inside `data`. An unknown UUID returns `404`; a malformed UUID returns `400`.

## 8. Update a record

```http
PUT /api/v1/well-operations/{id}
Content-Type: application/json
```

`PUT` is a complete replacement. All four client fields are required, including unchanged values. `PATCH` is not supported.

```json
{
  "wellNo": "ONGC-WELL-101",
  "job": "Well testing",
  "purpose": "Evaluate production capability",
  "dateTime": "2026-11-22T09:00:00+05:30"
}
```

```bash
curl -X PUT "https://ongc-well-operations-api.onrender.com/api/v1/well-operations/19d501f4-dccf-4f4a-9808-dd7d44eaa477" \
  -H "Content-Type: application/json" \
  -d '{"wellNo":"ONGC-WELL-101","job":"Well testing","purpose":"Evaluate production capability","dateTime":"2026-11-22T09:00:00+05:30"}'
```

Response: `200 OK`, with the updated record inside `data`. Possible errors: `400`, `404`, `409`, `429`, `500`.

## 9. Delete a record

```http
DELETE /api/v1/well-operations/{id}
```

```bash
curl -i -X DELETE "https://ongc-well-operations-api.onrender.com/api/v1/well-operations/19d501f4-dccf-4f4a-9808-dd7d44eaa477"
```

Response: `204 No Content`. There is no response body. Repeating the request returns `404`.

Deletion is permanent in the current API and there is no restore endpoint.

## 10. Health check

```http
GET /health
```

Response: `200 OK`

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-11-21T15:03:30.000Z"
}
```

If PostgreSQL cannot be reached, the endpoint returns `503 Service Unavailable`:

```json
{ "status": "error", "database": "disconnected" }
```

## 11. Error responses

### Validation error — `400 Bad Request`

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "dateTime", "message": "dateTime must be ISO 8601 with a timezone" }
  ]
}
```

Unknown request fields are rejected. Malformed JSON returns:

```json
{ "error": "Request body must contain valid JSON" }
```

### Record not found — `404 Not Found`

```json
{ "error": "Well operation not found" }
```

### Unknown route — `404 Not Found`

```json
{ "error": "Route not found" }
```

### Duplicate well number — `409 Conflict`

```json
{ "error": "A record with this wellNo already exists" }
```

### Too many requests — `429 Too Many Requests`

Each client address is limited to 200 requests in a rolling 15-minute window. Clients should use the returned rate-limit information and wait before retrying.

### Server error — `500 Internal Server Error`

```json
{ "error": "Internal server error" }
```

## 12. HTTP status reference

| Status | Meaning |
|---:|---|
| 200 | Read or update successful |
| 201 | Record created |
| 204 | Record deleted; no response body |
| 400 | Invalid UUID, query, JSON, or body |
| 404 | Record or route not found |
| 409 | Duplicate `wellNo` |
| 429 | Rate limit exceeded |
| 500 | Unexpected server/database error |
| 503 | Database unavailable during health check |

## 13. Usage constraints

- Maximum JSON request body: 100 KB.
- Rate limit: 200 requests per 15 minutes per client address.
- Maximum page size: 100 records.
- `wellNo` must be unique.
- Timestamps require an explicit timezone.
- Extra JSON fields are rejected.
- Searching, filtering, bulk operations, partial updates, soft deletion, and audit-history endpoints are not currently available.

## 14. Free-hosting behavior

The demonstration uses Render's free service plan and Neon PostgreSQL. After inactivity, the API may require a cold start, making the first request slower. Client software should use a reasonable timeout and may retry idempotent `GET` requests if a connection times out.

The free deployment has no production uptime or support commitment. A company deployment should use an approved hosting account, backups, monitoring, controlled database access, and a defined service-level objective.

## 15. Requirements before company use

1. Authentication using an approved identity provider.
2. Role-based authorization for read, create, update, and delete operations.
3. Immutable audit logs identifying who changed each record.
4. TLS/domain ownership under the company account.
5. Database backup and restore procedures.
6. Monitoring, alerting, log retention, and an uptime plan.
7. API ownership, support contacts, and change-management policy.
8. Automated contract, load, and security testing.

## 16. Postman and Swagger

Import `docs/ONGC_Well_Operations.postman_collection.json` into Postman. The Create request automatically generates a demonstration well number and stores the returned UUID in the `recordId` collection variable.

Alternatively, open Swagger UI, select an endpoint, choose **Try it out**, enter the required data, and select **Execute**.

## 17. Versioning

The current API path is `/api/v1`. Breaking request or response changes should use a new path such as `/api/v2` and be communicated to consumers before migration.

## 18. Ownership

This is a college internship project, not an official production ONGC service. The organization accepting the project should assign a technical owner and support contact before allowing other applications to depend on it.
