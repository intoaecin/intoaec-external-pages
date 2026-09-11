import FallbackExternalPage from "@/components/FallbackExternalPage";
import PageLoader from "@/features/components/Loader/PageLoader";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import LeadCaptureV2CustomerPreview from "./components/customerPreview/LeadCaptureV2CustomerPreview";
import type {
  LeadCaptureV2PreviewAnswer,
  LeadCaptureV2SubmitContext,
} from "./components/customerPreview/leadCaptureV2CustomerPreviewTypes";
import { useProjectTypesQuery } from "@/features/hooks/api/useProjectTypesQuery";
import { useLeadCaptureV2ExternalForm } from "./hooks/useLeadCaptureV2ExternalForm";
import {
  buildLeadCaptureV2SubmissionPayloadFromAnswers,
  buildLeadCapturePayloadFromAnswers,
  collectLeadCaptureV2SubmitFields,
  shouldCreateLeadForLeadCaptureV2FormType,
} from "./leadCaptureV2ExternalSubmit";
import { isLeadCaptureV2SuccessResponse } from "./api/leadCaptureV2Response";
import { getEnabledConfigurableSteps } from "./leadCaptureV2StepFlowConfig";
import { isLeadCaptureV2SlotSetupComplete } from "./leadCaptureV2SlotSetup";
import {
  LEAD_CAPTURE_V2_MOBILE_FIELD,
  matchesLeadCaptureV2FieldName,
} from "./leadCaptureV2LockedFields";

