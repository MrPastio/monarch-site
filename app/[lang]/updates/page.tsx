import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/content/dictionary";
import { isLocale, localeMeta, localePath } from "@/lib/i18n";
import { getReleaseCatalog } from "@/lib/releases";
import { formatDate } from "@/lib/format";
import { PageHero } from "@/components/page/page-hero";
import { UpdatesRiver } from "./updates-river";
import styles from "./updates.module.css";

export const revalidate = 900;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDict(lang);
  return { title: dict.pages.updates.title, description: dict.pages.updates.lede, alternates: { canonical: `/${lang}/updates` } };
}

export default async function UpdatesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const copy = dict.pages.updates;
  const stateLabels = {
    current: dict.pages.download.stateCurrent,
    archive: dict.pages.download.stateArchive,
    revoked: dict.pages.download.stateRevoked,
    history: dict.pages.download.stateHistory,
  };
  const catalog = await getReleaseCatalog();
  const intl = localeMeta[lang].intl;
  const entries = catalog.entries.filter((entry) => entry.notes);

  return (
    <>
      <PageHero kicker={dict.chrome.nav[3]!.label} title={copy.title} lede={copy.lede} home={localePath(lang)} />
      <section className={styles.section}>
        <div className="shell">
          <UpdatesRiver
            entries={entries.map((entry) => ({
              version: entry.version,
              display: entry.display,
              href: localePath(lang, `updates/${entry.display}`),
              state: entry.state,
              stateLabel: stateLabels[entry.state],
              date: entry.publishedAt ? formatDate(entry.publishedAt, intl) : null,
              major: entry.notes!.scale === "major",
              title: entry.notes!.title,
              summary: entry.notes!.summary,
              categories: entry.notes!.categories,
            }))}
            future={copy.future}
            categories={copy.categories}
            filterAll={copy.filterAll}
            filterLabel={copy.filterLabel}
            open={copy.open}
          />
        </div>
      </section>
    </>
  );
}
