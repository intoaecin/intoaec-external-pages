export interface VendorRfqLineItem {
  vendorRfqLineItemId: string;
  vendorRfqId: string;
  vendorRfqLineItemName: string;
  vendorRfqLineItemDescription: string;
  vendorRfqLineItemImage: string;
  vendorRfqLineItemQuantity: number;
  vendorRfqLineItemUnit: string;
  vendorRfqLineItemRate: number;
  vendorRfqLineItemTotal: number;
  itemQuantityFromEstimate: number | null;
  itemUnitFromEstimate: string | null;
  itemRateFromEstimate: string | null;
  itemTotalFromEstimate: string | null;
  tags: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
}

export interface OpenDialogItemState {
  open: boolean;
  item: VendorRfqLineItem | null;
}

export interface RfqLineItem {
  rliId: string;
  rfqId: string;
  rfqLineItemName: string;
  rfqLineItemDescription: string;
  rfqLineItemUnit: string;
  rfqLineItemImage: string;
  rfqLineItemQuantity: number;
  itemQuantityFromEstimate: number;
  itemUnitFromEstimate: string;
  itemRateFromEstimate: string;
  itemTotalFromEstimate: string;
  tags: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
}

export interface Rfq {
  rfqId: string;
  rfqSerial: string;
  rfqName: string;
  organizationId: string;
  organizationType: string;
  projectId: string;
  clientName: string;
  projectName: string;
  rfqEstimateName: string;
  rfqEstimateId: string;
  rfqTotalFromEstimate: string;
  isShippingDetailsSameAsOrganizationDetails: boolean;
  shippingName: string;
  shippingEmail: string;
  shippingContact: string;
  shippingAddress: string;
  senderNotes: string | null;
  receiverNotes: string | null;
  RFQGroupName: string;
  status: string;
  rqdBy: string;
  createdOn: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
  isTaxDisplay?: boolean;
  attachments?: any[];
  attachmentUrls?: string[];
}

export interface VendorRfqComment {
  // Add comment properties as needed
}

export interface vendorRfq {
  vendorRfqId: string;
  rfqId: string;
  senderId: string;
  senderType: string;
  receiverId: string;
  receiverUserId: string;
  receiverType: string;
  receiverName: string;
  receiverEmail: string;
  receiverMobile: string;
  receiverAddress: string | null;
  aecStatus: string;
  isMarkedAsFavorite: boolean;
  isConvertedPO: boolean;
  isTaxDisplay?: boolean;
  vendorStatus: string;
  vendorNotes: string | null;
  totalDiscountAmount: string;
  totalTaxAmount: string;
  totalAmount: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
  rfq: Rfq;
  rfqLineItems: RfqLineItem[];
  vendorRfqLineItems: VendorRfqLineItem[];
  vendorRfqComments: VendorRfqComment[];
  attachments?: any[];
  attachmentUrls?: string[];
}

export interface CreateRFQPOPreviewProps {
  data: vendorRfq | undefined;
  pdf?: boolean;
  commentMode?: boolean;
  vendorDetails?:
  | {
    vendorName: string;
    vendorEmail: string;
    vendorMobile: string;
    vendorLocation?: string;
    vendorTaxName?: string;
    vendorTaxId?: string;
  }
  | undefined;
  createdOn?: number;
  defaultOrganizationDetails?: {
    organizationName?: string;
    organizationWebsite?: string;
    organizationLocation?: string;
    mobileNumber?: string;
    emailId?: string;
    organizationLogo?: string;
    taxId?: string;
    taxName?: string;
  };
  shippingDetails?: {
    city?: string;
    mobileNumber?: string;
    emailAddress?: string;
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
  };

  currency?: string | null;
  isEditingAll?: boolean;
}

export interface ClientRFQPOPreviewHandle {
  saveAllRates: () => Promise<void>;
}
