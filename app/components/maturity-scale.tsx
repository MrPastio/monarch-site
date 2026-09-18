import type { Maturity } from "../content/claims";

const order: Maturity[] = ["alpha", "preview", "beta", "stable"];

/**
 * Maturity as a position on a shared scale, not a coloured badge.
 * A badge says "fine"; a scale says how far along this actually is.
 */
export function MaturityScale({
  value,
  labels,
}: {
  value: Maturity;
  labels: Record<Maturity, string>;
}) {
  const index = order.indexOf(value);

  return (
    <div className="maturity" data-value={value}>
      <span className="maturity-label">{labels[value]}</span>
      <span
        className="maturity-track"
        role="img"
        aria-label={`Зрелость: ${labels[value]} — ${index + 1} из ${order.length}`}
      >
        {order.map((step, i) => (
          <span
            key={step}
            className="maturity-tick"
            data-filled={i <= index || undefined}
            data-current={i === index || undefined}
          />
        ))}
      </span>
    </div>
  );
}
