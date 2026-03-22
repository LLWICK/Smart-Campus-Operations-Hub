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

- Java 21
- Node.js 20+
- Maven 3.9+
- MongoDB Atlas account (connection string configured)

## Setup & Run

### Backend

```bash
cd API/demo
mvn spring-boot:run
```

The API runs on `http://localhost:8080`.

### Frontend

```bash
cd FRONTEND
npm install
npm run dev
```

The client runs on `http://localhost:5173` and proxies API requests to the backend.

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List bookings (with filters) |
| GET | `/api/bookings/{id}` | Get booking by ID |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/{id}` | Update booking |
| DELETE | `/api/bookings/{id}` | Cancel booking |
| PATCH | `/api/bookings/{id}/approve` | Approve booking |
| PATCH | `/api/bookings/{id}/reject` | Reject booking |
| GET | `/api/bookings/check-availability` | Check availability |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get summary statistics |

## Team Contributions

- **Member 1:** Facilities & Assets Catalogue (Module A)
- **Member 2:** Booking Management (Module B)
