import type { WorkflowAddNodeSelection } from "@/features/automation/lib/workflowAddNodeSelection";
import type { WorkflowNodePersistedPayload } from "@/features/automation/types/workflowNodePayload";
import type { Edge, EdgeChange, Node, NodeChange } from "reactflow";

export type WorkflowNodeData = {
  label: string;
  variant: "trigger" | "condition" | "action" | "continuousAction" | "followUp" | "delay";
  stepIndex: number;
  config?: unknown;
  /** Saved node configuration from the details panel; drives card summary text. */
  workflowPayload?: WorkflowNodePersistedPayload;
  status?: "DRAFT" | "PUBLISHED";
  error?: string;
  showAddButton?: boolean;
  /** When adding a Condition step, prefer this method over the registry default. */
  preferredConditionMethod?: string;
  onAddNodeSelect?: (
    selection: WorkflowAddNodeSelection,
    branch?: "yes" | "no"
  ) => void;
  onRemoveClick?: () => void;
  /** Opens the node details panel (wired from the workflow canvas). */
  onOpenDetails?: () => void;
};

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowRfEdge = Edge;

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowRfEdge[];
  /** Bumped when the synced graph changes; remounts React Flow to drop stale edge geometry. */
  canvasRemountKey: string;
  /** While true, ignore React Flow edge change events during programmatic graph sync. */
  isApplyingGraphSync: boolean;
  /**
   * After closing the add-node popover, backdrop clicks can pass through to the canvas
   * and fire `onNodeClick` for the same node. Ignore that case until `until`.
   */
  suppressWorkflowNodeDetailOpenUntil: number;
  suppressWorkflowNodeDetailOpenForNodeId: string | null;
  /** Ignore `onNodeClick` for `nodeId` until `ms` elapse (default 450). */
  suppressWorkflowNodeDetailPaneOpenForMs: (nodeId: string, ms?: number) => void;
  /** When set, the workflow canvas should open details for this node id (then clear). */
  pendingOpenDetailsNodeId: string | null;
  setPendingOpenDetailsNodeId: (nodeId: string | null) => void;
  /** When set, pan the viewport to this node after the next graph sync (then clear). */
  pendingCenterNodeId: string | null;
  setPendingCenterNodeId: (nodeId: string | null) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowRfEdge[]) => void;
  resetWorkflowCanvas: () => void;
  addNode: (node: WorkflowNode, parentId?: string) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
}
