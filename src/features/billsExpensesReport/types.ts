export interface BillsExpensesFilters {
  projectIds: string[];
  startDate: number | undefined;
  endDate: number | undefined;
  billsOrExpense: string;
  sourceTypes: string[];
  modeOfPayment: string;
  receiverId: string | undefined;
  receiver?: any;
  status: string;
}

export interface BillsExpensesRow {
  id: string;
  rawAmount: number;
  rawSenderId?: string;
  rawEntityType?: string;
  projectName: string;
  name: string;
  receiverName: string;
  source: string;
  dueDate: string;
  qty?: number | string;
  unit?: string;
  totalAmount: string;
  modeOfPayment: string;
  status: string;
}

export interface BillsExpensesAggregates {
  totalInvoicedAmount: number;
  totalReceivedAmount: number;
  totalExpenses: number;
  netBalance: number;
}

export const EMPTY_FILTERS: BillsExpensesFilters = {
  projectIds: [],
  startDate: undefined,
  endDate: undefined,
  billsOrExpense: "",
  sourceTypes: [],
  modeOfPayment: "",
  receiverId: undefined,
  receiver: null,
  status: "",
};

