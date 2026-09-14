import { BoqCommentPopup } from "@/features/components/boq/BoqCommentPopup";
import { useEstimateCommentsData } from "@/features/components/providers/BoqProvider/BoqSuggestionProvider";
import NoPortfolioImage from "@/assets/icons/no-portfolio-image";
import ProposalLeadCommentsIcon from "@/assets/icons/proposalLeadComments-icon";
import {
  formatDateBasedOnOrganizationLocalization,
  formatNumberITL,
  hexToRgb,
} from "@/lib/helpers";
import { defaultBOQColumns } from "@/lib/constants";
import { getLocalizedUnitLabel } from "@/lib/unitLocalization";
import {
  BoqClientEstiamteSectionResponseType,
  BoqClientEstimateSectionItemResponseType,
  BoqClientEstimateSectionType,
} from "@/types";
import {
  Box,
  Button,
  Checkbox,
  createTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
  SxProps,
  Theme,
} from "@mui/material";
import React, { useMemo, useRef } from "react";
import { Material } from "../export/BoqExport";
import { useTranslation } from "react-i18next";
import { TruncatedText } from "@/components_v2/TruncatedText";
import ImagePreviewDialog from "@/features/components/ImagePreviewDialog";

// TypeScript Types
export interface Item {
  itemId: string;
  itemName: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  category: string;
  itemImages: string[];
  totalCost: number;
  rateIncluProfit: number;
  materials: Material[];
}

export interface SectionData {
  sectionId: string;
  sectionName: string;
  sectionItems: Item[];
}

const sortVisibleColumns = (columns?: any[]) => {
  if (!Array.isArray(columns)) return [];

  // If NOT app → filter showToCustomer
  const filtered = columns.filter(
    (col) => col.showToCustomer && col.disabled !== false,
  );

  return filtered.sort((a, b) => {
    if (a.accessor === "itemDescription") return -1;
    if (b.accessor === "itemDescription") return 1;
    if (a.accessor === "totalCost") return 1;
    if (b.accessor === "totalCost") return -1;

    return Number(b.fixedOrder) - Number(a.fixedOrder);
  });
};

const getMaterialAmount = (material: any) =>
  material?.materialPrice ??
  material?.priceInclusiveTax ??
  material?.rateIncluProfit ??
  material?.ratePerUnit ??
  material?.rate;

const pdfColumnDivider = "1px solid #DDE7F2";

const getPdfColumnWidth = (columnValue?: string) => {
  switch (columnValue) {
    case "itemName":
      return "50%";
    case "quantity":
      return "10%";
    case "unit":
      return "10%";
    case "ratePerUnit":
    case "rateExcluTax":
    case "tax":
    case "rateIncluProfit":
      return "15%";
    case "startDate":
      return "12%";
    case "duration":
      return "8%";
    case "endDate":
      return "12%";
    case "totalCost":
      return "15%";
    default:
      return "10%";
  }
};

// On-screen (non-PDF) column widths: fixed pixel values so a table with many
// columns overflows its container and scrolls horizontally instead of being
// squeezed to fit — percentages of a 100%-wide table can never trigger scroll.
const ITEM_NAME_COLUMN_PX = 260;
const LIVE_COLUMN_PX_WIDTHS: Record<string, number> = {
  quantity: 90,
  unit: 90,
  ratePerUnit: 130,
  rateExcluTax: 150,
  tax: 110,
  rateIncluProfit: 130,
  startDate: 130,
  duration: 110,
  endDate: 130,
  totalCost: 130,
};
const DEFAULT_LIVE_COLUMN_PX = 130;

const getLiveColumnWidthPx = (columnValue?: string) =>
  columnValue === "itemName"
    ? ITEM_NAME_COLUMN_PX
    : (LIVE_COLUMN_PX_WIDTHS[columnValue ?? ""] ?? DEFAULT_LIVE_COLUMN_PX);

const getColumnWidth = (columnValue?: string, pdf?: boolean) =>
  pdf
    ? getPdfColumnWidth(columnValue)
    : `${getLiveColumnWidthPx(columnValue)}px`;

const getTableMinWidthPx = (columns: any[]) =>
  ITEM_NAME_COLUMN_PX +
  columns.reduce((sum, col) => sum + getLiveColumnWidthPx(col.columnValue), 0);

const isDateColumn = (columnValue?: string) =>
  columnValue === "startDate" || columnValue === "endDate";

const dateColumnCellSx = {
  minWidth: "96px",
  whiteSpace: "nowrap",
  overflowWrap: "normal",
  wordBreak: "normal",
} as const;

const pdfWrapSx = {
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  lineHeight: 1.3,
} as const;

const currencyOverflowSx = {
  maxWidth: "100%",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  display: "block",
} as const;

const isEmptyPreviewValue = (value: unknown) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "");

const isEmptyOrZeroPreviewValue = (value: unknown) =>
  isEmptyPreviewValue(value) || Number(value) === 0;

const isEmptyOrPlaceholderPreviewValue = (value: unknown) =>
  isEmptyPreviewValue(value) ||
  (typeof value === "string" && value.trim() === "-");

const getMaterialRate = (material: any) =>
  material?.rateIncluProfit ??
  material?.ratePerUnit ??
  material?.rate ??
  material?.priceInclusiveTax;

const isBlankMaterial = (material: any) =>
  [
    material?.materialName,
    material?.materialDescription,
    material?.unitValue,
    material?.unit,
  ].every(isEmptyOrPlaceholderPreviewValue) &&
  [getMaterialRate(material), getMaterialAmount(material)].every(
    isEmptyOrZeroPreviewValue,
  );

