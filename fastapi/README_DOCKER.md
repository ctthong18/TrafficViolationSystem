# Docker Setup Guide

## Cấu hình Docker

### 1. Tạo file .env

Tạo file `.env` trong thư mục `fastapi/` với nội dung sau:

```env
# Database Configuration
DATABASE_URL=postgresql://traffic_user:trafficviolation@postgres:5432/traffic_violation
POSTGRES_USER=traffic_user
POSTGRES_PASSWORD=trafficviolation
POSTGRES_DB=traffic_violation

# Security
SECRET_KEY=your-secret-key-change-in-production-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BCRYPT_ROUNDS=12

# Redis
REDIS_URL=redis://redis:6379/0

# MinIO
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=minio123
MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET=violations
MINIO_CONSOLE_URL=http://localhost:9001

# MongoDB
MONGO_URI=mongodb://mongo:27017
MONGO_DB=ai_logs

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:8080

# App Settings
PROJECT_NAME=Traffic Violation System
VERSION=1.0.0
DEBUG=true

# pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@local.com
PGADMIN_DEFAULT_PASSWORD=admin123
```

### 2. Chạy Docker

```bash
cd fastapi
docker-compose up --build
```

### 3. Truy cập các services

- **FastAPI**: http://localhost:8000
- **FastAPI Docs**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050
  - Email: admin@local.com
  - Password: admin123
- **MinIO Console**: http://localhost:9001
  - User: minio
  - Password: minio123
- **Portainer**: http://localhost:9002

### 4. Databases

- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MongoDB**: localhost:27017

## Cấu trúc Docker

### Dockerfile
- Sử dụng Python 3.11-slim
- Cài đặt dependencies từ requirements.txt
- Sao chép toàn bộ project vào /fastapi
- Chạy uvicorn từ /fastapi/app

### Docker Compose
- **fastapi**: FastAPI backend service
- **postgres**: PostgreSQL database
- **redis**: Redis cache
- **minio**: Object storage
- **mongo**: MongoDB for AI logs
- **pgadmin**: PostgreSQL admin interface
- **mysql**: MySQL database (tùy chọn)
- **wordpress**: WordPress site (tùy chọn)
- **portainer**: Docker management UI

## Khắc phục sự cố

### Lỗi kết nối database
Đợi PostgreSQL khởi động hoàn toàn trước khi FastAPI start.

### Lỗi import module
Kiểm tra PYTHONPATH trong dockerfile (đã được cấu hình là /fastapi).

### Lỗi .env không được load
Đảm bảo file .env tồn tại trong thư mục fastapi/.

## Notes

- Tất cả volumes được lưu trữ vĩnh viễn trong Docker
- Để reset database: `docker-compose down -v` (xóa volumes)
- Để rebuild images: `docker-compose up --build`

