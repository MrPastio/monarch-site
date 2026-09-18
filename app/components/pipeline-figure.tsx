"use client";

import { motion, useReducedMotion } from "motion/react";
import { spring } from "./motion/springs";
import type { Boundary, StoryStep } from "../content/types";

/**
 * A DIAGRAM of how a request travels, not a screenshot of the app.
 * It is labelled as a diagram on purpose: drawing a fake application
 * window would be a lie, and a real 0.2.5 capture is a separate task.
 *
 * Motion here has one job: show WHERE the request is and where it is
 * blocked. The active step is the single animated owner.
 */

const boundaryTone: Record<Boundary, string> = {
  device: "device",
  network: "network",
  system: "system",
};

type Props = {
  steps: StoryStep[];
  activeId: string;
  boundaryLabels: Record<Boundary, string>;
  onSelect?: (id: string) => void;
  caption: string;
  compact?: boolean;
};

export function PipelineFigure({
  steps,
  activeId,
  boundaryLabels,
  onSelect,
  caption,
  compact = false,
}: Props) {
  const reduced = useReducedMotion();
  const activeIndex = Math.max(0, steps.findIndex((s) => s.id === activeId));

  return (
    <figure className="pipeline" data-compact={compact || undefined}>
      <div className="pipeline-head">
        <span className="pipeline-caption">{caption}</span>
        <span className="pipeline-progress" aria-hidden="true">
          {String(activeIndex + 1).padStart(2, "0")}/{String(steps.length).padStart(2, "0")}
        </span>
      </div>

      <ol className="pipeline-track">
        {steps.map((step, index) => {
          const active = step.id === activeId;
          const passed = index < activeIndex;
          const Row = onSelect ? "button" : "div";

          return (
            <li key={step.id} className="pipeline-item">
              <Row
                {...(onSelect
                  ? {
                      type: "button" as const,
                      onClick: () => onSelect(step.id),
                      "aria-current": active ? ("step" as const) : undefined,
                    }
                  : {})}
                className="pipeline-row"
                data-active={active || undefined}
                data-passed={passed || undefined}
              >
                <span className="pipeline-rail" aria-hidden="true">
                  <span className="pipeline-node">
                    {active && !reduced ? (
                      <motion.span
                        layoutId="pipeline-marker"
                        className="pipeline-marker"
                        transition={spring.panel}
                      />
                    ) : active ? (
                      <span className="pipeline-marker" />
                    ) : null}
                  </span>
                  {index < steps.length - 1 ? <span className="pipeline-line" /> : null}
                </span>

                <span className="pipeline-body">
                  <span className="pipeline-ordinal mono">{step.ordinal}</span>
                  <span className="pipeline-title">{step.title}</span>
                  <span className="pipeline-boundary" data-tone={boundaryTone[step.boundary]}>
                    {boundaryLabels[step.boundary]}
                  </span>
                </span>
              </Row>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
