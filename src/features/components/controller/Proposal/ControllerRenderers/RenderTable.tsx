import PlateEditor from "@/components/plate-editor";
import React, { useEffect, useMemo, useRef, useState } from "react";

const RenderTable = ({ controller }: { controller: any }) => {
  const isCellEmpty = (cellValue: any) => {
    if (!cellValue || !Array.isArray(cellValue)) return true;
    return cellValue.every((node: any) => {
      if (node.type === 'p' && node.children) {
        return node.children.every((child: any) => 
          !child.text || child.text.trim() === ''
        );
      }
      return false;
    });
  };

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const element = tableContainerRef.current;
    if (!element) return;

    const updateWidth = (width: number) => {
      setContainerWidth(width);
    };

    updateWidth(element.clientWidth);

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        updateWidth(entry.contentRect.width);
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const scaledColumnWidths = useMemo(() => {
    if (!controller?.content?.length || !controller?.content?.[0]?.length) {
      return [];
    }

    const baseWidths = controller.content[0].map((cell: any) => {
      const raw =
        typeof cell?.style?.width === "number"
          ? cell.style.width
          : Number(cell?.style?.width);
      return Number.isFinite(raw) && raw > 0 ? raw : 200;
    });

    const totalBaseWidth = baseWidths.reduce((sum: number, width: number) => sum + width, 0);
    if (!containerWidth || totalBaseWidth <= 0) return baseWidths;

    const scale =
      totalBaseWidth > containerWidth ? containerWidth / totalBaseWidth : 1;
    return baseWidths.map((width: number) => Math.max(1, Math.floor(width * scale)));
  }, [controller?.content, containerWidth]);

  const getColumnWidth = (cellIndex: number, fallbackWidth?: unknown) => {
    const scaled = scaledColumnWidths[cellIndex];
    if (typeof scaled === "number" && scaled > 0) return scaled;
    const raw = typeof fallbackWidth === "number" ? fallbackWidth : Number(fallbackWidth);
    if (Number.isFinite(raw) && raw > 0) return raw;
    return 200;
  };

  return (
    <div
      ref={tableContainerRef}
      style={{ width: "100%", height: "100%", overflowX: "hidden", overflowY: "hidden" }}
    >
      <table
        style={{
          borderCollapse: "collapse",
          tableLayout: "fixed",
          width: "100%",
          minWidth: "100%",
          maxWidth: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {controller?.content?.map((row: any, rowIndex: any) => (
          <tr
            key={rowIndex}
            style={{
              border: "1px solid #ccc",
              ...(row?.[0]?.isHeader
                ? {
                    backgroundColor: "#d1d5db",
                    border: "2px solid #111827",
                  }
                : {}),
            }}
          >
            {row?.map((cell: any, cellIndex: any) => (
              <td
                key={cellIndex}
                style={{
                  width: getColumnWidth(cellIndex, cell?.style?.width),
                  height: cell?.style?.height,
                  paddingInline: "0.2rem",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  overflow: "hidden",
                  ...(row?.[0]?.isHeader ? { fontWeight: "bold" } : {}),
                  ...(cell?.style?.borderWidth
                    ? {
                        borderWidth: cell?.style?.borderWidth,
                        borderStyle: "solid",
                      }
                    : cellIndex !== row?.length - 1
                    ? {
                        borderRight: `1px solid ${
                          row?.[0]?.isHeader ? "#111827" : "#ccc"
                        }`,
                      }
                    : {}),
                  ...(cell?.style?.borderColor
                    ? { borderColor: cell?.style?.borderColor }
                    : {}),
                  ...(cell?.style?.cellBackgroundColor
                    ? { backgroundColor: cell?.style?.cellBackgroundColor }
                    : {}),
                }}
              >
                {isCellEmpty(cell?.value) ? (
                  <div style={{ minHeight: "20px" }} />
                ) : (
                  <PlateEditor
                    id={`preview-${cell?.cellId}`}
                    intialValue={cell?.value}
                    readOnly
                  />
                )}
              </td>
            ))}
          </tr>
        ))}
      </table>
    </div>
  );
};

export default RenderTable;
