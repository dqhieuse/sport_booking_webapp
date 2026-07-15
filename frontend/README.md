# Sport Booking WebApp - Frontend

Frontend dùng React Router, Vite, TypeScript, Tailwind CSS, Hero UI và
`@gravity-ui/icons`.

## Cấu trúc chính

```text
app/
├── components/      # Component dùng chung: navigation, state, cards
├── config/          # Cấu hình env
├── features/        # Module theo domain: auth, sports, venues, courts, bookings
├── layouts/         # Public layout và dashboard layout
├── lib/             # API client, token store, helper
├── pages/           # Page composition
├── routes/          # React Router route files
└── types/           # Type dùng chung
```

## Cấu hình môi trường

Tạo file `.env` từ `.env.example` nếu cần đổi API URL:

```bash
VITE_APP_NAME=SportZone
VITE_API_BASE_URL=http://localhost:8080/api
```

## Chạy local

```bash
npm install
npm run dev
```

Ứng dụng chạy tại `http://localhost:5173`.

## Kiểm tra

```bash
npm run typecheck
npm run build
```

Ghi chú: hiện tại chưa thêm `axios` vì dependency chưa có trong `package.json`.
`app/lib/apiClient.ts` đang dùng `fetch` để giữ project build được trước.
