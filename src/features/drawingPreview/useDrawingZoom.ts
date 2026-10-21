import { useEffect, useState, type RefObject } from "react";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const BUTTON_FACTOR = 1.25;
const WHEEL_FACTOR = 1.1;

const clampZoom = (value: number) =>
  Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(value.toFixed(2))));

export function useDrawingZoom(container: RefObject<HTMLDivElement>) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const hasModifier = event.ctrlKey || event.metaKey;
      const zoomInKey =
        event.key === "+" ||
        event.code === "NumpadAdd" ||
        (hasModifier && event.key === "=");
      const zoomOutKey =
        event.key === "-" ||
        event.key === "_" ||
        event.code === "NumpadSubtract";
      const resetKey = hasModifier && event.key === "0";

      if (event.altKey || (!zoomInKey && !zoomOutKey && !resetKey)) return;

      const target = event.target;
      const isEditing =
        target instanceof Element &&
        Boolean(
          target.closest(
            'input, textarea, select, [contenteditable], [role="textbox"], [role="dialog"], [role="menu"], [role="listbox"]',
          ),
        );

      // Keep browser zoom from taking over, but leave typing and dialogs alone.
      if (hasModifier || !isEditing) event.preventDefault();
      if (isEditing) return;

      if (zoomInKey) setZoom((value) => clampZoom(value * BUTTON_FACTOR));
      else if (zoomOutKey) setZoom((value) => clampZoom(value / BUTTON_FACTOR));
      else setZoom(1);
    };

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      if (event.target instanceof Node && container.current?.contains(event.target)) {
        setZoom((value) =>
          clampZoom(event.deltaY > 0 ? value / WHEEL_FACTOR : value * WHEEL_FACTOR),
        );
      }
    };

    const preventGestureZoom = (event: Event) => event.preventDefault();

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    window.addEventListener("gesturestart", preventGestureZoom);
    window.addEventListener("gesturechange", preventGestureZoom);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("wheel", handleWheel, true);
      window.removeEventListener("gesturestart", preventGestureZoom);
      window.removeEventListener("gesturechange", preventGestureZoom);
    };
  }, [container]);

  return {
    zoom,
    canZoomIn: zoom < MAX_ZOOM,
    canZoomOut: zoom > MIN_ZOOM,
    zoomIn: () => setZoom((value) => clampZoom(value * BUTTON_FACTOR)),
    zoomOut: () => setZoom((value) => clampZoom(value / BUTTON_FACTOR)),
    zoomReset: () => setZoom(1),
  };
}
