import { MARKUP_SYMBOL_ART, type SymbolArt } from "./markupSymbolArt";

/**
 * Ported from intoaec-UI `features/lead/fileViewer/markup/markupSymbols.ts`:
 * the same `category.name` keys stored in `shapeData.symbolKey` (with
 * `markupSymbolArt.ts` copied as is), without the picker-only labels. Keep both in sync.
 */
const SYMBOL_ART_BY_KEY = new Map<string, SymbolArt>(
  Object.entries(MARKUP_SYMBOL_ART).flatMap(([category, symbols]) =>
    Object.entries(symbols).map(([name, art]) => [`${category}.${name}`, art] as const),
  ),
);

/** Keys from the first symbol set that have a direct counterpart, so markups placed with them still draw. */
const LEGACY_SYMBOL_KEYS: Record<string, string> = {
  "audiovisual.television": "audiovisual.tvDisplay",
  "audiovisual.monitor": "audiovisual.tvDisplay",
  "audiovisual.videoCamera": "security.camera",
  "electrical.outlet": "electrical.receptacleDuplex",
  "electrical.disconnect": "electrical.disconnectSwitch",
  "electrical.switch": "lighting.switch",
  "fireLifeSafety.exit": "lighting.exitSignBasic",
  "geometric.cross": "geometric.x",
  "mechanical.airVent": "mechanical.diffuserSupply",
  "security.cctv": "security.camera",
  "security.door": "geometric.door",
};

export const getMarkupSymbolArt = (key?: string) =>
  key ? SYMBOL_ART_BY_KEY.get(LEGACY_SYMBOL_KEYS[key] ?? key) : undefined;

/** Symbol size as per-mille of the drawing width, so it scales with the page. */
export const SYMBOL_SIZE_PER_MILLE = 12;

/** A symbol's saved size, or the default for symbols placed before resizing existed. */
export const getSymbolSizePerMille = (shape: { symbolSize?: number }) =>
  shape.symbolSize ?? SYMBOL_SIZE_PER_MILLE;
