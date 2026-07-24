/**
 * Utility functions for calculating simple discounts and taxes
 * All discounts and taxes are summed together and applied to the base amount
 */

export interface DiscountItem {
  discountId: string;
  discountName: string;
  /** Percentage when `discountAmountUnit` is PERCENTAGE or omitted. */
  discountValue: number;
  /** When FIXED, `discountFixedAmount` is subtracted from the subtotal (no % math). */
  discountAmountUnit?: "FIXED" | "PERCENTAGE";
  discountFixedAmount?: number;
}

export interface TaxItem {
  taxId: string;
  taxName: string;
  taxValue: number; // percentage
}

/**
 * Calculate simple discounts on a given amount
 * All discounts are summed together and applied to the base amount
 * @param subtotal - The base amount to apply discounts to
 * @param discounts - Array of discount items
 * @returns Object containing total discount amount and final amount after discounts
 */
export const calculateSequentialDiscounts = (
  subtotal: number,
  discounts: DiscountItem[]
): { totalDiscountAmount: number; amountAfterDiscounts: number } => {
  if (!discounts || discounts.length === 0) {
    return { totalDiscountAmount: 0, amountAfterDiscounts: subtotal };
  }

  let fixedTotal = 0;
  let percentSum = 0;

  for (const discount of discounts) {
    const unit = discount.discountAmountUnit ?? "PERCENTAGE";
    if (unit === "FIXED" && discount.discountFixedAmount != null) {
      fixedTotal += Math.max(0, discount.discountFixedAmount);
    } else {
      percentSum += discount.discountValue ?? 0;
    }
  }

  const percentPart = (subtotal * percentSum) / 100;
  const rawTotalDiscountAmount = fixedTotal + percentPart;
  const totalDiscountAmount = Math.min(
    Math.max(0, subtotal),
    Math.max(0, rawTotalDiscountAmount),
  );
  const amountAfterDiscounts = Math.max(0, subtotal - totalDiscountAmount);

  return {
    totalDiscountAmount,
    amountAfterDiscounts,
  };
};

/**
 * Calculate simple taxes on a given amount
 * All taxes are summed together and applied to the base amount
 * @param amount - The base amount to apply taxes to
 * @param taxes - Array of tax items
 * @returns Object containing total tax amount and final amount after taxes
 */
export const calculateSequentialTaxes = (
  amount: number,
  taxes: TaxItem[]
): { totalTaxAmount: number; amountAfterTaxes: number } => {
  if (!taxes || taxes.length === 0) {
    return { totalTaxAmount: 0, amountAfterTaxes: amount };
  }

  // Calculate total tax percentage by summing all tax values
  const totalTaxPercentage = taxes.reduce((sum, tax) => sum + tax.taxValue, 0);
  const totalTaxAmount = (amount * totalTaxPercentage) / 100;
  const amountAfterTaxes = amount + totalTaxAmount;

  return {
    totalTaxAmount,
    amountAfterTaxes,
  };
};

/**
 * Calculate the complete pricing breakdown with simple discounts and taxes
 * @param subtotal - The base subtotal amount
 * @param discounts - Array of discount items
 * @param taxes - Array of tax items
 * @returns Complete pricing breakdown
 */
export const calculatePricingBreakdown = (
  subtotal: number,
  discounts: DiscountItem[],
  taxes: TaxItem[]
): {
  subtotal: number;
  totalDiscountAmount: number;
  amountAfterDiscounts: number;
  totalTaxAmount: number;
  grandTotal: number;
} => {
  // Apply discounts first
  const { totalDiscountAmount, amountAfterDiscounts } = calculateSequentialDiscounts(
    subtotal,
    discounts
  );

  // Apply taxes to the amount after discounts
  const { totalTaxAmount, amountAfterTaxes } = calculateSequentialTaxes(
    amountAfterDiscounts,
    taxes
  );

  return {
    subtotal,
    totalDiscountAmount,
    amountAfterDiscounts,
    totalTaxAmount,
    grandTotal: amountAfterTaxes,
  };
};
