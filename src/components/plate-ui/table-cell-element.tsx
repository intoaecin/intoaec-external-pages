import React from "react";
import { cn, withProps, withRef } from "@udecode/cn";
import { PlateElement } from "@udecode/plate-common";
import {
  useTableCellElement,
  useTableCellElementResizable,
  useTableCellElementResizableState,
  useTableCellElementState,
} from "@udecode/plate-table";

import { ResizeHandle } from "./resizable";

export const TableCellElement = withRef<
  typeof PlateElement,
  {
    hideBorder?: boolean;
    isHeader?: boolean;
  }
>(({ children, className, style, hideBorder, isHeader, ...props }, ref) => {
  const { element } = props;

  const {
    colIndex,
    rowIndex,
    readOnly,
    selected,
    hovered,
    hoveredLeft,
    rowSize,
    borders,
    isSelectingCell,
    colSpan,
  } = useTableCellElementState();
  const { props: cellProps } = useTableCellElement({ element: props.element });
  const resizableState = useTableCellElementResizableState({
    colIndex,
    rowIndex,
    colSpan,
  });

  const { rightProps, bottomProps, leftProps, hiddenLeft } =
    useTableCellElementResizable(resizableState);

  const Cell = isHeader ? "th" : "td";

  return (
    <PlateElement
      ref={ref}
      asChild
      className={cn(
        "tw-relative tw-h-full tw-overflow-visible tw-border-none tw-bg-background tw-p-0",
        hideBorder && "before:tw-border-none",
        element.background ? "tw-bg-[--cellBackground]" : "tw-bg-background",
        !hideBorder &&
          cn(
            isHeader && "tw-text-left [&_>_*]:tw-m-0",
            "before:tw-h-full before:tw-w-full",
            selected && "before:tw-z-10 before:tw-bg-muted",
            "before:tw-absolute before:tw-box-border before:tw-select-none before:tw-content-['']",
            borders &&
              cn(
                borders.bottom?.size &&
                  `before:tw-border-b before:tw-border-b-border`,
                borders.right?.size &&
                  `before:tw-border-r before:tw-border-r-border`,
                borders.left?.size &&
                  `before:tw-border-l before:tw-border-l-border`,
                borders.top?.size &&
                  `before:tw-border-t before:tw-border-t-border`
              )
          ),
        className
      )}
      {...cellProps}
      {...props}
      style={
        {
          "--cellBackground": element.background,
          ...style,
        } as React.CSSProperties
      }
    >
      <Cell>
        <div
          className="tw-relative tw-z-20 tw-box-border tw-h-full tw-px-3 tw-py-2"
          style={{
            minHeight: rowSize,
          }}
        >
          {children}
        </div>

        {!isSelectingCell && (
          <div
            className="tw-group tw-absolute tw-top-0 tw-h-full tw-w-full tw-select-none"
            contentEditable={false}
            suppressContentEditableWarning={true}
          >
            {!readOnly && (
              <>
                <ResizeHandle
                  {...rightProps}
                  className="tw--top-3 tw-right-[-5px] tw-w-[10px]"
                />
                <ResizeHandle
                  {...bottomProps}
                  className="tw-bottom-[-5px] tw-h-[10px]"
                />
                {!hiddenLeft && (
                  <ResizeHandle
                    {...leftProps}
                    className="tw--top-3 tw-left-[-5px] tw-w-[10px]"
                  />
                )}

                {hovered && (
                  <div
                    className={cn(
                      "tw-absolute tw--top-3 tw-z-30 tw-h-[calc(100%_+_12px)] tw-w-1 tw-bg-ring",
                      "tw-right-[-1.5px]"
                    )}
                  />
                )}
                {hoveredLeft && (
                  <div
                    className={cn(
                      "tw-absolute tw--top-3 tw-z-30 tw-h-[calc(100%_+_12px)] tw-w-1 tw-bg-ring",
                      "tw-left-[-1.5px]"
                    )}
                  />
                )}
              </>
            )}
          </div>
        )}
      </Cell>
    </PlateElement>
  );
});
TableCellElement.displayName = "TableCellElement";

export const TableCellHeaderElement = withProps(TableCellElement, {
  isHeader: true,
});
