export type UnitTranslationFunction = (
  key: string,
  options?: Record<string, unknown>,
) => string;

export interface LocalizableUnitType {
  itemUnitValue?: string;
  itemUnitName?: string;
  powerValue?: number;
}

export interface LocalizedUnitOption {
  label: string;
  value: string;
}

type UnitDefinition = {
  key: string;
  aliases: string[];
  showSymbol?: boolean;
  symbolIncludesPower?: boolean;
  defaultSymbol?: string;
};

const UNIT_DEFINITIONS: UnitDefinition[] = [
  { key: "meter", aliases: ["m", "meter", "meters", "metre", "metres"] },
  { key: "millimeter", aliases: ["mm", "millimeter", "millimeters"] },
  { key: "centimeter", aliases: ["cm", "centimeter", "centimeters"] },
  { key: "kilometer", aliases: ["km", "kilometer", "kilometers"] },
  { key: "inch", aliases: ["in", "inch", "inches"] },
  { key: "feet", aliases: ["ft", "foot", "feet"] },
  { key: "yard", aliases: ["yd", "yard", "yards"] },
  { key: "mile", aliases: ["mi", "mile", "miles"] },
  { key: "numbers", aliases: ["nos", "no", "number", "numbers"] },
  { key: "acre", aliases: ["acre", "acres"] },
  { key: "hectare", aliases: ["ha", "hectare", "hectares"] },
  { key: "liter", aliases: ["l", "liter", "liters", "litre", "litres"] },
  { key: "quart", aliases: ["qt", "quart", "quarts"] },
  { key: "milliliter", aliases: ["ml", "milliliter", "milliliters"] },
  { key: "milligram", aliases: ["mg", "milligram", "milligrams"] },
  { key: "pint", aliases: ["pt", "pint", "pints"] },
  { key: "gram", aliases: ["g", "gram", "grams"] },
  { key: "gallon", aliases: ["gal", "gallon", "gallons"] },
  { key: "fluidOunce", aliases: ["fl oz", "floz", "fluid ounce"] },
  { key: "tonne", aliases: ["tonne", "tonnes", "metric ton"] },
  { key: "ounce", aliases: ["oz", "ounce", "ounces"] },
  { key: "pound", aliases: ["lb", "lbs", "pound", "pounds"] },
  { key: "imperialTon", aliases: ["imperial ton"] },
  { key: "stone", aliases: ["stone"] },
  { key: "usTon", aliases: ["us ton"] },
  { key: "kilogram", aliases: ["kg", "kilogram", "kilograms"] },
  { key: "set", aliases: ["set", "sets"] },
  { key: "runningMeter", aliases: ["rmt", "running meter"] },
  { key: "job", aliases: ["job", "jobs"], showSymbol: false },
  { key: "outdoor", aliases: ["out door", "outdoor"], showSymbol: false },
  { key: "roughOpening", aliases: ["ro", "rough opening"] },
  { key: "lumpsum", aliases: ["lumpsum", "lump sum"], showSymbol: false },
  { key: "pieces", aliases: ["pcs", "piece", "pieces"] },
  {
    key: "cubicMeterPerDay",
    aliases: ["cubic meter per day", "cum/day", "m3/day", "m³/day"],
    symbolIncludesPower: true,
  },
  {
    key: "numbersPerSquareMeter",
    aliases: [
      "numbers per square meter",
      "number per square meter",
      "nos/sqm",
      "nos/m²",
      "number/m²",
    ],
    symbolIncludesPower: true,
  },
  { key: "factor", aliases: ["factor"], showSymbol: false },
  {
    key: "runningMeterPerSquareMeter",
    aliases: ["running meter per square meter", "rmt/sqm", "rmt/m²"],
    symbolIncludesPower: true,
  },
  { key: "constant", aliases: ["constant"], showSymbol: false },
  {
    key: "squareMeterPerLiter",
    aliases: ["square meter per liter", "sqm/l", "m²/l"],
    symbolIncludesPower: true,
  },
  {
    key: "kilogramPerSquareMeter",
    aliases: ["kilogram per square meter", "kg/sqm", "kg/m²"],
    symbolIncludesPower: true,
  },
  {
    key: "squareMeter",
    aliases: ["square meter", "sqm"],
    symbolIncludesPower: true,
  },
  {
    key: "squareMeterPerKilogram",
    aliases: ["square meter per kilogram", "sqm/kg", "m²/kg"],
    symbolIncludesPower: true,
  },
  { key: "ton", aliases: ["ton", "tons"] },
  {
    key: "squareMeterPerDay",
    aliases: ["square meter per day", "sqm/day", "m²/day"],
    symbolIncludesPower: true,
  },
  {
    key: "squareMeterPerHour",
    aliases: ["square meter per hour", "sqm/hr", "m²/hr"],
    symbolIncludesPower: true,
  },
  {
    key: "percentage",
    aliases: ["percentage", "%"],
    defaultSymbol: "%",
  },
  { key: "day", aliases: ["day", "days"], showSymbol: false },
  { key: "roll", aliases: ["roll", "rolls"], showSymbol: false },
  { key: "crewHour", aliases: ["crew-hour"], showSymbol: false },
  { key: "meterPerHour", aliases: ["m/hr"] },
  { key: "tonnePerHour", aliases: ["t/hr", "tons/hr", "tons per hour"] },
  { key: "kit", aliases: ["kit", "kits"], showSymbol: false },
  { key: "pail", aliases: ["pail", "pails"], showSymbol: false },
  { key: "workerHour", aliases: ["worker-hour"], showSymbol: false },
  { key: "manMonth", aliases: ["man-month"], showSymbol: false },
  { key: "labourHour", aliases: ["labour-hour"], showSymbol: false },
  { key: "meterPerDay", aliases: ["m/day"] },
  {
    key: "cubicYardPerSquareMeter",
    aliases: ["cubic yard per square meter", "yd³/m²", "cy/m²"],
    symbolIncludesPower: true,
  },
  { key: "numberPerDay", aliases: ["number/day", "numbers per day", "nos/day"] },
  { key: "kilogramPerDay", aliases: ["kg/day"] },
  { key: "tonnePerDay", aliases: ["t/day", "tons/day", "tons per day"] },
  { key: "manHour", aliases: ["man-hour"], showSymbol: false },
  { key: "labourDay", aliases: ["labour-day"], showSymbol: false },
  { key: "box", aliases: ["box", "boxes"], showSymbol: false },
  { key: "can", aliases: ["can", "cans"], showSymbol: false },
  { key: "micrometer", aliases: ["µm", "micron", "microns"] },
  { key: "numberPerHour", aliases: ["number/hr", "numbers per hour", "nos/hr"] },
  { key: "tub", aliases: ["tub", "tubs"], showSymbol: false },
  { key: "bag", aliases: ["bag", "bags"], showSymbol: false },
  { key: "bucket", aliases: ["bucket", "buckets"], showSymbol: false },
  { key: "hour", aliases: ["hour", "hours"], showSymbol: false },
  { key: "kilogramPerMeter", aliases: ["kg/m"] },
  { key: "tube", aliases: ["tube", "tubes"], showSymbol: false },
  { key: "poundPerFoot", aliases: ["lb/ft", "lbs/ft", "pounds per foot"] },
  { key: "crewDay", aliases: ["crew-day"], showSymbol: false },
  { key: "workerDay", aliases: ["worker-day"], showSymbol: false },
  { key: "bundle", aliases: ["bundle", "bundles"], showSymbol: false },
  { key: "pair", aliases: ["pair", "pairs"], showSymbol: false },
  { key: "boardFoot", aliases: ["board foot", "bd.ft"] },
  { key: "manDay", aliases: ["man-day", "man-days"], showSymbol: false },
  { key: "month", aliases: ["month", "months"], showSymbol: false },
  { key: "meterPerSquareMeter", aliases: ["m/m²"], symbolIncludesPower: true },
  { key: "square", aliases: ["square"], showSymbol: false },
  { key: "bale", aliases: ["bale", "bales"], showSymbol: false },
  { key: "load", aliases: ["load", "loads"], showSymbol: false },
  {
    key: "cubicMeterPerHour",
    aliases: ["cubic meter per hour", "m³/hr"],
    symbolIncludesPower: true,
  },
  { key: "trip", aliases: ["trip", "trips"], showSymbol: false },
  { key: "pack", aliases: ["pack", "packs"], showSymbol: false },
  { key: "shift", aliases: ["shift", "shifts"], showSymbol: false },
  { key: "shot", aliases: ["shot", "shots"], showSymbol: false },
  { key: "squareMeterPerBag", aliases: ["m²/bag"], symbolIncludesPower: true },
  { key: "mil", aliases: ["mil"] },
  {
    key: "kilogramPerCubicMeter",
    aliases: ["kilogram per cubic meter", "kg/m3", "kg/m³"],
    symbolIncludesPower: true,
  },
  { key: "cubicMeter", aliases: ["cubic meter", "m3", "m³"], symbolIncludesPower: true },
  { key: "litersPerMetricTon", aliases: ["liters per metric ton", "liters/mt"] },
  { key: "numberPerMeter", aliases: ["number per meter", "nos/m"] },
  {
    key: "squareMeterPerRoll",
    aliases: ["square meter per roll", "sqm/roll", "m²/roll"],
    symbolIncludesPower: true,
  },
  { key: "joints", aliases: ["joint", "joints"], showSymbol: false },
  { key: "runningMeterPerMeter", aliases: ["running meter per meter", "rmt/m"] },
  {
    key: "squareMeterPerCore",
    aliases: ["square meter per core", "m²/core"],
    symbolIncludesPower: true,
  },
  {
    key: "squareMeterPerFixture",
    aliases: ["square meter per fixture", "m²/fixture"],
    symbolIncludesPower: true,
  },
  { key: "toggle", aliases: ["toggle"], showSymbol: false },
  { key: "literPerTon", aliases: ["liter per ton", "l/t"] },
  { key: "uses", aliases: ["use", "uses"], showSymbol: false },
  { key: "multiplier", aliases: ["multiplier"], showSymbol: false },
  { key: "type", aliases: ["type"], showSymbol: false },
  { key: "r", aliases: ["r"], showSymbol: false },
];

