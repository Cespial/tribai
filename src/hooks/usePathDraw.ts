"use client";

import { useEffect, useRef } from "react";

/**
 * Hook for SVG path draw-in animation on scroll.
 * Uses IntersectionObserver to trigger stroke-dashoffset animation.
 * Respects prefers-reduced-motion.
 */
export function usePathDraw<T extends Element = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const paths = container.querySelectorAll<SVGPathElement>(".workflow-path");
    if (paths.length === 0) return;

    paths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.setProperty("--path-length", String(length));
      path.style.strokeDasharray = String(length);

      if (prefersReducedMotion) {
        path.style.strokeDashoffset = "0";
        return;
      }

      path.style.strokeDashoffset = String(length);
    });

    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        paths.forEach((path) => {
          path.style.transition = "stroke-dashoffset 1.2s ease-out";
          path.style.strokeDashoffset = "0";
        });

        observer.disconnect();
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return ref;
}
