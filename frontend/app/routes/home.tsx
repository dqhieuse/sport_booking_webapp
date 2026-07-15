import type { Route } from "./+types/home";
import HomePage from "~/pages/public/HomePage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SportZone - Đặt sân thể thao" },
    {
      name: "description",
      content: "Tìm sân thể thao, xem địa điểm và đặt lịch nhanh.",
    },
  ];
}

export default function Home() {
  return <HomePage />;
}
