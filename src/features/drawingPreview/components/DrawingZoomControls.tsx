import { Box, ButtonBase, IconButton, Tooltip } from "@mui/material";
import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DrawingZoomControlsProps {
  zoom: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function DrawingZoomControls({
  zoom,
  canZoomIn,
  canZoomOut,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: DrawingZoomControlsProps) {
  const { t } = useTranslation();
  const canReset = Math.abs(zoom - 1) > 0.001;

  return (
    <Box
      sx={{
        position: "fixed",
        left: "50%",
        bottom: 16,
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        bgcolor: "rgba(97, 97, 97, 0.7)",
        borderRadius: 1,
        boxShadow: 2,
        zIndex: 1000,
        p: 0.5,
      }}
    >
      <Tooltip title={t("drawingPreview.zoomOut")}>
        <span>
          <IconButton
            size="small"
            onClick={onZoomOut}
            disabled={!canZoomOut}
            aria-label={t("drawingPreview.zoomOut")}
            sx={{ color: "common.white" }}
          >
            <Minus size={16} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t("drawingPreview.resetZoom")}>
        <span>
          <ButtonBase
            type="button"
            disabled={!canReset}
            onClick={onZoomReset}
            aria-label={t("drawingPreview.resetZoom")}
            sx={{
              py: 0.5,
              px: 1,
              minWidth: 50,
              textAlign: "center",
              typography: "caption",
              fontWeight: 500,
              borderRadius: 1,
              color: "common.white",
            }}
          >
            {Math.round(zoom * 100)}%
          </ButtonBase>
        </span>
      </Tooltip>
      <Tooltip title={t("drawingPreview.zoomIn")}>
        <span>
          <IconButton
            size="small"
            onClick={onZoomIn}
            disabled={!canZoomIn}
            aria-label={t("drawingPreview.zoomIn")}
            sx={{ color: "common.white" }}
          >
            <Plus size={16} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
