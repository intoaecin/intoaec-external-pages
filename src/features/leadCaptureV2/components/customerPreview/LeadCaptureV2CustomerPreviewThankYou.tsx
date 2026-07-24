import { CardLayout } from "@/components/layout/CardLayout";
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

type LeadCaptureV2CustomerPreviewThankYouProps = {
  isExternalPage?: boolean;
};

const LeadCaptureV2CustomerPreviewThankYou = ({
  isExternalPage = false,
}: LeadCaptureV2CustomerPreviewThankYouProps) => {
  const { t } = useTranslation();

  return (
    <CardLayout
      isClickable={false}
      border={!isExternalPage}
      boxShadow={0}
      padding={0}
      sx={{
        width: "100%",
        overflow: "hidden",
        bgcolor: "background.paper",
        ...(isExternalPage && {
          display: "flex",
          flexDirection: "column",
          flex: "0 0 auto",
          borderRadius: { xs: 0, sm: 2 },
          border: { xs: 0, sm: "1px solid" },
          borderColor: { sm: "divider" },
        }),
      }}
    >
      <Stack
        spacing={2}
        alignItems="center"
        sx={(theme) => ({
          px: isExternalPage ? { xs: 2.5, sm: 4 } : { xs: 2, sm: 4 },
          py: isExternalPage ? { xs: 3, sm: 5 } : { xs: 4, sm: 5 },
          flex: isExternalPage ? "0 0 auto" : undefined,
          justifyContent: "flex-start",
          textAlign: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        })}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <CelebrationOutlinedIcon />
        </Box>
        <Stack spacing={1} alignItems="center">
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {t("leadCaptureV2.thankYouPage.previewTitle")}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 520 }}
          >
            {t("leadCaptureV2.thankYouPage.previewDescription")}
          </Typography>
        </Stack>
      </Stack>
    </CardLayout>
  );
};

export default LeadCaptureV2CustomerPreviewThankYou;
