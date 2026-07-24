import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { LEAD_CAPTURE_V2_PREVIEW_CONTENT_MAX_WIDTH } from "./leadCaptureV2CustomerPreviewTypes";

type LeadCaptureV2CustomerPreviewHeroProps = {
  description?: string;
  title: string;
};

const LeadCaptureV2CustomerPreviewHero = ({
  description = "",
  title,
}: LeadCaptureV2CustomerPreviewHeroProps) => {
  const resolvedDescription = description.trim();

  return (
  <Box
    sx={(theme) => ({
      width: "100%",
      maxWidth: LEAD_CAPTURE_V2_PREVIEW_CONTENT_MAX_WIDTH,
      px: { xs: 2, sm: 3 },
      py: { xs: 2.5, sm: 3, md: 3.5 },
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      bgcolor: alpha(theme.palette.primary.main, 0.04),
      textAlign: "center",
    })}
  >
    <Stack spacing={1.25} alignItems="center" sx={{ width: "100%", minWidth: 0 }}>
      <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: "break-word", width: "100%" }}>
        {title}
      </Typography>
      {resolvedDescription ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 520, mx: "auto", wordBreak: "break-word", width: "100%" }}
        >
          {resolvedDescription}
        </Typography>
      ) : null}
    </Stack>
  </Box>
  );
};

export default LeadCaptureV2CustomerPreviewHero;
