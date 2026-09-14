import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Checkbox,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  useTheme,
} from "@mui/material";
import NoDataFound from "@/components_v2/NoDataFound";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { formatDateBasedOnOrganizationLocalization } from "@/lib/helpers";
import { EditableCell } from "./custom-table/EditableCell";
import CustomTablePagination from "@/features/components/customTablePagination/customTablePagination";
import {
  useMenuState,
  useTableSelection,
  useTextOverflow,
} from "./custom-table/hooks";
import { RowActions } from "./custom-table/RowActions";
import { SelectionBanner } from "./custom-table/SelectionBanner";
import { TableHeader } from "./custom-table/TableHeader";
import {
  ACTION_COLUMN_WIDTH,
  HEADER_SCROLLBAR_COVER_HEIGHT,
  SELECTION_BANNER_HEIGHT,
  SELECT_COLUMN_WIDTH,
  getBodyCellSx,
  getSkeletonCellSx,
  getStickyActionCellSx,
} from "./custom-table/tableStyles";
import type { Column, CustomTableProps } from "./custom-table/types";

export type { ActionItem, Column, CustomTableProps } from "./custom-table/types";

interface CellContentProps {
  row: any;
  column: Column;
  rowIndex: number;
  isHovered: boolean;
  editingCell: { rowIndex: number; columnId: string } | null;
  editValue: string;
  localizationValue: any;
  overflowStates: Record<string, boolean>;
  setOverflowRef: (key: string, el: HTMLElement | null) => void;
  onStartEditing: (rowIndex: number, columnId: string, value: string) => void;
  onEditValueChange: (value: string) => void;
  onEditComplete: (rowIndex: number, columnId: string) => void;
  onCancelEditing: () => void;
}

function getCellValue(row: any, column: Column, localizationValue: any) {
  if (column.id === "createdAt") {
    return formatDateBasedOnOrganizationLocalization(
      localizationValue,
      row[column.id],
      true,
    );
  }

  return row[column.id];
}

function getTooltipTitle(column: Column, row: any, content: React.ReactNode) {
  if (!column.tooltipText) return String(content);
  return typeof column.tooltipText === "function"
    ? column.tooltipText(row)
    : column.tooltipText;
}

function CellContent({
  row,
  column,
  rowIndex,
  isHovered,
  editingCell,
  editValue,
  localizationValue,
  overflowStates,
  setOverflowRef,
  onStartEditing,
  onEditValueChange,
  onEditComplete,
  onCancelEditing,
}: CellContentProps) {
  const isEditing =
    editingCell?.rowIndex === rowIndex && editingCell?.columnId === column.id;
  const value = getCellValue(row, column, localizationValue);

  if (isEditing && column.editable) {
    return (
      <EditableCell
        column={column}
        editValue={editValue}
        localizationValue={localizationValue}
        onEditValueChange={onEditValueChange}
        onComplete={() => onEditComplete(rowIndex, column.id)}
        onCancel={onCancelEditing}
      />
    );
  }

  const content = column.render
    ? column.render(row, rowIndex, isHovered)
    : value;
  const wrappedContent = column.editable ? (
    <Box
      component="span"
      onClick={() => onStartEditing(rowIndex, column.id, value)}
    >
      {content}
    </Box>
  ) : (
    content
  );

  const cellKey = `${rowIndex}-${column.id}`;
  const shouldShowTooltip = column.isTooltip && !!overflowStates[cellKey];

  if (column.suppressCellOverflow) {
    if (!shouldShowTooltip) return <>{wrappedContent}</>;

    return (
      <Tooltip title={getTooltipTitle(column, row, content)} enterDelay={500}>
        <Box component="span" sx={{ display: "inline-block", maxWidth: "100%" }}>
          {wrappedContent}
        </Box>
      </Tooltip>
    );
  }

  const cellContent = (
    <Box
      component="span"
      ref={(el: HTMLElement | null) => setOverflowRef(cellKey, el)}
      sx={{
        display: "block",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
      }}
    >
      {wrappedContent}
    </Box>
  );

  if (!shouldShowTooltip) return cellContent;

  return (
    <Tooltip title={getTooltipTitle(column, row, content)} enterDelay={500}>
      {cellContent}
    </Tooltip>
  );
}

