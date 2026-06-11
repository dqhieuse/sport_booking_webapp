import * as React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/useAuth";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { routePaths } from "@/routes/routePaths";

type BreadcrumbItemType = {
    label: string;
    to?: string;
};

export function VendorLayout() {
    const { session } = useAuth();
    const { pathname } = useLocation();

    const breadcrumbItems: BreadcrumbItemType[] = (() => {
        const items: BreadcrumbItemType[] = [
            { label: "Vendor", to: routePaths.vendorDashboard },
        ];

        if (pathname === routePaths.vendorDashboard) {
            items.push({ label: "Dashboard" });
            return items;
        }

        if (pathname === routePaths.vendorProfile) {
            items.push({ label: "Profile" });
            return items;
        }

        if (pathname === routePaths.vendorVenues) {
            items.push({ label: "Venues" });
            return items;
        }

        if (pathname === routePaths.vendorVenueCreate) {
            items.push({ label: "Venues", to: routePaths.vendorVenues });
            items.push({ label: "Create venue" });
            return items;
        }

        if (/^\/vendor\/venues\/\d+\/edit$/.test(pathname)) {
            items.push({ label: "Venues", to: routePaths.vendorVenues });
            items.push({ label: "Edit venue" });
            return items;
        }

        if (pathname.startsWith(`${routePaths.vendorVenues}/`)) {
            items.push({ label: "Venues", to: routePaths.vendorVenues });
            items.push({ label: "Venue details" });
            return items;
        }

        if (pathname === routePaths.vendorCourts) {
            items.push({ label: "Courts" });
            return items;
        }

        if (pathname === routePaths.vendorCourtCreate) {
            items.push({ label: "Courts", to: routePaths.vendorCourts });
            items.push({ label: "Create court" });
            return items;
        }

        if (/^\/vendor\/courts\/\d+\/edit$/.test(pathname)) {
            items.push({ label: "Courts", to: routePaths.vendorCourts });
            items.push({ label: "Edit court" });
            return items;
        }

        if (pathname.startsWith(`${routePaths.vendorCourts}/`)) {
            items.push({ label: "Courts", to: routePaths.vendorCourts });
            items.push({ label: "Court details" });
            return items;
        }

        if (pathname === routePaths.vendorImages) {
            items.push({ label: "Images" });
            return items;
        }

        if (pathname === routePaths.vendorImageCreate) {
            items.push({ label: "Images", to: routePaths.vendorImages });
            items.push({ label: "Create image" });
            return items;
        }

        if (pathname === routePaths.vendorSlots) {
            items.push({ label: "Slots" });
            return items;
        }

        if (pathname === routePaths.vendorBookings) {
            items.push({ label: "Bookings" });
            return items;
        }

        items.push({ label: "Vendor" });
        return items;
    })();

    if (!session) {
        return null;
    }

    return (
        <SidebarProvider>
            <AppSidebar user={session.user} />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbItems.map((item, index) => (
                                <React.Fragment key={`${item.label}-${index}`}>
                                    <BreadcrumbItem>
                                        {item.to ? (
                                            <BreadcrumbLink asChild>
                                                <Link to={item.to}>
                                                    {item.label}
                                                </Link>
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage>
                                                {item.label}
                                            </BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                    {index < breadcrumbItems.length - 1 && (
                                        <BreadcrumbSeparator />
                                    )}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
