import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatNumberITL,
  formatToCamelCaseWithAmpersand,
  getLocalizationValue,
} from "@/lib/helpers";
import { OrganizationLocalizationType } from "@/types";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import RowResizer from "../ControllerCreaters/RowResizer";
import {
  calculateSequentialDiscounts,
  calculateSequentialTaxes,
} from "@/utils/sequentialDiscountCalculator";
import { roundNumber } from "@/utils/numbers";
import { CUSTOM_DISCOUNT_ID } from "@/features/components/proposal/constants/discounts";
import { getLocalizedUnitLabel } from "@/lib/unitLocalization";

const PRICING_TABLE_HEADER_COLOR_KEY =
  "--pricing-table-header-background-color";

type PricingTableHeaderCell = {
  value: string;
  label: string;
  style?: {
    cellBackgroundColor?: string;
  };
};

const getPricingTableHeaderColor = (controller: {
  header?: Array<PricingTableHeaderCell>;
  style?: Record<string, any>;
}) => {
  const styledHeader = controller?.header?.find(
    (headerCell) => typeof headerCell?.style?.cellBackgroundColor === "string"
  );

  if (typeof styledHeader?.style?.cellBackgroundColor === "string") {
    return styledHeader.style.cellBackgroundColor;
  }

  return typeof controller?.style?.[PRICING_TABLE_HEADER_COLOR_KEY] === "string"
    ? controller.style[PRICING_TABLE_HEADER_COLOR_KEY]
    : "#C2CFE0";
};

