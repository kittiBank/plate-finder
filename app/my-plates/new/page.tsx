import type { Metadata } from "next";
import { AddLostPlateForm } from "@/components/my-plates/AddLostPlateForm";
import { bangkokToday, initialDraft } from "@/components/my-plates/draft";
import { th } from "@/locales/th";

export const metadata: Metadata = {
  title: `${th.addPlate.title} · ${th.app.name}`,
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AddLostPlatePage({ searchParams }: PageProps<"/my-plates/new">) {
  const params = await searchParams;
  const today = bangkokToday();
  // Search and plate-detail CTAs link here with ?plate=&province= so owners don't retype.
  const initial = initialDraft({ plate: first(params.plate), province: first(params.province) }, today);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <AddLostPlateForm initial={initial} today={today} />
    </main>
  );
}
