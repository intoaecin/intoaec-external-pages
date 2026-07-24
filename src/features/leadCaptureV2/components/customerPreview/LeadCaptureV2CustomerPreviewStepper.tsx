import {
  Avatar,
  Box,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { leadCaptureV2PreviewStepLabelSx } from "./leadCaptureV2CustomerPreviewLayout";
import type { LeadCaptureV2PreviewStepperItem } from "./leadCaptureV2CustomerPreviewUtils";

type LeadCaptureV2CustomerPreviewStepperProps = {
  activeStepIndex: number;
  isExternalPage?: boolean;
  steps: LeadCaptureV2PreviewStepperItem[];
};

const LeadCaptureV2CustomerPreviewStepper = ({
  activeStepIndex,
  isExternalPage = false,
  steps,
}: LeadCaptureV2CustomerPreviewStepperProps) => {
  const { t } = useTranslation();
  const totalSteps = steps.length;
  const activeStep = steps[activeStepIndex] ?? steps[0];
  const progressValue = totalSteps
    ? ((activeStepIndex + 1) / totalSteps) * 100
    : 0;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        ...(isExternalPage && {
          px: { xs: 2.5, sm: 0 },
          pt: { xs: 1.5, sm: 0 },
          pb: { xs: 1.5, sm: 0 },
          bgcolor: { xs: "background.paper", sm: "transparent" },
        }),
      }}
    >
      <Stack
        spacing={1.25}
        sx={{
          display: { xs: "flex", lg: "none" },
          minWidth: 0,
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
          sx={{ minWidth: 0 }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            {t("leadCaptureV2.customerPreview.stepProgress", {
              current: activeStepIndex + 1,
              total: totalSteps,
            })}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              textAlign: "right",
              minWidth: 0,
              flex: 1,
            }}
          >
            {activeStep?.label}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progressValue}
          aria-label={t("leadCaptureV2.customerPreview.stepProgressAria", {
            current: activeStepIndex + 1,
            total: totalSteps,
          })}
          sx={(theme) => ({
            height: 6,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            "& .MuiLinearProgress-bar": {
              borderRadius: 1,
              bgcolor: "primary.main",
            },
          })}
        />
      </Stack>

      <Box
        sx={{
          display: { xs: "none", lg: "grid" },
          gridTemplateColumns: `repeat(${Math.max(totalSteps, 1)}, minmax(0, 1fr))`,
          gap: { lg: 1, xl: 1.5 },
          alignItems: "start",
          minWidth: 0,
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isComplete = index < activeStepIndex;
          const isLeftConnectorComplete = index <= activeStepIndex;
          const isRightConnectorComplete = index < activeStepIndex;

          return (
            <Stack
              key={step.stepKey}
              spacing={1}
              alignItems="center"
              sx={{ minWidth: 0 }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={{ lg: 0.75, xl: 1 }}
                sx={{ width: "100%", minWidth: 0 }}
              >
                {index > 0 ? (
                  <Divider
                    sx={{
                      flex: 1,
                      minWidth: 8,
                      borderColor: isLeftConnectorComplete ? "primary.main" : "divider",
                    }}
                  />
                ) : (
                  <Box sx={{ flex: 1, minWidth: 8 }} />
                )}
                <Avatar
                  sx={(theme) => ({
                    width: { lg: 32, xl: 36 },
                    height: { lg: 32, xl: 36 },
                    flexShrink: 0,
                    bgcolor: isActive
                      ? "primary.main"
                      : isComplete
                        ? alpha(theme.palette.primary.main, 0.16)
                        : "action.hover",
                    color: isActive
                      ? "primary.contrastText"
                      : isComplete
                        ? "primary.main"
                        : "text.secondary",
                    border: 1,
                    borderColor: isActive ? "primary.main" : "divider",
                  })}
                >
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    {index + 1}
                  </Typography>
                </Avatar>
                {index < totalSteps - 1 ? (
                  <Divider
                    sx={{
                      flex: 1,
                      minWidth: 8,
                      borderColor: isRightConnectorComplete ? "primary.main" : "divider",
                    }}
                  />
                ) : (
                  <Box sx={{ flex: 1, minWidth: 8 }} />
                )}
              </Stack>
              <Typography
                variant="caption"
                color={isActive ? "text.primary" : "text.secondary"}
                title={step.label}
                sx={{
                  ...leadCaptureV2PreviewStepLabelSx,
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {step.label}
              </Typography>
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
};

export default LeadCaptureV2CustomerPreviewStepper;
