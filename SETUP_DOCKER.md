# Docker Setup Guide

This project is configured to run with Docker Compose. This allows you to run the Backend (FastAPI), Frontend (Next.js), Database (Postgres), Redis, and Celery Workers with a single command.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop).

## Quick Start

1.  **Build and Start Containers:**

    Run the following command in the root directory (where `docker-compose.yml` is located):

    ```bash
    docker-compose up --build
    ```

    This command will:
    - Build the Docker images for the backend and frontend.
    - Start the Postgres database and Redis.
    - Start the FastAPI backend and Celery worker.
    - Start the Next.js frontend.

2.  **Access the Application:**

    - **Frontend:** [http://localhost:3000](http://localhost:3000)
    - **Backend API:** [http://localhost:8000/docs](http://localhost:8000/docs)
    - **Flower (Celery Monitor):** [http://localhost:5555](http://localhost:5555)

## Services Overview

-   **backend**: The FastAPI application. Runs on port 8000.
-   **frontend**: The Next.js application. Runs on port 3000.
-   **db**: PostgreSQL 15 database. Data is persisted in a Docker volume `postgres_data`.
-   **redis**: Redis cache and message broker for Celery.
-   **worker**: Celery worker for background tasks.
-   **flower**: Web-based tool for monitoring and administrating Celery clusters.

## Environment Variables

-   The configuration uses `docker-compose.yml` to set environment variables.
-   `NEXT_PUBLIC_API_URL` is set to `http://localhost:8000` for the frontend to communicate with the backend from your browser.

## Database Management

The database starts empty (or with persistent data if you've run it before). The backend is configured to create tables on startup (`create_tables` in `main.py`).

**To seed initial data:**

You can execute the seeding script inside the running backend container:

```bash
docker-compose exec backend python app/seed_data.py
# Or if your seed script is in the root of fastapi
docker-compose exec backend python seed_data.py
```

## 🧪 Running Tests

You can run the backend test suite inside the container:

```bash
docker-compose exec backend pytest
```

## Troubleshooting

-   **Frontend can't connect to Backend:** Ensure `NEXT_PUBLIC_API_URL` is correct. If you are accessing from another device, you might need to change `localhost` to your machine's IP.
-   **Database connection fails:** Ensure the `db` service is healthy. Docker Compose waits for it, but sometimes it takes a few extra seconds on first run.
