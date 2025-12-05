FROM python:3.11-slim

# Thiết lập môi trường
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/fastapi

# Đặt thư mục làm việc
WORKDIR /fastapi/app

# Cài đặt các gói hệ thống cần thiết
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libgl1 \
    libglib2.0-0 \
    libmagic-dev \
    libmagic-mgc \
    && rm -rf /var/lib/apt/lists/*

# Sao chép file requirements trước (tối ưu cache layer)
COPY requirements.txt .

# Cài đặt dependencies Python
RUN pip install --no-cache-dir -r requirements.txt alembic

# Sao chép toàn bộ project vào /fastapi
COPY . /fastapi/

# Expose port
EXPOSE 8000

# Lệnh khởi chạy
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
