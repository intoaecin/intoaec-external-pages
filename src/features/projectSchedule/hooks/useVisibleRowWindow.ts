import { useEffect, useRef, useState, type RefObject } from "react";

interface VisibleRowWindow {
  endIndex: number;
  scrollTop: number;
  startIndex: number;
  viewportHeight: number;
}

interface UseVisibleRowWindowOptions {
  overscan?: number;
  rowHeight: number;
  scrollContainerRef: RefObject<HTMLElement>;
  totalRows: number;
  disabled?: boolean;
}

export function useVisibleRowWindow({
  overscan = 8,
  rowHeight,
  scrollContainerRef,
  totalRows,
  disabled = false,
}: UseVisibleRowWindowOptions): VisibleRowWindow {
  const [windowState, setWindowState] = useState({
    startIndex: 0,
    endIndex: 0,
  });

  const rowHeightRef = useRef(rowHeight);
  const overscanRef = useRef(overscan);
  const totalRowsRef = useRef(totalRows);

  useEffect(() => {
    rowHeightRef.current = rowHeight;
    overscanRef.current = overscan;
    totalRowsRef.current = totalRows;
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
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;
      const rHeight = rowHeightRef.current;
      const oScan = overscanRef.current;
      const tRows = totalRowsRef.current;

      if (tRows <= 0) {
        setWindowState((prev) => {
          if (prev.startIndex === 0 && prev.endIndex === 0) return prev;
          return { startIndex: 0, endIndex: 0 };
        });
        return;
      }

      const rawStartIndex = Math.floor(scrollTop / rHeight);
      const visibleRowCount = Math.ceil(viewportHeight / rHeight);

      const startIndex = Math.max(0, rawStartIndex - oScan);
      const endIndex = Math.min(
        tRows - 1,
        rawStartIndex + visibleRowCount + oScan
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

    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;

    if (totalRows <= 0) {
      setWindowState((prev) => {
        if (prev.startIndex === 0 && prev.endIndex === 0) return prev;
        return { startIndex: 0, endIndex: 0 };
      });
      return;
    }

    const rawStartIndex = Math.floor(scrollTop / rowHeight);
    const visibleRowCount = Math.ceil(viewportHeight / rowHeight);

    const startIndex = Math.max(0, rawStartIndex - overscan);
    const endIndex = Math.min(
      totalRows - 1,
      rawStartIndex + visibleRowCount + overscan
    );

    setWindowState((prev) => {
      if (prev.startIndex === startIndex && prev.endIndex === endIndex) {
        return prev;
      }
      return { startIndex, endIndex };
    });
  }, [rowHeight, overscan, totalRows, scrollContainerRef, disabled]);

  return {
    startIndex: windowState.startIndex,
    endIndex: windowState.endIndex,
    scrollTop: scrollContainerRef.current?.scrollTop || 0,
    viewportHeight: scrollContainerRef.current?.clientHeight || 0,
  };
}