const renderCurrencyPreviewValue = (
  value: any,
  currency: string,
  localizationValue: any,
  pdf?: boolean,
) => {
  if (isEmptyPreviewValue(value)) {
    return "-";
  }

  const formatted = `${currency ?? ""}${
    formatNumberITL(localizationValue, value) ?? value
  }`;

  if (pdf) {
    return (
      <Box component="span" sx={pdfWrapSx}>
        {formatted}
      </Box>
    );
  }

  return (
    <Box component="span" title={formatted} sx={currencyOverflowSx}>
      {formatted}
    </Box>
  );
};

const renderNumericPreviewValue = (value: any, pdf?: boolean) => {
  if (isEmptyPreviewValue(value)) {
    return "-";
  }

  const formatted = String(value);

  if (pdf) {
    return (
      <Box component="span" sx={pdfWrapSx}>
        {formatted}
      </Box>
    );
  }

  return (
    <Box component="span" title={formatted} sx={currencyOverflowSx}>
      {formatted}
    </Box>
  );
};

type LineItemImageSource = BoqClientEstimateSectionItemResponseType & {
  itemImage?: string;
  itemImages?: string[];
};

const getLineItemImage = (item: BoqClientEstimateSectionItemResponseType) => {
  const lineItem = item as LineItemImageSource;

  return (
    lineItem.itemImage ||
    (Array.isArray(lineItem.itemImages) ? lineItem.itemImages[0] : undefined)
  );
};

const LineItemImage = ({
  src,
  pdf,
  onPreview,
  previewLabel,
}: {
  src?: string;
  pdf?: boolean;
  onPreview?: () => void;
  previewLabel: string;
}) => {
  if (!src) return null;

  return (
    <Box
      component="button"
      type="button"
      onClick={onPreview}
      aria-label={previewLabel}
      sx={{
        border: 0,
        p: 0,
        m: 0,
        bgcolor: "transparent",
        lineHeight: 0,
        cursor: "pointer",
        flexShrink: 0,
        mt: 0.25,
      }}
    >
      <Box
        component="img"
        src={src}
        alt=""
        sx={{
          display: "block",
          width: pdf ? 28 : 32,
          height: pdf ? 28 : 32,
          borderRadius: "4px",
          objectFit: "cover",
        }}
      />
    </Box>
  );
};

const StaticLineItemImage = ({ src, pdf }: { src?: string; pdf?: boolean }) => {
  if (!src) return null;

  return (
    <Box
      component="img"
      src={src}
      alt=""
      sx={{
        display: "block",
        width: pdf ? 28 : 32,
        height: pdf ? 28 : 32,
        borderRadius: "4px",
        objectFit: "cover",
        flexShrink: 0,
        mt: 0.25,
      }}
    />
  );
};

const OverflowTooltip = ({
  title,
  children,
  disabled = false,
}: {
  title?: string;
  children: React.ReactElement;
  disabled?: boolean;
}) => {
  const contentRef = React.useRef<HTMLElement | null>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  const checkOverflow = React.useCallback(() => {
    const element = contentRef.current;
    if (!element) {
      setIsOverflowing(false);
      return;
    }

    setIsOverflowing(
      element.scrollWidth > element.clientWidth ||
        element.scrollHeight > element.clientHeight,
    );
  }, []);

  React.useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [checkOverflow, title]);

  return (
    <Tooltip
      title={!disabled && isOverflowing ? title || "" : ""}
      arrow
      placement="top-start"
    >
      <span
        style={{ display: "block", maxWidth: "100%" }}
        onMouseEnter={checkOverflow}
      >
        {React.cloneElement(children, { ref: contentRef })}
      </span>
    </Tooltip>
  );
};

const PdfColumnGroup = ({
  columns,
  pdf,
}: {
  columns: any[];
  pdf?: boolean;
}) => (
  <colgroup>
    <col style={{ width: getColumnWidth("itemName", pdf) }} />
    {columns.map((col) => (
      <col
        key={col.columnId ?? col.columnValue}
        style={{ width: getColumnWidth(col.columnValue, pdf) }}
      />
    ))}
  </colgroup>
);

