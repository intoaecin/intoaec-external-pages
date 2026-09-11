import React, { useRef, useEffect, useState } from "react";

export interface RowResizerProps {
  id?: string;
  disabled?: boolean;
  minHeight?: number;
  maxHeight?: number;
  defaultHeight?: number;
  className?: string;
  resizeStart?: () => void;
  resizeEnd?: (height: number) => void;
  show?: boolean;
}

const RowResizer: React.FC<RowResizerProps> = ({
  id,
  disabled = false,
  minHeight = 30,
  maxHeight,
  defaultHeight = 40,
  className = "",
  resizeStart,
  resizeEnd,
  show = false,
}) => {
  const resizeRef = useRef<HTMLTableRowElement>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<number>(0);
  const [startHeightPrev, setStartHeightPrev] = useState<number>(0);
  const [lastDraggedHeight, setLastDraggedHeight] = useState<number>(0);
  const [draggedRow, setDraggedRow] = useState<string | null>(null);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    
    // Prevent event propagation to avoid interfering with controller dragging
    e.stopPropagation();
    
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDraggedRow(id || "");
    if (resizeStart) resizeStart();
    setDragging(true);
    setStartPos(y);

    setStartHeightPrev(0);
    if (resizeRef.current) {
      const prevSibling = resizeRef.current.previousSibling as any;
      if (prevSibling) {
        setStartHeightPrev(prevSibling.clientHeight);
      }
    }
  };

  const endDrag = () => {
    if (disabled) return;
    setDragging(false);
    if (resizeEnd && draggedRow === id) resizeEnd(lastDraggedHeight);
    setDraggedRow(null);
  };

  const onMouseMove = (e: MouseEvent | TouchEvent) => {
    if (disabled || !dragging) return;
    
    const y =
      e instanceof MouseEvent
        ? e.clientY
        : e.touches
        ? e.touches[0].clientY
        : 0;

    const ele = resizeRef.current as any;
    if (!ele || !ele.previousSibling) return;

    const moveDiff = y - startPos;
    const newHeight = startHeightPrev + moveDiff;

    if (newHeight < minHeight) {
      return;
    }

    if (maxHeight && newHeight > maxHeight) {
      return;
    }

    ele.previousSibling.style.height = newHeight + "px";
    ele.previousSibling.style.minHeight = newHeight + "px";
    ele.previousSibling.style.maxHeight = newHeight + "px";
    ele.previousSibling.style.setProperty(
      "--row_resize_before_height",
      newHeight + "px"
    );
    setLastDraggedHeight(newHeight);
  };

  // Initialize row height
  useEffect(() => {
    const ele = resizeRef.current as any;
    if (!ele || !ele.previousSibling) return;
    
    if (defaultHeight) {
      ele.previousSibling.style.minHeight = defaultHeight + "px";
      ele.previousSibling.style.height = defaultHeight + "px";
      ele.previousSibling.style.maxHeight = defaultHeight + "px";
    } else if (minHeight) {
      ele.previousSibling.style.minHeight = minHeight + "px";
      ele.previousSibling.style.height = minHeight + "px";
      ele.previousSibling.style.maxHeight = minHeight + "px";
    }
  }, [defaultHeight, minHeight]);

  // Handle dragging events
  useEffect(() => {
    if (!dragging) return;

    const addEventListenersToDocument = () => {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchmove", onMouseMove);
      document.addEventListener("touchend", endDrag);
    };

    const removeEventListenersFromDocument = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("touchend", endDrag);
    };

    addEventListenersToDocument();

    return () => {
      removeEventListenersFromDocument();
    };
  }, [dragging, onMouseMove, endDrag]);

  const style: React.CSSProperties = {
    userSelect: "none",
    height: "0px",
    cursor: disabled ? "default" : "ns-resize",
    backgroundColor: "transparent",
    border: "none",
    position: "relative",
    width: "100%",
  };

  if (show && !disabled) {
    // style.height = "6px";
    // No visual styling - completely invisible
  }

  return (
    <tr
      ref={resizeRef}
      style={style}
      className={`row_resizer_own_class ${
        disabled ? "disabled_row_resize" : ""
      } ${className}`}
      onMouseDown={!disabled ? (e) => startDrag(e) : undefined}
      onTouchStart={!disabled ? (e) => startDrag(e) : undefined}
    >
      <td colSpan={100} style={{ padding: 0, margin: 0, height: show && !disabled ? "0px" : "0px" }} />
    </tr>
  );
};

export default RowResizer;
