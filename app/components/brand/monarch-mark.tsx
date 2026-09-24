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
