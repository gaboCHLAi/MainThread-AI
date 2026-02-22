# MainThread

Full-stack application with a React (Vite) frontend and two Node.js backend services, orchestrated with Docker Compose.

## Architecture

| Service            | Description        | Port (host) |
|--------------------|--------------------|-------------|
| **frontend-service** | React + Vite app   | 3000        |
| **server-a-service** | Backend API (server-A) | 5000     |
| **server-b-service** | Backend API (server-B / scraping) | 5001 |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- **Windows:** Docker Desktop must be **running** before you run `docker compose`. If you see an error like `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`, start Docker Desktop and wait until it is fully ready, then try again.
- For local (non-Docker) development: Node.js 20+

## Quick Start with Docker

1. **Create environment files** (required for the backend services):
   - `backend/server-A/.env` — copy from `backend/server-A/.env.example` if available and set your variables.
   - `backend/server-B/.env` — copy from `backend/server-B/.env.example` if available and set your variables (e.g. `PORT=5001`, API keys).

2. **Build and run all services:**

   ```bash
   docker compose up --build
   ```

3. **Open in browser:**
   - Frontend: http://localhost:3000  
   - Server A API: http://localhost:5000  
   - Server B API: http://localhost:5001  

## Run in background

```bash
docker compose up --build -d
```

Stop:

```bash
docker compose down
```

## Local development (without Docker)

- **Frontend:** `cd frontend && npm install && npm run dev`
- **Server A:** `cd backend/server-A && npm install && npm run dev`
- **Server B:** `cd backend/server-B && npm install && npm run dev`

Set `PORT` and other variables in each service’s `.env` as needed.

## Project structure

```
MainThread/
├── docker-compose.yml      # Orchestrates frontend + server-A + server-B
├── frontend/               # React + Vite + Tailwind
│   ├── Dockerfile
│   └── .dockerignore
├── backend/
│   ├── server-A/           # Express API (port 5000)
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   └── server-B/           # Scraping/API service (port 5001)
│       ├── Dockerfile
│       └── .dockerignore
└── README.md
```

## Notes

- Backend services use `env_file` pointing to `./backend/server-A/.env` and `./backend/server-B/.env`. Ensure these files exist (or adjust `docker-compose.yml`) before running.
- Server B is protected by an API key; send it in the `x-api-key` header when calling its API.
