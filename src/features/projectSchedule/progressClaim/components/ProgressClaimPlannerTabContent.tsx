import { Box } from "@mui/material";
import { PAGE_HEIGHT_WITH_TAB } from "@/components/layout/PageLayout";
import { viewportConstrainedMaxHeightCss } from "@/components/layout/viewportChrome";
import type { ProgressClaimPlannerTab } from "../hooks/useProgressClaimTabs";
import type { ProgressClaimPlannerScope } from "../types";
import ProgressClaimAssetsTab from "./ProgressClaimAssetsTab";
import ProgressClaimMaterialsTab from "./ProgressClaimMaterialsTab";
import ProgressClaimQuantityTab from "./ProgressClaimQuantityTab";
import ProgressClaimResourcesTab from "./ProgressClaimResourcesTab";
import ProgressClaimScheduleProvider from "./ProgressClaimScheduleProvider";

interface ProgressClaimPlannerTabContentProps extends ProgressClaimPlannerScope {
  tab: ProgressClaimPlannerTab;
  /** The page has no app header above it (claim preview, client page), so the tab fills that space too. */
  standalone?: boolean;
}

// PAGE_HEIGHT_WITH_TAB reserves room for the app header; a standalone page has none.
const STANDALONE_PAGE_HEIGHT_WITH_TAB = viewportConstrainedMaxHeightCss({
  outsideShellPx: 0,
  pageLayoutTabs: true,
});

/** Read-only Planner views for the Materials / Resources / Assets / Quantity tabs, shared by the internal and client claim pages. */
export default function ProgressClaimPlannerTabContent({
  tab,
  standalone = false,
  ...scope
}: ProgressClaimPlannerTabContentProps) {
  return (
    <ProgressClaimScheduleProvider {...scope}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: standalone ? STANDALONE_PAGE_HEIGHT_WITH_TAB : PAGE_HEIGHT_WITH_TAB,
          minHeight: 0,
          overflow: "hidden",
          // The boards fill the tab; the Materials table sits on the page background.
          bgcolor: tab === "MATERIALS" ? undefined : "background.paper",
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
