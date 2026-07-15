import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  type NavigateOptions,
  type To,
  useLocation,
  useNavigate,
  useOutlet,
} from "react-router";

import { cn } from "~/lib/utils";

const curtainInDuration = 180;
const curtainOutDuration = 220;

type TransitionPhase = "idle" | "covering" | "revealing" | "entering";

type DisplayedRoute = {
  key: string;
  outlet: React.ReactElement | null;
};

type PageTransitionProps = {
  className?: string;
};

type PageTransitionNavigation = {
  navigateWithTransition: (to: To, options?: NavigateOptions) => void;
};

const PageTransitionContext = createContext<PageTransitionNavigation | null>(null);

export function PageTransition({ className }: PageTransitionProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const coverTimerRef = useRef<number | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingDestinationRef = useRef<string | null>(null);
  const pendingTransitionRef = useRef(false);
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [displayedRoute, setDisplayedRoute] = useState<DisplayedRoute>({
    key: location.key,
    outlet,
  });

  function clearTransitionTimers() {
    if (coverTimerRef.current) window.clearTimeout(coverTimerRef.current);
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
  }

  function revealDisplayedRoute(nextRoute: DisplayedRoute) {
    setDisplayedRoute(nextRoute);
    setPhase("revealing");

    frameRef.current = window.requestAnimationFrame(() => {
      setPhase("entering");

      revealTimerRef.current = window.setTimeout(() => {
        setPhase("idle");
      }, curtainOutDuration);
    });
  }

  function navigateWithTransition(to: To, options?: NavigateOptions) {
    const destinationKey = typeof to === "string" ? to : JSON.stringify(to);

    if (
      pendingTransitionRef.current &&
      pendingDestinationRef.current === destinationKey
    ) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      pendingDestinationRef.current = null;
      navigate(to, options);
      return;
    }

    clearTransitionTimers();
    pendingDestinationRef.current = destinationKey;
    pendingTransitionRef.current = true;
    setPhase("covering");

    coverTimerRef.current = window.setTimeout(() => {
      navigate(to, options);
    }, curtainInDuration);
  }

  const transitionNavigation = useMemo(
    () => ({ navigateWithTransition }),
    [navigate],
  );

  useEffect(() => {
    function shouldIgnoreLinkClick(
      event: MouseEvent,
      anchor: HTMLAnchorElement,
    ) {
      return (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("aria-disabled") === "true"
      );
    }

    function handleDocumentLinkClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (shouldIgnoreLinkClick(event, anchor)) return;

      const href = anchor.getAttribute("href");

      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);

      if (nextUrl.origin !== window.location.origin) return;

      event.preventDefault();

      navigateWithTransition(
        `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`,
      );
    }

    document.addEventListener("click", handleDocumentLinkClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentLinkClick, true);
    };
  }, [navigateWithTransition]);

  useEffect(() => {
    if (displayedRoute.key === location.key) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setDisplayedRoute({ key: location.key, outlet });
      setPhase("idle");
      return;
    }

    clearTransitionTimers();

    if (pendingTransitionRef.current) {
      pendingTransitionRef.current = false;
      pendingDestinationRef.current = null;
      revealDisplayedRoute({ key: location.key, outlet });
      return;
    }

    setPhase("covering");

    coverTimerRef.current = window.setTimeout(() => {
      revealDisplayedRoute({ key: location.key, outlet });
    }, curtainInDuration);
  }, [displayedRoute.key, location.key, outlet]);

  useEffect(() => {
    return () => {
      clearTransitionTimers();
    };
  }, []);

  return (
    <div className={cn("relative min-h-screen overflow-x-clip", className)}>
      <div
        className={cn(
          "min-h-screen transform-gpu transition-[opacity,transform,filter] duration-300 ease-out",
          phase === "revealing" &&
            "opacity-0 blur-[2px] translate-y-3 scale-[0.995]",
          phase !== "revealing" && "opacity-100 blur-0 translate-y-0 scale-100",
        )}
      >
        <PageTransitionContext.Provider value={transitionNavigation}>
          {displayedRoute.outlet}
        </PageTransitionContext.Provider>
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 z-[9999] bg-white transition-opacity ease-out",
          phase === "covering" &&
            "opacity-100 duration-[180ms]",
          phase === "revealing" &&
            "opacity-100 duration-[220ms]",
          phase === "entering" &&
            "opacity-0 duration-[220ms]",
          phase === "idle" && "opacity-0 duration-[180ms]",
        )}
      />
    </div>
  );
}

export function usePageTransitionNavigate() {
  const context = useContext(PageTransitionContext);

  if (!context) {
    throw new Error("usePageTransitionNavigate must be used inside PageTransition");
  }

  return context.navigateWithTransition;
}
