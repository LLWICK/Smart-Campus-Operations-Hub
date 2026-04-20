# Smart Campus Operations Hub

A web platform for managing university facility and asset bookings. Built with Spring Boot REST API and React client application.

## Tech Stack

- **Backend:** Spring Boot 4.0.4, Java 21, MongoDB Atlas
- **Frontend:** React 19, Vite, Tailwind CSS
- **Database:** MongoDB (NoSQL)

## Project Structure

```
Smart-Campus-Operations-Hub/
├── API/demo/           # Spring Boot REST API
├── FRONTEND/           # React client application
└── .github/workflows/  # CI/CD pipeline
```

## Prerequisites

- Java 21 (or compatible JDK)
- Node.js 20+
- MongoDB (local or Atlas; connection string in `application.properties`)
- **Maven is optional** — the project includes `mvnw.cmd` (Windows) / `./mvnw` (Mac/Linux) so you do **not** need `mvn` on your PATH.

## Setup & Run

### Backend

From the `API/demo` folder, use the **Maven wrapper** (not `mvn`):

**Windows (PowerShell or CMD):**

```bash
cd API/demo
.\mvnw.cmd spring-boot:run
```

**Mac / Linux:**

```bash
cd API/demo
./mvnw spring-boot:run
```

If you have Maven installed globally, `mvn spring-boot:run` also works.

The API runs on `http://localhost:8080`.

### Frontend

```bash
cd FRONTEND
npm install
npm run dev
```

The client runs on `http://localhost:5173`. The booking and facility API clients use **`http://localhost:8080/api`** with **credentials** so the browser sends the same **OAuth session cookie** as `/api/auth/status` (required for authenticated REST calls).

## Authentication

- **Google OAuth2** — users must be **enrolled** in the database (see admin user management); unlisted emails cannot sign in.
- **`GET /api/auth/status`** — returns `authenticated`, profile fields, `role`, and **`userId`** (MongoDB user id) for the SPA.

## API Endpoints

### Facilities (`/api/facilities`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/facilities` | List all facilities (with search/filter) |
| GET | `/api/facilities/{id}` | Get facility by ID |
| POST | `/api/facilities` | Create facility |
| PUT | `/api/facilities/{id}` | Update facility |
| DELETE | `/api/facilities/{id}` | Delete facility |
| PATCH | `/api/facilities/{id}/status` | Toggle status |

### Bookings (`/api/bookings`)

Authenticated users only. **Create** sets the booker from the session (request body does not include `userId` / `userName`). **List** is scoped to the current user unless the caller is an **admin**. **Get / update / cancel by id** require **owner or admin**. **Approve** and **reject** require **ADMIN**.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List bookings (filters; non-admins see only their own) |
| GET | `/api/bookings/{id}` | Get booking by ID |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/{id}` | Update booking (PENDING only; owner or admin) |
| DELETE | `/api/bookings/{id}` | Cancel booking (owner or admin) |
| PATCH | `/api/bookings/{id}/approve` | Approve booking (**admin only**) |
| PATCH | `/api/bookings/{id}/reject` | Reject booking (**admin only**) |
| GET | `/api/bookings/check-availability` | Check availability (optional `excludeBookingId` when editing) |
| GET | `/api/bookings/facility/{facilityId}/date/{date}` | Bookings for a facility on a date |

**Frontend (Module B):** My Bookings, New Booking, Booking detail (cancel / **edit** when PENDING), **Edit booking** page (`/bookings/:id/edit`), Admin **Manage Bookings**.

See **[TESTING_GUIDE.md](TESTING_GUIDE.md)** for step-by-step checks.

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get summary statistics |

## Team Contributions

- **Member 1:** Facilities & Assets Catalogue (Module A)
- **Member 2:** Booking Management (Module B)
