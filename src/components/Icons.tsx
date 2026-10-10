import type { ReactElement, SVGProps } from "react";
import type { CategoryId } from "../game/types";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

const CATEGORY_PATHS: Record<CategoryId | "coroa", ReactElement> = {
  capitais: (
    <>
      <path d="M3 21h18" />
      <path d="M4 10h16L12 4z" />
      <path d="M6 10v8M10 10v8M14 10v8M18 10v8" />
    </>
  ),
  bandeiras: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h12l-2.5 4.5L17 13H5" />
    </>
  ),
  continentes: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
    </>
  ),
  moedas: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9.2c-.6-.8-1.7-1.2-3-1.2c-1.7 0-3 .9-3 2s1.3 1.7 3 2s3 .9 3 2s-1.3 2-3 2c-1.3 0-2.4-.4-3-1.2" />
      <path d="M12 6.5v11" />
    </>
  ),
  idiomas: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  natureza: (
    <>
      <path d="M2.5 20l6.5-11l4 6.5l2.5-3.5l6 8z" />
      <circle cx="17.5" cy="6" r="2" />
    </>
  ),
  coroa: (
    <>
      <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" />
      <path d="M5 16h14" />
    </>
  ),
};

export function CategoryIcon({ id, ...rest }: IconProps & { id: CategoryId | "coroa" }) {
  return <Svg {...rest}>{CATEGORY_PATHS[id]}</Svg>;
}

export const HeartIcon = (p: IconProps) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3c1.4-1.9 3-3 5-3c3.4 0 5.6 3.4 4.3 6.8c-1.8 4.6-9.3 9.2-9.3 9.2z" />
  </Svg>
);
export const BackIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 5l-7 7l7 7" />
  </Svg>
);
export const CheckIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={3}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const CrossIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={3}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const PlayIcon = (p: IconProps) => (
  <Svg {...p} fill="currentColor">
    <path d="M7 4.5v15l12.5-7.5z" />
  </Svg>
);
export const TargetIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </Svg>
);
export const BookIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5c-2.5-2-5.5-2-8-.5z" />
    <path d="M12 6v13.5" />
  </Svg>
);
export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Svg>
);
export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);
export const FlameIcon = (p: IconProps) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M12 2.5c.6 3.4 4.8 5.6 4.8 10.5a4.8 4.8 0 0 1-9.6 0c0-2 .9-3.5 2.1-4.7c.2 1.6 1 2.6 2 3c-.5-3.3-.1-6.1.7-8.8z" />
  </Svg>
);
