import { CardLayout } from "@/components/layout/CardLayout";
import { UIPrimaryContainedButton } from "@/features/components/HelperComponents/UIPrimaryContainedButton";
import { UISecondaryOutlinedButton } from "@/features/components/HelperComponents/UISecondaryOutlinedButton";
import LeadCaptureV2PreferredSlots from "../LeadCaptureV2PreferredSlots";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LeadCaptureV2StepFlowConfig } from "../../leadCaptureV2StepFlowConfig";
import { getStepFlowLabel } from "../../leadCaptureV2StepFlowConfig";

type LeadCaptureV2CustomerPreviewSlotSetupProps = {
  isExternalPage?: boolean;
  stepFlowConfig: LeadCaptureV2StepFlowConfig;
  disabled?: boolean;
  organizationId?: string;
  organizationType?: string;
  onBack?: () => void;
  showBack?: boolean;
  onContinue?: () => void;
  isContinueDisabled?: boolean;
  isContinueLoading?: boolean;
};

const LeadCaptureV2CustomerPreviewSlotSetup = ({
  isExternalPage = false,
  stepFlowConfig,
  disabled = false,
  organizationId,
  organizationType,
  onBack,
  showBack = true,
  onContinue,
  isContinueDisabled = false,
  isContinueLoading = false,
}: LeadCaptureV2CustomerPreviewSlotSetupProps) => {
  const { t } = useTranslation();
  const title = getStepFlowLabel("slotSetup", stepFlowConfig, t);

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
        display: "flex",
        flexDirection: "column",
        ...(isExternalPage && {
          flex: { xs: 1, sm: "initial" },
          borderRadius: { xs: 0, sm: 2 },
          border: { xs: 0, sm: "1px solid" },
          borderColor: { sm: "divider" },
        }),
      }}
    >
      <Stack
        spacing={0.5}
        sx={(theme) => ({
          width: "100%",
          minWidth: 0,
          px: isExternalPage ? { xs: 2.5, sm: 3 } : { xs: 2, sm: 3 },
          py: isExternalPage ? { xs: 2.25, sm: 2.5 } : { xs: 2, sm: 2.5 },
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: 1,
          borderColor: "divider",
        })}
      >
        <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: "break-word" }}>
          {title}
        </Typography>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: isExternalPage ? { xs: 2.5, sm: 3 } : { xs: 2, sm: 3 },
          py: isExternalPage ? { xs: 2.25, sm: 2.5 } : { xs: 2, sm: 2.5 },
        }}
      >
        <LeadCaptureV2PreferredSlots
          embedded
          disabled={disabled}
          organizationId={organizationId}
          organizationType={organizationType}
        />
      </Box>

      {(() => {
        const hasBack = showBack && Boolean(onBack);
        const hasContinue = Boolean(onContinue);
        const hasBothButtons = hasBack && hasContinue;

        return (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={
              hasBothButtons
                ? "space-between"
                : hasContinue
                  ? "stretch"
                  : "flex-start"
            }
            spacing={1.5}
            sx={{
              width: "100%",
              px: { xs: 2, sm: 2.5, md: 3 },
              py: isExternalPage ? { xs: 1.75, md: 2.5 } : { xs: 2, md: 2.5 },
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              position: { xs: "sticky", sm: "static" },
              bottom: 0,
              zIndex: 1,
            }}
          >
            {hasBack ? (
              <UISecondaryOutlinedButton
                fullWidth={!hasBothButtons}
                color="primary"
                disabled={isContinueLoading}
                startIcon={<ArrowLeft size={16} />}
                onClick={onBack}
                sx={{
                  width: hasBothButtons ? { xs: "50%", md: 160 } : "100%",
                  flex: hasBothButtons
                    ? { xs: "1 1 0", md: "0 0 160px" }
                    : "initial",
                  minWidth: 0,
                }}
              >
                {t("common.back")}
              </UISecondaryOutlinedButton>
            ) : null}
            {hasContinue ? (
              <UIPrimaryContainedButton
                fullWidth={!hasBothButtons}
                color="primary"
                loading={isContinueLoading}
                disabled={isContinueLoading || isContinueDisabled}
                endIcon={<ArrowRight size={16} />}
                onClick={onContinue}
                sx={{
                  width: hasBothButtons ? { xs: "50%", md: 160 } : "100%",
                  flex: hasBothButtons
                    ? { xs: "1 1 0", md: "0 0 160px" }
                    : "1 1 auto",
                  minWidth: 0,
                }}
              >
                {t("common.continue")}
              </UIPrimaryContainedButton>
            ) : null}
          </Stack>
        );
      })()}
    </CardLayout>
  );
};

export default LeadCaptureV2CustomerPreviewSlotSetup;
