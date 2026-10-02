import { crestCrown, crestShield, crestTrunk, crestViewBox, crestAspect } from "./crest-paths";
import { asset } from "@/lib/asset";
import styles from "./monarch-mark.module.css";

/**
 * The official Monarch crest, drawn from the 1:1 trace of the owner's artwork.
 * `dark` is the primary variant (white shield, gold crown — for dark grounds);
 * `light` is its twin for light grounds (navy shield, muted gold crown).
 */
const palettes = {
  dark: { shield: "#fefefe", crown: "#e1ad33" },
  light: { shield: "#172234", crown: "#bf9a65" },
} as const;

/**
 * The app icon as PaperPixel shows it: the primary crest (white shield, gold
 * crown) on an ink tile. On paper the logo always sits on its tile; the gold
 * of the crown is the only colour on the site.
 */
export function MonarchTile({ size = 32, title, className }: { size?: number; title?: string; className?: string }) {
  return (
    <span
      className={[styles.tile, className].filter(Boolean).join(" ")}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.27) }}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <MonarchMark size={Math.round(size * 0.62)} variant="dark" />
    </span>
  );
}

export function MonarchMark({
  size = 32,
  variant = "dark",
  title,
  className,
}: {
  size?: number;
  variant?: keyof typeof palettes;
  title?: string;
  className?: string;
}) {
  const colors = palettes[variant];
  return (
    <svg
      className={[styles.mark, className].filter(Boolean).join(" ")}
      width={size}
      height={Math.round(size * crestAspect)}
      viewBox={crestViewBox}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={crestCrown} fill={colors.crown} fillRule="evenodd" />
      <path d={crestShield} fill={colors.shield} fillRule="evenodd" />
      <path d={crestTrunk} fill={colors.shield} fillRule="evenodd" />
    </svg>
  );
}

/** The MONARCH wordmark, cut 1:1 from the official artwork and tinted by CSS. */
export function MonarchWordmark({ height = 14, className }: { height?: number; className?: string }) {
  return (
    <span
      className={[styles.wordmark, className].filter(Boolean).join(" ")}
      style={{ height, width: Math.round((height * 937) / 104), "--wordmark": `url("${asset("/brand/wordmark.webp")}")` } as React.CSSProperties}
      aria-hidden
    />
  );
}
