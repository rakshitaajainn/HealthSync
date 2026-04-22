# Postman Test Cases

This folder contains import-ready Postman artifacts for the HealthSync backend:

- `HealthSync.postman_collection.json`
- `HealthSync.postman_environment.json`

## Import Order

1. Import the environment file.
2. Import the collection file.
3. Select the `HealthSync Local` environment.
4. Update `sampleImagePath`, `samplePdfPath`, and `invalidFilePath` to real local files on your machine.
5. Start the backend on `http://localhost:5000`.

## Coverage Summary

### Root & Health

- `GET /`
  - Success: returns welcome payload and endpoint index
- `GET /api/health`
  - Success: returns `status = OK`
- Unknown route
  - Error: returns structured `404`

### Authentication

- `POST /api/auth/signup`
  - Success: valid registration returns `201`, token, user
  - Error: duplicate email returns `409`
  - Edge: invalid name/email/password/age/bloodGroup returns `400`
- `POST /api/auth/login`
  - Success: valid credentials return `200`, token, user
  - Error: wrong password returns `401`
  - Edge: missing password returns validation `400`
- `GET /api/auth/profile`
  - Success: valid Bearer token returns current user
  - Error: missing token returns `401` with `NO_TOKEN`
  - Error: malformed token returns `401` with `INVALID_TOKEN`
- `PUT /api/auth/profile`
  - Success: updates profile details
  - Edge: invalid `bloodGroup` currently bubbles up as `500` from Mongoose validation

### Reports

- `GET /api/reports`
  - Success: returns authenticated user's reports and count
- `POST /api/reports/upload`
  - Success: supported image upload returns `201` and report metadata
  - Error: missing file returns `400` with `NO_FILE`
  - Error: invalid `reportType` returns `400` with `INVALID_REPORT_TYPE`
  - Error: unsupported file type returns `400` with `VALIDATION_ERROR`
- `GET /api/reports/:id`
  - Success: returns owned report
  - Error: missing report returns `404` with `REPORT_NOT_FOUND`
  - Edge: malformed ObjectId currently returns `500`
- `DELETE /api/reports/:id`
  - Success: deletes owned report
  - Edge: second delete returns `404` with `REPORT_NOT_FOUND`

### AI

- `POST /api/ai/predict`
  - Success: returns risk level, score, factors, and recommendations
  - Error: missing required fields returns `400`
  - Edge: out-of-range vitals and unsupported enum values currently return `500` with validation message
- `POST /api/ai/analyze`
  - Error: missing `reportId` returns `400`
  - Error: missing report returns `404`
  - Note: no success request is included by default because it depends on a real uploaded file remaining available for OCR/analysis
- `GET /api/ai/insights/:reportId`
  - Error: missing report returns `404`
  - Error: invalid JWT returns `401`

### Emergency

- `GET /api/emergency/:userId`
  - Success: returns public-safe emergency summary
  - Error: malformed userId returns `400`
  - Error: missing user returns `404`
- `GET /api/emergency/:userId/qr`
  - Success: default base64 JSON payload
  - Edge: SVG output format returns `image/svg+xml`
  - Error: malformed userId returns `400`

## Notes About Current API Behavior

Some edge-case requests intentionally assert the API's current behavior, even where a `400` might be cleaner than a `500`. These are useful for regression tracking:

- `PUT /api/auth/profile` with invalid enum values
- `GET /api/reports/:id` with malformed MongoDB ObjectId
- `POST /api/ai/predict` with invalid ranges or unsupported enum strings

If you later normalize those responses to `400`, update the Postman assertions to match.

## Suggested Run Order

Run the collection top-to-bottom the first time because later requests reuse values created earlier:

1. Root & Health
2. Authentication
3. Reports
4. AI
5. Emergency

## Optional Additions

If you want fuller cross-user authorization coverage, create a second test user manually and set:

- `otherUserToken`
- `otherUserReportId`

That will let you add explicit `403` tests for:

- `GET /api/reports/:id`
- `DELETE /api/reports/:id`
- `POST /api/ai/analyze`
- `GET /api/ai/insights/:reportId`
