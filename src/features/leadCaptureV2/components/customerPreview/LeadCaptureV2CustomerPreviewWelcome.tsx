import { CardLayout } from "@/components/layout/CardLayout";
import WavingHandOutlinedIcon from "@mui/icons-material/WavingHandOutlined";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
type LeadCaptureV2CustomerPreviewWelcomeProps = {
  description?: string;
  dense?: boolean;
  isExternalPage?: boolean;
  title: string;
};

const LeadCaptureV2CustomerPreviewWelcome = ({
  dense = false,
  description = "",
  isExternalPage = false,
  title,
}: LeadCaptureV2CustomerPreviewWelcomeProps) => {
  const { t } = useTranslation();
  const resolvedDescription = description.trim();

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
        spacing={dense ? 1.25 : 2}
        alignItems="center"
        sx={(theme) => ({
          width: "100%",
          minWidth: 0,
          px: isExternalPage
            ? { xs: 2.5, sm: 3, md: 3.5, lg: 4 }
            : { xs: 2, sm: 3, md: 3.5, lg: 4 },
          py: dense
            ? isExternalPage
              ? { xs: 2.5, sm: 3, lg: 3.5 }
              : { xs: 2.5, sm: 3, lg: 3.5 }
            : isExternalPage
              ? { xs: 3, sm: 4, lg: 5 }
              : { xs: 3.5, sm: 4, lg: 5 },
          flex: isExternalPage ? "0 0 auto" : undefined,
          justifyContent: "flex-start",
          textAlign: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        })}
      >
        <Box
          sx={(theme) => ({
            width: dense
              ? { xs: 56, sm: 60 }
              : isExternalPage
                ? { xs: 72, sm: 64 }
                : 64,
            height: dense
              ? { xs: 56, sm: 60 }
              : isExternalPage
                ? { xs: 72, sm: 64 }
                : 64,
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: "primary.main",
            "& .MuiSvgIcon-root": {
              fontSize: dense
                ? { xs: 26, sm: 28 }
                : isExternalPage
                  ? { xs: 34, sm: 24 }
                  : 24,
            },
          })}
        >
          <WavingHandOutlinedIcon />
        </Box>
        <Stack spacing={1} alignItems="center" sx={{ width: "100%", minWidth: 0 }}>
          <Typography
            variant={dense || isExternalPage ? "h6" : "body1"}
            sx={{ fontWeight: 500, wordBreak: "break-word", width: "100%" }}
          >
            {title}
          </Typography>
          {resolvedDescription ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                maxWidth: isExternalPage ? { xs: 310, sm: "100%" } : "100%",
                width: "100%",
                wordBreak: "break-word",
              }}
            >
              {resolvedDescription}
            </Typography>
          ) : null}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word", width: "100%" }}>
          {t("leadCaptureV2.customerPreview.welcomeHint")}
        </Typography>
      </Stack>
    </CardLayout>
  );
};

export default LeadCaptureV2CustomerPreviewWelcome;
