import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("is a labelled switch that reflects its state", () => {
    render(<Toggle checked label="SMS" onChange={() => {}} />);
    const toggle = screen.getByRole("switch", { name: "SMS" });
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange with the opposite value when clicked", async () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} label="SMS" onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("can be toggled with the keyboard", async () => {
    const onChange = vi.fn();
    render(<Toggle checked label="SMS" onChange={onChange} />);
    screen.getByRole("switch").focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
