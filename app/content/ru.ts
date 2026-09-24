/**
 * Russian reference copy. Plain, friendly language; every product statement
 * here must be backed by a claim in ./claims.ts (tests/truth.test.mjs).
 */
export const ru = {
  meta: {
    title: "Monarch — твой интеллект на твоём железе",
    description:
      "Monarch — локальный ИИ для Windows. Чат, код и задачи прямо на твоём компьютере: план виден заранее, важные действия — только с твоего разрешения, результат проверяется.",
  },
  chrome: {
    skip: "К содержимому",
    home: "Monarch — на главную",
    nav: [
      { href: "how-it-works", label: "Устройство" },
      { href: "security", label: "Безопасность" },
      { href: "principles", label: "Принципы" },
      { href: "updates", label: "Версии" },
      { href: "documentation", label: "Документация" },
    ],
    download: "Скачать",
    menu: "Меню",
    close: "Закрыть",
    language: "Язык",
    pendingTranslation: "перевод готовится",
  },
  hero: {
    kicker: "Monarch 0.2.5 · Windows 10 и 11",
    title: [
      [
        { t: "Твой " },
        { t: "интеллект", accent: true },
        { t: " —" },
      ],
      [
        { t: "на твоём " },
        { t: "железе", accent: true },
        { t: "." },
      ],
    ],
    lede: "Локальный ИИ для Windows: чат, код и задачи на твоём компьютере. Monarch показывает план, спрашивает перед важными действиями и проверяет результат.",
    primary: "Скачать для Windows",
    secondary: "Как устроен Monarch",
    facts: [
      { value: "Локально", label: "модели и данные на устройстве", claim: "localFirst" },
      { value: "По запросу", label: "интернет и облако — с согласия", claim: "consentEgress" },
      { value: "С проверкой", label: "результат сверяется отдельно", claim: "resultVerified" },
    ],
    scrollCue: "Листай — заглянем внутрь",
    crestLabel: "Герб Monarch: щит с короной и дорожками печатной платы",
  },
  footer: {
    tagline: "Твой интеллект — на твоём железе.",
    columns: [
      {
        title: "Продукт",
        links: [
          { href: "how-it-works", label: "Как устроен" },
          { href: "security", label: "Безопасность" },
          { href: "principles", label: "Принципы" },
        ],
      },
      {
        title: "Загрузка",
        links: [
          { href: "download", label: "Скачать" },
          { href: "updates", label: "Все версии" },
          { href: "documentation", label: "Документация" },
        ],
      },
    ],
    external: [
      { href: "https://github.com/MrPastio/monarch", label: "Исходный код" },
      { href: "https://github.com/MrPastio/monarch-releases/releases", label: "GitHub Releases" },
    ],
    honesty:
      "Манифест обновлений подписан Ed25519, установщик сверяется по SHA-256. Сертификата Authenticode у установщика пока нет, поэтому Windows SmartScreen может показать предупреждение.",
    rights: "Monarch · MrPastio",
  },
} as const;
