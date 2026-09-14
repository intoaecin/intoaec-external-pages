import type { OrganizationLocalizationType } from "@/types";
import {
  formatDateBasedOnOrganizationLocalization,
  formatNumberITL,
  getLocalizationValue,
} from "@/lib/helpers";
import type { PublicInvoice } from "./types";

export const invoiceAmount = (
  invoice: PublicInvoice,
  value: number | undefined,
  localization?: OrganizationLocalizationType[],
) => {
  const symbol = getLocalizationValue(localization, "CURRENCY", "SYMBOL") ?? invoice.invoiceCurrency ?? "";
  return `${symbol}${formatNumberITL(localization, Number(value ?? 0))}`;
};

export const invoiceDate = (value: number | undefined, localization?: OrganizationLocalizationType[]) =>
  value ? formatDateBasedOnOrganizationLocalization(localization, value, true) : "–";

export const paymentTermKey = (term: { invoicePaymentTermId?: string; paymentName?: string; paymentScheduleDueDate?: number; amount?: number }, index: number) =>
  term.invoicePaymentTermId ?? `${term.paymentName ?? "payment"}-${term.paymentScheduleDueDate ?? index}-${term.amount ?? 0}`;
