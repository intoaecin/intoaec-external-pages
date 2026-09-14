import React from "react";
import { Box } from "@mui/material";
import type {
  OpenDialogItemState,
  VendorRfqLineItem,
} from "./clientRfqPreviewTypes";
import { ClientRFQMobileItemInfo } from "./ClientRFQMobileItemInfo";
import { ClientRFQMobileItemActions } from "./ClientRFQMobileItemActions";

export function ClientRFQMobileLineItemCard(props: {
  item: VendorRfqLineItem;
  index: number;
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
  formatCurrency: (val: number) => any;
  handleRateEdit: (itemId: string, currentRate: number) => void;
  t: (key: string) => string;
}) {
  const {
    item,
    index,
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
    formatCurrency,
    handleRateEdit,
    t,
  } = props;

  return (
    <Box
      key={item?.vendorRfqLineItemId}
      sx={{
        mb: 1.5,
        width: "100%",
        boxShadow: 1,
        borderRadius: "6px",
        bgcolor:
          isEditingAll || editingRate === item?.vendorRfqLineItemId
            ? "#E3F2FD"
            : "#F9F9FA",
        transition: "background-color 0.2s ease",
      }}
      onMouseEnter={() => setHoveredRow(index)}
      onMouseLeave={() => setHoveredRow(null)}
    >
      <Box
        sx={{
          py: 1,
          px: 1.8,
          "&:last-child": { pb: 1.2 },
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <ClientRFQMobileItemInfo
            item={item}
            isMobile={isMobile}
            dialogState={dialogState}
            handleDialogClose={handleDialogClose}
            localizationValue={localizationValue}
            formatCurrency={formatCurrency}
            t={t}
            isEditingAll={isEditingAll}
            editingRate={editingRate}
            rateValue={rateValue}
            editedRatesById={editedRatesById}
          />
          <ClientRFQMobileItemActions
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
            commentPopupRef={commentPopupRef}
            handleDialogOpen={handleDialogOpen}
            localizationValue={localizationValue}
            formatCurrency={formatCurrency}
            handleRateEdit={handleRateEdit}
            t={t}
          />
        </Box>
      </Box>
    </Box>
  );
}
