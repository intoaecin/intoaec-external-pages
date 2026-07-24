import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { leadCaptureV2PreviewContentColumnSx } from "./leadCaptureV2CustomerPreviewLayout";

type LeadCaptureV2CustomerPreviewContentColumnProps = {
  children: ReactNode;
  fillExternalPage?: boolean;
  isExternalPage?: boolean;
};

const LeadCaptureV2CustomerPreviewContentColumn = ({
  children,
  fillExternalPage = true,
  isExternalPage = false,
}: LeadCaptureV2CustomerPreviewContentColumnProps) => (
  <Box
    sx={[
      leadCaptureV2PreviewContentColumnSx,
      isExternalPage
          ? {
              display: "flex",
              flexDirection: "column",
              flex: fillExternalPage ? { xs: 1, sm: "initial" } : "0 0 auto",
            }
        : {},
    ]}
  >
    {children}
  </Box>
);

export default LeadCaptureV2CustomerPreviewContentColumn;
