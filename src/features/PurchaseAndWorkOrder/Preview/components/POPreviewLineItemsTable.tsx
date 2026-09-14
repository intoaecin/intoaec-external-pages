import React, { useMemo } from "react";
import { Box } from "@mui/material";
import CustomTable from "@/components/custom-table";
import {
  PO_PREVIEW_FIELDS,
  PREVIEW_LINE_ITEM_TABLE_SX,
  buildPreviewLineItemColumns,
} from "@/features/RFQAndPO/components/previewLineItemColumns";

export type POPreviewLineItemsTableProps = {
  data: any;
  pdf?: boolean;
  isMobile: boolean;
  isWorkOrder: boolean;
  localizationValue: any;
  t: (key: string) => string;
  commentMode?: boolean;
  hoveredRow: number | null;
  setHoveredRow: (v: number | null) => void;
  commentPopupRef: React.MutableRefObject<any>;
};

export function POPreviewLineItemsTable(props: POPreviewLineItemsTableProps) {
  const {
    data,
    pdf,
    isMobile,
    isWorkOrder,
    localizationValue,
    t,
    commentMode,
    commentPopupRef,
  } = props;

  const columns = useMemo(() => {
    const isWo = Boolean(isWorkOrder || data?.isWorkOrder);
    const itemLabel = pdf
      ? isWo
        ? "Scope of Work"
        : "Item"
      : isWo
        ? t("workOrder.scopeOfWork")
        : t("common.item");
    const totalLabel = pdf ? "Amount" : t("common.amount");

    return buildPreviewLineItemColumns({
      fields: PO_PREVIEW_FIELDS,
      t,
      pdf,
      localizationValue,
      itemLabel,
      totalLabel,
      formatMoney: true,
      showDescription: !isWo,
      nameLimit: 25,
      descriptionLimit: 30,
      commentMode,
      onCommentClick: (anchor, itemId) => {
        commentPopupRef?.current?.handleOpen(anchor, itemId);
      },
    });
  }, [
    data?.isWorkOrder,
    isWorkOrder,
    pdf,
    localizationValue,
    t,
    commentMode,
    commentPopupRef,
  ]);

  if (isMobile) return null;

  const rows = data?.poLineItems ?? [];

  return (
    <Box className={`${isMobile ? "mx-1" : ""} border`}>
      <CustomTable
        columns={columns}
        data={rows}
        getRowId={(row, index) => row?.poliId ?? row?.rliId ?? index}
        stickyHeader={false}
        emptyStateMinHeight={80}
        sx={PREVIEW_LINE_ITEM_TABLE_SX}
      />
    </Box>
  );
}
