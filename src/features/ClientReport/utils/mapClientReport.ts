import dayjs from "dayjs";
import type { ClientReportRecord } from "../types";

export type ClientReportApiItem = {
  clientReportId?: string;
  reportId?: string;
  id?: string;
  projectId?: string;
  organizationId?: string;
  organizationDetails?: ClientReportRecord["organizationDetails"];
  clientDetails?: ClientReportRecord["clientDetails"];
  title?: string;
  reportTitle?: string;
  createdAt?: number | string;
  createdOn?: number | string;
  createdBy?: string;
  createdByName?: string;
  reportStartDate?: number | string;
  reportEndDate?: number | string;
  totalHours?: string;
  breakTime?: string;
  weatherCondition?: Record<string, unknown> | null;
  status?: string;
  notes?: ClientReportRecord["noteSections"] | string;
  attachments?: string[];
  includedInLog?: ClientReportRecord["includedInLog"];
  scheduleProgress?: ClientReportRecord["scheduleProgress"];
  taskProgress?: ClientReportRecord["taskProgress"];
  workersProgress?: ClientReportRecord["workersProgress"];
  inventoryStatus?: ClientReportRecord["inventoryStatus"];
};

export const getReportTimestamp = (value?: number | string) => {
  if (typeof value === "number") {
    return value;
  }

  const parsedValue = Number(value);
  if (Number.isFinite(parsedValue)) {
    return parsedValue;
  }

  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.valueOf() : undefined;
};

const formatDate = (value?: number | string) => {
  const timestamp = getReportTimestamp(value);
  return timestamp ? dayjs(timestamp).format("DD MMM YYYY") : "";
};

const formatTime = (value?: number | string) => {
  const timestamp = getReportTimestamp(value);
  return timestamp ? dayjs(timestamp).format("hh:mm A") : "";
};

const getReportNotes = (notes?: ClientReportApiItem["notes"]) => {
  if (typeof notes === "string") {
    return notes;
  }

  return notes?.[0]?.content ?? "";
};

export const mapClientReport = (
  report: ClientReportApiItem,
): ClientReportRecord => {
  const weatherCondition = report.weatherCondition;

  return {
    id: report.clientReportId ?? report.reportId ?? report.id ?? "",
    projectId: report.projectId,
    organizationId: report.organizationId,
    organizationDetails: report.organizationDetails,
    clientDetails: report.clientDetails,
    createdAt: getReportTimestamp(
      report.createdAt ?? report.createdOn ?? report.reportStartDate,
    ),
    createdBy: report.createdBy ?? report.createdByName,
    reportStartDate: getReportTimestamp(report.reportStartDate),
    reportEndDate: getReportTimestamp(report.reportEndDate),
    date: formatDate(report.createdAt ?? report.createdOn ?? report.reportStartDate),
    title: report.title ?? report.reportTitle ?? "-",
    startTime: formatTime(report.reportStartDate),
    endTime: formatTime(report.reportEndDate),
    totalHours: report.totalHours ?? "-",
    breakTime: report.breakTime ?? "",
    weather:
      typeof weatherCondition?.condition === "string"
        ? weatherCondition.condition
        : "",
    temperature:
      typeof weatherCondition?.temperature === "string"
        ? weatherCondition.temperature
        : "",
    affectingWork: Boolean(weatherCondition?.affectingWork),
    status: report.status ?? "Draft",
    notes: getReportNotes(report.notes),
    noteSections: Array.isArray(report.notes) ? report.notes : undefined,
    attachments: report.attachments ?? [],
    weatherCondition,
    includedInLog: report.includedInLog,
    scheduleProgress: report.scheduleProgress ?? [],
    taskProgress: report.taskProgress ?? [],
    workersProgress: report.workersProgress ?? [],
    inventoryStatus: report.inventoryStatus ?? [],
  };
};
