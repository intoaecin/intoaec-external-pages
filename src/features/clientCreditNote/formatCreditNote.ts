import type { OrganizationLocalizationType } from "@/types";
import { formatDateBasedOnOrganizationLocalization, formatNumberITL, getLocalizationValue } from "@/lib/helpers";
import type { PublicCreditNote } from "./types";

export const creditNoteAmount = (
  creditNote: PublicCreditNote,
  value: number | undefined,
  localization?: OrganizationLocalizationType[],
) => {
  const symbol = getLocalizationValue(localization, "CURRENCY", "SYMBOL") ?? creditNote.invoiceCurrency ?? "";
  return `${symbol}${formatNumberITL(localization, Number(value ?? 0))}`;
};

export const creditNoteDate = (value: number | undefined, localization?: OrganizationLocalizationType[]) =>
  value ? formatDateBasedOnOrganizationLocalization(localization, value, true) : "–";
