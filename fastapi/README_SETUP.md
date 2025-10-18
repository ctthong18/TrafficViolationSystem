## Khởi tạo database

Truy cập vào database của postgres, nhập mật khẩu user postgres

`psql -U postgres`

-- Tạo database mới

`CREATE DATABASE traffic_violation;`

-- Tạo user mới

`CREATE USER traffic_user WITH PASSWORD 'trafficviolation';`

-- Cấp toàn quyền cho user này trên database traffic_violation

`GRANT ALL PRIVILEGES ON DATABASE traffic_violation TO traffic_user;`


`\c traffic_violation;  -- kết nối tới database`

-- Cấp quyền sử dụng schema public

`GRANT USAGE ON SCHEMA public TO traffic_user;`

-- Cấp quyền tạo bảng, sequence, type trong schema public

`GRANT CREATE ON SCHEMA public TO traffic_user;`

-- Cấp toàn quyền quản lý mọi bảng đã có hoặc sẽ tạo mới

`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO traffic_user;`

-- Cấp quyền trên sequence (cho id tự tăng)

`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO traffic_user;`

-- Đảm bảo các bảng tạo sau này tự động có quyền

`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO traffic_user;`

`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO traffic_user;`

-- Cấp quyền sử dụng schema public

`GRANT USAGE ON SCHEMA public TO traffic_user;`

-- Cho phép user được tạo bảng, type, sequence, view...

`GRANT CREATE ON SCHEMA public TO traffic_user;`

-- Cho phép truy cập vào tất cả bảng, sequence hiện có

`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO traffic_user;`

`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO traffic_user;`

-- Đảm bảo các bảng/sequence tạo sau này cũng tự động cấp quyền

`ALTER DEFAULT PRIVILEGES IN SCHEMA public`

`GRANT ALL PRIVILEGES ON TABLES TO traffic_user;`

`ALTER DEFAULT PRIVILEGES IN SCHEMA public`

`GRANT ALL PRIVILEGES ON SEQUENCES TO traffic_user;`


