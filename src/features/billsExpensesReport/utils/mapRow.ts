import type { TFunction } from "i18next";
import {
  formatDateBasedOnOrganizationLocalization,
  formatNumberITL,
  formatSeedValues,
} from "@/lib/helpers";
import { toLowerNoSpace } from "@/utils/string";
import { getReceiverName } from "@/features/billsAndExpenses/utils/helper";
import type { BillsExpensesRow } from "../types";

export interface MapRowDeps {
  t: TFunction;
  localizationValue: any;
  usersData: any[];
  vendorData: any[];
  leadData: any;
}

export const mapApiRowToRow = (
  raw: any,
  index: number,
  deps: MapRowDeps,
): BillsExpensesRow => {
  const { t, localizationValue, usersData, vendorData, leadData } = deps;
  const id = raw.expenseId || raw.id || String(index);

  const resolvedReceiver = getReceiverName(
    raw.receiverId,
    raw.receiverType,
    usersData,
    vendorData,
    leadData,
  );

  const fallbackReceiver =
    raw.receiverName || raw.receiverDisplayName || raw.receiverId || "-";

  const receiverName =
    resolvedReceiver && resolvedReceiver !== "-"
      ? resolvedReceiver
      : fallbackReceiver;

  const dueDate = raw.dueDate
    ? formatDateBasedOnOrganizationLocalization(
        localizationValue,
        Number(raw.dueDate),
        false,
        true,
      ) || new Date(Number(raw.dueDate)).toLocaleDateString()
    : "-";

  const totalAmount =
    raw.totalAmount != null && raw.totalAmount !== ""
      ? String(formatNumberITL(localizationValue, Number(raw.totalAmount)))
      : "-";

  const modeOfPayment = raw.modeOfPayment
    ? t(
        `revenueDashboard.paymentMethodLabels.${toLowerNoSpace(
          formatSeedValues(raw.modeOfPayment),
        )}`,
        { defaultValue: formatSeedValues(raw.modeOfPayment) },
      )
    : "-";

  const status = raw.status
    ? t(`paymentStatus.${toLowerNoSpace(formatSeedValues(raw.status))}`, {
        defaultValue: formatSeedValues(raw.status),
      })
    : "-";

  const source = raw.entityType
    ? t(`common.${raw.entityType}`, {
        defaultValue: formatSeedValues(raw.entityType),
      })
    : "-";

  return {
    id,
    rawAmount: Number(raw.totalAmount || 0),
    rawSenderId: raw.senderId,
    rawEntityType: raw.entityType,
    projectName: raw.projectName || "-",
    name: raw.name || "-",
    receiverName,
    source,
    dueDate,
    totalAmount,
    modeOfPayment,
    status,
    qty: raw.quantity !== undefined && raw.quantity !== null ? raw.quantity : "-",
    unit: raw.unit || "-",
  };
};

