import React, { useMemo } from "react";
import { Box, TextField } from "@mui/material";
import CustomTable from "@/components/custom-table";
import type { CreateRFQPOPreviewProps } from "./clientRfqPreviewTypes";
import type { VendorRfqLineItem } from "./clientRfqPreviewTypes";
import {
  CLIENT_RFQ_PREVIEW_FIELDS,
  PREVIEW_LINE_ITEM_TABLE_SX,
  buildPreviewLineItemColumns,
  formatPreviewCurrency,
} from "@/features/RFQAndPO/components/previewLineItemColumns";

export function ClientRFQPOPreviewLineItemsTable(props: {
  data: CreateRFQPOPreviewProps["data"];
  pdf?: boolean;
  isMobile: boolean;
  commentMode?: boolean;
  isEditingAll?: boolean;
  editingRate: string | null;
  rateValue: string;
  setRateValue: (v: string) => void;
  editedRatesById: Record<string, string>;
  setEditedRatesById: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  updatingRate: boolean;
  hoveredRow: number | null;
  setHoveredRow: (v: number | null) => void;
  commentPopupRef: React.MutableRefObject<any>;
  localizationValue: any;
  t: (key: string) => string;
  formatCurrency: (val: number) => any;
  handleRateEdit: (itemId: string, currentRate: number) => void;
}) {
  const {
    data,
    pdf,
    isMobile,
    commentMode,
    isEditingAll,
    editingRate,
    rateValue,
    setRateValue: _setRateValue,
    editedRatesById,
    setEditedRatesById,
    updatingRate,
    commentPopupRef,
    localizationValue,
    t,
    formatCurrency,
    handleRateEdit,
  } = props;

  const columns = useMemo(
    () =>
      buildPreviewLineItemColumns({
        fields: CLIENT_RFQ_PREVIEW_FIELDS,
        t,
        pdf,
        localizationValue,
        formatCurrency,
        showDescription: true,
        descriptionPlaceholder: "-",
        nameLimit: 25,
        commentMode,
        suppressCommentWhenPdf: false,
        onCommentClick: (anchor, itemId) => {
          commentPopupRef?.current?.handleOpen(anchor, itemId);
        },
        renderRate: (row: VendorRfqLineItem) => {
          if (isEditingAll) {
            return (
              <Box
                className="d-flex align-items-center gap-1"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  whiteSpace: "nowrap",
                  "& .MuiInputBase-root": { height: 32 },
                }}
              >
                <TextField
                  size="small"
                  type="text"
                  value={editedRatesById[row.vendorRfqLineItemId] ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                      setEditedRatesById((prev) => ({
                        ...prev,
                        [row.vendorRfqLineItemId]: value,
                      }));
                    }
                  }}
                  onKeyDown={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (
                      e.key === "-" ||
                      (e.key === "." && target.value.includes("."))
                    ) {
                      e.preventDefault();
                    }
                  }}
                  sx={{ width: "80px" }}
                  inputProps={{
                    min: 0,
                    style: { textAlign: "center", fontSize: "0.875rem" },
                  }}
                />
              </Box>
            );
          }

          return (
            <Box
              className="d-flex align-items-center justify-content-center gap-1"
              sx={{ opacity: updatingRate ? 0.6 : 1 }}
              onClick={() =>
                !updatingRate &&
                handleRateEdit(
                  row?.vendorRfqLineItemId,
                  row?.vendorRfqLineItemRate ?? 0,
                )
              }
            >
              <span className="fw-600">
                {formatPreviewCurrency(
                  localizationValue,
                  row?.vendorRfqLineItemRate ?? 0,
                )}
              </span>
            </Box>
          );
        },
        renderTotalValue: (row: VendorRfqLineItem) => {
          const qty = Number(row?.vendorRfqLineItemQuantity) || 0;

          if (isEditingAll) {
            const raw = editedRatesById[row.vendorRfqLineItemId];
            const rate =
              raw === ""
                ? 0
                : Number(raw ?? row?.vendorRfqLineItemRate ?? 0);
            const total = (Number.isFinite(rate) ? rate : 0) * qty;
            return formatCurrency(total);
          }

          if (editingRate === row?.vendorRfqLineItemId) {
            const rate = rateValue === "" ? 0 : Number(rateValue);
            const total = (Number.isFinite(rate) ? rate : 0) * qty;
            return formatCurrency(total);
          }

          return formatCurrency(Number(row?.vendorRfqLineItemTotal) || 0);
        },
      }),
    [
      t,
      pdf,
      localizationValue,
      formatCurrency,
      commentMode,
      commentPopupRef,
      isEditingAll,
      editingRate,
      rateValue,
      editedRatesById,
      setEditedRatesById,
      updatingRate,
      handleRateEdit,
    ],
  );

  if (isMobile) return null;

  const rows = data?.vendorRfqLineItems ?? [];

  return (
    <Box className={`${isMobile ? "mx-1" : ""} border`}>
      <CustomTable
        columns={columns}
        data={rows}
        getRowId={(row) => row?.vendorRfqLineItemId}
        stickyHeader={false}
        emptyStateMinHeight={80}
        sx={{
          ...PREVIEW_LINE_ITEM_TABLE_SX,
          ...(isEditingAll
            ? {
                "& .MuiTableBody .MuiTableRow-root": {
                  backgroundColor: "#E3F2FD",
                  height: 50,
                  transition: "background-color 0.2s ease",
                },
              }
            : {}),
        }}
      />
    </Box>
  );
}
