import type {
  PricingBillingPeriod,
  PricingForUserCount,
  PricingResponseBody,
  PricingTierBreakdownLine,
  UserBasedDiscountBand,
} from "./pricing.types";

export function toPricingBillingPeriod(
  billing: string | undefined | null,
): PricingBillingPeriod {
  const normalized = (billing || "monthly").toLowerCase().replace(/-/g, "_");

  if (
    normalized === "semi_annually" ||
    normalized === "half_yearly" ||
    normalized.includes("half") ||
    normalized.includes("semi")
  ) {
    return "half_yearly";
  }
  if (
    normalized === "annually" ||
    normalized === "annual" ||
    normalized.includes("annual")
  ) {
    return "annual";
  }
  if (normalized === "quarterly" || normalized.includes("quarter")) {
    return "quarterly";
  }
  return "monthly";
}

export function getBillingPeriodMultiplier(
  period: PricingBillingPeriod,
): number {
  switch (period) {
    case "quarterly":
      return 3;
    case "half_yearly":
      return 6;
    case "annual":
      return 12;
    default:
      return 1;
  }
}

export function getPricingForUserCount(
  pricingBody: PricingResponseBody | undefined,
  userCount: number,
): PricingForUserCount | undefined {
  if (!pricingBody?.pricing || userCount < 1) {
    return undefined;
  }
  return pricingBody.pricing[String(userCount)];
}

export function getMonthlyPackageAmount(
  pricingForCount: PricingForUserCount | undefined,
  billingPeriod: PricingBillingPeriod,
): number {
  if (!pricingForCount) {
    return 0;
  }
  const multiplier = getBillingPeriodMultiplier(billingPeriod);
  return pricingForCount.subTotalAmountAfterUserDiscount / multiplier;
}

export function buildPricingTierBreakdown(
  bands: UserBasedDiscountBand[] | undefined,
  pricing: Record<string, PricingForUserCount> | undefined,
  licenseCount: number,
  startCount = 0,
): PricingTierBreakdownLine[] {
  if (!bands?.length || !pricing || licenseCount <= startCount) {
    return [];
  }

  const lines: PricingTierBreakdownLine[] = [];

  for (const band of bands) {
    const tierMin = band.minUser;
    const tierMax =
      band.maxUser === null || band.maxUser === undefined
        ? Number.MAX_SAFE_INTEGER
        : band.maxUser;

    const effectiveMin = Math.max(tierMin, startCount + 1);
    const effectiveMax = Math.min(licenseCount, tierMax);

    if (effectiveMax < effectiveMin) {
      continue;
    }

    const usersInTier = effectiveMax - effectiveMin + 1;
    const samplePricing =
      pricing[String(effectiveMin)] || pricing[String(tierMin)];
    const discountPercentage = Number(band.discountPercentage) || 0;
    const priceAfterUserDiscount =
      samplePricing?.priceAfterUserDiscount ??
      (samplePricing?.basePrice || 0) * (1 - discountPercentage / 100);
    const tierTotal = usersInTier * priceAfterUserDiscount;

    lines.push({
      key: `${tierMin}-${tierMax}`,
      minUser: effectiveMin,
      maxUser: effectiveMax,
      usersInTier,
      discountPercentage,
      priceAfterUserDiscount,
      tierTotal,
    });
  }

  return lines;
}

export function getAdditionalLicensesMonthlyAmount(
  pricingBody: PricingResponseBody | undefined,
  licenseCount: number,
  startCount: number,
  billingPeriod: PricingBillingPeriod,
): number {
  if (!pricingBody || licenseCount <= startCount) {
    return 0;
  }

  const fullAmount = getMonthlyPackageAmount(
    getPricingForUserCount(pricingBody, licenseCount),
    billingPeriod,
  );
  const priorAmount =
    startCount > 0
      ? getMonthlyPackageAmount(
          getPricingForUserCount(pricingBody, startCount),
          billingPeriod,
        )
      : 0;

  return Math.max(0, fullAmount - priorAmount);
}
