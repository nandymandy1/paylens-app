"use client";

import { useEffect, useRef, type FC, type PropsWithChildren } from "react";

type ScrollRevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}>;

const directionOffset = (dir: "up" | "down" | "left" | "right" | "none") => {
  switch (dir) {
    case "up":
      return { y: 32, x: 0 };
    case "down":
      return { y: -32, x: 0 };
    case "left":
      return { y: 0, x: 32 };
    case "right":
      return { y: 0, x: -32 };
    case "none":
      return { y: 0, x: 0 };
  }
};

const ScrollReveal: FC<ScrollRevealProps> = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      el.style.opacity = "1";
      el.style.transform = "none";

      return;
    }

    const { x, y } = directionOffset(direction);

    el.style.opacity = "0";
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.style.transition = `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translate(0, 0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [delay, direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal;