const MaterialRows = ({
  item,
  columns,
  currency,
  localizationValue,
  pdf,
}: {
  item: BoqClientEstimateSectionItemResponseType;
  columns: any[];
  currency: string;
  localizationValue: any;
  pdf?: boolean;
}) => {
  const materials = Array.isArray((item as any)?.materials)
    ? (item as any).materials
    : [];
  const { t } = useTranslation();

  if (!materials.length) return null;

  return (
    <>
      {materials.map((material: any, index: number) => {
        const blankMaterial = isBlankMaterial(material);

        return (
          <TableRow
            key={`${item.sectionItemId}-material-${index}`}
            sx={{
              backgroundColor: "#F4F9FF",
              "& .MuiTableCell-root": {
                borderBottom: "1px solid #D7E7F7",
                borderRight: pdf ? pdfColumnDivider : undefined,
                fontSize: "0.8rem",
                py: 1,
              },
              "& .MuiTableCell-root:last-of-type": {
                borderRight: 0,
              },
            }}
          >
            <TableCell
              sx={{
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                pl: 3,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontSize: "0.82rem", fontWeight: 600 }}
              >
                {material?.materialName || "-"}
              </Typography>
              {material?.materialDescription && (
                <OverflowTooltip
                  title={!pdf ? material.materialDescription : ""}
                  disabled={pdf}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.72rem",
                      color: "#64748B",
                      ...(pdf
                        ? {}
                        : {
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }),
                      ...pdfWrapSx,
                    }}
                  >
                    {material.materialDescription}
                  </Typography>
                </OverflowTooltip>
              )}
            </TableCell>
            {columns.map((column) => {
              const accessor = String(column.columnValue ?? column.accessor);
              let content: React.ReactNode = "-";

              if (accessor === "quantity") {
                content = blankMaterial
                  ? "-"
                  : renderNumericPreviewValue(
                      formatNumberITL(localizationValue, material?.quantity) ??
                        material?.quantity ??
                        "-",
                      pdf,
                    );
              } else if (accessor === "unit") {
                content =
                  getLocalizedUnitLabel(
                    material?.unitValue || material?.unit,
                    t,
                  ) || "-";
              } else if (
                accessor === "ratePerUnit" ||
                accessor === "rateIncluProfit" ||
                accessor === "rate"
              ) {
                content = renderCurrencyPreviewValue(
                  blankMaterial ? undefined : getMaterialRate(material),
                  currency,
                  localizationValue,
                  pdf,
                );
              } else if (accessor === "rateExcluTax") {
                content = renderCurrencyPreviewValue(
                  blankMaterial ? undefined : material?.rateExcluTax,
                  currency,
                  localizationValue,
                  pdf,
                );
              } else if (accessor === "tax") {
                const taxValue = blankMaterial ? undefined : material?.tax;
                content = isEmptyPreviewValue(taxValue)
                  ? "-"
                  : material?.taxType === "FIXED"
                    ? renderCurrencyPreviewValue(
                        taxValue,
                        currency,
                        localizationValue,
                        pdf,
                      )
                    : renderNumericPreviewValue(
                        `${formatNumberITL(localizationValue, taxValue) ?? taxValue}%`,
                        pdf,
                      );
              } else if (accessor === "totalCost") {
                content = renderCurrencyPreviewValue(
                  blankMaterial ? undefined : getMaterialAmount(material),
                  currency,
                  localizationValue,
                  pdf,
                );
              } else if (accessor === "profitMarkup" || accessor === "profit") {
                const profitValue = blankMaterial
                  ? undefined
                  : (material?.profitMarkup ?? material?.profit);
                content = isEmptyPreviewValue(profitValue)
                  ? "-"
                  : (material?.profitMarkupType ?? material?.profitType) ===
                      "FIXED"
                    ? renderCurrencyPreviewValue(
                        profitValue,
                        currency,
                        localizationValue,
                        pdf,
                      )
                    : renderNumericPreviewValue(
                        formatNumberITL(localizationValue, profitValue) ??
                          profitValue,
                        pdf,
                      );
              } else {
                // Generic fallback for any other/custom column, mirroring
                // the parent item row's default rendering so materials
                // don't silently show "-" for columns not special-cased
                // above (e.g. custom columns, formula columns).
                const rawValue = blankMaterial
                  ? undefined
                  : (material as any)?.[accessor];

                if (column?.calcConfig?.isCurrencyColumn) {
                  content = renderCurrencyPreviewValue(
                    rawValue,
                    currency,
                    localizationValue,
                    pdf,
                  );
                } else if (
                  column?.dataType === "Number" &&
                  !isEmptyPreviewValue(rawValue) &&
                  !isNaN(Number(rawValue))
                ) {
                  content = renderNumericPreviewValue(
                    formatNumberITL(localizationValue, rawValue) ?? rawValue,
                    pdf,
                  );
                } else if (!isEmptyPreviewValue(rawValue)) {
                  content = String(rawValue);
                }
              }

              return (
              <TableCell
                key={column.columnId ?? accessor}
                align="center"
                sx={{
                  fontWeight: accessor === "totalCost" ? 600 : undefined,
                  ...(pdf ? {} : { overflow: "hidden", maxWidth: 0 }),
                }}
              >
                  {content}
              </TableCell>
              );
            })}
          </TableRow>
        );
      })}
    </>
  );
};

