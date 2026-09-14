import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { Column } from "@/components/custom-table";
import ViewCommentIcon from "@/assets/icons/view-comment-icon";
import { TruncatedText } from "@/components_v2/TruncatedText";
import {
  formatNumberITL,
  getLocalizationValue,
} from "@/lib/helpers";
import { getLocalizedUnitLabel } from "@/lib/unitLocalization";

/** Dense preview styling to match existing RFQ/PO/WO preview tables. */
export const PREVIEW_LINE_ITEM_TABLE_SX: SxProps<Theme> = {
  boxShadow: "none",
  borderRadius: 0,
  "& .MuiTableBody .MuiTableRow-root": {
    backgroundColor: "#F9F9FA",
    height: 50,
  },
  "& .MuiTableBody .MuiTableCell-root": {
    padding: "8px",
    fontSize: "0.875rem",
  },
  "& .MuiTableHead .MuiTableCell-root": {
    padding: "12px 8px",
    fontSize: "0.875rem",
  },
};

export type PreviewLineItemFieldMap = {
  id: string;
  name: string;
  image: string;
  description?: string;
  quantity: string;
  unit: string;
  /** Fallback unit field (e.g. itemUnitFromEstimate). */
  unitFallback?: string;
  rate: string;
  total: string;
};

export const RFQ_PREVIEW_FIELDS: PreviewLineItemFieldMap = {
  id: "rliId",
  name: "rfqLineItemName",
  image: "rfqLineItemImage",
  quantity: "rfqLineItemQuantity",
  unit: "rfqLineItemUnit",
  unitFallback: "itemUnitFromEstimate",
  rate: "rfqLineItemPrice",
  total: "rfqLineItemTotal",
};

export const PO_PREVIEW_FIELDS: PreviewLineItemFieldMap = {
  id: "poliId",
  name: "poItemName",
  image: "poItemImage",
  description: "poItemDescription",
  quantity: "poItemQuantity",
  unit: "poItemUnit",
  unitFallback: "itemUnitFromEstimate",
  rate: "poItemRate",
  total: "poItemTotal",
};

export const CLIENT_RFQ_PREVIEW_FIELDS: PreviewLineItemFieldMap = {
  id: "vendorRfqLineItemId",
  name: "vendorRfqLineItemName",
  image: "vendorRfqLineItemImage",
  description: "vendorRfqLineItemDescription",
  quantity: "vendorRfqLineItemQuantity",
  unit: "vendorRfqLineItemUnit",
  rate: "vendorRfqLineItemRate",
  total: "vendorRfqLineItemTotal",
};

export function formatPreviewCurrency(
  localizationValue: any,
  value: number | string | null | undefined,
  formatCurrency?: (val: number) => React.ReactNode,
): React.ReactNode {
  const num = Number(value ?? 0);
  if (formatCurrency) return formatCurrency(num);
  if (localizationValue) {
    return (
      getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") +
      "" +
      formatNumberITL(localizationValue, num)
    );
  }
  return value ?? 0;
}

function getField(row: any, key?: string) {
  if (!key) return undefined;
  return row?.[key];
}

function PreviewItemNameCell({
  row,
  fields,
  showDescription,
  descriptionPlaceholder,
  nameLimit,
  descriptionLimit,
}: {
  row: any;
  fields: PreviewLineItemFieldMap;
  showDescription?: boolean;
  /** When set, empty descriptions still render (e.g. "-"). */
  descriptionPlaceholder?: string;
  nameLimit?: number;
  descriptionLimit?: number;
}) {
  const image = getField(row, fields.image);
  const name = getField(row, fields.name) ?? "";
  const description = fields.description
    ? getField(row, fields.description)
    : undefined;
  const descriptionText =
    description ||
    (descriptionPlaceholder != null ? descriptionPlaceholder : undefined);

  return (
    <div className="d-flex gap-1">
      <div className="d-flex">
        <img
          src={image || "/images/no-image.png"}
          width={20}
          height={20}
          className="rounded"
          alt=""
        />
      </div>
      <div>
        <span className="fw-600">
          {nameLimit != null ? (
            <TruncatedText text={String(name)} limit={nameLimit} />
          ) : (
            name
          )}
        </span>
        {showDescription && descriptionText != null ? (
          <>
            <br />
            <Tooltip title={String(description || "")} arrow placement="top">
              <Box
                className="fs-7"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                  lineHeight: 1.4,
                  color: "#6c757d",
                  cursor: "default",
                }}
              >
                {descriptionLimit != null && description ? (
                  <TruncatedText
                    text={String(description)}
                    limit={descriptionLimit}
                  />
                ) : (
                  descriptionText
                )}
              </Box>
            </Tooltip>
          </>
        ) : null}
      </div>
    </div>
  );
}

