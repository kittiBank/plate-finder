"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { th } from "@/locales/th";
import { HomeIcon, MapIcon, PlateIcon } from "./icons";

const TABS = [
  { href: "/", label: th.nav.home, Icon: HomeIcon },
  { href: "/map", label: th.nav.map, Icon: MapIcon },
  { href: "/my-plates", label: th.nav.myPlates, Icon: PlateIcon },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Floating glass tab bar: หน้าแรก / แผนที่ / ป้ายของฉัน. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label={th.nav.label}
      className={cn(
        "fixed inset-x-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-50 mx-auto grid h-[68px] max-w-[358px] grid-cols-3 items-center px-2",
        "rounded-nav border border-white/90 bg-white/72 shadow-nav backdrop-blur-xl backdrop-saturate-160",
      )}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-0.5 py-1.5 text-[11.5px]",
              active ? "font-semibold text-link" : "font-medium text-muted",
            )}
          >
            <Icon strokeWidth={active ? 2 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
