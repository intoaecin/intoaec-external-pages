import { useCallback, useEffect, useRef, type RefObject } from "react";

interface UsePanningOptions {
  /**
   * CSS selector for elements that should NOT initiate panning when clicked.
   * Defaults to ".TaskBarContainer" (Gantt bar elements).
   */
  excludeSelector?: string;
  /**
   * Minimum pixel movement before the gesture is treated as a pan (suppresses
   * the resulting click event). Defaults to 3.
   */
  movementThreshold?: number;
  /**
   * Called when the container is actively being panned. Return false to cancel.
   */
  isBlocked?: () => boolean;
}

interface UsePanningResult {
  /** Attach to the scroll container's onMouseDown */
  onMouseDown: (e: React.MouseEvent) => void;
  /** Attach to the scroll container's onMouseMove */
  onMouseMove: (e: React.MouseEvent) => void;
  /** Attach to the scroll container's onMouseLeave */
  onMouseLeave: () => void;
}

/**
 * Enables click-drag panning on a scrollable container — the mouse equivalent
 * of a touchpad two-finger scroll.
 *
 * Automatically:
 * - Switches cursor to "grabbing" while panning.
 * - Suppresses the browser `click` event that fires after a drag ends, so
 *   overlapping click handlers (e.g. dependency-line popups) don't trigger.
 * - Stops panning when the mouse is released anywhere in the document.
 */
export function usePanning(
  containerRef: RefObject<HTMLElement>,
  options: UsePanningOptions = {}
): UsePanningResult {
  const {
    excludeSelector = ".TaskBarContainer",
    movementThreshold = 3,
    isBlocked,
  } = options;

  const isPanningRef = useRef(false);
  const hasPannedRef = useRef(false);
  const panOriginRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const stopPanning = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      if (containerRef.current) {
        containerRef.current.style.cursor = "";
      }
    }
  }, [containerRef]);

  // Stop panning on mouseup anywhere in the document
  useEffect(() => {
    document.addEventListener("mouseup", stopPanning);
    return () => document.removeEventListener("mouseup", stopPanning);
  }, [stopPanning]);

  // Suppress the click event that the browser fires after a drag ends
  useEffect(() => {
    const suppressClickAfterPan = (e: MouseEvent) => {
      if (hasPannedRef.current) {
        hasPannedRef.current = false;
        e.stopPropagation();
        e.preventDefault();
      }
    };
    document.addEventListener("click", suppressClickAfterPan, { capture: true });
    return () =>
      document.removeEventListener("click", suppressClickAfterPan, { capture: true });
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      if (excludeSelector) {
        const target = e.target as HTMLElement;
        if (target.closest(excludeSelector)) return;
      }

      const container = containerRef.current;
      if (!container) return;

      isPanningRef.current = true;
      hasPannedRef.current = false;
      panOriginRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
      };
      container.style.cursor = "grabbing";
    },
    [containerRef, excludeSelector]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanningRef.current) return;
      if (isBlocked?.()) {
        stopPanning();
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const dx = e.clientX - panOriginRef.current.x;
      const dy = e.clientY - panOriginRef.current.y;

      if (Math.abs(dx) > movementThreshold || Math.abs(dy) > movementThreshold) {
        hasPannedRef.current = true;
      }

      container.scrollLeft = panOriginRef.current.scrollLeft - dx;
      container.scrollTop = panOriginRef.current.scrollTop - dy;
    },
    [containerRef, isBlocked, movementThreshold, stopPanning]
  );

  const onMouseLeave = useCallback(() => {
    stopPanning();
  }, [stopPanning]);

  return { onMouseDown, onMouseMove, onMouseLeave };
}
