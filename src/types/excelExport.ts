/**
 * Workbook description rendered into a styled .xlsx by aec-botsync's
 * centralized export endpoint (`POST /api/exports/excel`). Features decide
 * the content; botsync owns the look.
 */

export type ExcelCell = string | number | null;

/** Row looks shared by every export: header (brand blue), subHeader (light blue), section/total (bold, subtle fill), highlight (brand blue, e.g. a grand total). */
export type ExcelRowStyle = "header" | "subHeader" | "section" | "total" | "highlight";

/** Inclusive cell range, 0-based. */
export interface ExcelMerge {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface ExcelSheetSpec {
  name: string;
  rows: ExcelCell[][];
  columnWidths?: number[];
  merges?: ExcelMerge[];
  /** Excel number format for every numeric cell in a column (0-based). */
  columnFormats?: Array<{ column: number; numberFormat: string }>;
  rowStyles?: Array<{ row: number; style: ExcelRowStyle }>;
  /** Cells that open a URL when clicked (0-based); the cell shows its own text. */
  links?: Array<{ row: number; column: number; url: string }>;
  /**
   * Images shown as thumbnails in a cell (0-based). botsync fetches them, so
   * only files on allow-listed storage (S3) appear; others are skipped.
   */
  images?: Array<{ row: number; column: number; url: string }>;
  /** Rows kept visible while scrolling (e.g. the header). */
  freezeRows?: number;
  gridLines?: boolean;
}

export interface ExcelWorkbookSpec {
  fileName: string;
  sheets: ExcelSheetSpec[];
}

export const EXCEL_MONEY_FORMAT = "#,##0.00";
export const EXCEL_QTY_FORMAT = "#,##0.###";
