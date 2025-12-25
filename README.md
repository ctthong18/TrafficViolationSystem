# Traffic Violation System

A modern, full-stack application for managing and processing traffic violations using AI-assisted detection.

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
```
### 3. Configure Environment
Create a `.env` file in the `fastapi` directory and paste the following configuration:

```env
# Database
DATABASE_URL=postgresql://<postgres_user>:<postgres_password>@localhost:5432/<postgres_db>

# Security
SECRET_KEY=yoursecretkeyhere_change_this_for_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Redis & Celery
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Cloudinary (Optional - for evidence storage)
cloudinary_cloud_name=your_cloud_name
cloudinary_api_key=your_api_key
cloudinary_api_secret=your_api_secret
```

### 4. Database Migrations & Seeding
Run the following commands in the `fastapi` directory:
```bash
# Apply migrations
alembic upgrade head

# Seed initial data (Includes rules, users, and sample violations)
python seed_data.py
```

### 5. Frontend Setup (Next.js)
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
- **Admin:** `admin` / `admin123`

Then you can create new Officer (inside Admin portal) and Citizen users (Register page).

## API Documentation
Once the server is running, you can access the interactive documentation at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

Or you can checkout the folder **fastapi/app/api/docs**