// Item Row Component
const ItemRow: React.FC<{
  item: BoqClientEstimateSectionItemResponseType;
  index: number;
  items: BoqClientEstimateSectionItemResponseType[];
  currency: string;
  visibleColumns?: any[];
  localizationValue: any;
  showMaterials?: boolean;
  pdf?: boolean;
  type?: "CLIENT" | "ADMIN";
  selectedItemIds?: Set<string>;
  onToggleItemSelect?: (itemId: string) => void;
}> = ({
  item,
  index,
  items,
  currency,
  visibleColumns,
  localizationValue,
  showMaterials,
  pdf,
  type,
  selectedItemIds,
  onToggleItemSelect,
}) => {
  const isLast = items.length - 1 === index;
  const isClientView =
    type === "CLIENT" ||
    (type !== "ADMIN" &&
      typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/client-boq") ||
        window.location.pathname.startsWith("/sales-order") ||
        window.location.pathname.startsWith("/change-order-preview")));
  const columnsToRender = Array.isArray(visibleColumns) ? visibleColumns : [];
  const taxBreakdownColumnsEnabled = ["rateExcluTax", "tax"].every(
    (accessor) =>
      columnsToRender.some(
        (column) => String(column.accessor) === accessor,
      ),
  );
  const itemImageUrl = getLineItemImage(item);
  const itemSelectionId = String(item.sectionItemId || item.itemName);
  const { t } = useTranslation();
  const [previewImageOpen, setPreviewImageOpen] = React.useState(false);

  const renderCell = (key: any, value: any, colDef?: any) => {
    const isText = typeof value === "string";
    const renderCurrencyValue = (valToRender: any = value) =>
      renderCurrencyPreviewValue(
        valToRender,
        currency,
        localizationValue,
        pdf,
      );

    const renderValueWithDiff = (
      colKey: string,
      currentVal: any,
      defaultNode: React.ReactNode,
      isCurrency = false,
    ) => {
      if (!item) return defaultNode;

      const getEstValue = () => {
        if (colKey === "quantity") {
          return (
            (item as any)["estimate-quantity"] ??
            (item as any)["estimate-qty"] ??
            (item as any).estimateQuantity ??
            (item as any).estimateQty
          );
        }
        if (
          colKey === "ratePerUnit" ||
          colKey === "rateIncluProfit" ||
          colKey === "rate"
        ) {
          return (
            (item as any)["estimate-rate"] ??
            (item as any)["estimate-ratePerUnit"] ??
            (item as any)["estimate-rateInclProfit"] ??
            (item as any)["estimate-rateIncluProfit"] ??
            (item as any).estimateRate
          );
        }
        if (colKey === "totalCost" || colKey === "price") {
          return (
            (item as any)["estimate-price"] ??
            (item as any)["estimate-totalCost"] ??
            (item as any).estimatePrice
          );
        }
        if (colKey === "unit") {
          return (item as any)["estimate-unit"] ?? (item as any).estimateUnit;
        }
        return (
          (item as any)[`estimate-${colKey}`] ??
          (item as any)[
            `estimate${colKey.charAt(0).toUpperCase() + colKey.slice(1)}`
          ]
        );
      };

      const estVal = getEstValue();

      if (
        estVal === undefined ||
        estVal === null ||
        String(estVal) === String(currentVal ?? "")
      ) {
        return defaultNode;
      }

      const numCurrent = Number(currentVal);
      const numEst = Number(estVal);
      const isNumericDiff = !isNaN(numCurrent) && !isNaN(numEst);

      let bgColor = "action.hover";
      let textColor = "text.primary";

      if (isNumericDiff) {
        if (numCurrent > numEst) {
          bgColor = isClientView ? "#fce8e6" : "#e6f4ea";
          textColor = isClientView ? "#c5221f" : "#137333";
        } else if (numCurrent < numEst) {
          bgColor = isClientView ? "#e6f4ea" : "#fce8e6";
          textColor = isClientView ? "#137333" : "#c5221f";
        }
      } else {
        bgColor = "#e8f0fe";
        textColor = "#1a73e8";
      }

      const formattedEstVal = isCurrency
        ? renderCurrencyValue(estVal)
        : isNumericDiff
          ? (formatNumberITL(localizationValue, estVal) ?? estVal)
          : colKey === "unit"
            ? getLocalizedUnitLabel(String(estVal), t) || String(estVal)
            : String(estVal);

      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: bgColor,
            minWidth: 50,
          }}
        >
          <Box sx={{ color: textColor, fontWeight: 600 }}>{defaultNode}</Box>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.68rem",
              color: "text.secondary",
              textDecoration: "line-through",
              lineHeight: 1.1,
              mt: 0.25,
              opacity: 0.85,
            }}
          >
            Est: {formattedEstVal}
          </Typography>
        </Box>
      );
    };

    switch (key) {
      case "itemName":
        return pdf ? (
          <Typography
            variant="body2"
            sx={{
              maxWidth: "100%",
              ...pdfWrapSx,
            }}
          >
            {value || "-"}
          </Typography>
        ) : (
          <OverflowTooltip title={value || ""}>
            <Typography
              variant="body2"
              sx={{
                maxWidth: "100%",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                ...pdfWrapSx,
              }}
            >
              {value || "-"}
            </Typography>
          </OverflowTooltip>
        );

      case "itemDescription":
        return (
          <Typography
            variant="body2"
            sx={{
              width: pdf ? "100%" : "180px",
              maxWidth: pdf ? "100%" : "none",
              display: pdf ? "block" : "-webkit-box",
              WebkitLineClamp: pdf ? "unset" : 2,
              paddingY: 2,
              WebkitBoxOrient: "vertical",
              overflow: pdf ? "visible" : "hidden",
              whiteSpace: pdf ? "normal" : "inherit",
              overflowWrap: "anywhere",
              wordBreak: pdf ? "break-word" : "normal",
              lineHeight: 1.3,
            }}
          >
            {pdf ? (
              value || "-"
            ) : (
              <TruncatedText text={value || "-"} limit={20} />
            )}
          </Typography>
        );

      case "quantity": {
        if (isEmptyPreviewValue(value)) {
          return "-";
        }
        return renderNumericPreviewValue(
          formatNumberITL(localizationValue, value) ?? value,
          pdf,
        );
      }

      case "unit": {
        const localizedUnit = getLocalizedUnitLabel(value, t) || "-";
        return pdf ? (
          <Typography variant="body2" sx={pdfWrapSx}>
            {localizedUnit}
          </Typography>
        ) : (
          <TruncatedText text={localizedUnit} limit={20} />
        );
      }

      case "ratePerUnit":
      case "rateExcluTax":
      case "rateIncluProfit": {
        return renderCurrencyValue();
      }

      case "tax": {
        if (isEmptyPreviewValue(value)) return "-";
        return item.taxType === "FIXED"
          ? renderCurrencyValue()
          : renderNumericPreviewValue(
              `${formatNumberITL(localizationValue, value) ?? value}%`,
              pdf,
            );
      }

      case "startDate":
      case "endDate":
        return (
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {value
              ? formatDateBasedOnOrganizationLocalization(
                  localizationValue,
                  value,
                  true,
                )
              : "-"}
          </Typography>
        );

      case "totalCost": {
        return renderCurrencyValue();
      }

      default: {
        if (colDef?.calcConfig?.isCurrencyColumn) {
          return renderCurrencyValue();
        }

        if (
          colDef?.dataType === "Number" &&
          !isEmptyPreviewValue(value) &&
          !isNaN(Number(value))
        ) {
          return renderNumericPreviewValue(
            formatNumberITL(localizationValue, value) ?? value,
            pdf,
          );
        }

        if (colDef?.dataType === "Link") {
          if (value && value !== "") {
            return (
              <a
                href={String(value)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1976d2",
                  textDecoration: "none",
                  ...(pdf
                    ? {
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }
                    : {}),
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {pdf ? (
                  String(value)
                ) : (
                  <TruncatedText text={String(value)} limit={30} />
                )}
              </a>
            );
          }
          return "-";
        }

        if (isText) {
          return pdf ? (
            <Typography variant="body2" sx={pdfWrapSx}>
              {value || "-"}
            </Typography>
          ) : (
            <TruncatedText text={value || "-"} limit={30} />
          );
        }
        return value ?? "-";
      }
    }
  };

  return (
    <>
      <ImagePreviewDialog
        open={previewImageOpen}
        imageSrc={itemImageUrl}
        fileName={item?.itemName}
        closeLabel={t("common.close")}
        onClose={() => setPreviewImageOpen(false)}
      />
      <TableRow
        sx={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #e0e0e0",
          "& .MuiTableCell-root": {
            borderRight: pdf ? pdfColumnDivider : undefined,
          },
          "& .MuiTableCell-root:last-of-type": {
            borderRight: 0,
          },
        }}
      >
        <TableCell
          sx={{
            width: getColumnWidth("itemName", pdf),
            maxWidth: 0,
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            px: pdf ? 0.5 : 1,
            py: 1.5,
            verticalAlign: "top",
          }}
        >
          <Box
            sx={{
              maxWidth: "100%",
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              ...pdfWrapSx,
            }}
          >
            {!pdf && onToggleItemSelect && (
              <Checkbox
                size="small"
                checked={Boolean(selectedItemIds?.has(itemSelectionId))}
                onChange={() => onToggleItemSelect(itemSelectionId)}
                onClick={(e) => e.stopPropagation()}
                inputProps={{ "aria-label": t("toast.selectItems") }}
                sx={{ p: 0, mt: 0.25, flexShrink: 0 }}
              />
            )}
            {pdf ? (
              <StaticLineItemImage src={itemImageUrl} pdf={pdf} />
            ) : (
              <LineItemImage
                src={itemImageUrl}
                pdf={pdf}
                onPreview={() => setPreviewImageOpen(true)}
                previewLabel={t("common.preview")}
              />
            )}
            <Box sx={{ minWidth: 0, maxWidth: "100%" }}>
              {renderCell("itemName", item?.itemName)}
              {item?.itemDescription && (
                <OverflowTooltip
                  title={!pdf ? item.itemDescription : ""}
                  disabled={pdf}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748B",
                      fontSize: "12px",
                      mt: 0.5,
                      ...(pdf
                        ? {}
                        : {
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }),
                      ...pdfWrapSx,
                    }}
                  >
                    {item.itemDescription}
                  </Typography>
                </OverflowTooltip>
              )}
            </Box>
          </Box>
        </TableCell>
        {columnsToRender.map((col: any) => {
          const value =
            col.columnValue === "ratePerUnit"
              ? taxBreakdownColumnsEnabled
                ? item.ratePerUnit
                : item.rateIncluProfit
              : item[col.columnValue];

          if (col.columnValue === "itemName") {
            return (
              <TableCell
                key={col.columnValue}
                align="left"
                sx={{
                  width: getColumnWidth(col.columnValue, pdf),
                  maxWidth: pdf ? 0 : "none",
                  whiteSpace: pdf ? "normal" : "nowrap",
                  overflowWrap: pdf ? "anywhere" : "normal",
                  verticalAlign: pdf ? "top" : "middle",
                  px: pdf ? 0.5 : 1.25,
                  py: 1.5,
                }}
              >
                <Box
                  className="d-flex py-1 pl-2"
                  sx={{
                    gap: 1,
                    width: pdf ? "100%" : "220px",
                    maxWidth: pdf ? "100%" : "220px",
                    alignItems: "flex-start",
                  }}
                >
                  {pdf ? (
                    <StaticLineItemImage src={itemImageUrl} pdf={pdf} />
                  ) : (
                    <LineItemImage
                      src={itemImageUrl}
                      pdf={pdf}
                      onPreview={() => setPreviewImageOpen(true)}
                      previewLabel={t("common.preview")}
                    />
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    {renderCell("itemName", item.itemName, col)}
                    {renderCell("itemDescription", item.itemDescription, col)}
                  </Box>
                </Box>
              </TableCell>
            );
          }

          return (
            <TableCell
              key={col.columnValue}
              align="center"
              sx={{
                width: getColumnWidth(col.columnValue, pdf),
                maxWidth: isDateColumn(col.columnValue) ? "none" : 0,
                whiteSpace: pdf
                  ? isDateColumn(col.columnValue)
                    ? "nowrap"
                    : "normal"
                  : "nowrap",
                overflow: pdf ? undefined : "hidden",
                overflowWrap: pdf
                  ? isDateColumn(col.columnValue)
                    ? "normal"
                    : "anywhere"
                  : "normal",
                wordBreak: isDateColumn(col.columnValue) ? "normal" : undefined,
                ...(isDateColumn(col.columnValue) ? dateColumnCellSx : {}),
                verticalAlign: "top",
                px: pdf ? 0.5 : 1.25,
                py: 1.5,
              }}
            >
              <Box
                className="d-flex justify-content-center align-items-start"
                sx={{ minWidth: 0, maxWidth: "100%", width: "100%" }}
              >
                {renderCell(col.columnValue, value, col)}
              </Box>
            </TableCell>
          );
        })}
      </TableRow>
      {showMaterials && (
        <MaterialRows
          item={item}
          columns={columnsToRender}
          currency={currency}
          localizationValue={localizationValue}
          pdf={pdf}
        />
      )}
    </>
  );
};