const LeadCaptureV2ExternalCapture = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const organization = useOrganization();
  const { logoUrl, organizationName, websiteUrl } = organization;
  const {
    VITE_LEADMANAGER_ENDPOINT,
  } = useEnv();
  const { post: createLead } = useAxios(
    `${VITE_LEADMANAGER_ENDPOINT}/lead-capture`,
    false,
  );
  const {
    loading,
    error,
    parsedForm,
    services,
    leadCaptureV2Id,
    organizationId,
    organizationType,
  } = useLeadCaptureV2ExternalForm(organization);
  const { data: projectTypes = [] } = useProjectTypesQuery({
    organizationId: organizationId ?? undefined,
    organizationType: organizationType ?? undefined,
    enabled: Boolean(organizationId && organizationType),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBeforeThankYou = useCallback(
    async (
      answers: Record<string, LeadCaptureV2PreviewAnswer>,
      submitContext: LeadCaptureV2SubmitContext,
    ): Promise<boolean> => {
      if (!parsedForm || !organizationId || !organizationType) {
        toast.error(t("toast.somethingWentWrong"));
        return false;
      }

      if (isSubmitting) {
        return false;
      }

      const submitFields = collectLeadCaptureV2SubmitFields(
        parsedForm.fields,
        parsedForm.serviceFieldsByServiceId,
      );

      const slotSetupEnabled = getEnabledConfigurableSteps(
        parsedForm.stepFlowConfig,
      ).some((step) => step.stepId === "slotSetup");
      const shouldCreateLead = shouldCreateLeadForLeadCaptureV2FormType(
        parsedForm.formType,
      );

      if (slotSetupEnabled && !isLeadCaptureV2SlotSetupComplete()) {
        toast.error(
          t("leadCaptureV2.customerPreview.slotSetupRequired", {
            defaultValue: "Please choose a date and time slot before submitting.",
          }),
        );
        return false;
      }

      const payloadParams = {
        answers,
        fields: submitFields,
        formType: parsedForm.formType,
        leadCaptureV2Id: leadCaptureV2Id ?? undefined,
        selectedServiceTypeId: submitContext.selectedServiceId,
        selectedServiceType: submitContext.selectedServiceType,
        services,
        dimensionUnitsByFieldId: submitContext.dimensionUnitsByFieldId,
        organizationId,
        organizationName,
        organizationType,
        projectSource: router.query.projectSource
          ? String(router.query.projectSource)
          : "Leadcapture",
        includeSlotSetup: slotSetupEnabled,
        projectTypes,
        useDefaultProjectTypeWhenMissing: shouldCreateLead,
      };
      const payload: any = shouldCreateLead
        ? buildLeadCapturePayloadFromAnswers(payloadParams)
        : buildLeadCaptureV2SubmissionPayloadFromAnswers(payloadParams);

      if (router.query.email) {
        payload.leadEmail = payload.leadEmail || String(router.query.email);
      }
      if (router.query.phone) {
        payload.leadMobile = payload.leadMobile || String(router.query.phone);
      }
      if (router.query.leadId) {
        payload.leadId = String(router.query.leadId);
      }
      if (router.query.projectId) {
        payload.projectId = String(router.query.projectId);
      }
      if (router.query.sentHistoryId) {
        payload.sentHistoryId = String(router.query.sentHistoryId);
      }

      const mobileField = submitFields.find(
        (field) =>
          field.typeKey === "phone" &&
          matchesLeadCaptureV2FieldName(field, [
            LEAD_CAPTURE_V2_MOBILE_FIELD,
            "Mobile",
            "Phone Number",
          ]),
      );
      const isMobileRequired = mobileField ? (mobileField.enabled && mobileField.required) : false;

      if (shouldCreateLead && (!payload.leadName || (isMobileRequired && !payload.leadMobile))) {
        toast.error(
          !payload.leadName && isMobileRequired && !payload.leadMobile
            ? t("leadCaptureV2.customerPreview.missingRequiredLeadFields", {
                defaultValue:
                  "Please complete your name and mobile number before submitting.",
              })
            : !payload.leadName
              ? t("leadCaptureV2.customerPreview.missingRequiredNameField", {
                  defaultValue: "Please complete your name before submitting.",
                })
              : t("leadCaptureV2.customerPreview.missingRequiredMobileField", {
                  defaultValue: "Please complete your mobile number before submitting.",
                })
        );
        return false;
      }

      setIsSubmitting(true);
      try {
        const response = await createLead(payload);
        if (
          shouldCreateLead
            ? response?.code !== "LEAD_CREATED"
            : !isLeadCaptureV2SuccessResponse(response)
        ) {
          toast.error(t("toast.somethingWentWrong"));
          return false;
        }

        return true;
      } catch {
        toast.error(t("toast.somethingWentWrong"));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      createLead,
      isSubmitting,
      organizationId,
      organizationName,
      organizationType,
      parsedForm,
      services,
      leadCaptureV2Id,
      parsedForm?.stepFlowConfig,
      projectTypes,
      router.query.projectSource,
      t,
    ],
  );

  if (loading) {
    return <PageLoader />;
  }

  if (error || !parsedForm) {
    return (
      <FallbackExternalPage
        title={t("externalFallback.leadCaptureV2.title")}
        description={t("externalFallback.leadCaptureV2.description")}
      />
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: { xs: 8, md: 12 },
          right: { xs: 8, md: 12 },
          zIndex: 2,
        }}
      >
        <LanguageSwitcher />
      </Box>
      {logoUrl ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: { xs: 2, md: 3 },
            px: 2,
          }}
        >
          <Box
            component={websiteUrl ? "a" : "div"}
            {...(websiteUrl
              ? {
                  href: websiteUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                }
              : {})}
            sx={{
              display: "inline-flex",
              cursor: websiteUrl ? "pointer" : "default",
              textDecoration: "none",
            }}
          >
            <Box
              component="img"
              src={logoUrl}
              alt={organizationName ?? "Organization logo"}
              sx={{
                width: 160,
                height: 48,
                objectFit: "contain",
              }}
            />
          </Box>
        </Box>
      ) : null}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <LeadCaptureV2CustomerPreview
          fields={parsedForm.fields}
          formName={parsedForm.formName}
          formTitle={parsedForm.formTitle}
          formType={parsedForm.formType}
          formDescription={parsedForm.formDescription}
          services={services}
          serviceFieldsByServiceId={parsedForm.serviceFieldsByServiceId}
          stepFlowConfig={parsedForm.stepFlowConfig}
          organizationId={organizationId ?? undefined}
          organizationType={organizationType}
          leadCaptureV2Id={leadCaptureV2Id ?? undefined}
          onBeforeThankYou={handleBeforeThankYou}
          isContinueLoading={isSubmitting}
          isExternalPage
        />
      </Box>
    </Box>
  );
};

export default LeadCaptureV2ExternalCapture;
