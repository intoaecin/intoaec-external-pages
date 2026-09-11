import type { BillsExpensesFilters } from "../types";

/** Effective filters for GET_BILLS_AND_EXPENSES (optional projectIds override). */
export const billsExpensesFiltersForRequest = (
  filters: BillsExpensesFilters,
  projectIdsOverride?: string[],
): BillsExpensesFilters => ({
  ...filters,
  projectIds:
    projectIdsOverride && projectIdsOverride.length > 0
      ? projectIdsOverride
      : filters.projectIds,
});

export interface BuildBillsExpensesRequestArgs {
  organizationId?: string;
  organizationType?: string;
  pageNumber: number;
  rowsPerPage: number;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  filters: BillsExpensesFilters;
}

const omitEmpty = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === "" || v === null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    (out as any)[k] = v;
  }
  return out;
};

export const buildBillsExpensesRequest = ({
  organizationId,
  organizationType,
  pageNumber,
  rowsPerPage,
  sortBy,
  sortOrder,
  filters,
}: BuildBillsExpensesRequestArgs) => {
  const filterPart = omitEmpty({
    billsOrExpense:
      filters.billsOrExpense && filters.billsOrExpense !== "ALL"
        ? filters.billsOrExpense
        : undefined,
    modeOfPayment:
      filters.modeOfPayment && filters.modeOfPayment !== "ALL"
        ? filters.modeOfPayment
        : undefined,
    startDate: filters.startDate,
    endDate: filters.endDate,
    receiverId: filters.receiverId,
    status:
      filters.status && filters.status !== "ALL" ? filters.status : undefined,
  });

  return {
    eventType: "GET_BILLS_AND_EXPENSES",
    organizationId,
    // Backend currently expects the misspelled key. Keep here so the typo is in one place.
    organiationType: organizationType,
    pageNumber,
    rowsPerPage,
    sortBy,
    sortOrder,
    ...filterPart,
    filters: {
      projectIds: filters.projectIds,
      entityTypes: filters.sourceTypes,
    },
  };
};

export interface BuildInvoiceDashboardRequestArgs {
  organizationId?: string;
  receiverId?: string;
  projectIds?: string[];
  dueStartDate?: number;
  dueEndDate?: number;
  statuses?: string[];
  /** RECEIVED_PAYMENT | EXPENSES — aligned with bills report; EXPENSES zeros invoice dashboard server-side. */
  billsOrExpense?: string;
  modeOfPayment?: string;
}

export const buildInvoiceDashboardRequest = ({
  organizationId,
  receiverId,
  projectIds,
  dueStartDate,
  dueEndDate,
  statuses,
  billsOrExpense,
  modeOfPayment,
}: BuildInvoiceDashboardRequestArgs) => {
  const filterPart = omitEmpty({
    projectIds,
    dueStartDate,
    dueEndDate,
    statuses,
    billsOrExpense:
      billsOrExpense && billsOrExpense !== "ALL"
        ? billsOrExpense
        : undefined,
    modeOfPayment:
      modeOfPayment && modeOfPayment !== "ALL" ? modeOfPayment : undefined,
  });

  return {
    eventType: "FETCH_INVOICES_DASHBOARD_DATA",
    senderId: organizationId,
    receiverId,
    ...(Object.keys(filterPart).length ? { filters: filterPart } : {}),
  };
};
