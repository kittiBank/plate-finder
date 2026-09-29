import Form from "next/form";
import { IconButton } from "@/components/ui/IconButton";
import { ArrowLeftIcon, SearchIcon } from "@/components/ui/icons";
import { th } from "@/locales/th";

const t = th.search;

/** Compact hero with the search box. Submitting reloads /search?q= via client navigation. */
export function SearchHeader({ query }: { query: string }) {
  return (
    <header className="relative overflow-hidden rounded-b-hero bg-hero px-5 pt-[18px] pb-6 text-white">
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-20 size-[230px] rounded-full bg-[radial-gradient(circle,rgba(126,214,255,0.5),rgba(126,214,255,0)_70%)] animate-float"
      />

      <div className="relative flex h-11 items-center gap-3 animate-rise">
        <IconButton href="/" label={t.back} variant="glass-dark">
          <ArrowLeftIcon size={22} />
        </IconButton>
        <h1 className="font-display text-[22px] font-bold">{t.title}</h1>
      </div>

      <div className="relative mt-4 rounded-[22px] border border-white/40 bg-white/22 p-1.5 shadow-[0_12px_30px_rgba(20,40,70,0.25)] backdrop-blur-lg animate-rise stagger-1">
        <Form
          action="/search"
          role="search"
          className="flex h-14 items-center gap-2.5 rounded-[17px] bg-white/96 pr-1.5 pl-4"
        >
          <SearchIcon size={22} className="shrink-0 text-link" />
          <input
            // Keyed so the box shows the new query after each client-side navigation.
            key={query}
            name="q"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            defaultValue={query}
            autoFocus={!query}
            placeholder={t.placeholder}
            aria-label={t.inputLabel}
            className="min-w-0 grow bg-transparent text-base text-deep outline-none placeholder:text-[#5d6d7e]"
          />
          <IconButton type="submit" label={t.submit} variant="cta">
            <SearchIcon size={20} />
          </IconButton>
        </Form>
      </div>
    </header>
  );
}
