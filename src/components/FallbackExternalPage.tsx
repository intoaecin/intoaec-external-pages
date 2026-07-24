import { CardLayout } from "@/components/layout/CardLayout";
import { UIPrimaryContainedButton } from "@/features/components/HelperComponents/UIPrimaryContainedButton";
import { Box, Stack, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, FileX2, RefreshCcw, Search, X } from "lucide-react";

interface FallbackExternalPageProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onRefresh?: () => void;
}

const FallbackExternalPage: React.FC<FallbackExternalPageProps> = ({
  title,
  description,
  buttonText,
  onRefresh,
}) => {
  const { t } = useTranslation();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
        backgroundColor: "background.default",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 980 }}>
        <CardLayout isClickable={false} padding={0} border>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              minHeight: { xs: 520, md: 420 },
              overflow: "hidden",
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                position: "relative",
                flex: { xs: "0 0 auto", md: "0 0 40%" },
                minHeight: { xs: 220, md: "auto" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: (theme) => theme.palette.grey[100],
                px: { xs: 2, md: 3 },
                py: { xs: 3, md: 2 },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 180, sm: 220 },
                  height: { xs: 180, sm: 220 },
                  borderRadius: 2,
                  backgroundColor: (theme) => theme.palette.grey[200],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileX2 size={72} color="currentColor" />
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  right: { xs: 24, md: 32 },
                  top: { xs: 16, md: 24 },
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor: "error.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: "rotate(10deg)",
                  boxShadow: 1,
                }}
              >
                <X size={18} color="#fff" />
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  left: { xs: 24, md: 32 },
                  bottom: { xs: 16, md: 24 },
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor: "success.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: "rotate(-8deg)",
                  boxShadow: 1,
                }}
              >
                <Search size={18} color="currentColor" />
              </Box>
            </Box>

            <Box
              sx={{
                flex: 1,
                px: { xs: 2.5, sm: 4 },
                py: { xs: 3, sm: 4 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 2,
                backgroundColor: "background.paper",
              }}
            >
              <Box
                sx={{
                  width: "fit-content",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 999,
                  backgroundColor: "error.main",
                  color: "#fff",
                }}
              >
                <AlertCircle size={14} color="#fff" />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, letterSpacing: 0.6 }}
                >
                  {t("externalFallback.badge")}
                </Typography>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  color: "text.primary",
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {title ?? t("externalFallback.title")}
              </Typography>

              <Typography
                variant="body1"
                sx={{ color: "text.secondary", maxWidth: 560 }}
              >
                {description ?? t("externalFallback.description")}
              </Typography>

              <Box sx={{ pt: 1.5 }}>
                <UIPrimaryContainedButton
                  onClick={handleRefresh}
                  startIcon={<RefreshCcw size={18} />}
                  sx={{ width: { xs: "100%", sm: 200 } }}
                >
                  {buttonText ?? t("externalFallback.refresh")}
                </UIPrimaryContainedButton>
              </Box>

              <Typography
                variant="caption"
                sx={{ color: "text.secondary", maxWidth: 560 }}
              >
                {t("externalFallback.footer")}
              </Typography>
            </Box>
          </Box>
        </CardLayout>
      </Box>
    </Box>
  );
};

export default FallbackExternalPage;
