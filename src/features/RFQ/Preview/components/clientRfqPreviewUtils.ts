import {
  formatNumberITL,
  getLocalizationValue,
} from "@/lib/helpers";
import type { VendorRfqLineItem } from "./clientRfqPreviewTypes";

export function formatClientRfqCurrency(
  localizationValue: any,
  val: number,
) {
  return localizationValue
    ? `${getLocalizationValue(
        localizationValue,
        "CURRENCY",
        "SYMBOL",
      )}${formatNumberITL(localizationValue, val)}`
    : Number.isFinite(val)
      ? val
      : 0;
}

export function calcClientRfqTotals(
  items: VendorRfqLineItem[] = [],
  {
    isEditingAll,
    editingRate,
    rateValue,
    editedRatesById,
  }: {
    isEditingAll: boolean;
    editingRate: string | null;
    rateValue: string;
    editedRatesById: Record<string, string>;
  },
) {
  if (!items?.length) return { subtotal: 0, total: 0 };

  let subtotal = 0;

  for (const item of items) {
    if (isEditingAll) {
      const rateStr = editedRatesById[item.vendorRfqLineItemId];
      const rateNum = Number(rateStr ?? item.vendorRfqLineItemRate ?? 0);
      subtotal += rateNum * Number(item.vendorRfqLineItemQuantity);
    } else if (editingRate === item.vendorRfqLineItemId) {
      const rateNum = rateValue === "" ? 0 : Number(rateValue);
      subtotal += rateNum * Number(item.vendorRfqLineItemQuantity);
    } else {
      subtotal += item.vendorRfqLineItemTotal || 0;
    }
  }

  return { subtotal, total: subtotal };
}
