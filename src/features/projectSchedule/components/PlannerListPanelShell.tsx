import type { ReactNode, RefObject } from "react";
import { Box } from "@mui/material";

const LIST_PANEL_WIDTH = 240;

interface PlannerListPanelShellProps {
  header: ReactNode;
  bodyHeightPx: string;
  headerHeightPx: number;
  scrollTopPx: number;
  scrollRef: RefObject<HTMLDivElement>;
  onWheelScroll: (deltaY: number) => void;
  children: ReactNode;
}

export function PlannerListPanelShell({
  header,
  bodyHeightPx,
  headerHeightPx,
  scrollTopPx,
  scrollRef,
  onWheelScroll,
  children,
}: PlannerListPanelShellProps) {
  return (
    <Box
      sx={{
        width: LIST_PANEL_WIDTH,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        zIndex: 3,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: headerHeightPx,
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-end",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
        }}
      >
        <Box sx={{ width: "100%" }}>{header}</Box>
      </Box>
      <Box
        ref={scrollRef}
        sx={{ flex: 1, overflow: "hidden" }}
        onWheel={(event) => {
          if (event.deltaY === 0) return;
          event.preventDefault();
          onWheelScroll(event.deltaY);
        }}
      >
        <Box
          sx={{
            height: bodyHeightPx,
            transform: `translateY(-${scrollTopPx}px)`,
            willChange: "transform",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
