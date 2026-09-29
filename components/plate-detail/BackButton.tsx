"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "@/components/ui/IconButton";
import { ArrowLeftIcon } from "@/components/ui/icons";

type Props = { label: string; /** Used when the page was opened directly (shared link, new tab). */ fallbackHref: string };

/** Goes back to wherever the user came from (search, map); falls back to `fallbackHref`. */
export function BackButton({ label, fallbackHref }: Props) {
  const router = useRouter();
  return (
    <IconButton
      label={label}
      variant="glass-dark"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallbackHref))}
    >
      <ArrowLeftIcon size={22} />
    </IconButton>
  );
}
