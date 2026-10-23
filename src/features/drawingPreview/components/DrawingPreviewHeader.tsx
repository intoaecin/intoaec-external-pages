import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import DownloadIcon from "@/assets/icons/download-icon";
import Autocomplete from "@/components_v2/Autocomplete";
import { TruncatedText } from "@/components_v2/TruncatedText";
import { formatDate } from "@/lib/helpers";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";

interface DrawingPreviewHeaderProps {
  leadFileId: string;
  fileName: string;
  versionNumber?: number;
  /** Versions the client was sent; the select shows when there is more than one */
  fileVersions?: Array<{ leadFileId: string; versionNumber: number; sentAt?: number | null }>;
  /** Omitted when the file does not allow downloads */
  onDownload?: () => void;
  canDownload: boolean;
  isDownloading: boolean;
  /** The client's decision (or superseded), shown beside the file name like an estimate's status */
  statusBadge?: ReactNode;
  /** Accept / reject controls while the request is open */
  decisionActions?: ReactNode;
}

export function DrawingPreviewHeader({
  leadFileId,
  fileName,
  versionNumber,
  fileVersions = [],
  onDownload,
  canDownload,
  isDownloading,
  statusBadge,
  decisionActions,
}: DrawingPreviewHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { logoUrl } = useOrganization();
  // The sent date, under each version, explains gaps in the numbering: unsent versions are never listed.
  const versionOptions = fileVersions.map((version) => ({
    label: t("drawingPreview.version", { version: version.versionNumber }),
    value: version.leadFileId,
    description: version.sentAt
      ? t("drawingPreview.receivedOn", {
          date: formatDate(String(version.sentAt)),
          // React escapes the text; i18next escaping would show "/" as "&#x2F;".
          interpolation: { escapeValue: false },
        })
      : undefined,
  }));
  const handleVersionChange = (nextLeadFileId?: string) => {
    if (!nextLeadFileId || nextLeadFileId === leadFileId) return;
    // Each version has its own share link; keep any other query params.
    void router.push({
      pathname: router.pathname,
      query: { ...router.query, leadFileId: nextLeadFileId },
    });
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        // Same height and padding as the other external pages' headers.
        px: { xs: 2, md: 3 },
        py: { xs: 1.5, md: 2 },
        minHeight: { xs: 64, md: 72 },
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {logoUrl && (
        <Box
          component="img"
          src={logoUrl}
          alt=""
          sx={{ height: 32, width: "auto", objectFit: "contain" }}
        />
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          {/* Long names stop at half the header and show in full on hover. */}
          <Typography variant="body1" noWrap sx={{ fontWeight: 500, minWidth: 0, maxWidth: "50%" }}>
            <TruncatedText text={fileName} useEllipsis />
          </Typography>
          {statusBadge && <Box sx={{ flexShrink: 0 }}>{statusBadge}</Box>}
        </Box>
        {versionNumber && versionOptions.length <= 1 && (
          <Typography variant="caption" color="text.secondary">
            {t("drawingPreview.version", { version: versionNumber })}
          </Typography>
        )}
      </Box>
      {versionOptions.length > 1 && (
        <Box sx={{ width: 120, flexShrink: 0 }}>
          <Autocomplete
            options={versionOptions}
            value={leadFileId}
            size="small"
            disableClearable
            disableSearch
            showSelectedInList
            // Same select width as the internal viewer; the list widens so each received date fits.
            listMinWidth={200}
            onChange={handleVersionChange}
          />
        </Box>
      )}
      <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, gap: 1 }}>
        {decisionActions}
        {onDownload && (
          <Tooltip title={t("tooltips.downloadAsPdf")} arrow>
            <span>
              <IconButton
                onClick={onDownload}
                disabled={!canDownload || isDownloading}
                aria-label={t("tooltips.downloadAsPdf")}
              >
                {isDownloading ? (
                  <CircularProgress size={16} />
                ) : (
                  <DownloadIcon style={{ width: "25px" }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        )}
        <LanguageSwitcher />
      </Box>
    </Box>
  );
}
