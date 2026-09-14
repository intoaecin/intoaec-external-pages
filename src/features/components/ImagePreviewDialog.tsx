import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

type ImagePreviewDialogProps = {
  open: boolean;
  imageSrc?: string;
  fileName?: string;
  closeLabel: string;
  downloadLabel?: string;
  onClose: () => void;
  onDownload?: () => void;
};

const ImagePreviewDialog = ({
  open,
  imageSrc,
  fileName,
  closeLabel,
  downloadLabel,
  onClose,
  onDownload,
}: ImagePreviewDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      transitionDuration={0}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          pr: 1,
        }}
      >
        <Typography
          title={fileName}
          sx={{
            color: "text.secondary",
            fontSize: { xs: 16, sm: 18 },
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {fileName}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {onDownload && (
            <IconButton
              size="small"
              sx={{ color: "primary.main" }}
              title={downloadLabel}
              aria-label={downloadLabel}
              onClick={onDownload}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            title={closeLabel}
            aria-label={closeLabel}
            onClick={onClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0, bgcolor: "background.default" }}>
        {imageSrc && (
          <Box
            component="img"
            src={imageSrc}
            alt={fileName}
            sx={{
              display: "block",
              width: "100%",
              maxHeight: "75vh",
              objectFit: "contain",
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
