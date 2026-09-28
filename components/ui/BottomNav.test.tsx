import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BottomNav } from "./BottomNav";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("BottomNav", () => {
  beforeEach(() => {
    pathname.current = "/";
  });

  it("shows the three tabs", () => {
    render(<BottomNav />);
    const nav = screen.getByRole("navigation", { name: "เมนูหลัก" });
    expect(nav.querySelectorAll("a")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "หน้าแรก" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "แผนที่" })).toHaveAttribute("href", "/map");
    expect(screen.getByRole("link", { name: "ป้ายของฉัน" })).toHaveAttribute("href", "/my-plates");
  });

  it("marks only the current tab", () => {
    pathname.current = "/map";
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: "แผนที่" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "หน้าแรก" })).not.toHaveAttribute("aria-current");
  });

  it("keeps a tab active on its sub-pages", () => {
    pathname.current = "/my-plates/new";
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: "ป้ายของฉัน" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "หน้าแรก" })).not.toHaveAttribute("aria-current");
  });
});
