import type { WorkflowNodeType } from "@/features/automation/constants";
import type { WorkflowNodeData } from "@/features/automation/types/workflowGraph";
import type { WorkflowNodePersistedPayload } from "@/features/automation/types/workflowNodePayload";

export const WORKFLOW_NODE_CONFIG_SCHEMA_VERSION = 1 as const;

/**
 * Stored in `workflow_nodes.config` (jsonb) and mirrored in UI `workflowPayload.config`.
 * Keeps UI rendering, registry method keys, and server execution metadata in one object.
 */
export type WorkflowNodeConfigV1 = {
  schemaVersion: typeof WORKFLOW_NODE_CONFIG_SCHEMA_VERSION;
  canvas: {
    reactFlowType: string;
    variant: WorkflowNodeData["variant"];
  };
  registry: {
    workflowNodeType: WorkflowNodeType;
    method: string | null;
  };
  display: {
    cardSummary: string;
  };
  fields: Record<string, unknown>;
  ids: {
    clientStepId: string;
    serverNodeId?: string;
  };
};

export function buildWorkflowNodeConfigV1(params: {
  clientStepId: string;
  reactFlowType: string;
  variant: WorkflowNodeData["variant"];
  workflowNodeType: WorkflowNodeType;
  method: string | null;
  cardSummary: string;
  fields?: Record<string, unknown>;
  serverNodeId?: string;
}): WorkflowNodeConfigV1 {
  return {
    schemaVersion: WORKFLOW_NODE_CONFIG_SCHEMA_VERSION,
    canvas: {
      reactFlowType: params.reactFlowType,
      variant: params.variant,
    },
    registry: {
      workflowNodeType: params.workflowNodeType,
      method: params.method,
    },
    display: {
      cardSummary: params.cardSummary,
    },
    fields: params.fields ?? {},
    ids: {
      clientStepId: params.clientStepId,
      serverNodeId: params.serverNodeId,
    },
  };
}

const CONDITION_METHODS_WITH_DEFAULT_OPERATOR = new Set([
  "PROJECT_TYPE",
  "PROJECT_STATUS",
  "LEAD_SOURCE",
  "LEAD_CAPTURE",
]);

function conditionFieldHasValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/** Ensures string/multi-select conditions persist a comparator for server evaluation. */
function applyConditionFieldDefaults(
  workflowNodeType: WorkflowNodeType,
  method: string | null,
  fields: Record<string, unknown>,
): Record<string, unknown> {
  if (workflowNodeType !== "CONDITION" || !method) return fields;
  if (!CONDITION_METHODS_WITH_DEFAULT_OPERATOR.has(method)) return fields;

  const operator = fields.operator;
  const hasOperator =
    operator !== undefined &&
    operator !== null &&
    String(operator).trim() !== "";
  if (hasOperator || !conditionFieldHasValue(fields.value)) return fields;

  return { ...fields, operator: "===" };
}

export function configV1FromWorkflowPayload(
  stepId: string,
  reactFlowType: string,
  variant: WorkflowNodeData["variant"],
  payload: WorkflowNodePersistedPayload | undefined,
): WorkflowNodeConfigV1 {
  const workflowNodeType = payload?.type ?? "ACTION";
  const method = payload?.method ?? null;
  const rawFields = { ...(payload?.config ?? {}) };
  const fields = applyConditionFieldDefaults(
    workflowNodeType,
    method,
    rawFields,
  );

  return buildWorkflowNodeConfigV1({
    clientStepId: stepId,
    reactFlowType,
    variant,
    workflowNodeType,
    method,
    cardSummary: payload?.cardSummary ?? "",
    fields,
    serverNodeId: payload?.serverNodeId,
  });
}

export function isWorkflowNodeConfigV1(
  value: unknown,
): value is WorkflowNodeConfigV1 {
  if (!value || typeof value !== "object") return false;
  const v = value as WorkflowNodeConfigV1;
  return (
    v.schemaVersion === 1 &&
    typeof v.canvas === "object" &&
    typeof v.registry === "object" &&
    typeof v.display === "object" &&
    typeof v.fields === "object" &&
    typeof v.ids === "object"
  );
}
