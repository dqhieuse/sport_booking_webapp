import { ArrowRightFromSquare, Bars, ChevronDown } from "@gravity-ui/icons";
import { Avatar, Button, Dropdown, Label, Link, Separator } from "@heroui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { getDefaultRouteForRole, useAuth } from "~/features/auth/AuthProvider";
import { cn } from "~/lib/utils";
import { routePaths } from "~/routes/routePaths";

const sportMenuItems = [
  { id: "all", label: "Tất cả môn thể thao", to: routePaths.courts },
  { id: "bong-da", label: "Bóng đá", to: `${routePaths.courts}?sport=bong-da` },
  { id: "cau-long", label: "Cầu lông", to: `${routePaths.courts}?sport=cau-long` },
  { id: "tennis", label: "Tennis", to: `${routePaths.courts}?sport=tennis` },
  {
    id: "pickleball",
    label: "Pickleball",
    to: `${routePaths.courts}?sport=pickleball`,
  },
];

const navItems = [
  { label: "Lịch đặt", to: routePaths.bookingHistory },
  { label: "Liên hệ", to: "#contact" },
];

export function AppHeader() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, status, user } = useAuth();
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const updateHeaderState = () => {
      setIsFloating(window.scrollY > 8);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderState);
  }, []);

  function userInitials(fullName?: string) {
    if (!fullName?.trim()) return "SZ";

    const words = fullName.trim().split(/\s+/);
    const first = words[0]?.[0] ?? "";
    const last = words.length > 1 ? words[words.length - 1]?.[0] ?? "" : "";

    return `${first}${last}`.toUpperCase();
  }

  async function handleAccountMenuAction(key: React.Key) {
    if (!user) return;

    if (key === "profile") {
      navigate(routePaths.profile);
      return;
    }

    if (key === "bookings") {
      navigate(routePaths.bookingHistory);
      return;
    }

    if (key === "dashboard") {
      navigate(getDefaultRouteForRole(user.role));
      return;
    }

    if (key === "logout") {
      await logout();
      navigate(routePaths.home);
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[padding,background-color,box-shadow] duration-300 ease-out",
        isFloating
          ? "bg-transparent px-3 py-2 sm:px-6"
          : "bg-white/95 px-4 py-0 backdrop-blur sm:px-6",
      )}
    >
      <div
        className={cn(
          "flex w-full items-center justify-between gap-4 transition-[border-radius,box-shadow,background-color,padding,transform] duration-300 ease-out",
          isFloating
            ? "translate-y-1 rounded-full bg-white/90 px-4 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur"
            : "translate-y-0 rounded-none bg-white px-0 py-2.5 shadow-none",
        )}
      >
        <div className="flex flex-row items-center gap-3">
          <Link
            className="rounded-full border border-transparent px-2 py-1 text-[14px] font-bold leading-5 text-[#18181b] transition-all! hover:border-secondary"
            href={routePaths.home}
          >
            SportZone<span className="text-success">.</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu chính">
            <Separator orientation="vertical" className="h-4 w-0.5 my-auto"/>
            <Link
              className="flex h-9 items-center font-normal justify-center rounded-3xl px-4 text-sm leading-5 text-[#18181b] transition-colors! hover:bg-default"
              href={routePaths.home}
            >
              Trang chủ
            </Link>
            <Dropdown>
              <Dropdown.Trigger className="flex h-9 items-center justify-center gap-2 rounded-3xl px-4 text-sm! leading-5 text-[#18181b] outline-none transition-colors hover:bg-default">
                Sân
                <ChevronDown className="size-4" aria-hidden="true" />
              </Dropdown.Trigger>
              <Dropdown.Popover className="min-w-[220px] rounded-2xl">
                <Dropdown.Menu
                  aria-label="Chọn môn thể thao"
                  onAction={(key) => {
                    const item = sportMenuItems.find(
                      (sport) => sport.id === String(key),
                    );

                    if (item) {
                      navigate(item.to);
                    }
                  }}
                >
                  {sportMenuItems.map((item) => (
                    <Dropdown.Item id={item.id} key={item.id}>
                      <Label>{item.label}</Label>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
            {navItems.map((item) => (
              <Link
                className="flex h-9 items-center font-normal justify-center rounded-3xl px-4 text-sm leading-5 text-[#18181b] transition-colors! hover:bg-default"
                href={item.to}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          {status === "authenticated" && isAuthenticated && user ? (
            <Dropdown>
              <Dropdown.Trigger
                aria-label="Mở menu tài khoản"
                className="flex size-10 items-center justify-center rounded-full outline-none transition-transform active:scale-[0.96]"
              >
                <Avatar className="size-9 border border-border bg-default">
                  {user.avatarUrl && (
                    <Avatar.Image alt={user.fullName} src={user.avatarUrl} />
                  )}
                  <Avatar.Fallback>{userInitials(user.fullName)}</Avatar.Fallback>
                </Avatar>
              </Dropdown.Trigger>
              <Dropdown.Popover className="min-w-[240px] rounded-2xl">
                <div className="px-3 pt-3 pb-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-9 border border-border bg-default">
                      {user.avatarUrl && (
                        <Avatar.Image alt={user.fullName} src={user.avatarUrl} />
                      )}
                      <Avatar.Fallback>{userInitials(user.fullName)}</Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <Label>{user.fullName}</Label>
                      <span className="text-xs text-muted">{user.email}</span>
                    </div>
                  </div>
                </div>
                <Dropdown.Menu
                  aria-label="Tài khoản"
                  onAction={(key) => void handleAccountMenuAction(key)}
                >
                  <Dropdown.Item id="bookings" textValue="Lịch đặt">
                    <Label>Lịch đặt</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="profile" textValue="Hồ sơ cá nhân">
                    <Label>Hồ sơ cá nhân</Label>
                  </Dropdown.Item>
                  {(user.role === "ADMIN" || user.role === "VENDOR") && (
                    <Dropdown.Item id="dashboard" textValue="Dashboard">
                      <Label>
                        {user.role === "ADMIN"
                          ? "Admin Dashboard"
                          : "Vendor Dashboard"}
                      </Label>
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item variant="danger" id="logout" textValue="Đăng xuất">
                    <div className="flex w-full items-center justify-between gap-2">
                      <Label>Đăng xuất</Label>
                      <ArrowRightFromSquare className="size-3.5 text-danger" />
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          ) : (
            <>
              <Button
                className="h-9 rounded-3xl px-4 text-[14px]! font-medium!"
                type="button"
                variant="outline"
                onPress={() => navigate(routePaths.login)}
              >
                Đăng nhập
              </Button>
              <Button
                className="h-9 rounded-3xl px-4 text-[14px]! font-medium!"
                type="button"
                variant="primary"
                onPress={() => navigate(routePaths.register)}
              >
                Đăng ký
              </Button>
            </>
          )}
        </div>

        {status === "authenticated" && isAuthenticated && user ? (
          <Dropdown>
            <Dropdown.Trigger
              aria-label="Mở menu tài khoản"
              className="flex size-10 items-center justify-center rounded-full outline-none transition-transform active:scale-[0.96] sm:hidden"
            >
              <Avatar className="size-9 border border-border bg-default">
                {user.avatarUrl && (
                  <Avatar.Image alt={user.fullName} src={user.avatarUrl} />
                )}
                <Avatar.Fallback>{userInitials(user.fullName)}</Avatar.Fallback>
              </Avatar>
            </Dropdown.Trigger>
            <Dropdown.Popover className="min-w-[220px] rounded-2xl">
              <Dropdown.Menu
                aria-label="Tài khoản"
                onAction={(key) => void handleAccountMenuAction(key)}
              >
                <Dropdown.Item id="profile" textValue="Hồ sơ cá nhân">
                  <Label>Hồ sơ cá nhân</Label>
                </Dropdown.Item>
                <Dropdown.Item id="bookings" textValue="Lịch đặt">
                  <Label>Lịch đặt</Label>
                </Dropdown.Item>
                {(user.role === "ADMIN" || user.role === "VENDOR") && (
                  <Dropdown.Item id="dashboard" textValue="Dashboard">
                    <Label>Dashboard</Label>
                  </Dropdown.Item>
                )}
                <Dropdown.Item id="logout" textValue="Đăng xuất">
                  <Label>Đăng xuất</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        ) : (
          <Button
            isIconOnly
            aria-label="Mở menu"
            className="sm:hidden"
            type="button"
            variant="tertiary"
          >
            <Bars className="size-5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </header>
  );
}
