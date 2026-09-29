import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { th } from "@/locales/th";
import { PlateInput } from "./PlateInput";

function Controlled({ initial = "", provinceCode }: { initial?: string; provinceCode?: string | null }) {
  const [value, setValue] = useState(initial);
  return <PlateInput value={value} onChange={setValue} provinceCode={provinceCode} />;
}

describe("PlateInput", () => {
  it("is a labelled text field with a hint", () => {
    render(<Controlled />);
    const input = screen.getByRole("textbox", { name: th.form.plateLabel });
    expect(input).toHaveAccessibleDescription(th.form.plateHint);
    expect(input).not.toHaveAttribute("aria-invalid", "true");
  });

  it("shows a live plate preview once the text is a valid plate", async () => {
    render(<Controlled provinceCode="10" />);
    await userEvent.type(screen.getByRole("textbox"), "1กข 1234");
    expect(screen.getByRole("img", { name: "ป้ายทะเบียน 1กข 1234 กรุงเทพมหานคร" })).toBeInTheDocument();
  });

  it("normalizes Thai digits in the preview", async () => {
    render(<Controlled />);
    await userEvent.type(screen.getByRole("textbox"), "กข ๑๒๓");
    expect(screen.getByRole("img", { name: "ป้ายทะเบียน กข 123" })).toBeInTheDocument();
  });

  it("does not flag an unfinished plate while the user is still typing", async () => {
    render(<Controlled />);
    await userEvent.type(screen.getByRole("textbox"), "1กข");
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText(th.form.plateInvalid)).not.toBeInTheDocument();
  });

  it("flags an invalid plate after the field loses focus", async () => {
    render(<Controlled />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "abc");
    await userEvent.tab();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(th.form.plateInvalid);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("does not flag an empty field on blur", async () => {
    render(<Controlled />);
    await userEvent.click(screen.getByRole("textbox"));
    await userEvent.tab();
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid", "true");
  });
});
