import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Boxes, FileText, GitMerge, Layers, Package, Paperclip, Users } from "lucide-react";
import type { CustomTabItem } from "@/components/layout/PageLayout";
import type { ProgressClaimSettings } from "../types";
import type { ProgressClaimPhase } from "../utils/progressClaimPhases";
import {
  DEFAULT_PROGRESS_CLAIM_SETTINGS,
  PLANNER_TAB_SETTING_KEY,
} from "../utils/progressClaimSettings";

export type ProgressClaimPlannerTab = "MATERIALS" | "RESOURCES" | "ASSETS";
const PLANNER_TABS: ProgressClaimPlannerTab[] = ["MATERIALS", "RESOURCES", "ASSETS"];

const PLANNER_TAB_ITEMS: Record<ProgressClaimPlannerTab, { labelKey: string; icon: JSX.Element }> = {
  MATERIALS: { labelKey: "schedule.plannerMaterialsTab", icon: <Package size={16} /> },
  RESOURCES: { labelKey: "progressClaim.resourcesTab", icon: <Users size={16} /> },
  ASSETS: { labelKey: "schedule.plannerAssetsTab", icon: <Boxes size={16} /> },
};
const SUMMARY_TAB = "SUMMARY";
const ATTACHMENTS_TAB = "ATTACHMENTS";

export type ProgressClaimTab =
  | { kind: "SUMMARY" }
  | { kind: "CHANGE_ORDER" }
  | { kind: "PHASE"; phaseId: string }
  | { kind: "PLANNER"; tab: ProgressClaimPlannerTab }
  | { kind: "ATTACHMENTS" };

const CHANGE_ORDER_TAB = "CHANGE_ORDER";

/**
 * Summary, one tab per phase, then whichever of Materials / Resources /
 * Assets the project's claim settings enable, then Attachments when shown —
 * kept in the `subTab` query param (a phase tab stores its schedule id there).
 */
export function useProgressClaimTabs(
  phases: ProgressClaimPhase[] = [],
  settings: ProgressClaimSettings = DEFAULT_PROGRESS_CLAIM_SETTINGS,
  showAttachments: boolean = false,
  hasChangeOrders: boolean = false,
) {
  const router = useRouter();
  const { t } = useTranslation();

  const plannerTabs = useMemo(
    () => PLANNER_TABS.filter((tab) => settings[PLANNER_TAB_SETTING_KEY[tab]]),
    [settings],
  );

  const tabKeys = useMemo(
    () => [
      SUMMARY_TAB,
      ...(phases.length > 0 ? [phases[0].id] : []),
      ...(hasChangeOrders ? [CHANGE_ORDER_TAB] : []),
      ...phases.slice(1).map((phase) => phase.id),
      ...plannerTabs,
      ...(showAttachments ? [ATTACHMENTS_TAB] : []),
    ],
    [phases, plannerTabs, showAttachments, hasChangeOrders],
  );

  const querySubTab = String(router.query.subTab ?? SUMMARY_TAB);
  const activeTab = useMemo((): ProgressClaimTab => {
    const plannerTab = plannerTabs.find((tab) => tab === querySubTab.toUpperCase());
    if (plannerTab) return { kind: "PLANNER", tab: plannerTab };
    if (showAttachments && querySubTab.toUpperCase() === ATTACHMENTS_TAB) {
      return { kind: "ATTACHMENTS" };
    }
    if (hasChangeOrders && querySubTab.toUpperCase() === CHANGE_ORDER_TAB) {
      return { kind: "CHANGE_ORDER" };
    }
    if (phases.some((phase) => phase.id === querySubTab)) {
      return { kind: "PHASE", phaseId: querySubTab };
    }
    return { kind: "SUMMARY" };
  }, [phases, plannerTabs, querySubTab, showAttachments, hasChangeOrders]);

  const activeKey =
    activeTab.kind === "PLANNER"
      ? activeTab.tab
      : activeTab.kind === "PHASE"
        ? activeTab.phaseId
        : activeTab.kind === "ATTACHMENTS"
          ? ATTACHMENTS_TAB
          : activeTab.kind === "CHANGE_ORDER"
            ? CHANGE_ORDER_TAB
            : SUMMARY_TAB;

  const handleTabChange = useCallback(
    (index: number) => {
      void router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, subTab: tabKeys[index] ?? SUMMARY_TAB },
        },
        undefined,
        { shallow: true },
      );
    },
    [router, tabKeys],
  );

  const tabItems = useMemo<CustomTabItem[]>(
    () => [
      { label: t("progressClaim.summaryTab"), icon: <FileText size={16} /> },
      ...(phases.length > 0 ? [{ label: phases[0].name, icon: <Layers size={16} /> }] : []),
      ...(hasChangeOrders
        ? [{ label: t("progressClaim.changeOrderTab", { defaultValue: "Change Order" }), icon: <GitMerge size={16} /> }]
        : []),
      ...phases.slice(1).map((phase) => ({ label: phase.name, icon: <Layers size={16} /> })),
      ...plannerTabs.map((tab) => ({
        label: t(PLANNER_TAB_ITEMS[tab].labelKey),
        icon: PLANNER_TAB_ITEMS[tab].icon,
      })),
      ...(showAttachments
        ? [{ label: t("common.attachments"), icon: <Paperclip size={16} /> }]
        : []),
    ],
    [phases, plannerTabs, showAttachments, hasChangeOrders, t],
  );

  return {
    activeTab,
    tabItems,
    tabValue: Math.max(0, tabKeys.indexOf(activeKey)),
    handleTabChange,
  };
}
