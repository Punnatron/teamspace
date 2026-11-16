
import { useEffect, useRef, useState } from "react";

export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    // Check whether the user prefers reduced motion.
    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    let observer: IntersectionObserver | null = null;
    let revealFrameId: number | null = null;

    // Show the element on the next animation frame
    // when reduced motion is preferred or
    // IntersectionObserver is unavailable.
    if (
      prefersReducedMotion ||
      typeof IntersectionObserver === "undefined"
    ) {
      revealFrameId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setIsVisible(true);

            // Stop observing after the first reveal.
            observer?.unobserve(entry.target);
          }
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      observer.observe(element);
    }

    // Clean up observer and pending animation frame.
    return () => {
      observer?.disconnect();

      if (revealFrameId !== null) {
        window.cancelAnimationFrame(revealFrameId);
      }
    };
  }, []);

  return {
    ref,
    isVisible,
  };
}
