# Traffic Violation System
[![Build Status](https://github.com/OWNER/REPO/actions/workflows/main.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/main.yml)

Đây là dự án xây dựng Traffic Violation System 

## Mục Lục
- [Giới Thiệu](#giới-thiệu)
- [Quick Start](#quick-start)
- [Cấu trúc Project](#cấu-trúc-project)
- [API Endpoints](#api-endpoints)

## Đặc điểm nổi bật
- [x] Đăng nhập bằng Google
- [x] Tạo hóa đơn PDF
- [ ] Tích hợp thanh toán PayPal (sắp ra mắt)

## Giới thiệu

Hệ thống phạt nguội giao thông sử dụng AI để tự động phát hiện vi phạm, quản lý xử lý và phân tích dữ liệu. Hệ thống hỗ trợ 3 role: Admin, Officer, Citizen.

### Phân bổ Database

| Database | Chức năng | Ghi chú |
| :--- | :--- | :--- |
| **PostgreSQL** | Database chính | Dữ liệu người dùng, vi phạm, thanh toán |
| **MinIO** | Object Storage | Lưu ảnh/video vi phạm |
| **Redis** | Cache & Token Store | Cache, Session/Token, Hàng đợi (tùy chọn) |
| **MongoDB** | Log AI (optional) | Lưu trữ log và dữ liệu bán cấu trúc của AI |
| **pgAdmin** | Giao diện quản lý | Quản lý PostgreSQL |
| **MinIO Console** | Giao diện quản lý | Quản lý File Objects |

## Kiến trúc hệ thống

```bash
FastAPI Backend + PostgreSQL + AI Models (YOLO + OCR) + React Frontend
```
## Role-based Access Control

| Role | Quyền truy cập | Chức năng chính |
| :--- | :--- | :--- |
| **Admin** | Toàn quyền | Quản lý người dùng, hệ thống, analytics |
| **Officer** | Hạn chế | Duyệt vi phạm, xử lý khiếu nại |
| **Citizen** | Cá nhân | Xem vi phạm, thanh toán, khiếu nại, tố cáo |


## Quick Start

### 1. Cài đặt

Clone repository

`git clone https://github.com/ctthong18/TrafficViolationSystem.git`

`cd fastapi`

Kích hoạt Môi trường ảo (venv)

`python -m venv venv`

`.\venv\Scripts\activate`

Thoát khỏi môi trường ảo

`deactivate`

 Install các phiên bản cần thiết

`python -m pip install -r requirements.txt`

### 2. Cấu hình database

Tạo database PostgreSQL

`createdb traffic_db`

Chạy migrations

`python app/init_db.py`

### 3. Chạy server

`uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

Truy cập: http://localhost:8000/docs

##  Cấu trúc Project

```bash
fastapi/
├── app/
│   ├── api/                 # API endpoints
│   │   ├── endpoints/       # Routes theo role
│   │   ├── middleware/      # Authentication, logging
│   │   └── router.py       # Main router
│   ├── core/               # Core configurations
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic
│   └── utils/              # Helper functions
│   ├── .env           
│   ├── docker-compose.yml          
│   ├── dockerfile           
│   └── requirements.txt
```

## Authentication

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "ctthong18",
  "email": "thongphil18@email.com",
  "password": "thong123",
  "full_name": "Chu Thanh Thong",
  "phone_number": "091xxxxxxxx"
}
```

## Đăng nhập

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "ctthong18",
  "identification_number": "0402051205012",
  "password": "thong123"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

## Sử dụng token

```bash
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Đăng ký tài khoản | Public |
| `POST` | `/auth/login` | Đăng nhập | Public |
| `GET` | `/auth/me` | Thông tin user | All |
| `POST` | `/auth/change-password` | Đổi mật khẩu | All |

### Admin Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/users` | Danh sách users |
| `POST` | `/admin/users/officers` | 	Tạo tài khoản cán bộ |
| `GET` | `/admin/dashboard/stats` | Thống kê hệ thống |

### Officer Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/officer/violations/review-queue` | Danh sách chờ duyệt |
| `POST` | `/officer/violations/{id}/review` | 	Duyệt vi phạm |
| `GET` | `/officer/complaints/assigned` | Khiếu nại được phân công |

### Citizen Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/citizen/my-violations` | Vi phạm của tôi |
| `GET` | `/citizen/my-vehicles` | Phương tiện của tôi |
| `POST` | `/citizen/vehicles` | Đăng ký xe |
| `GET` | `/citizen/dashboard/stats` | Thống kê cá nhân |

### Violations 

| Method | Endpoint | Description | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/violations` | Danh sách vi phạm | All* |
| `GET` | `/violations/{id}` | Chi tiết vi phạm | All* |
| `POST` | `/violations` | Tạo vi phạm (AI) | Officer* |

<sub><em>(*): Citizen chỉ xem được vi phạm của mình</em></sub>

### Complaints

| Method | Endpoint | Description | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/complaints` | Danh sách khiếu nại | All* |
| `POST` | `/complaints` | 	Tạo khiếu nại | Citizen |
| `PUT` | `/complaints/{id}` | Cập nhật khiếu nại | Officer |

### Analytics

| Method | Endpoint | Description | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/analytics/dashboard` | Thống kê tổng quan | Officer+ |
| `GET` | `/analytics/time-range` | 	Thống kê theo khoảng thời gian | Officer+ |
| `GET` | `/analytics/calendar-range` | Thống kê bằng calendar picker | Officer+ |

###  Database Models

#### Core Models

- **User** — Người dùng hệ thống
- **Vehicle** — Phương tiện giao thông
- **Violation** — Vi phạm giao thông
- **Payment** — Thanh toán phạt
- **Complaint** — Khiếu nại
- **Evidence** — Bằng chứng vi phạm
- **Denuciation** - Tố cáo vi phạm

#### Analytics Models

- **DailyStats** — Thống kê hàng ngày
- **LocationHotspots** — Điểm nóng vi phạm
- **ViolationForecasts** — Dự báo vi phạm 
- **ActionRecommendations** — Đề xuất hành động

