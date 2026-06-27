# Sport Booking Frontend

Frontend React + TypeScript được dựng bằng Vite, React Router, Axios, Tailwind CSS 4 và shadcn/ui.

## Chạy local

```bash
cp .env.example .env
npm install
npm run dev
```

Mở `http://localhost:5173/design-system` để xem SportZone Design System.

## Cấu trúc chính

- `src/components/ui`: toàn bộ primitive được sinh từ shadcn/ui.
- `src/components/design-system`: component và pattern riêng của SportZone.
- `src/pages/DesignSystemPage.tsx`: tài liệu trực quan, hướng dẫn và demo component.
- `src/styles/index.css`: token light/dark và Sport Blue.

## Kiểm tra

```bash
npm run lint
npm run build
```
