import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import PageLoader from "@/features/components/Loader/PageLoader";
import DownloadIcon from "@/assets/icons/download-icon";
import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import NoDataFound from "@/components_v2/NoDataFound";
import ClientReportBusinessInfo from "@/features/ClientReport/ClientReportBusinessInfo";
import ClientReportCreate from "@/features/ClientReport/ClientReportCreate";
import { useClientReportById } from "@/features/ClientReport/hooks/useClientReportById";
import type { ClientReportRecord } from "@/features/ClientReport/types";
import DailyLogCreate from "@/features/DailyLog/DailyLogCreate";
import { useDailyLogById } from "@/features/DailyLog/hooks/useDailyLogById";
import type { DailyLogRecord } from "@/features/DailyLog/types";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { downloadClientReportPdf } from "@/features/ClientReport/utils/clientReportPdf";
import {
  formatDateBasedOnOrganizationLocalization,
  hexToRgb,
} from "@/lib/helpers";
import {
  Box,
  CircularProgress,
  IconButton,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Ported from intoaec-UI `src/pages/client-report/index.tsx`.
 *
 * Query-param driven (no dynamic route segment): `?clientReportId=<id>` for a
 * Client Report preview, `?dailyLogId=<id>` for a Daily Log preview — read via
 * the `next/router` compat shim (`src/router/nextRouterCompat.ts`), which
 * already merges `?search` params into `router.query`, exactly like the
 * source. `handleDownloadPdf` renders the on-page DOM directly (see
 * `downloadClientReportPdf` in `utils/clientReportPdf.ts`) and posts to
 * `VITE_AEC_CHATBOT_ENDPOINT` — self-contained, no separate SSR page fetch,
 * so (like the PO/WO preview) this needed no CORS-forwarding treatment.
 */

type ClientReportPreviewContentProps = {
  report?: ClientReportRecord;
  dailyLog?: DailyLogRecord;
  isReportUnavailable: boolean;
  isDailyLogPreview: boolean;
  organizationId?: string;
};

const getClientReportTitle = (
  report: ClientReportRecord | undefined,
  t: ReturnType<typeof useTranslation>["t"],
  localizationValue: ReturnType<
    typeof useOrganizationLocalization
  >["localizationValue"],
) => {
  const savedTitle = report?.title?.trim();

  if (savedTitle && savedTitle !== "-") {
    return savedTitle;
  }

  if (!report?.id) {
    return t("module.ClientReport", { defaultValue: "Client Report" });
  }

  const fromDate = report.reportStartDate
    ? formatDateBasedOnOrganizationLocalization(
        localizationValue,
        report.reportStartDate,
        true,
      )
    : "-";
  const toDate = report.reportEndDate
    ? formatDateBasedOnOrganizationLocalization(
        localizationValue,
        report.reportEndDate,
        true,
      )
    : "-";

  return t("clientReport.reportDateRangeTitle", {
    defaultValue: "Report ({{fromDate}} - {{toDate}})",
    fromDate,
    toDate,
    interpolation: { escapeValue: false },
  });
};

const ClientReportPreviewContent = ({
  report,
  dailyLog,
  isReportUnavailable,
  isDailyLogPreview,
  organizationId,
}: ClientReportPreviewContentProps) => {
  const { t } = useTranslation();
  const { VITE_AEC_CHATBOT_ENDPOINT } = useEnv();
  const { logoUrl } = useOrganization();
  const { localizationValue } = useOrganizationLocalization();
  const reportRef = useRef<HTMLDivElement | null>(null);
  const pdfReportRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [isPdfBusinessInfoReady, setIsPdfBusinessInfoReady] = useState(false);
  const reportTitle = getClientReportTitle(report, t, localizationValue);
  const previewTitle =
    isDailyLogPreview && dailyLog?.title?.trim()
      ? dailyLog.title
      : reportTitle;

  const handleDownloadPdf = async () => {
    if (!pdfReportRef.current) {
      return;
    }

    await downloadClientReportPdf({
      element: pdfReportRef.current,
      fileName: reportTitle,
      chatbotEndpoint: VITE_AEC_CHATBOT_ENDPOINT,
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100dvh",
        bgcolor: "#f7fafc",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          bgcolor: "#fff",
          boxShadow: "4px 4px 10px 0px rgb(0 0 0 / 5%)",
          px: { xs: 1.5, sm: 3 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minWidth: 0,
            flex: 1,
            maxWidth: "33.333%",
          }}
        >
          {logoUrl && (
            <Box
              sx={{
                height: "32px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={logoUrl}
                alt="Logo"
                style={{
                  height: "100%",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}
          <Tooltip title={previewTitle} arrow>
            <Typography
              noWrap
              sx={{
                fontSize: { xs: 16, sm: 18 },
                fontWeight: 600,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {previewTitle}
            </Typography>
          </Tooltip>
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
        >
          {downloading ? (
            <CircularProgress size={28} />
          ) : (
            <Tooltip title={t("tooltips.downloadAsPdf")} arrow>
              <span>
                <IconButton
                  disabled={isReportUnavailable || !isPdfBusinessInfoReady}
                  onClick={() => {
                    setDownloading(true);
                    handleDownloadPdf().finally(() => setDownloading(false));
                  }}
                >
                  <DownloadIcon style={{ width: "25px" }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <LanguageSwitcher />
        </Box>
      </Box>
      <Box
        ref={reportRef}
        sx={{
          width: "100%",
          maxWidth: 1440,
          mx: "auto",
          overflow: "visible",
        }}
      >
        {isReportUnavailable ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "calc(100dvh - 80px)",
              px: 2,
              py: { xs: 6, sm: 8 },
            }}
          >
            <NoDataFound
              size="medium"
              text={t("clientReport.reportDataNotFound", {
                defaultValue:
                  "Report data not found. Please contact admin for more details.",
              })}
            />
          </Box>
        ) : (
          <>
            {isDailyLogPreview ? (
              <DailyLogCreate
                report={dailyLog}
                isPreview
                isExternalPreview
              />
            ) : (
              <>
                <ClientReportBusinessInfo
                  report={report}
                  organizationId={organizationId}
                  withAuth={false}
                />
                <ClientReportCreate
                  report={report}
                  isPreview
                  isExternalPreview
                />
              </>
            )}
          </>
        )}
      </Box>
      {!isReportUnavailable && !isDailyLogPreview && (
        <Box
          aria-hidden
          sx={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: "700px",
            visibility: "hidden",
            pointerEvents: "none",
          }}
        >
          <Box
            ref={pdfReportRef}
            sx={{
              bgcolor: CLIENT_REPORT_COLORS.pageBackground,
              overflow: "visible",
            }}
          >
            <ClientReportBusinessInfo
              report={report}
              organizationId={organizationId}
              withAuth={false}
              pdf
              reportTitle={reportTitle}
              onReady={() => setIsPdfBusinessInfoReady(true)}
            />
            <ClientReportCreate report={report} isPreview isExternalPreview />
          </Box>
        </Box>
      )}
    </Box>
  );
};

const ClientReportPreview = () => {
  const router = useRouter();
  const {
    loading,
    organizationId,
    organizationType,
    mainColor,
    textColor,
  } = useOrganization();
  const clientReportId = Array.isArray(router.query.clientReportId)
    ? router.query.clientReportId[0]
    : router.query.clientReportId;
  const dailyLogId = Array.isArray(router.query.dailyLogId)
    ? router.query.dailyLogId[0]
    : router.query.dailyLogId;
  const isDailyLogPreview = Boolean(dailyLogId);
  const {
    report,
    loading: reportLoading,
    error: reportError,
  } = useClientReportById(isDailyLogPreview ? undefined : clientReportId);
  const {
    report: dailyLog,
    loading: dailyLogLoading,
    error: dailyLogError,
  } = useDailyLogById(dailyLogId);

  const isReportUnavailable = isDailyLogPreview
    ? Boolean(dailyLogError || !dailyLogId || !dailyLog?.id)
    : Boolean(reportError || !clientReportId || !report?.id);

  if (loading || reportLoading || dailyLogLoading) {
    return <PageLoader />;
  }

  const theme = createTheme({
    palette: {
      primary: {
        main: `rgba(${hexToRgb(mainColor)}, 0.8)`,
        contrastText: textColor ?? "#FFFFFF",
        light: `rgba(${hexToRgb(mainColor)}, 0.1)`,
        dark: `rgba(${hexToRgb(mainColor)}, 1)`,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <OrganizationLocalizationProvider
        organizationId={organizationId}
        organizationType={organizationType}
      >
        <ClientReportPreviewContent
          report={report}
          dailyLog={dailyLog}
          isReportUnavailable={isReportUnavailable}
          isDailyLogPreview={isDailyLogPreview}
          organizationId={organizationId}
        />
      </OrganizationLocalizationProvider>
    </ThemeProvider>
  );
};

const ClientReportExternalPage = () => (
  <OrganizationDetailsProvider>
    <ClientReportPreview />
  </OrganizationDetailsProvider>
);

export default ClientReportExternalPage;
