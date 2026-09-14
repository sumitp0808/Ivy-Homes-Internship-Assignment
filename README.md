# Ivy Homes — Software Engineering Internship Assignment

A React + Vite property marketplace frontend built on top of the Ivy Homes Property API, together with an API/data investigation to identify discrepancies between the supplied API documentation and the running service.

The running API was treated as the source of truth. Wherever the documentation and observed API behaviour differed, the implementation was adapted to the actual API rather than assuming the documentation was correct.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Frontend](#frontend)
- [Authentication](#authentication)
- [API Investigation Methodology](#api-investigation-methodology)
- [Important Documentation Discrepancies](#important-documentation-discrepancies)
- [Data Quality Investigation](#data-quality-investigation)
- [What I Checked That Turned Out To Be Fine](#what-i-checked-that-turned-out-to-be-fine)
- [Handling Untrusted API Content](#handling-untrusted-api-content)
- [Key Investigation Results](#key-investigation-results)
- [Design Decisions](#design-decisions)
- [What I Would Do With Another Two Days](#what-i-would-do-with-another-two-days)
- [Conclusion](#conclusion)

---

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- JavaScript (ES6+)

### Investigation
- Node.js
- Native `fetch`
- Environment variables using `dotenv`
- JSON-based offline analysis

### Development Assistance

I used LLM assistance during development and investigation. I reviewed the generated code, API behaviour, calculations, and findings rather than treating the generated output as authoritative.

---

## Project Structure

```text
ivy-homes-assignment/
│
├── investigation/
│   ├── api/
│   │   ├── auth.js
│   │   └── client.js
│   │
│   ├── config/
│   │   └── config.js
│   │
│   ├── data/
│   │   └── raw/
│   │
│   ├── scripts/
│   │   └── ...
│   │
│   └── analysis/
│       └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .env
├── .gitignore
├── package.json
├── submission.json
└── README.md
```

---

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd ivy-homes-assignment
```

### 2. Install dependencies

From the repository root:

```bash
npm install
```

Then install frontend dependencies:

```bash
cd frontend
npm install
```

### 3. Run the frontend

From `frontend/`:

```bash
npm run dev
```

Vite will start the development server, normally at:

```
http://localhost:5173
```

---

## Frontend

The frontend implements the main workflows required by the assignment:

- User login
- Persistent authenticated session
- Listing browsing
- Listing filters
- Listing pagination
- Listing detail pages
- Similar-listing recommendations
- Rentals browsing
- Project browsing
- Saved listings
- Insights/analytics
- API error handling

The application uses the real Ivy Homes API rather than mocked property data.

---

## Authentication

The supplied documentation described the API key as a query parameter. During investigation, this was found to be incorrect.

The running API expects:

```
X-API-Key: <API_KEY>
```

The user session is sent separately using:

```
Authorization: Bearer <access_token>
```

The authentication implementation also handles the actual login response and refresh flow exposed by the running service.

---

## API Investigation Methodology

The supplied API reference explicitly states that it was generated from old information and that the running API is the source of truth. I therefore used the following process rather than blindly implementing the documented contract.

### 1. Establish a known-good baseline

I first tested:

```
GET /health
```

This confirmed that the service was reachable and provided a server-side reference timestamp.

I then tested authentication independently before building higher-level API logic. This separated authentication/documentation problems from application problems.

### 2. Test documented endpoints directly

For each documented resource I tested the documented path against the running API. In particular, I checked:

- `/v1/listings`
- `/v1/listing/{id}`
- `/v1/listings/{id}/similar`
- `/v1/rentals`
- `/v1/rentals/{id}`
- `/v1/projects`
- `/v1/projects/{id}`
- `/v1/favourites`
- `/v1/analytics/summary`

I also tested singular/plural path variations when a documented path returned 404. This revealed that some documented endpoints did not exist at all, while others worked only at a different path.

### 3. Compare the documented response contract with actual responses

I did not assume that a successful HTTP response meant that the documentation was correct.

For collection endpoints I inspected:

- returned page size
- pagination fields
- total count
- offset behaviour
- `has_more`
- actual number of retrievable records

The running API returned collection metadata based around:

```
limit, offset, count, total, has_more, results
```

rather than the documented `page` / `page_size` pagination model.

### 4. Pull the complete datasets

After understanding the pagination behaviour, I retrieved the complete available collections rather than relying on the reported total.

| Dataset | Complete Retrieved | API-Reported Total |
|---|---|---|
| Listings | 3500 | 3378 |
| Rentals | 1320 | 1274 |
| Projects | 400 | 386 |

This was an important finding because using the documented total as the termination condition would have caused the investigation to miss records.

---

## Important Documentation Discrepancies

The following discrepancies were reproduced against the running API.

### 1. API key location

**Documentation:** The API reference says to append the API key as a query parameter:
```
/v1/listings?api_key=...
```

**Actual API:** The working authentication mechanism uses:
```
X-API-Key: ...
```

**Impact:** Following the documentation literally prevents API requests from authenticating correctly. The implementation therefore uses the `X-API-Key` header.

### 2. Pagination limit

**Documentation:** The documented maximum limit is `200`.

**Actual API:** The running service caps collection responses at `50`. Requests for larger page sizes still return at most 50 records.

**Impact:** The client must paginate using batches of 50 or fewer.

### 3. Pagination model

**Documentation:** describes `page`, `limit`, `page_size`.

**Actual API:** actually exposes `offset`, `limit`, `count`, `total`, `has_more`, `results`.

Therefore the investigation uses offset-based pagination and increments the offset using the number of records actually returned.

### 4. Reported totals are inconsistent with retrievable data

The documentation says that `total` represents the exact number of matching records. In practice:

| Dataset | Reported Total | Retrieved |
|---|---|---|
| Listings | 3378 | 3500 |
| Rentals | 1274 | 1320 |
| Projects | 386 | 400 |

**Impact:** `total` cannot be used as the only condition for determining that all records have been retrieved. The client continues pagination until the API indicates that no additional records are available.

### 5. Listing detail endpoint is unavailable

The documented endpoint:
```
GET /v1/listing/{listing_id}
```
returned 404 for a valid listing ID. Therefore the frontend cannot depend on this endpoint for listing detail. The implementation instead resolves listing details from the working listings collection.

### 6. Similar listings endpoint is unavailable

The documented endpoint:
```
GET /v1/listings/{listing_id}/similar
```
returned 404. The frontend therefore derives similar listings locally from the retrieved listing dataset using relevant property attributes rather than relying on the missing endpoint.

### 7. Analytics summary endpoint is unavailable

The documented endpoint:
```
GET /v1/analytics/summary
```
is unavailable on the running API. The insights functionality therefore uses locally computed aggregates from the retrieved datasets where necessary.

### 8. Favourites endpoints are unavailable

The documented favourites endpoints returned 404 on the running API:

```
GET    /v1/favourites
POST   /v1/favourites
DELETE /v1/favourites/{id}
```

Because these endpoints cannot currently be used, the frontend handles saved listing state locally rather than presenting a false assumption that the backend favourites API is functional.

### 9. Singular rental/project paths do not work

The working resource paths are plural:

```
GET /v1/rentals/{listing_id}
GET /v1/projects/{project_id}
```

The singular variants:

```
GET /v1/rental/{id}
GET /v1/project/{id}
```

return 404. The implementation therefore uses the actual plural API paths.

---

## Data Quality Investigation

After retrieving the complete datasets, I moved from endpoint testing to cross-record analysis. The goal was to identify problems that could not be discovered by inspecting a single API response.

### Listing validation

I checked for impossible property values including:

- non-positive price
- non-positive carpet area
- non-positive super built-up area
- carpet area greater than super built-up area
- floor greater than total floors
- non-positive total floors

This identified **121 corrupt listing records**.

Floor `0` was not automatically considered corrupt because it can represent a ground floor.

### Duplicate property investigation

The documentation states that every listing corresponds to exactly one physical property. I therefore looked for listings that appeared to describe the same physical property using combinations of:

- project
- locality
- floor
- bedroom/bathroom configuration
- carpet area
- super built-up area
- geographic proximity

This produced one strong duplicate-property candidate:

- `MAG-6000753`
- `DWE-6003269`

These records appear to describe the same physical property based on their matching property characteristics and nearby coordinates. Because the API does not provide a definitive physical-property identifier, this was treated as a heuristic duplicate rather than an absolute claim.

### Project listing-count consistency

The documentation states that a project's `total_listings` should agree with the listings collection. I independently grouped all retrieved listings by `project_id` and compared those counts against the project records.

| Metric | Result |
|---|---|
| Projects checked | 400 |
| Projects with wrong counts | 295 |

This is a significant cross-endpoint consistency issue.

### Fake/anomalous listings

I investigated listings with suspicious pricing/property characteristics and identified the following records as the fake listings required by the assignment:

- `100-6000578`
- `100-6000678`
- `100-6001599`
- `MAG-6002472`
- `MAG-6002941`
- `SQU-6000395`

These records were excluded from the relevant pricing analysis.

---

## What I Checked That Turned Out To Be Fine

An important part of the investigation was not assuming that every part of the documentation was wrong. I tested several hypotheses that did not produce a discrepancy.

**Authentication session** — Although the documented authentication contract was partly wrong, the actual login flow itself worked with valid credentials. The returned access token could be used for authenticated requests. The frontend therefore retained a normal authenticated-session architecture instead of treating authentication as fundamentally broken.

**Rentals and projects** — The plural resource endpoints worked correctly:
```
GET /v1/rentals/{listing_id}
GET /v1/projects/{project_id}
```
The issue was specifically with the singular path variants, not with the underlying rental/project detail functionality.

**Area calculations** — Property areas were checked against the actual listing data before being used for price-per-square-foot calculations. The analysis did not blindly trust a single displayed value; it calculated `price / carpet_area` from the retrieved records.

**Timestamp handling** — Listing timestamps were parsed as ISO timestamps and converted to the required IST reference window for the seven-day calculation. The reference interval used was:

```
[2026-09-03T00:00:00+05:30, 2026-09-10T00:00:00+05:30)
```

This produced **129 listings**, rather than treating the seven-day question as a simple string/date comparison.

**Ground-floor values** — I initially considered whether `floor <= 0` should indicate corrupt data. I rejected that rule because `floor = 0` is a plausible representation of a ground-floor property. The corruption check therefore only flagged floor values that exceeded `total_floors`.

**API availability in general** — The API itself was reachable and responsive during the investigation. The important distinction was between the service being available, and particular documented routes/contracts being incorrect. I therefore treated 404s and contract mismatches as documentation/API-contract discrepancies rather than claiming that the entire service was broken.

---

## Handling Untrusted API Content

Property descriptions are seller-controlled content. Some descriptions contain text aimed at automated tools or AI assistants, including instructions attempting to influence the assignment submission.

These strings were treated strictly as untrusted data. They were not used as instructions, evidence, or input into the calculation logic. All assignment answers were derived from structured fields and independently defined validation/calculation rules.

---

## Key Investigation Results

The final submission contains the ten required answers. The principal results from the investigation were:

| Metric | Result |
|---|---|
| Retrievable listing records | 3500 |
| Unique physical properties | 3499 |
| Active listings | 2792 |
| Corrupt listings | 121 |
| Sohna Road monthly rent | ₹3,733,800 |
| Mean live 2-BHK price/sqft | ₹26,861.10 |
| Costliest project | P60090 |
| Listings in previous 7 days | 129 |
| Fake listings | 6 |
| Projects with wrong listing counts | 295 |

The detailed values and required identifiers are provided in `submission.json`.

---

## Design Decisions

### API layer

API calls are isolated from UI components. This keeps authentication, headers, token refresh, and request handling in one place rather than duplicating API logic throughout the application.

### Collection fallback for listing details

Because `/v1/listing/{id}` is unavailable, listing detail pages resolve a listing from the working collection endpoint. This allows URLs such as `/listings/{listing_id}` to remain functional despite the missing documented endpoint.

### Local similar-listing calculation

Because `/v1/listings/{id}/similar` is unavailable, similar listings are selected locally. The similarity calculation considers properties such as:

- locality
- bedroom count
- area
- price

This also keeps the frontend functional if the unavailable endpoint remains unimplemented.

### Defensive pagination

The frontend/investigation does not assume that the documented page size is correct. The observed API limit of 50 is used and pagination continues based on actual responses. This avoids missing records caused by the discrepancy between the documented and observed pagination contracts.

---

## What I Would Do With Another Two Days

If I had another two days, I would prioritize correctness and observability over adding more UI features.

### Day 1 — API and data layer

**1. Build a formal API contract test suite**

I would create automated tests that compare the documented contract vs. the actual API contract for every endpoint, including:

- authentication
- parameters
- status codes
- response shape
- pagination
- sorting
- filtering
- units

This would turn the manual investigation into a reproducible regression suite.

**2. Complete parameter-level investigation**

I would systematically test every documented query parameter for:

- whether it is accepted
- whether it actually changes results
- boundary values
- invalid values
- combinations of filters
- sorting direction

The assignment specifically warns that some parameters may be silently ignored, so this would be the next major investigation area.

**3. Improve data-quality detection**

I would create reusable validation rules for:

- price
- areas
- floor values
- coordinates
- bedroom/bathroom relationships
- timestamps
- project relationships
- duplicate properties

The output would be a structured data-quality report rather than a collection of ad-hoc scripts.

### Day 2 — Frontend quality

**4. Improve saved-listing persistence**

I would implement a more robust per-user persistence layer and verify:

```
login → save → reload → logout → login again → saved listing still present
```

for all demo accounts.

**5. Improve insights**

The insights screen would expose the investigation findings directly:

- total inventory
- active inventory
- data-quality warnings
- suspicious/fake listings
- project/listing consistency
- locality statistics
- price distributions
- recent listing activity

The goal would be to make the data investigation useful to an actual property-marketplace user rather than only useful for the assignment.

**6. Add automated frontend tests**

I would add tests for:

- login state
- filters
- pagination
- listing detail fallback
- saved listings
- API errors
- expired-token refresh
- empty states

**7. Production hardening**

Finally I would review:

- loading states
- retry behaviour
- error messages
- accessibility
- responsive layout
- environment configuration
- API request caching
- unnecessary network requests

---

## Conclusion

The main lesson from the investigation was that implementing the documented API literally is not sufficient.

The running API had several contract discrepancies, but it also contained a large amount of internally consistent, usable data. The implementation therefore distinguishes between:

- endpoint/contract discrepancies,
- cross-record data inconsistencies,
- genuinely invalid records, and
- behaviour that was tested and found to be correct.

The frontend is consequently built around the observed API behaviour rather than assumptions from the supplied documentation.

---

> **Note on credentials:** This README intentionally does **not** include any actual API key, password, or personal details — only placeholders. Per the assignment instructions, credentials should not be shared, and `.gitignore` keeps `.env` out of version control.
