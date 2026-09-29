import type { Metadata } from "next";
import { Suspense } from "react";
import { ReportFlow } from "@/components/report/ReportFlow";
import { MOCK_USER_LOCATION } from "@/lib/mock/data";
import { th } from "@/locales/th";

export const metadata: Metadata = {
  title: `${th.report.title} · ${th.app.name}`,
};

export default function ReportPage() {
  // ReportFlow reads ?step= with useSearchParams, which needs a Suspense boundary.
  return (
    <Suspense>
      <ReportFlow initialLocation={MOCK_USER_LOCATION} />
    </Suspense>
  );
}
