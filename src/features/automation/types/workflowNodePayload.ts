import type { WorkflowNodeType } from "@/features/automation/constants";
import type { WorkflowNodeConfigV1 } from "@/features/automation/types/workflowNodeConfigV1";

/**
 * Persisted workflow node configuration saved from the details panel and shown on canvas cards.
 * When syncing to AECAutopilot, the same information is sent as `workflow_nodes.config`
 * using {@link WorkflowNodeConfigV1} (see `buildWorkflowNodeConfigV1`).
 */
export interface WorkflowNodePersistedPayload {
  id: string;
  type: WorkflowNodeType;
  method: string | null;
  /** Form field values and any auxiliary JSON; aligned with `WorkflowNodeConfigV1.fields`. */
  config: Record<string, unknown>;
  cardSummary: string;
  /** UUID returned by `CREATE_NODE` for client-first sync. */
  serverNodeId?: string;
  /** UUID returned by `CREATE_EDGE` from parent to this step. */
  serverEdgeId?: string;
}
