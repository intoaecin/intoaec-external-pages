type MaterialPricingRecord = Record<string, unknown>;

export type MaterialPricingSummary = {
  baseTotal: number;
  profitTotal: number;
  total: number;
};

const roundToCents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const getNumber = (value: unknown): number | null => {
  if (value === "" || value === null || value === undefined) return null;

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const getMaterialBaseRate = (material: MaterialPricingRecord) =>
  getNumber(material.priceInclusiveTax) ??
  getNumber(material.rate) ??
  getNumber(material.ratePerUnit);

const getMaterialProfit = (
  baseTotal: number,
  material: MaterialPricingRecord,
) => {
  const profitValue =
    getNumber(material.profit) ?? getNumber(material.profitMarkup) ?? 0;

  return material.profitMarkupType === "FIXED" ||
    material.profitType === "FIXED"
    ? profitValue
    : baseTotal * (profitValue / 100);
};

export const getMaterialPricingSummary = (
  materials: MaterialPricingRecord[] | undefined,
): MaterialPricingSummary => {
  if (!Array.isArray(materials)) {
    return { baseTotal: 0, profitTotal: 0, total: 0 };
  }

  return materials.reduce<MaterialPricingSummary>(
    (summary, material) => {
      const quantity = getNumber(material.quantity) ?? 0;
      const baseRate = getMaterialBaseRate(material);
      const storedTotal = getNumber(material.materialPrice);

      let baseTotal = baseRate === null ? 0 : quantity * baseRate;
      let profitTotal = getMaterialProfit(baseTotal, material);

      if (baseRate === null && storedTotal !== null) {
        const profitValue =
          getNumber(material.profit) ?? getNumber(material.profitMarkup) ?? 0;
        const isFixedProfit =
          material.profitMarkupType === "FIXED" ||
          material.profitType === "FIXED";

        baseTotal = isFixedProfit
          ? Math.max(0, storedTotal - profitValue)
          : storedTotal / (1 + profitValue / 100);
        profitTotal = storedTotal - baseTotal;
      }

      return {
        baseTotal: roundToCents(summary.baseTotal + baseTotal),
        profitTotal: roundToCents(summary.profitTotal + profitTotal),
        total: roundToCents(
          summary.total +
            (storedTotal ?? roundToCents(baseTotal + profitTotal)),
        ),
      };
    },
    { baseTotal: 0, profitTotal: 0, total: 0 },
  );
};
