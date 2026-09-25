"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { asset } from "@/lib/asset";
import styles from "./not-found-view.module.css";

// not-found receives no params, so the language comes from the address.
const COPY = {
  ru: { title: "Такой страницы нет.", text: "Возможно, адрес изменился. Вот куда можно пойти:", home: "На главную", download: "Скачать", updates: "Все версии" },
  uk: { title: "Такої сторінки немає.", text: "Можливо, адреса змінилася. Ось куди можна перейти:", home: "На головну", download: "Завантажити", updates: "Усі версії" },
  en: { title: "This page doesn’t exist.", text: "The address may have changed. Here’s where you can go:", home: "Home", download: "Download", updates: "All versions" },
  bg: { title: "Такава страница няма.", text: "Адресът може да се е променил. Ето къде можеш да отидеш:", home: "Начало", download: "Изтегли", updates: "Всички версии" },
} as const;

const noopSubscribe = () => () => {};
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const readSegment = () => {
  const path = window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length) : window.location.pathname;
  return path.split("/").filter(Boolean)[0] ?? "";
};

export function NotFoundView() {
  const segment = useSyncExternalStore(noopSubscribe, readSegment, () => "");
  const lang = (segment && segment in COPY ? segment : "ru") as keyof typeof COPY;
  const copy = COPY[lang];

  return (
    <section className={styles.root}>
      <div className={`shell ${styles.inner}`}>
        <Image className={styles.oscar} src={asset("/mascot/oscar-error.webp")} alt="" width={384} height={384} priority />
        <p className={styles.code}>404</p>
        <h1 className={`display ${styles.title}`}>{copy.title}</h1>
        <p className={styles.text}>{copy.text}</p>
        <div className={styles.links}>
          <Link className="btn btn-primary" href={`/${lang}`}>
            {copy.home}
          </Link>
          <Link className="btn btn-glass" href={`/${lang}/download`}>
            {copy.download}
          </Link>
          <Link className="btn btn-glass" href={`/${lang}/updates`}>
            {copy.updates}
          </Link>
        </div>
      </div>
    </section>
  );
}