const normalizeAlias = (value: string): string =>
  value.trim().toLowerCase().replace(/\.$/, "").replace(/\s+/g, " ");

const DEFINITION_BY_ALIAS = new Map<string, UnitDefinition>();
UNIT_DEFINITIONS.forEach((definition) => {
  definition.aliases.forEach((alias) => {
    DEFINITION_BY_ALIAS.set(normalizeAlias(alias), definition);
  });
});

const powerSuffix = (power?: number): string =>
  power === 2 ? "²" : power === 3 ? "³" : "";

const splitUnitValue = (
  rawValue: string,
  explicitPower?: number,
): { baseValue: string; power?: number } => {
  const value = rawValue.trim();
  if (explicitPower === 2 || explicitPower === 3) {
    return {
      baseValue: value.replace(/[²³]$/, ""),
      power: explicitPower,
    };
  }
  if (value.endsWith("²") || value.endsWith("³")) {
    return {
      baseValue: value.slice(0, -1),
      power: value.endsWith("²") ? 2 : 3,
    };
  }
  const prefixedPower = value.match(
    /^(square|cubic|sq|cu)(?:\.\s*|\s+)(.+)$/i,
  );
  if (prefixedPower) {
    const qualifier = prefixedPower[1].toLowerCase();
    return {
      baseValue: prefixedPower[2],
      power: qualifier === "square" || qualifier === "sq" ? 2 : 3,
    };
  }
  return { baseValue: value };
};

