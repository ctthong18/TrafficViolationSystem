FROM node:20-alpine

# Đặt thư mục làm việc
WORKDIR /app

# Sao chép package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Cài đặt pnpm
RUN npm install -g pnpm

# Cài đặt dependencies
RUN pnpm install

# Sao chép toàn bộ source code
COPY . .

# Expose port
EXPOSE 3000

# Lệnh khởi chạy development server
CMD ["pnpm", "run", "dev"]
