/**
 * Truth contract.
 *
 * Every factual statement the site makes about Monarch is registered here
 * with the evidence that backs it. Marketing copy references a claim by id;
 * `tests/truth.test.mjs` fails the build if a claim has no evidence or if
 * forbidden wording appears anywhere in the content.
 *
 * Source of truth is code and release evidence — NOT docs/official/MONARCH_WIKI_RU.md,
 * which is stale (it still calls 0.2.5 a Release Candidate).
 */

export type Maturity = "alpha" | "preview" | "beta" | "stable";

export type Claim = {
  id: string;
  /** What the site is allowed to say, in Russian. */
  ru: string;
  /** Repo-relative path or URL that proves it. */
  evidence: string;
  /** Maturity of the thing being claimed. */
  maturity: Maturity;
  /** The honest limit that must travel with the claim wherever it is shown. */
  limit?: string;
};

export const claims = {
  localFirst: {
    id: "localFirst",
    ru: "Основные модели, чаты и файлы остаются на твоём компьютере.",
    evidence: "src/modules/models",
    maturity: "stable",
    limit: "Обновления и отдельные внешние функции требуют интернета.",
  },
  permissionGate: {
    id: "permissionGate",
    ru: "Перед чувствительным или необратимым действием Monarch спрашивает отдельно.",
    evidence: "src/core/permission-gate.ts",
    maturity: "stable",
  },
  resultVerified: {
    id: "resultVerified",
    ru: "После действия Monarch отдельно проверяет, что изменилось на самом деле.",
    evidence: "src/agent/result-verifier.ts",
    maturity: "stable",
  },
  policyKernel: {
    id: "policyKernel",
    ru: "Границы доступа проверяет отдельный слой, а не сама модель.",
    evidence: "src/core/policy-kernel.ts",
    maturity: "stable",
  },
  signedManifest: {
    id: "signedManifest",
    ru: "Манифест релиза подписан ключом Ed25519, а установщик сверяется по SHA-256.",
    evidence: "app/lib/release.ts",
    maturity: "stable",
    limit:
      "Подписан манифест обновления, а не сам .exe: Authenticode у установщика нет.",
  },
  unsignedInstaller: {
    id: "unsignedInstaller",
    ru: "Установщик не подписан сертификатом Authenticode, поэтому SmartScreen может предупредить.",
    evidence: "docs/release/MONARCH_0.2.5_EVIDENCE_MATRIX.md",
    maturity: "stable",
  },
  securityNotAntivirus: {
    id: "securityNotAntivirus",
    ru: "Monarch Security показывает подозрительные события — это раннее наблюдение, а не антивирус.",
    evidence: "SECURITY.md, app/content/release-notes.ts (0.2.5: Security — Beta)",
    maturity: "beta",
    limit: "Не заменяет антивирус и не удаляет угрозы.",
  },
  hardware: {
    id: "hardware",
    ru: "Windows 10 или 11 x64, минимум 8 ГБ оперативной памяти, рекомендуется 16 ГБ.",
    evidence: "docs/release/MONARCH_0.2.5_COMPLETE_CHANGELOG.md",
    maturity: "stable",
    limit: "Скорость ответа зависит от выбранной модели и твоего железа.",
  },
  consentEgress: {
    id: "consentEgress",
    ru: "Интернет-поиск, облачные сервисы и MAX работают только после отдельного согласия.",
    evidence: "docs/architecture/MAX_PROVIDER_CONNECTIONS_2026-09-07.md",
    maturity: "stable",
    limit: "Проверка обновлений выходит в сеть без отдельного согласия.",
  },
  noTrackers: {
    id: "noTrackers",
    ru: "В приложении нет трекеров и сторонней аналитики.",
    evidence: "src (поиск по analytics/telemetry SDK: нет вхождений)",
    maturity: "stable",
  },
  safeIsolation: {
    id: "safeIsolation",
    ru: "Сейф — отдельный процесс без сети; агент к нему не допускается.",
    evidence: "docs/safe/SECURITY_MODEL.md",
    maturity: "stable",
    limit: "Не защищает от вредоносного кода под той же учётной записью, пока Сейф открыт.",
  },
  maxInDevelopment: {
    id: "maxInDevelopment",
    ru: "MAX с 12 провайдерами разрабатывается для версии 0.3 и ещё не опубликован.",
    evidence: "docs/release/MONARCH_0.3.0_CUMULATIVE_CHANGELOG.md",
    maturity: "alpha",
  },
  accessModes: {
    id: "accessModes",
    ru: "Три режима самостоятельности: всегда спрашивать, самостоятельно в проекте, самостоятельно на устройстве. Деньги и чувствительные для безопасности действия запрещены в любом.",
    evidence: "src/core/permission-gate.ts (0.2.5: permissionRuleFor), src/ui/public/index.html (autonomy-mode-select)",
    maturity: "stable",
  },
  securityThresholds: {
    id: "securityThresholds",
    ru: "Security: выкл. — только неизменяемые границы, наблюдать — журнал, охранять — вмешательство с риска 70%, строго — с 50%.",
    evidence: "src/ui/public/index.html (0.2.5: security-model-confirmation)",
    maturity: "beta",
  },
  agentTasks: {
    id: "agentTasks",
    ru: "Оскар раскладывает длинную задачу на шаги, показывает план, текущий шаг и итог; задачу можно остановить.",
    evidence: "app/content/release-notes.ts (0.2.5), src/agent",
    maturity: "stable",
  },
  computerUse: {
    id: "computerUse",
    ru: "Computer Use видит окна, запускает и закрывает приложения, нажимает, печатает и прокручивает; проверяет окно до и результат после.",
    evidence: "src/modules/computer, app/content/release-notes.ts (0.2.5)",
    maturity: "beta",
  },
  coderProjects: {
    id: "coderProjects",
    ru: "Coder — отдельный режим для кода внутри выбранного проекта.",
    evidence: "src/modules/coder, src/ui/public/index.html (coder-mode-root)",
    maturity: "stable",
  },
  memoryV4: {
    id: "memoryV4",
    ru: "Memory V4 отделяет обычные чаты от проектов Coder и отмечает ответы, где использовала память; Incognito в неё не попадает.",
    evidence: "src/modules/memory, app/content/release-notes.ts (0.2.5)",
    maturity: "stable",
  },
  voiceBeta: {
    id: "voiceBeta",
    ru: "Длинная диктовка и озвучка с пресетами голоса, скорости и интонации.",
    evidence: "src/modules/voice, app/content/release-notes.ts (0.2.5: Voice Studio V2)",
    maturity: "beta",
  },
  skillsPreview: {
    id: "skillsPreview",
    ru: "Навыки вызываются через «+» или «$», Personality выбирается для задачи.",
    evidence: "src/modules/astra, src/modules/profile",
    maturity: "preview",
  },
  telegramBot: {
    id: "telegramBot",
    ru: "Телефон привязывается одноразовым кодом на 15 минут; сообщения идут через Telegram.",
    evidence: "src/modules/telegram, src/ui/public/index.html (telegram-pairing-code)",
    maturity: "stable",
    limit: "Сообщения проходят через серверы Telegram.",
  },
  sharingApi: {
    id: "sharingApi",
    ru: "Sharing открывает локальные модели для своих программ через OpenAI-совместимый API на 127.0.0.1.",
    evidence: "src/modules/sharing/README.md",
    maturity: "stable",
  },
  astraV3: {
    id: "astraV3",
    ru: "Astra V3 переводит агентность на типизированные возможности с явной проверкой прав.",
    evidence: "docs/architecture/MONARCH_ASTRA_V3_IMPLEMENTATION_STATUS.md",
    maturity: "alpha",
    limit:
      "Не выпущено. Общее планирование, произвольные многошаговые задачи и архивация планировщика не закончены.",
  },
} as const satisfies Record<string, Claim>;

