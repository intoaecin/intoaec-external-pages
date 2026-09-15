export type PricingBillingPeriod =
  | "monthly"
  | "quarterly"
  | "half_yearly"
  | "annual";

export type UserBasedDiscountBand = {
  minUser: number;
  maxUser: number | null;
  discountPercentage: number;
};

export type PricingForUserCount = {
  basePrice: number;
  userDiscountPercentage: number;
  userDiscountAmount: number;
  priceAfterUserDiscount: number;
  trailingUserDiscountAmount: number;
  subTotalAmountAfterUserDiscount: number;
  billingPeriodDiscount: number;
  subTotalAfterBillingPeriodDiscount: number;
  taxPercentage: number;
  totalAmount: number;
};

export type PricingResponseBody = {
  countryCode: string;
  billingPeriod: string;
  userBasedDiscountBands: UserBasedDiscountBand[];
  pricing: Record<string, PricingForUserCount>;
};

export type PricingTierBreakdownLine = {
  key: string;
  minUser: number;
  maxUser: number;
  usersInTier: number;
  discountPercentage: number;
  priceAfterUserDiscount: number;
  tierTotal: number;
};
