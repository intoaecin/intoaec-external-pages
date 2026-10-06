import type { TFunction } from "i18next";
import {
  attachmentItemFromUploadValue,
  isAttachmentImage,
  parseAttachmentUrls,
} from "@/features/attachments/attachmentUploadHelpers";
import type {
  BusinessDetails,
  ClientDetails,
} from "@/features/hooks/api/useBusinessAndClientDetails";
import {
  EXCEL_MONEY_FORMAT,
  EXCEL_QTY_FORMAT,
  type ExcelCell,
  type ExcelRowStyle,
  type ExcelSheetSpec,
  type ExcelWorkbookSpec,
} from "@/types/excelExport";
import type { ProgressClaim } from "../hooks/api/create-progress-claim";
import type { ProgressClaimLine } from "../types";
import {
  buildItemLabels,
  getLineFigures,
  getLineQuantity,
  getLineTotals,
  isLumpSum,
} from "./progressClaimLineFigures";
import type { ProgressClaimPhase } from "./progressClaimPhases";
import { getPhaseRows } from "./progressClaimPhases";
import type { ProgressClaimStatement } from "./progressClaimStatement";
import {
  buildAssetsSheet,
  buildMaterialsSheet,
  buildResourcesSheet,
  type ProgressClaimPlannerData,
} from "./progressClaimPlannerExcel";

interface ProgressClaimWorkbookInput {
  claim: ProgressClaim;
  statement: ProgressClaimStatement;
  retentionPct: number;
  phases: ProgressClaimPhase[];
  claimedRows: ProgressClaimLine[];
  acceptedRows: ProgressClaimLine[];
  reasonByScheduleId: Record<string, string>;
  /** Materials / Resources / Assets, each present only when its tab is enabled. */
  planner: ProgressClaimPlannerData;
  /** "Business Info" / "Client Info", shown above the statement like the Summary tab. */
  parties: { business?: BusinessDetails; client?: ClientDetails };
  formatDate: (value: number) => string;
  formatTime: (value: number) => string;
  t: TFunction;
}

/** Collects rows and the style of each one as they're added. */
const createRowBuilder = () => {
  const rows: ExcelCell[][] = [];
  const rowStyles: NonNullable<ExcelSheetSpec["rowStyles"]> = [];
  const add = (row: ExcelCell[], style?: ExcelRowStyle) => {
    if (style) rowStyles.push({ row: rows.length, style });
    rows.push(row);
  };
  return { rows, rowStyles, add };
};

const orDash = (value?: string) => value?.trim() || "-";

const buildSummarySheet = ({
  claim,
  statement,
  retentionPct,
  parties,
  formatDate,
  t,
}: ProgressClaimWorkbookInput): ExcelSheetSpec => {
  const { business, client } = parties;
  // The org's own tax label (e.g. "GST"), falling back to a generic one.
  const taxLabel = business?.taxName?.trim() || t("common.tax");
  const period =
    claim.periodFrom && claim.periodTo
      ? `${formatDate(Number(claim.periodFrom))} - ${formatDate(Number(claim.periodTo))}`
      : "-";
  const { rows, rowStyles, add } = createRowBuilder();

  add([t("common.serialNumber"), claim.claimNumber]);
  add([t("progressClaim.statement.claimPeriod"), period]);
  add([]);

  add([t("common.businessInfo"), null, null], "section");
  // The logo sits in its own row, like the thumbnails on the Attachments sheet.
  const logoUrl = business?.logoUrl?.trim();
  const logoRow = rows.length;
  if (logoUrl) add([t("common.logo"), null]);
  add([t("common.name"), orDash(business?.name)]);
  add([t("common.email"), orDash(business?.email)]);
  add([t("common.phone"), orDash(business?.phone)]);
  add([t("common.website"), orDash(business?.website)]);
  add([t("common.location"), orDash(business?.location)]);
  add([taxLabel, orDash(business?.taxId)]);
  add([]);

  add([t("common.clientInfo"), null, null], "section");
  add([t("common.name"), orDash(client?.name)]);
  add([t("common.email"), orDash(client?.email)]);
  add([t("common.phone"), orDash(client?.phone)]);
  add([t("common.location"), orDash(client?.location)]);
  add([]);

  add([t("common.no"), t("common.description"), t("common.amount")], "header");
  add(["A", t("progressClaim.statement.workDone"), null], "section");
  statement.workDoneLines.forEach((line, index) => add([index + 1, line.name, line.amount]));
  add([null, t("progressClaim.statement.totalWorkDone"), statement.workDoneTotal], "total");
  add(["B", t("progressClaim.statement.variationOrder"), null], "section");
  if (statement.variationOrderLines.length > 0) {
    statement.variationOrderLines.forEach((line, index) => add([index + 1, line.name, line.amount]));
  } else {
    add([null, "-", null]);
  }
  add([null, t("progressClaim.statement.totalVariationOrders"), statement.variationOrderTotal], "total");
  add(["C", t("progressClaim.statement.totalAB"), statement.total], "total");
  add(["D", t("progressClaim.statement.retentionAt", { rate: retentionPct }), statement.retentionAmount]);
  add(["E", t("progressClaim.statement.netOfRetention"), statement.netOfRetention], "total");
  add(["F", t("progressClaim.statement.less"), null], "section");
  add([1, t("progressClaim.previousAcceptedTotal"), statement.previousAcceptedNet]);
  add([null, t("progressClaim.totalThisPeriod"), statement.thisPeriodNet], "highlight");

  return {
    name: t("progressClaim.summaryTab"),
    rows,
    rowStyles,
    // Column A also holds the detail labels (S.No, Business/Client Info) above the statement.
    columnWidths: [16, 60, 18],
    columnFormats: [{ column: 2, numberFormat: EXCEL_MONEY_FORMAT }],
    images: logoUrl ? [{ row: logoRow, column: 1, url: logoUrl }] : undefined,
  };
};