// Section Component
const Section: React.FC<{
  section: BoqClientEstiamteSectionResponseType;
  index: number;
  commentMode?: boolean;
  type: "CLIENT" | "ADMIN";
  commentPopupRef?: any;
  currency: string;
  visibleColumns?: any[];
  pdf?: boolean;
  showMaterials?: boolean;

  localizationValue: any;
  selectedItemIds?: Set<string>;
  onToggleItemSelect?: (itemId: string) => void;
}> = ({
  section,
  index,
  commentMode,
  commentPopupRef,
  type,
  currency,
  visibleColumns,
  pdf,
  showMaterials,
  localizationValue,
  selectedItemIds,
  onToggleItemSelect,
}) => {
  const columnsToRender = Array.isArray(visibleColumns) ? visibleColumns : [];
  const totalColumns = columnsToRender.length + 1;
  const totalCost = (section.sectionItems ?? []).reduce(
    (sum, item) => sum + (item.totalCost || 0),
    0,
  );
  const hasTotalCostColumn = columnsToRender.some(
    (col) => col.columnValue === "totalCost",
  );

  return (
    <>
      <Box
        sx={{
          position: "relative",
          // overlay pointer-events handling:
          // by default overlay should not block pointer events; when hovered allow events for commentNotifier
          ":hover":
            commentMode && type == "CLIENT"
              ? {
                  "& .commentNotifier": {
                    visibility: "visible",
                    pointerEvents: "auto",
                  },
                }
              : {},
        }}
      >
        {/* Overlay wrapper: keeps pointerEvents none by default, but on container hover it's allowed (see :hover above) */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            pointerEvents: "none", // don't block pointer events normally
            // When parent is hovered we will enable pointer events so the inner notifier can be clickable
            ":hover": {
              pointerEvents: "auto",
            },
          }}
        >
          <Typography
            className="commentNotifier d-flex justify-content-center"
            variant="body2"
            sx={{
              position: "absolute",
              zIndex: 5,
              px: 1,
              userSelect: "none",
              borderRadius: "4px",
              cursor: "pointer",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundImage: ` url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='lightGrey' stroke-width='3' stroke-dasharray='4%2c14' stroke-dashoffset='24' stroke-linecap='square'/%3e%3c/svg%3e")`,
              bgcolor: "background.paper",
              textAlign: "center",
              visibility: "hidden", // hidden by default
              alignItems: "center",
              verticalAlign: "center",
              pointerEvents: "auto", // allow clicks when visible
            }}
            component={"div"}
            onClick={(e) => {
              commentPopupRef?.current?.handleOpen(
                e.currentTarget,
                section.sectionId,
              );
            }}
          >
            <Button variant="outlined">
              <ProposalLeadCommentsIcon
                style={{ width: "20px", height: "20px" }}
              />
              <span className="fw-500 ml-1">{"Add Suggestions"}</span>
            </Button>
          </Typography>
        </Box>

        {/* Make this TableContainer horizontally scrollable */}
        <TableContainer
          sx={{
            marginBottom: "20px",
            borderTopLeftRadius: "5px",
            borderTopRightRadius: "5px",
            overflowX: "auto", // allow horizontal scrolling when table is wide
            width: "100%",
          }}
        >
          <Table
            sx={{
              width: "100%",
              boxShadow:
                "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
              // pin to the exact content width so extra columns overflow (and
              // scroll) instead of being squeezed into a fixed 100% width
              minWidth: pdf
                ? "100%"
                : `${getTableMinWidthPx(columnsToRender)}px`,
              tableLayout: "fixed",
              borderCollapse: "separate",
              ...(pdf
                ? {
                    "& .MuiTableCell-root": {
                      borderRight: pdfColumnDivider,
                    },
                    "& .MuiTableRow-root .MuiTableCell-root:last-of-type": {
                      borderRight: 0,
                    },
                  }
                : {}),
            }}
            aria-label="simple table"
            id={section.sectionId}
          >
            <PdfColumnGroup columns={columnsToRender} pdf={pdf} />
            <TableBody>
              {index !== 0 && (
                <TableRow
                  sx={{
                    background: "#F4FAFF",
                  }}
                >
                  <TableCell
                    className={`text-center ${pdf ? "px-1" : "px-5"}`}
                    colSpan={Math.max(
                      hasTotalCostColumn ? totalColumns - 1 : totalColumns,
                      1,
                    )}
                    sx={{
                      borderTopLeftRadius: "5px",
                      borderTopRightRadius: hasTotalCostColumn ? 0 : "5px",
                      borderRightWidth: "0px",
                      whiteSpace: pdf ? "normal" : "nowrap",
                      overflowWrap: pdf ? "anywhere" : "normal",
                    }}
                  >
                    <Box
                      sx={{ marginLeft: 0 }}
                      className="d-flex align-items-center gap-2"
                    >
                      <Typography variant="body1" className="fw-500">
                        {pdf ? (
                          <Box component="span" sx={pdfWrapSx}>
                            {section.sectionName || "-"}
                          </Box>
                        ) : (
                          <TruncatedText
                            text={section.sectionName ?? ""}
                            limit={30}
                          />
                        )}
                      </Typography>
                    </Box>
                  </TableCell>
                  {hasTotalCostColumn && (
                    <TableCell
                      align="right"
                      sx={{
                        borderTopRightRadius: "5px",
                        borderLeft: "0",
                        whiteSpace: pdf ? "normal" : "nowrap",
                        overflowWrap: pdf ? "anywhere" : "normal",
                        px: pdf ? 0.5 : 1.25,
                      }}
                    >
                      <Typography
                        variant="body1"
                        className="fw-500 text-black"
                        title={`${currency ?? ""}${
                          formatNumberITL(localizationValue, totalCost) ?? ""
                        }`}
                        sx={{
                          color: "text.primary",
                          textAlign: "right",
                          ...(pdf
                            ? pdfWrapSx
                            : currencyOverflowSx),
                        }}
                      >
                        {currency ?? ""}
                        {formatNumberITL(localizationValue, totalCost) ?? ""}
                      </Typography>
                    </TableCell>
                  )}
                </TableRow>
              )}
              {section?.sectionItems.map((item, idx) => (
                <ItemRow
                  key={idx}
                  item={item}
                  index={idx}
                  items={section.sectionItems}
                  currency={currency || ""}
                  visibleColumns={columnsToRender}
                  localizationValue={localizationValue}
                  showMaterials={showMaterials}
                  pdf={pdf}
                  type={type}
                  selectedItemIds={selectedItemIds}
                  onToggleItemSelect={onToggleItemSelect}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

// Main Component
const SectionTable = ({
  data,
  columns,
  currency,
  commentMode,
  localizationValue,
  type,
  pdf,
  showMaterials,
  selectedItemIds,
  onToggleItemSelect,
}: {
  data: BoqClientEstiamteSectionResponseType[] | BoqClientEstimateSectionType[];
  commentMode?: boolean;
  columns?: any;
  currency: string;
  type: "CLIENT" | "ADMIN";
  localizationValue: any;
  pdf: boolean;
  showMaterials?: boolean;
  selectedItemIds?: Set<string>;
  onToggleItemSelect?: (itemId: string) => void;
}) => {
  const commentPopupRef = useRef<any>();

  const { clientCommentAction } = useEstimateCommentsData();
  const { t } = useTranslation();
  const columnsToRender = useMemo(() => {
    const visibleColumns = sortVisibleColumns(
      pdf ? defaultBOQColumns : columns,
    );

    return visibleColumns.filter(
      (col) =>
        col.columnValue !== "itemDescription" &&
        col.accessor !== "itemDescription",
    );
  }, [columns, pdf]);
  const theme = useTheme();
  return (
    <>
      <BoqCommentPopup
        onChange={(commentText, currentId) => {
          clientCommentAction(commentText, currentId, "SECTION");
        }}
        ref={commentPopupRef}
      />
      <Box
        sx={{
          position: "relative",

          ":hover":
            commentMode && type == "CLIENT"
              ? {
                  "& .commentNotifier": {
                    visibility: "visible",
                    pointerEvents: "auto",
                  },
                }
              : {},
        }}
      >
        {/* overlay wrapper */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            pointerEvents: "none",
            ":hover": {
              pointerEvents: "auto",
            },
          }}
        >
          <Typography
            className="commentNotifier d-flex justify-content-center"
            variant="body2"
            sx={{
              position: "absolute",
              zIndex: 5,
              px: 1,
              userSelect: "none",
              borderRadius: "4px",
              cursor: "pointer",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundImage: ` url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='lightGrey' stroke-width='3' stroke-dasharray='4%2c14' stroke-dashoffset='24' stroke-linecap='square'/%3e%3c/svg%3e")`,
              bgcolor: "background.paper",
              textAlign: "center",
              visibility: "hidden",
              alignItems: "center",
              verticalAlign: "center",
              pointerEvents: "auto",
            }}
            component={"div"}
            onClick={(e) => {
              commentPopupRef?.current?.handleOpen(
                e.currentTarget,
                data[0]?.sectionId,
              );
            }}
          >
            <Button variant="outlined">
              <ProposalLeadCommentsIcon
                style={{ width: "20px", height: "20px" }}
              />
              <span className="fw-500 ml-1">{"Add Suggestions"}</span>
            </Button>
          </Typography>
        </Box>

        {/* Main TableContainer - make horizontally scrollable */}
        <TableContainer
          sx={{
            borderTopLeftRadius: "5px",
            borderTopRightRadius: "5px",
            marginBottom: "20px",
            overflowX: "auto", // allow horizontal scrolling
            width: "100%",
          }}
        >
          <Table
            sx={{
              width: "100%",
              // pin to the exact content width so extra columns overflow (and
              // scroll) instead of being squeezed into a fixed 100% width
              minWidth: pdf
                ? "100%"
                : `${getTableMinWidthPx(columnsToRender)}px`,
              tableLayout: "fixed",
              borderCollapse: "separate",
              ...(pdf
                ? {
                    "& .MuiTableCell-root": {
                      borderRight: pdfColumnDivider,
                    },
                    "& .MuiTableRow-root .MuiTableCell-root:last-of-type": {
                      borderRight: 0,
                    },
                  }
                : {}),
            }}
            aria-label="simple table"
            id={data[0]?.sectionId}
          >
            <PdfColumnGroup columns={columnsToRender} pdf={pdf} />
            <TableHead
              sx={{
                backgroundColor: theme?.palette?.primary?.main,
                fontColor: theme?.palette?.primary?.contrastText,
                "& .MuiTableCell-head": { color: "#FFFFFF" },
              }}
            >
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    width: getColumnWidth("itemName", pdf),
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                    px: pdf ? 0.5 : undefined,
                  }}
                >
                  {pdf ? "Item Name" : t("common.itemName")}
                </TableCell>
                {columnsToRender?.map((col: any) => (
                  <TableCell
                    key={col.columnId}
                    align="center"
                    sx={
                      {
                        width: getColumnWidth(col.columnValue, pdf),
                        whiteSpace: isDateColumn(col.columnValue)
                          ? "nowrap"
                          : "normal",
                        overflowWrap: isDateColumn(col.columnValue)
                          ? "normal"
                          : "anywhere",
                        wordBreak: isDateColumn(col.columnValue)
                          ? "normal"
                          : undefined,
                        ...(isDateColumn(col.columnValue)
                          ? dateColumnCellSx
                          : {}),
                        px: pdf ? 0.5 : undefined,
                      } as SxProps<Theme>
                    }
                  >
                    {col.columnValue === "ratePerUnit"
                      ? pdf
                        ? "Rate"
                        : t("common.rate", { defaultValue: "Rate" })
                      : pdf
                        ? col.columnLabel
                        : t(`boq.columns.${col.columnLabel}`, {
                            defaultValue: col.columnLabel,
                          })}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody
              sx={{
                boxShadow:
                  "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
              }}
            >
              {data.length > 0 && (
                <TableRow
                  sx={{
                    background: "#F4FAFF",
                  }}
                >
                  <TableCell
                    className={`text-center ${pdf ? "px-1" : "px-5"}`}
                    colSpan={columnsToRender?.length}
                    sx={{
                      borderTopLeftRadius: data[0].sectionName ? "0px" : "5px",
                      borderTopRightRadius: data[0].sectionName ? "0px" : "5px",
                      whiteSpace: pdf ? "normal" : "nowrap",
                      overflowWrap: pdf ? "anywhere" : "normal",
                    }}
                  >
                    <Box className="d-flex align-items-center gap-2">
                      <Typography variant="body1" className="fw-500">
                        {pdf ? (
                          <Box component="span" sx={pdfWrapSx}>
                            {data[0].sectionName || "-"}
                          </Box>
                        ) : (
                          <TruncatedText
                            text={data[0].sectionName ?? ""}
                            limit={30}
                          />
                        )}
                      </Typography>
                    </Box>
                  </TableCell>
                  {columnsToRender.some(
                    (col) => col.columnValue === "totalCost",
                  ) && (
                    <TableCell
                      align="right"
                      sx={{
                        width: getColumnWidth("totalCost", pdf),
                        borderTopRightRadius: "5px",
                        borderLeft: "0",
                        whiteSpace: pdf ? "normal" : "nowrap",
                        overflowWrap: pdf ? "anywhere" : "normal",
                        px: pdf ? 0.5 : undefined,
                      }}
                    >
                      {/* total Cost */}
                      <Box
                        // className=" position-absolute "
                        sx={{
                          // height: "100%",
                          // width: "100%",
                          // top: "0",
                          // left: "0",
                          textAlign: "right",
                          // verticalAlign: "middle",
                        }}
                      >
                        <Typography
                          variant="body1"
                          className="fw-500 text-black "
                          title={`${currency ?? ""}${formatNumberITL(
                            localizationValue,
                            data[0].sectionItems &&
                              data[0].sectionItems?.reduce(
                                (sum, item: any) => sum + item.totalCost,
                                0,
                              ),
                          )}`}
                          sx={{
                            color: "black",
                            ...(pdf ? pdfWrapSx : currencyOverflowSx),
                          }}
                        >
                          {currency ?? ""}
                          {formatNumberITL(
                            localizationValue,
                            data[0].sectionItems &&
                              data[0].sectionItems?.reduce(
                                (sum, item: any) => sum + item.totalCost,
                                0,
                              ),
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              )}
              {data[0]?.sectionItems &&
                data[0]?.sectionItems.map((item: any, idx) => (
                  <ItemRow
                    key={idx}
                    item={item}
                    index={idx}
                    items={data[0].sectionItems as any[]}
                    currency={currency || ""}
                    visibleColumns={columnsToRender}
                    localizationValue={localizationValue}
                    showMaterials={showMaterials}
                    pdf={pdf}
                    type={type}
                    selectedItemIds={selectedItemIds}
                    onToggleItemSelect={onToggleItemSelect}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box>
        {data.slice(1).map((section: any, index) => (
          <Section
            key={section.sectionId}
            section={section}
            index={index + 1}
            commentMode={commentMode}
            commentPopupRef={commentPopupRef}
            type={type}
            currency={currency || ""}
            visibleColumns={columnsToRender}
            pdf={pdf}
            showMaterials={showMaterials}
            localizationValue={localizationValue}
            selectedItemIds={selectedItemIds}
            onToggleItemSelect={onToggleItemSelect}
          />
        ))}
      </Box>
    </>
  );
};

export default SectionTable;
