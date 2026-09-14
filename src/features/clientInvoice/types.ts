export interface InvoiceLineItem {
  invoiceLineItemId?: string;
  itemName?: string;
  itemDescription?: string;
  quantity?: number;
  price?: number;
  taxPercentage?: number;
  TotalAmount?: number;
}

export interface InvoicePaymentTerm {
  invoicePaymentTermId?: string;
  paymentName?: string;
  paymentTerms?: string;
  paymentScheduleDueDate?: number;
  amount?: number;
  balanceAmount?: number;
  paymentTermStatus?: string;
  paymentSchedulestatus?: string;
  autoDebitStatus?: string;
  isPaid?: boolean;
  isAutoDebitEnabled?: boolean;
}

export interface InvoicePayment {
  receiptSerial?: string;
  thirdPartyReceiptSerial?: string;
  amountPaid?: number;
  paymentStatus?: string;
  paidOn?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface InvoiceCreditNote {
  invoiceCreditNoteId?: string;
  creditNoteSerial?: string;
  amount?: number;
  appliedAmount?: number;
}

export interface PublicInvoice {
  invoiceId?: string;
  invoiceSerial?: string;
  thirdPartyInvoiceSerial?: string;
  invoiceName?: string;
  invoiceStatus?: string;
  invoiceMode?: string;
  invoiceCurrency?: string;
  senderId: string;
  senderType: string;
  receiverId: string;
  receiverType?: string;
  clientName?: string;
  clientEmailAddress?: string;
  clientContactNumber?: string;
  projectType?: string;
  invoiceIssuedDate?: number;
  invoiceDueDate?: number;
  invoiceLineItems?: InvoiceLineItem[];
  invoicePaymentTerms?: InvoicePaymentTerm[];
  invoicePaymentSchedules?: Array<{ invoicePaymentScheduleId?: string; amount?: number; balanceAmount?: number }>;
  invoicePayments?: InvoicePayment[];
  subTotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  balanceAmount?: number;
  isDiscountApplied?: boolean;
  isTaxDisplay?: boolean;
  showPaymentTerms?: boolean;
  attachment?: string | string[];
  termsAndConditionsUrl?: string;
  termsAndConditionData?: unknown;
  notes?: string;
}

export interface InvoiceResult {
  invoice: PublicInvoice;
  payments: InvoicePayment[];
  credits: InvoiceCreditNote[];
}
