import { useCallback, useEffect, useRef, type RefObject } from "react";

type ScrollSource = "list" | "gantt";

export function useSyncedVerticalScroll(
  listScrollRef: RefObject<HTMLElement>,
  ganttScrollRef: RefObject<HTMLElement>,
) {
  const syncingSourceRef = useRef<ScrollSource | null>(null);
  const resetFrameRef = useRef<number | null>(null);

  const resetSyncingSource = useCallback(() => {
    if (resetFrameRef.current !== null) {
      cancelAnimationFrame(resetFrameRef.current);
    }

    resetFrameRef.current = requestAnimationFrame(() => {
      syncingSourceRef.current = null;
      resetFrameRef.current = null;
    });
  }, []);

  useEffect(() => {
    const listEl = listScrollRef.current;
    if (!listEl) return undefined;

    const onListScroll = () => {
      if (syncingSourceRef.current === "gantt") {
        resetSyncingSource();
        return;
      }

      const ganttEl = ganttScrollRef.current;
      if (ganttEl && ganttEl.scrollTop !== listEl.scrollTop) {
        syncingSourceRef.current = "list";
        ganttEl.scrollTop = listEl.scrollTop;
        resetSyncingSource();
      }
    };

    listEl.addEventListener("scroll", onListScroll, { passive: true });
    return () => listEl.removeEventListener("scroll", onListScroll);
  }, [ganttScrollRef, listScrollRef, resetSyncingSource]);

  useEffect(() => {
    const ganttEl = ganttScrollRef.current;
    if (!ganttEl) return undefined;

    const onGanttScroll = () => {
      if (syncingSourceRef.current === "list") {
        resetSyncingSource();
        return;
      }

      const listEl = listScrollRef.current;
      if (listEl && listEl.scrollTop !== ganttEl.scrollTop) {
        syncingSourceRef.current = "gantt";
        listEl.scrollTop = ganttEl.scrollTop;
        resetSyncingSource();
      }
    };

    ganttEl.addEventListener("scroll", onGanttScroll, { passive: true });
    return () => ganttEl.removeEventListener("scroll", onGanttScroll);
  }, [ganttScrollRef, listScrollRef, resetSyncingSource]);

  useEffect(() => {
    return () => {
      if (resetFrameRef.current !== null) {
        cancelAnimationFrame(resetFrameRef.current);
      }
    };
  }, []);
}
