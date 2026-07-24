import { CardLayout } from "@/components/layout/CardLayout";
import { TruncatedText } from "@/components_v2/TruncatedText";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ChevronRight, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LeadCaptureV2Service } from "../leadCaptureV2LayoutConfig";
import {
  getPreviewServiceName,
  getPreviewServiceTagline,
} from "./leadCaptureV2CustomerPreviewUtils";

type LeadCaptureV2CustomerPreviewServiceGridProps = {
  isExternalPage?: boolean;
  services: LeadCaptureV2Service[];
  emptyText?: string;
  selectedServiceIds?: string[];
  allowMultipleSelection?: boolean;
  onSelectService: (serviceId: string) => void;
};

const LeadCaptureV2CustomerPreviewServiceGrid = ({
  isExternalPage = false,
  services,
  emptyText,
  selectedServiceIds = [],
  allowMultipleSelection = false,
  onSelectService,
}: LeadCaptureV2CustomerPreviewServiceGridProps) => {
  const { t } = useTranslation();
  const resolvedEmptyText =
    emptyText ?? t("leadCaptureV2.customerPreview.noServices");

  if (services.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          px: isExternalPage ? { xs: 2, sm: 0 } : 0,
          py: isExternalPage ? { xs: 1.5, sm: 0 } : 0,
        }}
      >
        {resolvedEmptyText}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
        },
        alignContent: "start",
        gap: isExternalPage ? { xs: 1.25, sm: 1.5, md: 2 } : { xs: 1.5, md: 2 },
        width: "100%",
        height: "auto",
        minWidth: 0,
        overflowY: "visible",
        px: isExternalPage ? { xs: 2, sm: 0 } : 0,
        py: isExternalPage ? { xs: 1.5, sm: 0 } : 0,
      }}
    >
      {services.map((service) => {
        const serviceTagline = getPreviewServiceTagline(service);
        const isSelected = selectedServiceIds.includes(service.id);

        return (
          <CardLayout
            key={service.id}
            isClickable
            border
            boxShadow={0}
            padding={0}
            onClick={() => onSelectService(service.id)}
            sx={{
              bgcolor: "background.paper",
              overflow: "hidden",
              border: "1px solid",
              borderColor: isSelected ? "primary.main" : "divider",
              borderRadius: 2,
              transition: "border-color 150ms ease, box-shadow 150ms ease",
              "&:hover": {
                borderColor: "primary.main",
              },
              "&:active": {
                transform: "scale(0.99)",
              },
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                px: isExternalPage ? { xs: 2.5, sm: 2.5 } : { xs: 2, sm: 2.5 },
                py: isExternalPage
                  ? { xs: 2.25, sm: 2.25 }
                  : { xs: 2, sm: 2.25 },
              }}
            >
              <Avatar
                sx={(theme) => ({
                  width: { xs: 44, sm: 48 },
                  height: { xs: 44, sm: 48 },
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  flexShrink: 0,
                })}
              >
                <Typography variant="body1" sx={{ lineHeight: 1 }}>
                  {service.icon}
                </Typography>
              </Avatar>
              <Stack spacing={0.35} sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500, minWidth: 0 }}>
                  <TruncatedText
                    text={getPreviewServiceName(service, t)}
                    useEllipsis
                    maxWidth="100%"
                  />
                </Typography>
                {serviceTagline ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 0 }}
                  >
                    <TruncatedText
                      text={serviceTagline}
                      useEllipsis
                      maxWidth="100%"
                    />
                  </Typography>
                ) : null}
              </Stack>
              <Box
                sx={(theme) => ({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  flexShrink: 0,
                  bgcolor: isSelected
                    ? "primary.main"
                    : alpha(theme.palette.primary.main, 0.08),
                  color: isSelected ? "primary.contrastText" : "primary.main",
                })}
              >
                {allowMultipleSelection && isSelected ? (
                  <Check size={18} aria-hidden />
                ) : (
                  <ChevronRight size={18} aria-hidden />
                )}
              </Box>
            </Stack>
          </CardLayout>
        );
      })}
    </Box>
  );
};

export default LeadCaptureV2CustomerPreviewServiceGrid;
