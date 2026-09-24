import Link from "next/link";
import { MonarchMark } from "@/components/brand/monarch-mark";
import styles from "./prose.module.css";

export default function NotFound() {
  return (
    <section className={styles.section} style={{ minHeight: "80vh", display: "grid", placeItems: "center", paddingTop: "var(--s-10)" }}>
      <div className="shell" style={{ display: "grid", justifyItems: "center", gap: "var(--s-5)", textAlign: "center" }}>
        <MonarchMark size={64} />
        <h1 className={styles.h2}>404</h1>
        <p className={styles.text}>Такой страницы нет · This page does not exist</p>
        <Link className="btn btn-primary" href="/">
          Monarch →
        </Link>
      </div>
    </section>
  );
}
