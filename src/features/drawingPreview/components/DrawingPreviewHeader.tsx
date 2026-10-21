import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import DownloadIcon from "@/assets/icons/download-icon";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";

interface DrawingPreviewHeaderProps {
  fileName: string;
  versionNumber?: number;
  /** Omitted when the file does not allow downloads */
  onDownload?: () => void;
  canDownload: boolean;
  isDownloading: boolean;
  /** Accept / reject controls, or the client's decision once made */
  decisionActions?: ReactNode;
}

export function DrawingPreviewHeader({
  fileName,
  versionNumber,
  onDownload,
  canDownload,
  isDownloading,
  decisionActions,
}: DrawingPreviewHeaderProps) {
  const { t } = useTranslation();
  const { logoUrl } = useOrganization();

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        px: { xs: 1.5, sm: 3 },
        py: 1.5,
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
        {versionNumber && (
          <Typography variant="caption" color="text.secondary">
            {t("drawingPreview.version", { version: versionNumber })}
          </Typography>
        )}
      </Box>
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
