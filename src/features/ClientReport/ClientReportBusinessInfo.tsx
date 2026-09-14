import ClientReportBusinessAndClientInfo from "./ClientReportBusinessAndClientInfo";
import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import { Box } from "@mui/material";
import type { ClientReportRecord } from "./types";

type ClientReportBusinessInfoProps = {
  report?: ClientReportRecord | null;
  organizationId?: string;
  projectId?: string;
  withAuth: boolean;
  pdf?: boolean;
  reportTitle?: string;
  onReady?: () => void;
};

const ClientReportBusinessInfo = ({
  report,
  organizationId,
  projectId,
  withAuth,
  pdf = false,
  reportTitle,
  onReady,
}: ClientReportBusinessInfoProps) => {
  const resolvedProjectId = report?.projectId ?? projectId;
  const resolvedOrganizationId = report?.organizationId ?? organizationId;

  if (!resolvedProjectId || !resolvedOrganizationId) {
    return null;
  }

  return (
    <Box
      className="client-report-business-info"
      sx={{
        bgcolor: CLIENT_REPORT_COLORS.pageBackground,
        px: { xs: 0, sm: 1 },
        pt: { xs: 1.5, sm: 2 },
      }}
    >
      <ClientReportBusinessAndClientInfo
        type="CLIENT"
        projectId={resolvedProjectId}
        organizationId={resolvedOrganizationId}
        withAuth={withAuth}
        defaultClientDetails={report?.clientDetails}
        defaultOrganizationDetails={report?.organizationDetails}
        pdf={pdf}
        reportTitle={reportTitle}
        isPreview
        isTaxDisplay
        onReady={onReady}
      />
    </Box>
  );
};

export default ClientReportBusinessInfo;
