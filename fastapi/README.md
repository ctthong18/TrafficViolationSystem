# Traffic Violation System - Backend API

Powerful and scalable Backend API built with FastAPI.

## 🚀 Tech Stack
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **Database:** PostgreSQL (with [SQLAlchemy](https://www.sqlalchemy.org/) ORM)
- **Migrations:** [Alembic](https://alembic.sqlalchemy.org/)
- **Validation:** [Pydantic](https://docs.pydantic.dev/)
- **Authentication:** JWT (JSON Web Tokens)
- **Task Queue:** Celery & Redis

## 🛠️ Getting Started

1. **Setup environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Run migrations:**
   ```bash
   alembic upgrade head
   ```

3. **Seed initial data (Optional):**
   ```bash
   python seed_data.py
   ```

4. **Run development server:**
   ```bash
   uvicorn app.main:app --reload
   ```

## 📖 API Documentation
Once the server is running, you can access the interactive documentation at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## 📂 Project Structure
- `app/api`: Route handlers and endpoints
- `app/models`: Database models (SQLAlchemy)
- `app/schemas`: Data validation (Pydantic)
- `app/services`: Business logic layer
- `app/core`: Configuration and security
- `tests`: Pytest suite
