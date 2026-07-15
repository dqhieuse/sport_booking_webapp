import { Link } from "@heroui/react";

import { routePaths } from "~/routes/routePaths";

const footerSections = [
  {
    title: "Khám phá",
    links: [
      { label: "Trang chủ", href: routePaths.home },
      { label: "Danh sách sân", href: routePaths.courts },
      { label: "Địa điểm", href: routePaths.venues },
      { label: "Môn thể thao", href: routePaths.sports },
    ],
  },
  {
    title: "Môn phổ biến",
    links: [
      { label: "Bóng đá", href: `${routePaths.courts}?sport=bong-da` },
      { label: "Cầu lông", href: `${routePaths.courts}?sport=cau-long` },
      { label: "Tennis", href: `${routePaths.courts}?sport=tennis` },
      { label: "Pickleball", href: `${routePaths.courts}?sport=pickleball` },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Lịch đặt của tôi", href: routePaths.bookingHistory },
      { label: "Đăng nhập", href: routePaths.login },
      { label: "Tạo tài khoản", href: routePaths.register },
      { label: "Liên hệ", href: `${routePaths.home}#contact` },
    ],
  },
];

const contactItems = [
  "support@sportzone.vn",
  "08:00 - 22:00 hằng ngày",
  "Hà Nội, TP. Hồ Chí Minh, Đà Nẵng",
];

const footerLinkClassName =
  "relative inline-flex w-fit text-white/60 transition-colors before:absolute before:-bottom-1 before:left-0 before:h-px before:w-full before:origin-left before:scale-x-0 before:bg-success before:transition-transform before:duration-300 before:ease-out hover:text-success hover:before:scale-x-100 focus-visible:text-success focus-visible:before:scale-x-100";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="overflow-hidden relative bg-[#2c2c2c] text-white">
      <div className="rounded-b-[48px] lg:rounded-b-[72px] h-32 bg-background shadow-2xl"></div>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pt-14">
        <div className="grid gap-10 pt-10 lg:grid-cols-[1.25fr_2fr]">
          <div className="max-w-sm">
            <Link
              className={`${footerLinkClassName} text-[16px] font-bold leading-6 text-white`}
              href={routePaths.home}
            >
              SportZone<span className="text-success">.</span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Nền tảng đặt sân thể thao giúp người chơi tìm sân, xem lịch trống
              và quản lý lịch đặt rõ ràng hơn.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h2 className="text-sm text-white/50">
                  {section.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {section.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        className={`${footerLinkClassName} text-sm font-semibold leading-5`}
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h2 className="text-sm font-semibold text-white">Liên hệ</h2>
              <ul className="mt-4 space-y-3 text-sm leading-5 text-white/60">
                {contactItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-5 text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} SportZone. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>Điều khoản sử dụng</span>
            <span>Chính sách bảo mật</span>
          </div>
        </div>
      </div>
      <div className="relative flex min-h-[180px] items-end justify-center px-6 sm:min-h-[240px] lg:min-h-[300px]">
        <p className="translate-y-8 text-[64px] font-bold leading-none text-white/0 [-webkit-text-stroke:1px_rgba(255,255,255,0.16)] sm:text-[120px] lg:text-[200px]">
          SportZone.
        </p>
      </div>
    </footer>
  );
}
