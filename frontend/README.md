# Sport Booking Frontend

Frontend React + TypeScript dùng Vite, React Router, Axios, Tailwind CSS 4, shadcn/ui và Remix Icon.

## Chạy local

Yêu cầu Node.js 22+ và backend chạy tại `http://localhost:8080`.

```bash
cp .env.example .env
npm ci
npm run dev
```

Mở `http://localhost:5173`. Khi `VITE_API_BASE_URL` để trống, Vite proxy `/api` và `/uploads` sang backend local.

## Cấu trúc frontend

```text
src/
├── app/
│   ├── pages/              # Trang lỗi cấp ứng dụng: 403, 404
│   └── router/             # Route tree, route paths và kiểm tra quyền truy cập
├── layouts/                # Public/Auth/Vendor/Admin layout
├── modules/
│   ├── auth/               # Session, đăng nhập, route guard
│   ├── booking/            # Luồng đặt sân theo từng vai trò
│   ├── court/              # Khám phá/quản lý sân
│   ├── dashboard/          # Trang tổng quan theo vai trò
│   ├── home/               # Trang public
│   ├── payment/            # Kết quả và trạng thái thanh toán
│   ├── profile/            # Hồ sơ riêng theo USER/VENDOR/ADMIN
│   ├── settings/           # Cấu hình hệ thống
│   ├── sport/              # Quản lý môn thể thao
│   ├── user/               # Quản lý tài khoản người dùng/đối tác
│   └── venue/              # Khám phá/quản lý địa điểm
├── components/ui/          # Primitive shadcn/ui
├── components/shared/      # Component dùng giữa các module
├── components/icons/       # Ánh xạ Remix Icon dùng thống nhất toàn ứng dụng
├── lib/                    # API client và utility dùng chung
└── styles/                 # Theme token và global style
```

Module cấp cao nhất luôn biểu diễn domain nghiệp vụ. Role không tạo thành module riêng; page theo role đặt trong `pages/public`, `pages/user`, `pages/vendor` hoặc `pages/admin` của domain tương ứng.

Route chính:

- Public: `/`, `/sports`, `/courts`, `/courts/:courtId`, `/venues`, `/venues/:venueId`.
- Guest-only: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/resend-verification`.
- Auth callback: `/verify-email`, `/auth/reset-password`, `/auth/google/callback`.
- User: `/user`, `/user/bookings`, `/user/bookings/:bookingId`, `/user/profile`, `/courts/:courtId/book`, `/payment/result`.
- Vendor: `/vendor`, `/vendor/venues/*`, `/vendor/courts/*`, `/vendor/bookings/*`, `/vendor/profile`.
- Admin: `/admin`, `/admin/sports`, `/admin/users`, `/admin/vendors`, `/admin/venues`, `/admin/courts`, `/admin/bookings/*`, `/admin/settings`, `/admin/profile`.

Người đã đăng nhập không thể mở route guest-only. Route protected kiểm tra đúng role; sai role chuyển đến `/403`, URL không tồn tại đi trang 404. Backend vẫn là nơi bắt buộc kiểm tra phân quyền và ownership dữ liệu.

`USER` tiếp tục sử dụng `PublicLayout`: đăng nhập chỉ mở thêm lịch đặt, hồ sơ, tạo booking và kết quả thanh toán. `VENDOR` và `ADMIN` dùng workspace layout riêng vì có sidebar và nghiệp vụ quản trị.

## Luồng xác thực

- Đăng ký tạo tài khoản `PENDING_VERIFICATION` và chuyển người dùng đến màn hình kiểm tra email.
- Email chứa link `${FRONTEND_BASE_URL}/verify-email?token=...`.
- Xác minh thành công chỉ kích hoạt tài khoản; người dùng phải đăng nhập lại để tạo session.
- Access token chỉ được lưu trong memory của ứng dụng, không lưu trong `localStorage` hoặc `sessionStorage`.
- Refresh token do backend lưu trong cookie `HttpOnly`; JavaScript frontend không đọc được giá trị cookie.
- Khi tải lại trang, frontend gọi `POST /auth/session` để cấp lại access token mà không rotate refresh token.
- Khi protected API trả `401`, frontend gọi một lần `POST /auth/refresh`, backend rotate cookie rồi frontend thử lại các request đang chờ.
- Nếu refresh thất bại, access token và auth state phía frontend bị xóa.

## Biến môi trường

```dotenv
VITE_API_BASE_URL=
```

- Để trống khi frontend/backend cùng domain và reverse proxy `/api`.
- Nếu frontend/backend khác domain, đặt URL đầy đủ, ví dụ `https://api.example.com/api` và cấu hình CORS/cookie tương ứng ở backend.
- Biến Vite được đóng gói lúc build, không thay đổi được sau khi image đã build.

## Build production

```bash
npm ci
npm run lint
npm run build
npm run preview
```

Nội dung deploy nằm trong `dist/`. Web server phải fallback route không tồn tại về `index.html` vì ứng dụng dùng `BrowserRouter`.

### Docker + Nginx

Build cùng-origin (frontend gọi `/api`):

```bash
docker build -t sportzone-frontend ./frontend
docker run --rm -p 8081:80 -e BACKEND_URL=http://host.docker.internal:8080 sportzone-frontend
```

`BACKEND_URL` là địa chỉ backend mà container Nginx truy cập được. Nginx đã cấu hình SPA fallback và proxy `/api`, `/uploads`.

Build với API ở domain riêng:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com/api \
  -t sportzone-frontend ./frontend
```

## Kiểm tra

```bash
npm run lint
npm run build
```
