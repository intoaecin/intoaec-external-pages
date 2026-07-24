import type { ProjectType } from "@/types";

export const PROJECT_TYPES_API_PATH = "/customized-project-types";

export type GetProjectTypesRequest = {
  organizationId: string;
  organizationType: string;
  isGetAll?: boolean;
};

export type ProjectTypesApiEnvelope<T = unknown> = {
  statusCode?: number;
  code?: string;
  message?: string;
  body?: T;
  error?: unknown;
};

export const isProjectTypesApiSuccess = (data: unknown): boolean => {
  if (!data || typeof data !== "object") return false;
  const envelope = data as ProjectTypesApiEnvelope;
  if (envelope.error != null) return false;
  if (typeof envelope.code === "string") {
    const code = envelope.code.toUpperCase();
    if (code.includes("ERROR") || code.includes("FAILED")) return false;
  }
  return true;
};

export type { ProjectType };