function getNoDataColSpan(
  columns: Column[],
  showSelectAll: boolean,
  showRowActions: boolean,
) {
  return columns.length + (showSelectAll ? 1 : 0) + (showRowActions ? 1 : 0);
}

export default function CustomTable({
  columns,
  data,
  loading = false,
  stickyHeader = true,
  currentRowData,
  emptyStateImage = "/images/no-data-found-1.svg",
  emptyStateText = "",
  emptyStateMinHeight,
  hideEmptyState = false,
  showRowActions = false,
  inlineRowActions = false,
  onRowAction,
  actionItems = [],
  onRowClick,
  renderExpandedRow,
  renderExpandedRowCells,
  expandedRowCellSx,
  onCellEdit,
  showSelectAll = false,
  selectionDisabled = false,
  selectionDisabledTooltip,
  selectedRows = [],
  onSelectionChange,
  getRowId,
  containerHeight = "auto",
  sx = {},
  selectionToolbarExtra,
  pagination,
}: CustomTableProps) {
  const { localizationValue } = useOrganizationLocalization();
  const theme = useTheme();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnId: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  const {
    selected,
    isAllSelected,
    isIndeterminate,
    selectAll,
    toggleRow,
    clearAll,
    isRowSelected,
  } = useTableSelection(data, selectedRows, onSelectionChange);

  const { overflowStates, setRef: setOverflowRef } = useTextOverflow(data);
  const { menuState, openMenu, closeMenu } = useMenuState(data, actionItems);

  const noDataMinHeight = useMemo(
    () =>
      emptyStateMinHeight ??
      (containerHeight === "auto" ? 150 : containerHeight),
    [containerHeight, emptyStateMinHeight],
  );

  const actionButtonStyle = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: 0,
      backgroundColor: theme.palette.primary.main,
      border: "none",
      padding: 0,
      color: "#ffffff",
      margin: 0,
    }),
    [theme.palette.primary.main],
  );

  const startEditing = useCallback(
    (rowIndex: number, columnId: string, value: string) => {
      setEditingCell({ rowIndex, columnId });
      setEditValue(String(value));
    },
    [],
  );

  const handleEditComplete = useCallback(
    (rowIndex: number, columnId: string) => {
      onCellEdit?.(rowIndex, columnId, editValue);
      setEditingCell(null);
    },
    [editValue, onCellEdit],
  );

  const tableHeader = selected.length === 0 && (
    <TableHeader
      columns={columns}
      showSelectAll={showSelectAll}
      selectionDisabled={selectionDisabled}
      selectionDisabledTooltip={selectionDisabledTooltip}
      showRowActions={showRowActions}
      stickyHeader={stickyHeader}
      isAllSelected={isAllSelected}
      isIndeterminate={isIndeterminate}
      onSelectAll={selectAll}
    />
  );

  const selectionBanner =
    selected.length > 0 ? (
      <SelectionBanner
        count={selected.length}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={selectAll}
        onClearAll={clearAll}
        extra={selectionToolbarExtra}
      />
    ) : null;

  const scrollbarCoverHeight =
    selected.length > 0
      ? SELECTION_BANNER_HEIGHT
      : HEADER_SCROLLBAR_COVER_HEIGHT;

  const showFlexEmptyState =
    !loading &&
    (!data || data.length === 0) &&
    selected.length === 0 &&
    !hideEmptyState;

  const showHeaderOnlyEmptyState =
    !loading &&
    (!data || data.length === 0) &&
    selected.length === 0 &&
    hideEmptyState;

  const fillsParentViewport = containerHeight !== "auto";

  return (
    <Box
      sx={{
        position: "relative",
        ...(fillsParentViewport
          ? {
              flex: 1,
              minHeight: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }
          : {}),
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "4px",
          height: containerHeight,
          maxHeight: containerHeight,
          position: "relative",
          display: showFlexEmptyState ? "flex" : undefined,
          flexDirection: showFlexEmptyState ? "column" : undefined,
          minHeight:
            showFlexEmptyState && containerHeight === "auto" ? 280 : undefined,
          overflow: "auto",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          ...(fillsParentViewport ? { flex: 1, minHeight: 0 } : {}),
          ...sx,
        }}
      >
        {/*
          Banner + table share one width wrapper so bulk-select header spans the
          full scrollable table width (not only the visible viewport).
        */}
        <Box
          sx={{
            display: showFlexEmptyState ? "flex" : "inline-block",
            flexDirection: showFlexEmptyState ? "column" : undefined,
            flex: showFlexEmptyState ? 1 : undefined,
            minWidth: "100%",
            minHeight: showFlexEmptyState ? "100%" : undefined,
            verticalAlign: "top",
          }}
        >
          {selectionBanner}
          {showFlexEmptyState ? (
            <>
              <Table
                stickyHeader={stickyHeader}
                sx={{ flexShrink: 0, width: "100%" }}
              >
                {tableHeader}
              </Table>
              <Box
                sx={{
                  flex: containerHeight === "auto" ? "1 1 auto" : 1,
                  minHeight: containerHeight === "auto" ? noDataMinHeight : 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "background.paper",
                  overflow: "auto",
                }}
              >
                <NoDataFound text={emptyStateText} />
              </Box>
            </>
          ) : showHeaderOnlyEmptyState ? (
            <Table stickyHeader={stickyHeader} sx={{ width: "100%" }}>
              {tableHeader}
              <TableBody />
            </Table>
          ) : (
            <Table
              stickyHeader={stickyHeader && selected.length === 0}
              sx={{ width: "100%" }}
            >
              {tableHeader}
              <TableBody sx={{ backgroundColor: "background.paper" }}>
              {!loading &&
                data?.length > 0 &&
                data.map((row, index) => {
                  const rowKey = getRowId?.(row, index) ?? index;
                  const isPulledToInventory =
                    Array.isArray(currentRowData) &&
                    currentRowData[index]?.isPulledToInventory === true;

                  const expandedRow = renderExpandedRow?.(row, index);
                  const expandedRowCells = renderExpandedRowCells?.(row, index);

                  return (
                    <React.Fragment key={rowKey}>
                      <TableRow
                        sx={{
                          position: "relative",
                          cursor: onRowClick ? "pointer" : "default",
                        }}
                        onMouseEnter={() => setHoveredRow(index)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        {showSelectAll && (
                          <TableCell
                            sx={{
                              width: SELECT_COLUMN_WIDTH,
                              minWidth: SELECT_COLUMN_WIDTH,
                              maxWidth: SELECT_COLUMN_WIDTH,
                              padding: "8px",
                            }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Tooltip
                              title={
                                selectionDisabled
                                  ? selectionDisabledTooltip ?? ""
                                  : ""
                              }
                              arrow
                              disableHoverListener={
                                !selectionDisabled || !selectionDisabledTooltip
                              }
                            >
                              <span>
                                <Checkbox
                                  checked={isRowSelected(index)}
                                  onChange={() => toggleRow(index)}
                                  disabled={selectionDisabled}
                                  sx={{
                                    opacity: selectionDisabled ? 0.55 : 1,
                                    cursor: selectionDisabled
                                      ? "not-allowed"
                                      : "pointer",
                                  }}
                                />
                              </span>
                            </Tooltip>
                          </TableCell>
                        )}

                        {columns.map((column) => (
                          <TableCell
                            key={column.id}
                            align={column.align || "left"}
                            sx={getBodyCellSx(column, theme)}
                            onClick={() => {
                              if (!editingCell && onRowClick) onRowClick(row);
                            }}
                          >
                            <CellContent
                              row={row}
                              column={column}
                              rowIndex={index}
                              isHovered={hoveredRow === index}
                              editingCell={editingCell}
                              editValue={editValue}
                              localizationValue={localizationValue}
                              overflowStates={overflowStates}
                              setOverflowRef={setOverflowRef}
                              onStartEditing={startEditing}
                              onEditValueChange={setEditValue}
                              onEditComplete={handleEditComplete}
                              onCancelEditing={() => setEditingCell(null)}
                            />
                          </TableCell>
                        ))}

                        {showRowActions && (
                          <TableCell sx={getStickyActionCellSx(theme)}>
                            {!isPulledToInventory && (
                              <RowActions
                                row={row}
                                index={index}
                                isHovered={hoveredRow === index}
                                isMenuActive={menuState.rowIndex === index}
                                menuState={menuState}
                                actionItems={actionItems}
                                inlineRowActions={inlineRowActions}
                                buttonStyle={actionButtonStyle}
                                onOpen={openMenu}
                                onClose={closeMenu}
                                onRowAction={onRowAction}
                              />
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                      {expandedRowCells ? (
                        expandedRowCells
                      ) : expandedRow ? (
                        <TableRow>
                          <TableCell
                            colSpan={getNoDataColSpan(
                              columns,
                              showSelectAll,
                              showRowActions,
                            )}
                            sx={{
                              p: 1,
                              bgcolor: "background.default",
                              ...expandedRowCellSx,
                            }}
                          >
                            {expandedRow}
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </React.Fragment>
                  );
                })}

              {!loading && (!data || data.length === 0) && (
                <TableRow
                  sx={{ "& .MuiTableCell-root": { borderBottom: "none" } }}
                >
                  <TableCell
                    colSpan={getNoDataColSpan(
                      columns,
                      showSelectAll,
                      showRowActions,
                    )}
                    align="center"
                    sx={{
                      minHeight: noDataMinHeight,
                      verticalAlign: "middle",
                    }}
                  >
                    <NoDataFound image={emptyStateImage} text={emptyStateText} />
                  </TableCell>
                </TableRow>
              )}

              {loading &&
                [1, 2, 3, 4].map((_, index) => (
                  <TableRow key={index}>
                    {showSelectAll && (
                      <TableCell
                        sx={{
                          borderRight: "none",
                          width: SELECT_COLUMN_WIDTH,
                          minWidth: SELECT_COLUMN_WIDTH,
                          maxWidth: SELECT_COLUMN_WIDTH,
                          padding: "8px",
                        }}
                      >
                        <Skeleton variant="rounded" height={24} width={24} />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const stickyRight = Boolean(column.stickyOnRight);
                      return (
                        <TableCell
                          key={column.id}
                          sx={getSkeletonCellSx(column, theme)}
                        >
                          {stickyRight ? (
                            <Skeleton
                              variant="rounded"
                              height={24}
                              width={24}
                            />
                          ) : (
                            <Skeleton
                              className="mr-3 my-3 w-120"
                              variant="rounded"
                              height={30}
                            />
                          )}
                        </TableCell>
                      );
                    })}
                    {showRowActions && (
                      <TableCell
                        sx={{
                          position: "sticky",
                          right: 0,
                          zIndex: 2,
                          width: ACTION_COLUMN_WIDTH,
                          minWidth: ACTION_COLUMN_WIDTH,
                          maxWidth: ACTION_COLUMN_WIDTH,
                          padding: 0,
                          verticalAlign: "middle",
                          backgroundColor: theme.palette.background.paper,
                        }}
                      >
                        <Skeleton variant="rounded" height={24} width={24} />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          )}
        </Box>
      </TableContainer>
      {stickyHeader && (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "16px",
            height: scrollbarCoverHeight,
            background: theme.palette.primary.main,
            pointerEvents: "none",
            zIndex: 13,
            borderTopRightRadius: "4px",
          }}
        />
      )}
      {pagination && (
        <Box sx={{ px: 2 }}>
          <CustomTablePagination
            totalPage={pagination.totalPage}
            onChangeRowsperPage={pagination.onChangeRowsperPage}
            rowsPerPage={pagination.rowsPerPage}
            currentPage={pagination.currentPage}
            onChangePage={pagination.onChangePage}
          />
        </Box>
      )}
    </Box>
  );
}