function PreviewCommentButton({
  row,
  fields,
  isHovered,
  commentMode,
  pdf,
  suppressCommentWhenPdf = true,
  onCommentClick,
}: {
  row: any;
  fields: PreviewLineItemFieldMap;
  isHovered?: boolean;
  commentMode?: boolean;
  pdf?: boolean;
  suppressCommentWhenPdf?: boolean;
  onCommentClick?: (anchor: HTMLElement, itemId: string) => void;
}) {
  if (
    !commentMode ||
    (suppressCommentWhenPdf && pdf) ||
    !onCommentClick
  ) {
    return null;
  }
  const itemId = getField(row, fields.id);
  if (!itemId) return null;

  return (
    <Box
      component="div"
      sx={{
        position: "absolute",
        right: 4,
        top: "50%",
        transform: "translateY(-50%)",
        opacity: isHovered ? 1 : 0,
        pointerEvents: isHovered ? "auto" : "none",
      }}
      className="menu-button-container"
    >
      <IconButton
        size="small"
        className="hide-in-pdf"
        onClick={(e) => {
          e.stopPropagation();
          onCommentClick(e.currentTarget, String(itemId));
        }}
        color="primary"
        sx={{ p: 0.5 }}
      >
        <ViewCommentIcon style={{ width: "25px" }} />
      </IconButton>
    </Box>
  );
}

export type BuildPreviewLineItemColumnsOptions = {
  fields: PreviewLineItemFieldMap;
  t: (key: string) => string;
  pdf?: boolean;
  localizationValue?: any;
  /** Header for item column (defaults to item description). */
  itemLabel?: string;
  /** Header for total/amount column (defaults to common.total). */
  totalLabel?: string;
  formatCurrency?: (val: number) => React.ReactNode;
  /** Whether to show description under the name. */
  showDescription?: boolean;
  /** When set, empty descriptions still render (e.g. "-"). */
  descriptionPlaceholder?: string;
  nameLimit?: number;
  descriptionLimit?: number;
  /** When false, rate/total render raw values (admin RFQ preview). Default true when localization provided. */
  formatMoney?: boolean;
  commentMode?: boolean;
  /** When true (default), comment icon is hidden in PDF mode. */
  suppressCommentWhenPdf?: boolean;
  onCommentClick?: (anchor: HTMLElement, itemId: string) => void;
  /** Override rate cell (e.g. client RFQ inline edit). */
  renderRate?: (
    row: any,
    rowIndex?: number,
    isHovered?: boolean,
  ) => React.ReactNode;
  /** Override total cell value (comment button still appended unless suppressed). */
  renderTotalValue?: (
    row: any,
    rowIndex?: number,
    isHovered?: boolean,
  ) => React.ReactNode;
};

/**
 * Shared read-only preview columns for RFQ / PO / WO / client RFQ desktop tables.
 */
export function buildPreviewLineItemColumns(
  options: BuildPreviewLineItemColumnsOptions,
): Column[] {
  const {
    fields,
    t,
    pdf,
    localizationValue,
    itemLabel,
    totalLabel,
    formatCurrency,
    showDescription,
    descriptionPlaceholder,
    nameLimit,
    descriptionLimit,
    formatMoney = Boolean(localizationValue) || Boolean(formatCurrency),
    commentMode,
    suppressCommentWhenPdf = true,
    onCommentClick,
    renderRate,
    renderTotalValue,
  } = options;

  const money = (value: number | string | null | undefined) =>
    formatMoney
      ? formatPreviewCurrency(localizationValue, value, formatCurrency)
      : (value ?? 0);

  return [
    {
      id: fields.name,
      label: (
        <span className="fw-600">
          {itemLabel ??
            (pdf ? "Item Description" : t("common.itemDescription"))}
        </span>
      ),
      width: "30%",
      suppressCellOverflow: true,
      render: (row) => (
        <PreviewItemNameCell
          row={row}
          fields={fields}
          showDescription={showDescription}
          descriptionPlaceholder={descriptionPlaceholder}
          nameLimit={nameLimit}
          descriptionLimit={descriptionLimit}
        />
      ),
    },
    {
      id: fields.quantity,
      label: (
        <span className="fw-600">
          {pdf ? "Quantity" : t("common.quantity")}
        </span>
      ),
      align: "center",
      render: (row) => (
        <span className="fw-600 text-center">
          {getField(row, fields.quantity)}
        </span>
      ),
    },
    {
      id: fields.unit,
      label: (
        <span className="fw-600">{pdf ? "Unit" : t("common.unit")}</span>
      ),
      align: "center",
      render: (row) => (
        <span className="fw-600 text-center">
          {getLocalizedUnitLabel(
            getField(row, fields.unit) || getField(row, fields.unitFallback),
            t,
          )}
        </span>
      ),
    },
    {
      id: fields.rate,
      label: (
        <span className="fw-600">{pdf ? "Rate" : t("common.rate")}</span>
      ),
      align: "center",
      suppressCellOverflow: true,
      render: (row, rowIndex, isHovered) =>
        renderRate ? (
          renderRate(row, rowIndex, isHovered)
        ) : (
          <span className="fw-600">{money(getField(row, fields.rate))}</span>
        ),
    },
    {
      id: fields.total,
      label: (
        <span className="fw-600">
          {totalLabel ?? (pdf ? "Total" : t("common.total"))}
        </span>
      ),
      align: "center",
      suppressCellOverflow: true,
      render: (row, rowIndex, isHovered) => (
        <Box sx={{ position: "relative", width: "100%" }}>
          <span className="fw-600">
            {renderTotalValue
              ? renderTotalValue(row, rowIndex, isHovered)
              : money(getField(row, fields.total))}
          </span>
          <PreviewCommentButton
            row={row}
            fields={fields}
            isHovered={isHovered}
            commentMode={commentMode}
            pdf={pdf}
            suppressCommentWhenPdf={suppressCommentWhenPdf}
            onCommentClick={onCommentClick}
          />
        </Box>
      ),
    },
  ];
}
