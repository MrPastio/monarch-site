import type { gsap as Gsap } from "gsap";

type Query = (selector: string) => Element[];
type Build = (tl: gsap.core.Timeline, q: Query, gsap: typeof Gsap) => void;

/**
 * One timeline per scene. The markup is always the scene's final state:
 * `gsap.set` (immediate) moves it to the start, `from`/`to` and `tl.set`
 * bring it back. Reverting the owning context restores the final markup, so
 * no-JS, reduced motion and an interrupted scene all rest in the same place.
 */
const k = (q: Query, key: string) => q(`[data-k="${key}"]`);
const typing = (length: number) => `steps(${Math.max(8, Math.round(length * 0.8))})`;

export const TIMELINES: Record<string, Build> = {
  tasks(tl, q, gsap) {
    const steps = k(q, "step");
    const ask = k(q, "ask");
    const stop = k(q, "stop");
    const working = k(q, "working");
    gsap.set(steps, { autoAlpha: 0, y: 10, attr: { "data-state": "pending" } });
    gsap.set(working, { attr: { "data-state": "running" } });
    gsap.set(ask, { attr: { "data-state": "asking" } });
    gsap.set(stop, { attr: { "data-state": "running" } });

    tl.from(k(q, "prompt"), { y: 64, scale: 0.94, autoAlpha: 0, transformOrigin: "100% 100%", duration: 0.75 })
      .from(working, { y: 10, autoAlpha: 0, duration: 0.45 }, "+=0.15");
    steps.forEach((step, index) => {
      tl.to(step, { autoAlpha: 1, y: 0, duration: 0.45 }, index === 0 ? "+=0.35" : "+=0.1");
      if (index === 2) {
        tl.from(ask, { autoAlpha: 0, y: 14, scale: 0.97, transformOrigin: "50% 0%", duration: 0.55 }, "+=0.25");
        tl.set(ask, { attr: { "data-state": "allowed" } }, "+=0.9");
        tl.from(k(q, "allow"), { scale: 0.92, duration: 0.4, ease: "back.out(2)" }, "<");
      }
      tl.set(step, { attr: { "data-state": "done" } }, "+=0.45");
    });
    tl.from(k(q, "report"), { autoAlpha: 0, y: 18, duration: 0.6 }, "+=0.2");
    tl.set(stop, { attr: { "data-state": "idle" } }, "<");
    tl.set(working, { attr: { "data-state": "done" } }, "<");
  },

  max(tl, q, gsap) {
    const toggle = k(q, "toggle");
    const cloud = k(q, "cloud");
    const local = k(q, "local");
    const prompt = k(q, "maxPrompt");
    const answer = k(q, "answerText");
    gsap.set(toggle, { attr: { "data-on": "false" } });
    gsap.set(cloud, { attr: { "data-state": "idle" } });
    gsap.set(local, { attr: { "data-state": "idle" } });

    tl.from(k(q, "composer"), { y: 20, autoAlpha: 0, duration: 0.6 })
      .from(prompt, { clipPath: "inset(0 100% 0 0)", ease: typing(prompt[0]?.textContent?.length ?? 30), duration: 1.1 }, "-=0.2")
      .set(toggle, { attr: { "data-on": "true" } }, "+=0.25")
      .fromTo(k(q, "lineCloud"), { autoAlpha: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, "+=0.3")
      .set(cloud, { attr: { "data-state": "waiting" } })
      .set(cloud, { attr: { "data-state": "failed" } }, "+=1.3")
      .to(k(q, "lineCloud"), { autoAlpha: 0, duration: 0.25, ease: "power1.out" }, "<")
      .from(k(q, "lineBroken"), { autoAlpha: 0, duration: 0.25, ease: "power1.out" }, "<")
      .from(k(q, "lineLocal"), { strokeDashoffset: 1, duration: 0.8, ease: "power2.inOut" }, "+=0.2")
      .set(local, { attr: { "data-state": "answering" } })
      .from(k(q, "answer"), { y: 16, autoAlpha: 0, duration: 0.6 })
      .from(answer, { clipPath: "inset(0 100% 0 0)", ease: typing(answer[0]?.textContent?.length ?? 60), duration: 1.8 }, "-=0.3");
  },

  reminders(tl, q, gsap) {
    const time = k(q, "remTime");
    const send = k(q, "remSend");
    gsap.set(time, { attr: { "data-time": "now" } });
    gsap.set(send, { attr: { "data-state": "idle" } });

    tl.from(k(q, "remPrompt"), { y: 64, scale: 0.94, autoAlpha: 0, transformOrigin: "100% 100%", duration: 0.75 })
      .from(k(q, "remAnswer"), { y: 12, autoAlpha: 0, duration: 0.5 }, "+=0.35")
      .from(k(q, "remClock"), { y: 10, autoAlpha: 0, duration: 0.45 }, "+=0.3")
      .set(time, { attr: { "data-time": "due" } }, "+=1.1")
      // The reminder arrives from the screen edge, the way a Windows notification does.
      .from(k(q, "remToast"), { x: 70, autoAlpha: 0, duration: 0.7, ease: "power3.out" }, "+=0.15");
  },

  downloads(tl, q, gsap) {
    const rows = k(q, "dlRow");
    gsap.set(rows, { attr: { "data-state": "idle" } });
    rows.forEach((row, index) => {
      const bar = row.querySelector('[data-k="dlBar"]');
      tl.set(row, { attr: { "data-state": "loading" } }, index === 0 ? 0.6 : "+=0.15")
        .fromTo(bar, { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", duration: index === 0 ? 1.4 : 0.9, ease: "power1.inOut" })
        .set(row, { attr: { "data-state": "done" } });
    });
    tl.from(k(q, "dlNote"), { y: 10, autoAlpha: 0, duration: 0.5 }, "+=0.3");
  },

  coder(tl, q, gsap) {
    const cells = k(q, "cell");
    gsap.set(cells, { attr: { "data-on": "false" } });

    tl.from(k(q, "coderUser"), { y: 40, autoAlpha: 0, scale: 0.96, transformOrigin: "100% 100%", duration: 0.7 })
      .from(k(q, "read"), { x: -10, autoAlpha: 0, duration: 0.45 }, "+=0.3")
      .from(k(q, "diff"), { y: 16, autoAlpha: 0, duration: 0.6 }, "+=0.2")
      .from(k(q, "diffLine"), { clipPath: "inset(0 100% 0 0)", duration: 0.5, stagger: 0.2, ease: "power2.out" }, "-=0.2")
      .from(k(q, "coderAllow"), { autoAlpha: 0, scale: 0.9, duration: 0.45, ease: "back.out(2)" }, "+=0.4");
    cells.forEach((cell, index) => tl.set(cell, { attr: { "data-on": "true" } }, index === 0 ? "+=0.5" : "+=0.22"));
    tl.from(k(q, "checksDone"), { autoAlpha: 0, x: -6, duration: 0.4 }, "+=0.1");
  },

  setup(tl, q, gsap) {
    const bodies = k(q, "setupBody");
    const night = k(q, "night");
    const origin = "at 74% 47%";
    gsap.set(bodies, { attr: { "data-lang": "0", "data-pick": "-1" } });

    ["1", "2", "3", "0"].forEach((lang, index) => tl.set(bodies, { attr: { "data-lang": lang } }, 0.9 + index * 0.75));
    tl.fromTo(night, { clipPath: `circle(0% ${origin})` }, { clipPath: `circle(150% ${origin})`, duration: 1.1, ease: "power3.inOut" }, "+=0.7")
      .to(night, { clipPath: `circle(0% ${origin})`, duration: 0.9, ease: "power3.inOut" }, "+=0.9")
      .set(bodies, { attr: { "data-pick": "2" } }, "+=0.35");
  },
};
