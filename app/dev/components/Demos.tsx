"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Toggle } from "@/components/ui/Toggle";

// Dev-only gallery demos; labels here are sample data, not app copy.
export function ToggleDemo() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <div className="flex items-center gap-6">
      <Toggle checked={a} onChange={setA} label="md toggle" />
      <Toggle checked={b} onChange={setB} label="md toggle off" />
      <Toggle checked={a} onChange={setA} label="sm toggle" size="sm" />
      <Toggle checked disabled onChange={() => {}} label="disabled" />
    </div>
  );
}

const FILTERS = ["ทั้งหมด", "พบวันนี้", "ใกล้ฉัน 5 กม."];

export function ChipDemo() {
  const [selected, setSelected] = useState(FILTERS[0]);
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <Chip key={f} selected={selected === f} onClick={() => setSelected(f)}>
          {f}
        </Chip>
      ))}
      <Chip>
        <span className="size-2.5 rounded-[3px] border border-dashed border-link bg-aqua/40" />
        พื้นที่น้ำท่วม
      </Chip>
    </div>
  );
}
