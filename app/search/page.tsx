import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ResultCard } from "@/components/search/ResultCard";
import { SearchHeader } from "@/components/search/SearchHeader";
import { OutlineButton, PrimaryButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { BellIcon, MapIcon, PlateSearchIcon } from "@/components/ui/icons";
import { getMockFoundReports } from "@/lib/mock/data";
import { formatPlate, normalizePlate } from "@/lib/plate-utils/parse";
import { getProvince } from "@/lib/plate-utils/provinces";
import { parseSearchQuery, searchByNumber, searchPlates, type SearchQuery } from "@/lib/plate-utils/search";
import { th } from "@/locales/th";

const t = th.search;

export const metadata: Metadata = {
  title: `${t.title} · ${th.app.name}`,
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q) ?? "";
  const parsed = parseSearchQuery(query);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-8">
      <SearchHeader query={query} />
      <div className="flex flex-col gap-5 px-5 pt-5">
        {parsed.kind === "empty" && (
          <Message icon={<PlateSearchIcon size={26} />} heading={t.empty.heading} sub={t.empty.sub}>
            <p className="text-[13px] text-muted">
              {t.empty.examples}: <Example q="1กข 1234 กรุงเทพ" /> <Example q="กข 123" /> <Example q="1234" />
            </p>
          </Message>
        )}

        {parsed.kind === "invalid" && (
          <Message icon={<PlateSearchIcon size={26} />} heading={t.invalid.heading} sub={t.invalid.sub} />
        )}

        {parsed.kind === "province_only" && (
          <ProvinceOnly provinceName={getProvince(parsed.provinceCode)?.nameTh ?? ""} />
        )}

        {(parsed.kind === "plate" || parsed.kind === "number") && <Results query={parsed} />}
      </div>
    </main>
  );
}

type ResultsQuery = Extract<SearchQuery, { kind: "plate" | "number" }>;

function Results({ query }: { query: ResultsQuery }) {
  // Mock data until the `searchPlates` server action lands (Phase 5).
  const now = new Date();
  const reports = getMockFoundReports(now).map((r) => ({
    ...r,
    normalized: normalizePlate(formatPlate(r.plate)),
    number: r.plate.number,
  }));
  const { provinceCode } = query;
  const byNumber = query.kind === "number";
  const { exact, similar } = byNumber
    ? searchByNumber(query, reports)
    : searchPlates({ normalized: query.plate.normalized, provinceCode }, reports);

  const plateText = byNumber ? t.numberLabel(query.number) : formatPlate(query.plate);
  const provinceName = provinceCode ? getProvince(provinceCode)?.nameTh : t.allProvinces;
  // A number alone isn't a full plate, so the add-plate form only gets the province.
  const registerHref = `/my-plates/new?${new URLSearchParams({
    ...(!byNumber && { plate: query.plate.normalized }),
    ...(provinceCode && { province: provinceCode }),
  })}`;

  return (
    <>
      <div className="flex flex-col gap-1 animate-rise stagger-2">
        <p className="text-[13px] text-muted">{t.searchingFor}</p>
        <p className="font-display text-lg font-semibold text-deep">
          {plateText} · {provinceName}
        </p>
        {query.kind === "plate" && query.unknownProvince && (
          <p className="text-[13px] text-muted">{t.unknownProvince(query.unknownProvince)}</p>
        )}
        {byNumber && <p className="text-[13px] leading-normal text-muted">{t.numberTip}</p>}
      </div>

      {exact.length > 0 ? (
        <section aria-labelledby="exact-heading" className="flex flex-col gap-3 animate-rise stagger-3">
          <SectionHeading id="exact-heading" count={exact.length}>
            {byNumber ? t.numberExactHeading(query.number) : t.exactHeading}
          </SectionHeading>
          <ul className="flex flex-col gap-3">
            {exact.map(({ item }) => (
              <ResultCard key={item.id} report={item} now={now} />
            ))}
          </ul>
          <p className="text-center text-[13px] text-muted">
            {t.notYours}{" "}
            <Link href={registerHref} className="inline-block py-2.5 font-semibold text-link">
              {t.notYoursCta}
            </Link>
          </p>
        </section>
      ) : (
        <div className="animate-rise stagger-3">
          <Message icon={<BellIcon size={26} />} heading={byNumber ? t.none.numberHeading(query.number) : t.none.heading(plateText)} sub={t.none.sub}>
            <PrimaryButton href={registerHref} className="mt-1 w-full">
              <BellIcon size={20} />
              {t.none.cta}
            </PrimaryButton>
          </Message>
        </div>
      )}

      {similar.length > 0 && (
        <section aria-labelledby="similar-heading" className="flex flex-col gap-3 animate-rise stagger-4">
          <div className="flex flex-col gap-0.5">
            <SectionHeading id="similar-heading" count={similar.length}>
              {t.similarHeading}
            </SectionHeading>
            <p className="text-[13px] leading-normal text-muted">{t.similarSub}</p>
          </div>
          <ul className="flex flex-col gap-3">
            {similar.map(({ item, reason }) => (
              <ResultCard key={item.id} report={item} reason={reason} now={now} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function ProvinceOnly({ provinceName }: { provinceName: string }) {
  return (
    <Message icon={<PlateSearchIcon size={26} />} heading={t.provinceOnly.heading} sub={t.provinceOnly.sub(provinceName)}>
      <OutlineButton href="/map" className="mt-1 w-full">
        <MapIcon size={20} />
        {t.provinceOnly.map}
      </OutlineButton>
    </Message>
  );
}

function SectionHeading({ id, count, children }: { id: string; count: number; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 id={id} className="font-display text-lg font-semibold text-deep">
        {children}
      </h2>
      <span className="text-[13px] text-muted">{t.exactCount(count)}</span>
    </div>
  );
}

function Message({ icon, heading, sub, children }: { icon: ReactNode; heading: string; sub: string; children?: ReactNode }) {
  return (
    <GlassCard className="flex flex-col items-center gap-2.5 px-5 py-6 text-center animate-rise stagger-2">
      <span className="flex size-14 items-center justify-center rounded-[18px] bg-info-soft text-info-ink">{icon}</span>
      <h2 className="font-display text-lg font-semibold text-deep">{heading}</h2>
      <p className="text-sm leading-normal text-balance text-muted">{sub}</p>
      {children}
    </GlassCard>
  );
}

function Example({ q }: { q: string }) {
  return (
    <Link
      href={`/search?${new URLSearchParams({ q })}`}
      className="inline-block rounded-full bg-info-soft px-3 py-2.5 font-semibold text-info-ink"
    >
      {q}
    </Link>
  );
}
