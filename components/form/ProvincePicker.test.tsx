import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { th } from "@/locales/th";
import { ProvincePicker, type ProvinceValue } from "./ProvincePicker";

function Controlled({ allowUnknown, onPick }: { allowUnknown?: boolean; onPick?: (v: ProvinceValue) => void }) {
  const [value, setValue] = useState<ProvinceValue>(undefined);
  return (
    <ProvincePicker
      value={value}
      onChange={(v) => {
        setValue(v);
        onPick?.(v);
      }}
      allowUnknown={allowUnknown}
    />
  );
}

async function openPicker() {
  await userEvent.click(screen.getByRole("button", { name: new RegExp(th.form.provinceLabel) }));
  return screen.getByRole("dialog", { name: th.form.provinceLabel });
}

describe("ProvincePicker", () => {
  it("shows the placeholder until a province is picked", () => {
    render(<Controlled />);
    expect(screen.getByRole("button", { name: new RegExp(th.form.provinceLabel) })).toHaveTextContent(
      th.form.provincePlaceholder,
    );
  });

  it("filters the list as the user searches", async () => {
    render(<Controlled />);
    const dialog = await openPicker();
    expect(within(dialog).getAllByRole("option")).toHaveLength(77);

    await userEvent.type(within(dialog).getByRole("searchbox", { name: th.form.provinceSearch }), "เชียง");
    const names = within(dialog).getAllByRole("option").map((o) => o.textContent);
    expect(names).toEqual(expect.arrayContaining(["เชียงใหม่", "เชียงราย"]));
    expect(names).not.toContain("กรุงเทพมหานคร");
  });

  it("says so when nothing matches", async () => {
    render(<Controlled />);
    const dialog = await openPicker();
    await userEvent.type(within(dialog).getByRole("searchbox"), "zzz");
    expect(within(dialog).queryAllByRole("option")).toHaveLength(0);
    expect(within(dialog).getByText(th.form.provinceNoResults("zzz"))).toBeInTheDocument();
  });

  it("selects a province, closes and shows its name", async () => {
    const onPick = vi.fn();
    render(<Controlled onPick={onPick} />);
    const dialog = await openPicker();
    await userEvent.click(within(dialog).getByRole("option", { name: "นนทบุรี" }));

    expect(onPick).toHaveBeenCalledWith("12");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(th.form.provinceLabel) })).toHaveTextContent("นนทบุรี");
  });

  it("marks the current province as selected", async () => {
    render(<Controlled />);
    await userEvent.click(within(await openPicker()).getByRole("option", { name: "นนทบุรี" }));
    const dialog = await openPicker();
    expect(within(dialog).getByRole("option", { name: "นนทบุรี" })).toHaveAttribute("aria-selected", "true");
  });

  it("only offers 'unknown province' when allowed", async () => {
    render(<Controlled />);
    expect(within(await openPicker()).queryByRole("option", { name: new RegExp(th.form.provinceUnknown) })).toBeNull();
  });

  it("can pick 'unknown province' as null", async () => {
    const onPick = vi.fn();
    render(<Controlled allowUnknown onPick={onPick} />);
    const dialog = await openPicker();
    await userEvent.click(within(dialog).getByRole("option", { name: new RegExp(th.form.provinceUnknown) }));

    expect(onPick).toHaveBeenCalledWith(null);
    expect(screen.getByRole("button", { name: new RegExp(th.form.provinceLabel) })).toHaveTextContent(
      th.form.provinceUnknown,
    );
  });
});
