## 📋 Prerequisites

### 1. Core Runtimes
- **Node.js** (v18 or later)
- **Python** (3.10 or later)

### 2. Infrastructure (Databases)

#### **PostgreSQL** (Primary Database)
- **Windows:** Download and run the installer from [enterprisedb.com](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads). Ensure you install "PostgreSQL Server" and "pgAdmin 4".
- **MacOS:** `brew install postgresql@15`
- **Linux:** `sudo apt install postgresql`

#### **Redis** (Task Queue for Celery)
- **Windows (Recommended):** Use **WSL2** to install Redis:
  ```bash
  sudo apt install redis-server
  sudo service redis-server start
  ```
  *Alternatively, use [Docker](https://www.docker.com/products/docker-desktop/) or [Memurai](https://www.memurai.com/) (Redis compatible for Windows).*
- **MacOS:** `brew install redis`
- **Linux:** `sudo apt install redis-server`

---

## 🛠️ Step-by-Step Installation

### 1. Database Setup
Create a new database in PostgreSQL named `traffic_db`:
```bash
# In your psql terminal or GUI
CREATE DATABASE traffic_db;
```

### 2. Backend Setup (FastAPI)
Navigate to the `fastapi` directory and set up the environment:

```bash
cd fastapi

# Create virtual environment
python -m venv venv
# Activate on Windows:
.\venv\Scripts\activate
# Activate on Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment
# Copy .env.example to .env (if exists) and update DATABASE_URL and REDIS_URL
# Example: DATABASE_URL=postgresql://postgres:password@localhost:5432/traffic_db
```

Run migrations and seed the database:
```bash
# Apply migrations
alembic upgrade head

# Seed initial data (Includes rules, users, and sample violations)
python seed_data.py
```

### 3. Frontend Setup (Next.js)
In a new terminal, navigate to the `frontend` directory:

```bash
cd frontend

# Install dependencies
npm install

# Generate the API client from the backend schema
npm run generate-api
```

---

## 🚀 Running the Application

To run the system, you need to start three separate processes:

### A. Start the Backend API
```bash
cd fastapi
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

### B. Start the Celery Worker (For background tasks)
```bash
cd fastapi
celery -A celery_worker worker --loglevel=info
```

### C. Start the Frontend
```bash
cd frontend
npm run dev
```
The web app will be available at `http://localhost:3000`.

---

## 🔑 Default Credentials
After seeding, you can log in with:
- **Admin:** `admin` / `password123`
- **Officer:** `officer1` / `password123`
- **Citizen:** `citizen1` / `password123`
