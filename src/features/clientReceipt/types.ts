export interface ReceiptSchedule {
  invoiceSerial?: string;
  thirdPartyInvoiceSerial?: string;
  paymentScheduleDueDate?: number;
  paymentSchedulestatus?: string;
  paymentTermStatus?: string;
  paymentTerms?: string;
  paymentName?: string;
}

export interface ReceiptInvoicePayment {
  invoiceSerial?: string;
  thirdPartyInvoiceSerial?: string;
  amountPaid?: number;
  invoiceBalanceAmount?: number;
  createdBy?: string;
  paidOn?: number;
  invoicePaymentSchedules?: ReceiptSchedule[];
  invoicePaymentTerms?: ReceiptSchedule[];
}

export interface PublicReceipt {
  invoicesReceiptId?: string;
  receiptSerial?: string;
  thirdPartyReceiptSerial?: string;
  createdAt?: number;
  paidOn?: number;
  modeOfPayment?: string;
  paymentStatus?: string;
  unAppliedAmount?: number;
  senderId: string;
  receiverId: string;
  invoicePayments?: ReceiptInvoicePayment[];
}

export interface ReceiptRefund {
  refundSerial?: string;
  thirdPartyRefundSerial?: string;
  refundAmount?: number;
  paymentMethod?: string;
  refundStatus?: string;
  createdAt?: number;
}

export interface ReceiptPaymentRow {
  invoiceSerial?: string;
  thirdPartyInvoiceSerial?: string;
  paymentName: string;
  amount: number;
  paidOn?: number;
  paymentTerms: string;
  dueDate?: number;
  paymentStatus?: string;
}

export interface ClientReceiptResult {
  receipt: PublicReceipt;
  paymentRows: ReceiptPaymentRow[];
  invoicePayments: ReceiptInvoicePayment[];
  refunds: ReceiptRefund[];
}
