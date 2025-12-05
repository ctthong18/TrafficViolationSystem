# Docker Setup cho Traffic Violation System

## Cấu trúc

Folder này chứa tất cả các file Docker configuration cho cả backend (FastAPI) và frontend (Next.js).

## Services

- **backend**: FastAPI application (port 8000)
- **frontend**: Next.js application (port 3000)
- **postgres**: PostgreSQL database (port 5432)
- **pgadmin**: pgAdmin web interface (port 5050)
- **redis**: Redis cache (port 6379)
- **minio**: MinIO object storage (port 9000, 9001)
- **mongo**: MongoDB (port 27017)
- **portainer**: Docker management UI (port 9002)
- **mysql**: MySQL database (port 3306)
- **wordpress**: WordPress site (port 8080)

## Cách sử dụng

### Khởi động tất cả services

```bash
cd docker
docker-compose up -d
```

### Khởi động chỉ backend và frontend

```bash
cd docker
docker-compose up -d backend frontend
```

### Xem logs

```bash
# Tất cả services
docker-compose logs -f

# Chỉ backend
docker-compose logs -f backend

# Chỉ frontend
docker-compose logs -f frontend
```

### Dừng services

```bash
docker-compose down
```

### Dừng và xóa volumes

```bash
docker-compose down -v
```

### Rebuild images

```bash
docker-compose up -d --build
```

## Truy cập

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050
- **MinIO Console**: http://localhost:9001
- **Portainer**: http://localhost:9002
- **WordPress**: http://localhost:8080

## Development

Cả backend và frontend đều được mount volumes để hỗ trợ hot-reload:
- Thay đổi code trong `fastapi/` sẽ tự động reload backend
- Thay đổi code trong `frontend/` sẽ tự động reload frontend

## Lưu ý

- Đảm bảo file `.env` tồn tại trong folder `fastapi/`
- Ports 3000, 8000, 5432, 5050, 6379, 9000, 9001, 9002, 3306, 8080 phải available
- Lần đầu build có thể mất vài phút để download images và install dependencies