export const getCanonicalUnitValue = (
  unit?: LocalizableUnitType | null,
): string => {
  if (!unit?.itemUnitValue) return "";
  const { baseValue, power } = splitUnitValue(
    unit.itemUnitValue,
    unit.powerValue,
  );
  return `${baseValue}${powerSuffix(power)}`;
};

export const getLocalizedUnitLabel = (
  unit: LocalizableUnitType | string | null | undefined,
  t: UnitTranslationFunction,
): string => {
  if (!unit) return "";

  const descriptor = typeof unit === "string" ? undefined : unit;
  const canonicalValue =
    typeof unit === "string" ? unit.trim() : getCanonicalUnitValue(unit);
  if (!canonicalValue) return "";

  const nameUnit = descriptor?.itemUnitName
    ? splitUnitValue(descriptor.itemUnitName)
    : undefined;
  const { baseValue, power: valuePower } = splitUnitValue(
    canonicalValue,
    descriptor?.powerValue,
  );
  const power = valuePower ?? nameUnit?.power;
  const baseUnitName = descriptor?.itemUnitName
    ? nameUnit?.baseValue
    : undefined;
  const definition =
    (descriptor?.itemUnitName
      ? DEFINITION_BY_ALIAS.get(normalizeAlias(descriptor.itemUnitName))
      : undefined) ??
    (baseUnitName
      ? DEFINITION_BY_ALIAS.get(normalizeAlias(baseUnitName))
      : undefined) ?? DEFINITION_BY_ALIAS.get(normalizeAlias(baseValue));

  if (!definition) {
    return descriptor?.itemUnitName || canonicalValue;
  }

  const form = power === 2 ? "square" : power === 3 ? "cubic" : "linear";
  const defaultName = baseUnitName || baseValue;
  const name = t(`units.names.${definition.key}.${form}`, {
    defaultValue: t(`units.names.${definition.key}`, {
      defaultValue: defaultName,
    }),
  });

  if (definition.showSymbol === false) return name;

  const localizedBaseSymbol = t(`units.symbols.${definition.key}`, {
    defaultValue: definition.defaultSymbol ?? baseValue,
  });
  const symbol = definition.symbolIncludesPower
    ? localizedBaseSymbol
    : `${localizedBaseSymbol}${powerSuffix(power)}`;
  return symbol;
};

export const buildLocalizedUnitOptions = (
  unitTypes: LocalizableUnitType[] | null | undefined,
  t: UnitTranslationFunction,
): LocalizedUnitOption[] => {
  if (!Array.isArray(unitTypes)) return [];

  const seen = new Set<string>();
  return unitTypes.reduce<LocalizedUnitOption[]>((options, unit) => {
    const value = getCanonicalUnitValue(unit);
    if (!value || seen.has(value)) return options;
    seen.add(value);
    options.push({ value, label: getLocalizedUnitLabel(unit, t) });
    return options;
  }, []);
};
