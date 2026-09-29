import type { ReactNode, SVGProps } from "react";

// Simple stroke icons from /design (24×24 viewBox, 1.8–2px stroke). Colour follows `currentColor`.
type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number };

function createIcon(paths: ReactNode, defaultStroke = 1.8) {
  function Icon({ size = 24, strokeWidth = defaultStroke, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {paths}
      </svg>
    );
  }
  return Icon;
}

export const BellIcon = createIcon(
  <>
    <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>,
);

export const UserIcon = createIcon(
  <>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20.5c.8-3.6 4-5.5 7.5-5.5s6.7 1.9 7.5 5.5" />
  </>,
  1.9,
);

export const HomeIcon = createIcon(
  <>
    <path d="M3 11l9-7 9 7" />
    <path d="M5.5 9.5V20h13V9.5" />
  </>,
);

export const MapIcon = createIcon(
  <>
    <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </>,
);

export const PlateIcon = createIcon(
  <>
    <rect x="3" y="7" width="18" height="11" rx="2" />
    <path d="M7 12.5h6" />
  </>,
);

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </>,
  2,
);

export const ScanIcon = createIcon(
  <>
    <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
    <path d="M8 12h8" />
  </>,
  1.9,
);

export const CameraIcon = createIcon(
  <>
    <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </>,
  1.9,
);

export const PlateSearchIcon = createIcon(
  <>
    <rect x="2.5" y="5" width="13" height="8" rx="1.5" />
    <path d="M5.5 9h5" />
    <circle cx="16.5" cy="15.5" r="3.5" />
    <path d="M21 20l-2-2" />
  </>,
  1.9,
);

export const PlusIcon = createIcon(<path d="M12 5v14M5 12h14" />, 2.2);

export const ArrowRightIcon = createIcon(<path d="M5 12h14M13 6l6 6-6 6" />, 2.2);

export const ArrowLeftIcon = createIcon(<path d="M19 12H5M11 6l-6 6 6 6" />, 2.2);

export const ImageIcon = createIcon(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <circle cx="9" cy="9.5" r="1.8" />
    <path d="M21 15.5l-5-5L5 20" />
  </>,
  1.9,
);

export const ShieldIcon = createIcon(
  <>
    <path d="M12 3l7.5 3v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6L12 3z" />
    <path d="M9 12l2 2 4-4" />
  </>,
  1.9,
);

export const CheckIcon = createIcon(<path d="M20 6L9 17l-5-5" />, 2);

export const CloseIcon = createIcon(<path d="M6 6l12 12M18 6L6 18" />, 2.2);

export const ChevronDownIcon = createIcon(<path d="M6 9l6 6 6-6" />, 2.2);

export const ChevronRightIcon = createIcon(<path d="M9 6l6 6-6 6" />, 2.2);

export const ExpandIcon = createIcon(<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5" />, 2);

export const PinIcon = createIcon(
  <>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </>,
  2,
);

export const ClockIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l3 2" />
  </>,
  2,
);

export const FilterIcon = createIcon(
  <>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </>,
  1.9,
);

export const LayersIcon = createIcon(
  <>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5" />
  </>,
);

export const LocateIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </>,
  1.9,
);

export const NavigateIcon = createIcon(<path d="M3 11l18-8-8 18-2-8-8-2z" />, 2);

export const MessageIcon = createIcon(<path d="M4 5h16v11H9l-5 4V5z" />, 2);

export const MailIcon = createIcon(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </>,
  2,
);

export function MoreIcon({ size = 20, ...props }: Omit<IconProps, "strokeWidth">) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}

/** App logo: plate with a yellow water drop. */
export function LogoIcon({ size = 24, ...props }: Omit<IconProps, "strokeWidth">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="7" width="18" height="11" rx="2" />
      <path d="M6.5 12.5h6" />
      <path
        d="M16.8 10.3c.9 1.1 1.4 1.9 1.4 2.5a1.4 1.4 0 0 1-2.8 0c0-.6.5-1.4 1.4-2.5z"
        className="fill-accent stroke-accent"
      />
    </svg>
  );
}
