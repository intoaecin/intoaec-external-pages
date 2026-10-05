import { useEffect, useRef, useState, type RefObject } from "react";

interface VisibleTimelineWindow {
  endIndex: number;
  scrollLeft: number;
  startIndex: number;
  viewportWidth: number;
}

interface UseVisibleTimelineWindowOptions {
  itemWidth: number;
  overscan?: number;
  scrollContainerRef: RefObject<HTMLDivElement>;
  totalItems: number;
  disabled?: boolean;
}

export function useVisibleTimelineWindow({
  itemWidth,
  overscan = 2,
  scrollContainerRef,
  totalItems,
  disabled = false,
}: UseVisibleTimelineWindowOptions): VisibleTimelineWindow {
  const [windowState, setWindowState] = useState({
    startIndex: 0,
    endIndex: 0,
  });

  const itemWidthRef = useRef(itemWidth);
  const overscanRef = useRef(overscan);
  const totalItemsRef = useRef(totalItems);

  useEffect(() => {
    itemWidthRef.current = itemWidth;
    overscanRef.current = overscan;
    totalItemsRef.current = totalItems;
  });

  useEffect(() => {
    if (disabled) {
      return;
    }

    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    let animationFrameId: number | null = null;

    const updateWindowState = () => {
      animationFrameId = null;
      const scrollLeft = container.scrollLeft;
      const viewportWidth = container.clientWidth;
      const iWidth = itemWidthRef.current;
      const oScan = overscanRef.current;
      const tItems = totalItemsRef.current;

      if (tItems <= 0) {
        setWindowState((prev) => {
          if (prev.startIndex === 0 && prev.endIndex === 0) return prev;
          return { startIndex: 0, endIndex: 0 };
        });
        return;
      }

      const rawStartIndex = Math.floor(scrollLeft / iWidth);
      const visibleItemCount = Math.ceil(viewportWidth / iWidth);

      const startIndex = Math.max(0, rawStartIndex - oScan);
      const endIndex = Math.min(
        tItems - 1,
        rawStartIndex + visibleItemCount + oScan
      );

      setWindowState((previousState) => {
        if (
          previousState.startIndex === startIndex &&
          previousState.endIndex === endIndex
        ) {
          return previousState;
        }

        return { startIndex, endIndex };
      });
    };

    const scheduleUpdate = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateWindowState);
    };

    scheduleUpdate();
    container.addEventListener("scroll", scheduleUpdate, { passive: true });

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", scheduleUpdate);
      resizeObserver.disconnect();

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [scrollContainerRef, disabled]);

  // Sync state if props change
  useEffect(() => {
    if (disabled) {
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const viewportWidth = container.clientWidth;

    if (totalItems <= 0) {
      setWindowState((prev) => {
        if (prev.startIndex === 0 && prev.endIndex === 0) return prev;
        return { startIndex: 0, endIndex: 0 };
      });
      return;
    }

    const rawStartIndex = Math.floor(scrollLeft / itemWidth);
    const visibleItemCount = Math.ceil(viewportWidth / itemWidth);

    const startIndex = Math.max(0, rawStartIndex - overscan);
    const endIndex = Math.min(
      totalItems - 1,
      rawStartIndex + visibleItemCount + overscan
    );

    setWindowState((prev) => {
      if (prev.startIndex === startIndex && prev.endIndex === endIndex) {
        return prev;
      }
      return { startIndex, endIndex };
    });
  }, [itemWidth, overscan, totalItems, scrollContainerRef, disabled]);

  return {
    startIndex: windowState.startIndex,
    endIndex: windowState.endIndex,
    scrollLeft: scrollContainerRef.current?.scrollLeft || 0,
    viewportWidth: scrollContainerRef.current?.clientWidth || 0,
  };
}
