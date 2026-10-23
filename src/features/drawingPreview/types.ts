export type MarkupTool =
  | "pen"
  | "highlighter"
  | "line"
  | "arrow"
  | "polyline"
  | "rect"
  | "ellipse"
  | "triangle"
  | "cloud"
  | "polygon"
  | "symbol"
  | "text";

/** Markup geometry as saved by intoaec-UI; points are percentages of the page size. */
export interface MarkupShapeData {
  tool: MarkupTool;
  points: Array<[number, number]>;
  color: string;
  strokeWidth: number;
  label?: string;
  filled?: boolean;
  symbolKey?: string;
  fontSize?: number;
}

export type ClientApprovalStatus = "SENT" | "ACCEPTED" | "REJECTED";

export interface SharedDrawingMarkup {
  annotationId: string;
  text: string;
  pageNumber?: number | null;
  shapeData: MarkupShapeData;
  status?: "OPEN" | "RESOLVED" | null;
}

export interface SharedDrawing {
  leadFileId: string;
  organizationId: string;
  organizationType: string;
  fileName: string;
  fileExtension?: string;
  fileUrl: string;
  versionNumber?: number;
  /** Versions of this file the client was sent, newest first */
  fileVersions?: Array<{ leadFileId: string; versionNumber: number }>;
  /** The file's own download setting; false hides the client download */
  allowDownload?: boolean;
  /** Only drawings ask the client to accept or reject; sent documents are view-only */
  isDrawing?: boolean;
  /** SENT while awaiting the client's answer, then ACCEPTED or REJECTED */
  approvalStatus?: ClientApprovalStatus | null;
  /** A newer version replaced this pending request; Accept / Reject are not offered */
  isSuperseded?: boolean;
  /** The client's own reason when they rejected it */
  rejectionReason?: string | null;
  acceptedAt?: number | null;
  rejectedAt?: number | null;
  markups: SharedDrawingMarkup[];
}

/** Natural size of a rendered page; markups are laid out in this coordinate space. */
export interface PageSize {
  width: number;
  height: number;
}
