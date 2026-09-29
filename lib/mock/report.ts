// Stand-in for the `createFoundReport` server action (Phase 5): just waits like a network call.
export async function submitFoundReportMock(): Promise<{ id: string }> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { id: "fr-new" };
}
