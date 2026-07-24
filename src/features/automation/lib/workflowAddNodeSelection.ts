import type { AutomationCardMethodKey } from "../constants";
import type { WorkflowCardVariant } from "../types/workflowCanvas";

export interface WorkflowAddNodeSelection {
  selectedCardMethod: AutomationCardMethodKey;
  selectedMethodOption: string;
  /**
   * Stable per-node id assigned when the node is created.
   * Keeps parent/child bindings intact when additional nodes are inserted later.
   */
  nodeStepIndex?: number;
}

export function cardMethodToVariant(
  method: AutomationCardMethodKey
): WorkflowCardVariant {
  switch (method) {
    case "TRIGGER":
      return "trigger";
    case "CONDITION":
      return "condition";
    case "ACTION":
      return "action";
    case "DELAY":
      return "delay";
  }
}

/** Maps API option keys to `automation.workflowFields.methods.*` i18n keys. */
export function methodOptionToMethodsTranslationKey(option: string): string {
  if (option === "IF/ELSE") return "IF_ELSE";
  return option;
}
