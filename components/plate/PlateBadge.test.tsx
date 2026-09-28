import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlateBadge } from "./PlateBadge";

const plate = { prefixDigit: "1", letters: "กข", number: "1234" };

describe("PlateBadge", () => {
  it("shows the formatted plate and the province name", () => {
    render(<PlateBadge plate={plate} provinceCode="10" />);
    expect(screen.getByText("1กข 1234")).toBeInTheDocument();
    expect(screen.getByText("กรุงเทพมหานคร")).toBeInTheDocument();
  });

  it("has an accessible label with plate and province", () => {
    render(<PlateBadge plate={plate} provinceCode="12" />);
    expect(screen.getByRole("img", { name: "ป้ายทะเบียน 1กข 1234 นนทบุรี" })).toBeInTheDocument();
  });

  it("omits the province line when the province is unknown", () => {
    render(<PlateBadge plate={{ ...plate, prefixDigit: null }} provinceCode={null} />);
    expect(screen.getByRole("img", { name: "ป้ายทะเบียน กข 1234" })).toBeInTheDocument();
  });

  it.each([
    ["sm", "108px", "56px"],
    ["md", "136px", "70px"],
  ] as const)("renders size %s at %s × %s", (size, width, height) => {
    render(<PlateBadge plate={plate} provinceCode="10" size={size} />);
    const badge = screen.getByRole("img");
    expect(badge).toHaveStyle({ width, height });
  });
});
