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
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";

interface DrawingPreviewHeaderProps {
  leadFileId: string;
  fileName: string;
  versionNumber?: number;
  /** Versions the client was sent; the select shows when there is more than one */
  fileVersions?: Array<{ leadFileId: string; versionNumber: number }>;
  /** Omitted when the file does not allow downloads */
  onDownload?: () => void;
  canDownload: boolean;
  isDownloading: boolean;
  /** Accept / reject controls, or the client's decision once made */
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
  decisionActions,
}: DrawingPreviewHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { logoUrl } = useOrganization();
  const versionOptions = fileVersions.map((version) => ({
    label: t("drawingPreview.version", { version: version.versionNumber }),
    value: version.leadFileId,
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
        <Typography variant="body1" noWrap sx={{ fontWeight: 500 }}>
          {fileName}
        </Typography>
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
