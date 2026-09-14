export interface RefundReceiptDetail {
  receiptSerial?: string;
  thirdPartyReceiptSerial?: string;
  modeOfPayment?: string;
  paymentStatus?: string;
  paidOn?: number;
}

export interface RefundCreditNoteDetail {
  serial?: string;
  thirdPartyCreditNoteSerial?: string;
  subTotal?: number;
  taxAmount?: number;
  createdAt?: number;
}

export interface PublicClientRefund {
  refundId?: string;
  refundSerial?: string;
  thirdPartyRefundSerial?: string;
  invoiceName?: string;
  senderId: string;
  senderType?: string;
  receiverId: string;
  serialNumber?: string;
  paymentMethod?: string;
  refundAgainst?: string;
  refundAmount?: number;
  refundStatus?: string;
  refundReason?: string;
  receiptDetails?: RefundReceiptDetail[];
  creditNoteDetails?: RefundCreditNoteDetail[];
}
