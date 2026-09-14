import React from "react";
import { Box, Typography } from "@mui/material";
import type {
  CreateRFQPOPreviewProps,
  OpenDialogItemState,
  VendorRfqLineItem,
} from "./clientRfqPreviewTypes";
import { ClientRFQMobileLineItemCard } from "./ClientRFQMobileLineItemCard";

export function ClientRFQPOPreviewMobileLineItems(props: {
  data: CreateRFQPOPreviewProps["data"];
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
  dialogState: OpenDialogItemState;
  handleDialogOpen: (item: VendorRfqLineItem) => void;
  handleDialogClose: () => void;
  localizationValue: any;
  t: (key: string) => string;
  formatCurrency: (val: number) => any;
  handleRateEdit: (itemId: string, currentRate: number) => void;
  updateMessage: string;
}) {
  const {
    data,
    isMobile,
    commentMode,
    isEditingAll,
    editingRate,
    rateValue,
    setRateValue,
    editedRatesById,
    setEditedRatesById,
    updatingRate,
    hoveredRow,
    setHoveredRow,
    commentPopupRef,
    dialogState,
    handleDialogOpen,
    handleDialogClose,
    localizationValue,
    t,
    formatCurrency,
    handleRateEdit,
    updateMessage,
  } = props;
  if (!isMobile) return null;
  return (
    <>
      <Box>
        {data?.vendorRfqLineItems?.map((item: any, index: number) => (
          <ClientRFQMobileLineItemCard
            key={item?.vendorRfqLineItemId}
            item={item}
            index={index}
            isMobile={isMobile}
            commentMode={commentMode}
            isEditingAll={isEditingAll}
            editingRate={editingRate}
            rateValue={rateValue}
            setRateValue={setRateValue}
            editedRatesById={editedRatesById}
            setEditedRatesById={setEditedRatesById}
            updatingRate={updatingRate}
            hoveredRow={hoveredRow}
            setHoveredRow={setHoveredRow}
            commentPopupRef={commentPopupRef}
            dialogState={dialogState}
            handleDialogOpen={handleDialogOpen}
            handleDialogClose={handleDialogClose}
            localizationValue={localizationValue}
            formatCurrency={formatCurrency}
            handleRateEdit={handleRateEdit}
            t={t}
          />
        ))}
      </Box>
      {updateMessage && (
        <Box className="mx-2 my-2">
          <Typography
            variant="body2"
            sx={{
              color: updateMessage.includes("successfully")
                ? "success.main"
                : "error.main",
              textAlign: "center",
              fontWeight: 500,
              backgroundColor: updateMessage.includes("successfully")
                ? "#E8F5E8"
                : "#FFEBEE",
              padding: "8px 16px",
              borderRadius: "4px",
              border: `1px solid ${
                updateMessage.includes("successfully") ? "#4CAF50" : "#F44336"
              }`,
            }}
          >
            {updateMessage}
          </Typography>
        </Box>
      )}
    </>
  );
}
