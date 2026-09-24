"use client";

import { useState } from "react";
import styles from "./copy-button.module.css";

export function CopyButton({ value, label, done }: { value: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={styles.button}
      data-copied={copied}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.done} aria-live="polite">
        {copied ? done : ""}
      </span>
    </button>
  );
}
