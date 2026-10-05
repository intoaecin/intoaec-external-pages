import { Box } from "@mui/material";
import { PAGE_HEIGHT_WITH_TAB } from "@/components/layout/PageLayout";
import type { ProgressClaimPlannerTab } from "../hooks/useProgressClaimTabs";
import type { ProgressClaimPlannerScope } from "../types";
import ProgressClaimAssetsTab from "./ProgressClaimAssetsTab";
import ProgressClaimMaterialsTab from "./ProgressClaimMaterialsTab";
import ProgressClaimQuantityTab from "./ProgressClaimQuantityTab";
import ProgressClaimResourcesTab from "./ProgressClaimResourcesTab";
import ProgressClaimScheduleProvider from "./ProgressClaimScheduleProvider";

interface ProgressClaimPlannerTabContentProps extends ProgressClaimPlannerScope {
  tab: ProgressClaimPlannerTab;
}

/** Read-only Planner views for the Materials / Resources / Assets / Quantity tabs, shared by the internal and client claim pages. */
export default function ProgressClaimPlannerTabContent({
  tab,
  ...scope
}: ProgressClaimPlannerTabContentProps) {
  return (
    <ProgressClaimScheduleProvider {...scope}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: PAGE_HEIGHT_WITH_TAB,
          minHeight: 0,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {tab === "MATERIALS" ? (
          <ProgressClaimMaterialsTab {...scope} />
        ) : tab === "RESOURCES" ? (
          <ProgressClaimResourcesTab {...scope} />
        ) : tab === "QUANTITY" ? (
          <ProgressClaimQuantityTab {...scope} />
        ) : (
          <ProgressClaimAssetsTab {...scope} />
        )}
      </Box>
    </ProgressClaimScheduleProvider>
  );
}