export type ClaimId = keyof typeof claims;

/**
 * Wording the site must never use, with the reason.
 * Enforced by tests/truth.test.mjs over the rendered HTML.
 */
export const forbiddenWording: { pattern: RegExp; because: string }[] = [
  {
    pattern: /подписанн?(ое|ый|о)\s+приложени|подписанн?ый\s+установщик/i,
    because: "Authenticode у установщика 0.2.5.0 отсутствует (NotSigned).",
  },
  {
    // A denial ("не заменяет антивирус") is exactly what we want to keep,
    // so the lookbehind only catches the affirmative claim.
    pattern: /(?<!не\s)замен(а|яет|ит)\s+антивирус|(?<!не\s)вместо\s+антивирус/i,
    because: "Monarch Security — раннее наблюдение, не антивирус.",
  },
  {
    pattern: /\b100\s*%|\bполностью\s+безопасн|\bгарантиру/i,
    because: "Абсолютных гарантий сайт не даёт.",
  },
  {
    pattern: /\bмгновенн|\bбез\s+задержек|\bлюбой\s+скорост/i,
    because: "Скорость зависит от железа и модели; замеров для сайта нет.",
  },
  {
    pattern: /революц|прорыв|лучший\s+в\s+мире|№\s*1/i,
    because: "Непроверяемые превосходные степени.",
  },
  {
    pattern: /работает\s+полностью\s+офлайн|совсем\s+без\s+интернета/i,
    because: "Обновления и отдельные функции требуют сети.",
  },
];
