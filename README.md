# Traffic Violation System
[![Build Status](https://github.com/OWNER/REPO/actions/workflows/main.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/main.yml)

Đây là dự án xây dựng Traffic Violation System 

## Mục Lục
- [Giới Thiệu](#giới-thiệu)
- [Cài Đặt](#cài-đặt)
- [Sử Dụng](#sử-dụng)
- [Đóng Góp](#đóng-góp)

## Đặc điểm nổi bật
- [x] Đăng nhập bằng Google
- [x] Tạo hóa đơn PDF
- [ ] Tích hợp thanh toán PayPal (sắp ra mắt)

## Cài đặt

1. Kích hoạt Môi trường ảo (venv)
`python -m venv venv`
`.\venv\Scripts\activate`

Thoát khỏi môi trường ảo
`deactivate`

2. Install các phiên bản cần thiết
`python -m pip install -r requirements.txt`

3. Khởi chạy 
`uvicorn app.main:app --reload`