const buildPhaseSheet = (
  name: string,
  claimedRows: ProgressClaimLine[],
  acceptedRows: ProgressClaimLine[],
  reasonByScheduleId: Record<string, string>,
  t: TFunction,
): ExcelSheetSpec => {
  const qty = t("common.qty");
  const amount = t("common.amount");
  const itemLabels = buildItemLabels(claimedRows);
  const acceptedById = new Map(acceptedRows.map((row) => [row.id, row]));
  const claimedTotals = getLineTotals(claimedRows);
  const acceptedTotals = getLineTotals(acceptedRows);
  const { rows, rowStyles, add } = createRowBuilder();

  add(
    [
      t("common.item"), t("schedule.scheduleName"), t("common.unit"),
      t("progressClaim.table.totalValue"), null, null,
      t("common.previous"), null,
      t("progressClaim.table.current"), null,
      t("progressClaim.table.accepted"), null,
      t("progressClaimExternal.varianceReason"),
    ],
    "header",
  );
  add([null, null, null, qty, t("common.rate"), amount, qty, amount, qty, amount, qty, amount, null], "subHeader");

  claimedRows.forEach((row) => {
    const claimed = getLineFigures(row);
    const accepted = getLineFigures(acceptedById.get(row.id) ?? row);
    const unit = row.unit ?? (isLumpSum(row) ? t("progressClaim.table.lumpSumUnit") : null);
    add(
      [
        itemLabels.get(row.id) ?? null,
        row.name,
        unit,
        getLineQuantity(row),
        claimed.rate,
        row.claimValue,
        claimed.previousQty,
        claimed.previousAmount,
        claimed.currentQty,
        claimed.currentAmount,
        accepted.currentQty,
        accepted.currentAmount,
        row.isGroup ? null : reasonByScheduleId[row.scheduleId] || null,
      ],
      row.isGroup ? "section" : undefined,
    );
  });

  add(
    [
      null, t("common.total"), null,
      null, null, claimedTotals.totalAmount,
      null, claimedTotals.previousAmount,
      null, claimedTotals.currentAmount,
      null, acceptedTotals.currentAmount,
      null,
    ],
    "total",
  );

  const mergeDown = (col: number) => ({ startRow: 0, startCol: col, endRow: 1, endCol: col });
  const mergeAcross = (from: number, to: number) => ({ startRow: 0, startCol: from, endRow: 0, endCol: to });

  return {
    name,
    rows,
    rowStyles,
    merges: [
      mergeDown(0), mergeDown(1), mergeDown(2),
      mergeAcross(3, 5), mergeAcross(6, 7), mergeAcross(8, 9), mergeAcross(10, 11),
      mergeDown(12),
    ],
    columnWidths: [8, 40, 8, 10, 14, 16, 10, 16, 10, 16, 10, 16, 36],
    columnFormats: [
      ...[4, 5, 7, 9, 11].map((column) => ({ column, numberFormat: EXCEL_MONEY_FORMAT })),
      ...[3, 6, 8, 10].map((column) => ({ column, numberFormat: EXCEL_QTY_FORMAT })),
    ],
    freezeRows: 2,
  };
};

const buildAttachmentsSheet = (
  attachments: string[] | null | undefined,
  t: TFunction,
): ExcelSheetSpec | null => {
  const urls = parseAttachmentUrls(attachments);
  if (urls.length === 0) return null;

  // Preview | Download link — images get a thumbnail in Preview.
  return {
    name: t("progressClaim.attachments.excelTab"),
    rows: [
      [t("common.preview"), t("progressClaim.attachments.excelUrl")],
      ...urls.map((url) => [null, url]),
    ],
    rowStyles: [{ row: 0, style: "header" }],
    columnWidths: [24, 100],
    links: urls.map((url, index) => ({ row: index + 1, column: 1, url })),
    images: urls
      .map((url, index) => ({ row: index + 1, column: 0, url }))
      .filter(({ url }) => isAttachmentImage(attachmentItemFromUploadValue(url))),
    freezeRows: 1,
  };
};

/**
 * The claim as a workbook description for botsync's export endpoint: Summary
 * (details + statement), one sheet per phase, Materials / Resources / Assets
 * for whichever tabs are enabled, then Attachments when the claim has any.
 */
export const buildProgressClaimWorkbook = (input: ProgressClaimWorkbookInput): ExcelWorkbookSpec => {
  const { claim, planner, t } = input;

  const sheets: Array<ExcelSheetSpec | null> = [
    buildSummarySheet(input),
    ...input.phases.map((phase) =>
      buildPhaseSheet(
        phase.name,
        getPhaseRows(input.claimedRows, phase.id),
        getPhaseRows(input.acceptedRows, phase.id),
        input.reasonByScheduleId,
        t,
      ),
    ),
    planner.materials ? buildMaterialsSheet(t("schedule.plannerMaterialsTab"), planner.materials, input) : null,
    planner.shifts ? buildResourcesSheet(t("progressClaim.resourcesTab"), planner.shifts, input) : null,
    planner.assets ? buildAssetsSheet(t("schedule.plannerAssetsTab"), planner.assets, input) : null,
    buildAttachmentsSheet(claim.attachments, t),
  ];

  return {
    fileName: `ProgressClaim-${claim.claimNumber}.xlsx`,
    sheets: sheets.filter((sheet): sheet is ExcelSheetSpec => sheet !== null),
  };
};
