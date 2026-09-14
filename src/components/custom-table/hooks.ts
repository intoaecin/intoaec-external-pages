import { useCallback, useEffect, useRef, useState } from "react";
import type { ActionItem, MenuState } from "./types";

export function useTableSelection(
  data: any[],
  controlledRows: number[],
  onSelectionChange?: (rows: number[]) => void,
) {
  const [internalSelected, setInternalSelected] = useState<number[]>([]);
  const isControlled = typeof onSelectionChange === "function";
  const selected = isControlled
    ? controlledRows
    : controlledRows.length > 0
      ? controlledRows
      : internalSelected;

  const commit = useCallback(
    (next: number[]) => {
      onSelectionChange ? onSelectionChange(next) : setInternalSelected(next);
    },
    [onSelectionChange],
  );

  const isAllSelected = data.length > 0 && selected.length === data.length;
  const isIndeterminate = selected.length > 0 && selected.length < data.length;

  const selectAll = useCallback(() => {
    commit(isAllSelected ? [] : data.map((_, index) => index));
  }, [commit, data, isAllSelected]);

  const toggleRow = useCallback(
    (rowIndex: number) => {
      commit(
        selected.includes(rowIndex)
          ? selected.filter((index) => index !== rowIndex)
          : [...selected, rowIndex],
      );
    },
    [commit, selected],
  );

  const clearAll = useCallback(() => commit([]), [commit]);

  const isRowSelected = useCallback(
    (rowIndex: number) => selected.includes(rowIndex),
    [selected],
  );

  return {
    selected,
    isAllSelected,
    isIndeterminate,
    selectAll,
    toggleRow,
    clearAll,
    isRowSelected,
  };
}

export function useTextOverflow(data: any[]) {
  const [overflowStates, setOverflowStates] = useState<Record<string, boolean>>(
    {},
  );
  const refs = useRef<Record<string, HTMLElement>>({});

  const checkOverflow = useCallback(
    (el: HTMLElement | null) => !!el && el.scrollWidth > el.clientWidth,
    [],
  );

  const recheck = useCallback(() => {
    const next: Record<string, boolean> = {};
    Object.entries(refs.current).forEach(([key, el]) => {
      next[key] = checkOverflow(el);
    });
    setOverflowStates(next);
  }, [checkOverflow]);

  useEffect(() => {
    const onResize = () => setTimeout(recheck, 100);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recheck]);

  useEffect(() => {
    if (data?.length > 0) {
      refs.current = {};
      setOverflowStates({});
    }
  }, [data]);

  const setRef = useCallback(
    (key: string, el: HTMLElement | null) => {
      if (el) {
        refs.current[key] = el;
        setTimeout(() => {
          const overflowing = checkOverflow(el);
          setOverflowStates((prev) =>
            prev[key] !== overflowing ? { ...prev, [key]: overflowing } : prev,
          );
        }, 0);
      } else {
        delete refs.current[key];
      }
    },
    [checkOverflow],
  );

  return { overflowStates, setRef };
}

export function useMenuState(data: any[], actionItems: ActionItem[]) {
  const [menuState, setMenuState] = useState<MenuState>({
    anchorEl: null,
    rowIndex: null,
  });

  const openMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>, rowIndex: number) => {
      event.stopPropagation();
      setMenuState({ anchorEl: event.currentTarget, rowIndex });
    },
    [],
  );

  const closeMenu = useCallback(() => {
    if (menuState.rowIndex !== null) {
      const row = data[menuState.rowIndex];
      const hasLoading = actionItems.some(
        (item) => item.condition?.(row) !== false && item.loading?.(row),
      );
      if (hasLoading) return;
    }
    setMenuState({ anchorEl: null, rowIndex: null });
  }, [actionItems, data, menuState.rowIndex]);

  useEffect(() => {
    if (!(menuState.anchorEl && menuState.rowIndex !== null)) return;

    const forceClose = () => setMenuState({ anchorEl: null, rowIndex: null });
    const onMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) forceClose();
    };
    const onPointerLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) forceClose();
    };

    window.addEventListener("mouseout", onMouseOut, true);
    window.addEventListener("mouseleave", onMouseOut as any, true);
    window.addEventListener("pointerleave", onPointerLeave, true);
    window.addEventListener("blur", forceClose);
    document.addEventListener("visibilitychange", forceClose);

    return () => {
      window.removeEventListener("mouseout", onMouseOut, true);
      window.removeEventListener("mouseleave", onMouseOut as any, true);
      window.removeEventListener("pointerleave", onPointerLeave, true);
      window.removeEventListener("blur", forceClose);
      document.removeEventListener("visibilitychange", forceClose);
    };
  }, [menuState.anchorEl, menuState.rowIndex]);

  return { menuState, openMenu, closeMenu };
}