const RenderPricingTable = ({
  controller,
}: {
  controller: {
    controllerName: string;
    controllerId: string;
    content: Array<
      Array<{ value: string; style: { width: number; height: number } }>
    >;
    header: Array<PricingTableHeaderCell>;
    style: Record<string, any>; // Adjust the type according to your specific styles
    x: number;
    y: number;
    taxes: Array<{ taxName: string; taxRate: number }>;
    discounts: Array<{ discountName: string; discountRate: number }>;
    rowHeights?: Array<number>;
  };
}) => {
  const { localizationLoading, localizationValue, refetch } =
    useOrganizationLocalization();
  const [subTotals, setSubTotals] = useState<Array<number | string>>([]);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    controller?.content?.map((row: any, rowIndex: number) => {
      const subTotal = getSubTotal(row[1].value, row[2].value);
      if (subTotal !== "") {
        setSubTotals((prev) => [
          ...prev.slice(0, rowIndex),
          subTotal,
          ...prev.slice(rowIndex + 1),
        ]);
      }
    });
  }, [controller]);

  const getSubTotal = (price: string, quantity: string) => {
    try {
      const priceInNumber = parseFloat(price);
      const quantityInNumber = parseFloat(quantity);
      const subTotal = priceInNumber * quantityInNumber;

      return subTotal;
    } catch (error) {
      return "";
    }
  };
  const overAllSubTotal: any = subTotals?.reduce(
    (accumulator, currentValue) =>
      typeof accumulator == "number" && typeof currentValue == "number"
        ? accumulator + currentValue
        : 0,
    0,
  );

  // Calculate sequential discounts
  const { totalDiscountAmount, amountAfterDiscounts } =
    calculateSequentialDiscounts(
      overAllSubTotal,
      controller?.discounts?.map((discount: any) => ({
        discountId: discount.discountId || "",
        discountName: discount.discountName || "",
        discountValue: discount.discountRate || 0,
        discountAmountUnit: discount.discountAmountUnit,
        discountFixedAmount: discount.discountFixedAmount,
      })) || [],
    );

  const totalAfterDiscount = amountAfterDiscounts;

  // Calculate sequential taxes on the amount after discounts
  const { totalTaxAmount } = calculateSequentialTaxes(
    totalAfterDiscount,
    controller?.taxes?.map((tax: any) => ({
      taxId: tax.taxId || "",
      taxName: tax.taxName || "",
      taxValue: tax.taxRate || 0,
    })) || [],
  );

  const grandTotal = totalAfterDiscount + totalTaxAmount;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        ...controller?.style,
      }}
    >
      <table border={1} style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
        <thead
          style={{
            background: getPricingTableHeaderColor(controller),
            color: "#000",
          }}
        >
          <tr>
            {controller?.header?.map((header, index) => (
              <th
                key={index}
                className="p-1"
                style={{
                  width: `${100 / (controller?.header?.length || 1)}%`,
                  textAlign: "start",
                  verticalAlign: "middle",
                }}
              >
                {t(`table.${formatToCamelCaseWithAmpersand(header.label)}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {controller?.content?.map((row: any, rowIndex: any) => (
            <>
              <tr
                key={controller?.controllerId + "-" + rowIndex}
                onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                onMouseLeave={() => setHoveredRowIndex(null)}
              >
                {row?.map((cell: any, cellIndex: any) => (
                  <td
                    key={
                      controller?.controllerId +
                      "-" +
                      rowIndex +
                      "-" +
                      cellIndex
                    }
                    style={{
                      width: `${100 / (controller?.header?.length || 1)}%`,
                      maxWidth: `${100 / (controller?.header?.length || 1)}%`,
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "normal",
                      verticalAlign: "middle",
                      textAlign: "start",
                    }}
                  >
                    {controller?.header?.[cellIndex]?.value === "Price" ||
                    controller?.header?.[cellIndex]?.value === "Subtotal" ? (
                      <span style={{ padding: "8px", display: "block" }}>
                        {localizationValue
                          ? getLocalizationValue(
                              localizationValue,
                              "CURRENCY",
                              "SYMBOL",
                            ) +
                            "" +
                            formatNumberITL(localizationValue, cell.value)
                          : cell.value}
                      </span>
                    ) : controller?.header?.[cellIndex]?.value === "Unit" ? (
                      <span style={{ padding: "8px", display: "block" }}>
                        {getLocalizedUnitLabel(cell.value, t) || cell.value}
                      </span>
                    ) : cellIndex === 0 ? (
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          wordWrap: "break-word",
                          minHeight: "30px",
                          width: "100%",
                          maxWidth: "100%",
                          overflowWrap: "break-word",
                          hyphens: "auto",
                          lineHeight: "normal",
                          display: "block",
                          margin: 0,
                          padding: "8px",
                          fontFamily: "inherit",
                          fontSize: "inherit",
                          textAlign: "start",
                          boxSizing: "border-box",
                        }}
                      >
                        {cell.value}
                      </pre>
                    ) : (
                      <span style={{ padding: "8px", display: "block" }}>
                        {cell.value}
                      </span>
                    )}
                  </td>
                ))}
                <td
                  style={{
                    width: `${100 / (controller?.header?.length || 1)}%`,
                    textAlign: "start",
                    verticalAlign: "middle",
                  }}
                >
                  <input
                    type="text"
                    className="p-1"
                    disabled
                    value={
                      localizationValue
                        ? getLocalizationValue(
                            localizationValue,
                            "CURRENCY",
                            "SYMBOL",
                          ) +
                          "" +
                          formatNumberITL(
                            localizationValue,
                            subTotals?.[rowIndex],
                          )
                        : subTotals?.[rowIndex] + ""
                    }
                    style={{
                      width: "100%",
                      border: "none",
                      textAlign: "start",
                      padding: "8px",
                      boxSizing: "border-box",
                      lineHeight: "normal",
                    }}
                  />
                </td>
              </tr>
              <RowResizer
                id={`row-${rowIndex}`}
                minHeight={25}
                defaultHeight={controller?.rowHeights?.[rowIndex] || 35}
                show={hoveredRowIndex === rowIndex}
                resizeStart={() => {}}
                resizeEnd={() => {}}
              />
            </>
          ))}
        </tbody>
      </table>

      <div className="row">
        <div className="col-lg-8"></div>
        <div className="col-lg-4">
          <div className="d-flex justify-content-between border p-1">
            <div>{t("common.subTotal")}</div>
            <div>
              {localizationValue
                ? getLocalizationValue(
                    localizationValue,
                    "CURRENCY",
                    "SYMBOL",
                  ) +
                  "" +
                  formatNumberITL(localizationValue, overAllSubTotal)
                : overAllSubTotal}
            </div>
          </div>

          {controller?.discounts?.map((discount: any) => (
            <div
              className="d-flex justify-content-between border  p-1"
              key={discount.discountId}
            >
              <div
                className="tw-max-w-32 tw-break-words tw-text-sm"
                title={discount.discountName}
              >
                {discount.discountName}
              </div>
              <div>
                {"(-) "}
                {discount?.discountId === CUSTOM_DISCOUNT_ID ? (
                  <>
                    {localizationValue
                      ? getLocalizationValue(
                          localizationValue,
                          "CURRENCY",
                          "SYMBOL",
                        )
                      : ""}
                    {formatNumberITL(
                      localizationValue,
                      discount?.discountAmountUnit === "FIXED"
                        ? roundNumber(discount?.discountFixedAmount ?? 0, 2)
                        : roundNumber(
                            (overAllSubTotal * (discount?.discountRate ?? 0)) /
                              100,
                            2,
                          ),
                    )}
                  </>
                ) : (
                  <>
                    {roundNumber(discount.discountRate ?? 0, 2)} {"%"}
                  </>
                )}
              </div>
            </div>
          ))}

          {controller?.taxes?.map((tax: any) => (
            <div
              className="d-flex justify-content-between border  p-1"
              key={tax.taxId}
            >
              <div
                className="tw-max-w-32 tw-break-words tw-text-sm"
                title={tax.taxName}
              >
                {tax.taxName}
              </div>
              <div>
                {"(+) "}
                {tax.taxRate} {"%"}
              </div>
            </div>
          ))}
          <div className="d-flex justify-content-between border fw-600 p-1">
            <div>{t("common.grandTotal")}</div>
            <div>
              {localizationValue
                ? getLocalizationValue(
                    localizationValue,
                    "CURRENCY",
                    "SYMBOL",
                  ) +
                  "" +
                  formatNumberITL(localizationValue, grandTotal)
                : grandTotal}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenderPricingTable;
