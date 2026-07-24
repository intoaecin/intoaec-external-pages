import { UIPrimaryContainedButton } from "@/features/components/HelperComponents/UIPrimaryContainedButton";
import { UISecondaryOutlinedButton } from "@/features/components/HelperComponents/UISecondaryOutlinedButton";
import { CardLayout } from "@/components/layout/CardLayout";
import { Stack } from "@mui/material";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
type LeadCaptureV2CustomerPreviewFooterProps = {
  onBack?: () => void;
  onContinue?: () => void;
  showBack?: boolean;
  showContinue?: boolean;
  isContinueDisabled?: boolean;
  isContinueLoading?: boolean;
  isExternalPage?: boolean;
};

const LeadCaptureV2CustomerPreviewFooter = ({
  onBack,
  onContinue,
  showBack = true,
  showContinue = true,
  isContinueDisabled = false,
  isContinueLoading = false,
  isExternalPage = false,
}: LeadCaptureV2CustomerPreviewFooterProps) => {
  const { t } = useTranslation();
  const hasBack = showBack && Boolean(onBack);
  const hasContinue = showContinue && Boolean(onContinue);
  const hasBothButtons = hasBack && hasContinue;

  return (
    <CardLayout
      isClickable={false}
      border={false}
      boxShadow={0}
      padding={0}
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        ...(isExternalPage && {
          borderRadius: 0,
          border: 0,
        }),
      }}
    >
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
          px: hasBack || hasContinue ? { xs: 2, sm: 2.5, md: 3 } : 0,
          py: isExternalPage ? { xs: 1.75, md: 2.5 } : { xs: 2, md: 2.5 },
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
              ml: hasBothButtons ? "auto" : 0,
            }}
          >
            {t("common.continue")}
          </UIPrimaryContainedButton>
        ) : null}
      </Stack>
    </CardLayout>
  );
};

export default LeadCaptureV2CustomerPreviewFooter;
