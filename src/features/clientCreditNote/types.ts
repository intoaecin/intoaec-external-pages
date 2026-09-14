export interface CreditNoteLineItem {
  creditNoteLineItemId?: string;
  itemName?: string;
  itemDescription?: string;
  quantity?: number;
  price?: number;
  taxPercentage?: number;
  totalAmount?: number;
}

export interface LinkedInvoice {
  invoiceCreditNoteId?: string;
  invoiceSerial?: string;
  thirdPartyInvoiceSerial?: string;
  amountApplied?: number;
  createdAt?: number;
}

export interface CreditNoteRefund {
  refundId?: string;
  refundSerial?: string;
  thirdPartyRefundSerial?: string;
  refundAmount?: number;
  paymentMethod?: string;
  refundStatus?: string;
  createdAt?: number;
}

export interface PublicCreditNote {
  creditNoteId?: string;
  senderId: string;
  senderType: string;
  receiverId: string;
  serial?: string;
  serialNumber?: string;
  thirdPartyCreditNoteSerial?: string;
  invoiceName?: string;
  status?: string;
  createdAt?: number;
  invoiceCurrency?: string;
  creditNoteLineItems?: CreditNoteLineItem[];
  subTotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  unappliedAmount?: number;
  invoiceCreditNotes?: LinkedInvoice[];
  creditNoteRefunds?: CreditNoteRefund[];
  termsAndConditionsUrl?: string;
  termsAndConditionData?: unknown;
}
