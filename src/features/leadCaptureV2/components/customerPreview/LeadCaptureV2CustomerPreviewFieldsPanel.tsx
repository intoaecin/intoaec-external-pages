import { CardLayout } from "@/components/layout/CardLayout";
import { UIPrimaryContainedButton } from "@/features/components/HelperComponents/UIPrimaryContainedButton";
import { UISecondaryOutlinedButton } from "@/features/components/HelperComponents/UISecondaryOutlinedButton";
import { Box, Collapse, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProjectType } from "@/types";
import type { LeadCaptureV2FormField } from "../leadCaptureV2LayoutConfig";
import LeadCaptureV2CustomerPreviewFieldInput from "./LeadCaptureV2CustomerPreviewFieldInput";
import type {
  LeadCaptureV2PreviewAnswer,
  LeadCaptureV2PreviewServiceFieldGroup,
} from "./leadCaptureV2CustomerPreviewTypes";
import {
  getPreviewFieldTitle,
  getPreviewServiceName,
  getPreviewServiceTagline,
} from "./leadCaptureV2CustomerPreviewUtils";
import { PlateContentStatic } from "@/components/PlateContentStatic";
import { toPlateTermsEditorValue } from "@/utils/plateTermsValue";

type LeadCaptureV2CustomerPreviewFieldsPanelProps = {
  answers: Record<string, LeadCaptureV2PreviewAnswer>;
  dimensionUnitsByFieldId?: Record<string, string>;
  emptyText: string;
  fieldsToRender?: LeadCaptureV2FormField[];
  serviceFieldGroups?: LeadCaptureV2PreviewServiceFieldGroup[];
  projectTypes?: ProjectType[];
  isLoadingProjectTypes?: boolean;
  organizationId?: string;
  organizationType?: string;
  leadCaptureV2Id?: string;
  onAnswerChange: (
    fieldId: string,
    nextAnswer: LeadCaptureV2PreviewAnswer,
  ) => void;
  onDimensionUnitChange?: (fieldId: string, nextUnit: string) => void;
  onFieldVerifiedChange: (fieldId: string, verified: boolean) => void;
  verifiedFieldIds: ReadonlySet<string>;
  onBack?: () => void;
  showBack?: boolean;
  onContinue?: () => void;
  isContinueDisabled?: boolean;
  isContinueLoading?: boolean;
  isExternalPage?: boolean;
  subtitle?: string;
  title: string;
};
const EMPTY_FIELDS: LeadCaptureV2FormField[] = [];
const EMPTY_SERVICE_GROUPS: LeadCaptureV2PreviewServiceFieldGroup[] = [];

const LeadCaptureV2CustomerPreviewFieldsPanel = ({
  answers,
  dimensionUnitsByFieldId = {},
  emptyText,
  fieldsToRender = EMPTY_FIELDS,
  serviceFieldGroups = EMPTY_SERVICE_GROUPS,
  projectTypes = [],
  isLoadingProjectTypes = false,
  organizationId,
  organizationType,
  leadCaptureV2Id,
  onAnswerChange,
  onDimensionUnitChange,
  onFieldVerifiedChange,
  verifiedFieldIds,
  onBack,
  showBack = true,
  onContinue,
  isContinueDisabled = false,
  isContinueLoading = false,
  isExternalPage = false,
  subtitle,
  title,
}: LeadCaptureV2CustomerPreviewFieldsPanelProps) => {
  const { t } = useTranslation();
  const resolvedFieldsToRender =
    fieldsToRender.length > 0
      ? fieldsToRender
      : serviceFieldGroups.flatMap((group) => group.fields);
  const hasGroupedContent = serviceFieldGroups.length > 0;
  const [expandedServiceIds, setExpandedServiceIds] = useState<Set<string>>(
    () => new Set(),
  );

  const serviceIdsString = (serviceFieldGroups || []).map((group) => group.service.id).join(",");

  useEffect(() => {
    setExpandedServiceIds(
      new Set((serviceFieldGroups || []).map((group) => group.service.id)),
    );
  }, [serviceIdsString]);

  const toggleServiceExpanded = (serviceId: string) => {
    setExpandedServiceIds((currentExpandedIds) => {
      const nextExpandedIds = new Set(currentExpandedIds);
      if (nextExpandedIds.has(serviceId)) {
        nextExpandedIds.delete(serviceId);
      } else {
        nextExpandedIds.add(serviceId);
      }
      return nextExpandedIds;
    });
  };

  const renderField = (field: LeadCaptureV2FormField) => (
    <Stack
      key={field.id}
      spacing={1.25}
      sx={{
        px: isExternalPage ? { xs: 2.5, sm: 3 } : { xs: 2, sm: 3 },
        py: isExternalPage ? { xs: 2.25, sm: 2.25 } : { xs: 2, sm: 2.25 },
      }}
    >
      <Stack spacing={0.5} sx={{ minWidth: 0, width: "100%" }}>
        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: "break-word" }}>
          {getPreviewFieldTitle(field, t)}
          {field.required ? (
            <Typography
              component="span"
              color="error.main"
              aria-hidden="true"
              sx={{ ml: 0.5 }}
            >
              *
            </Typography>
          ) : null}
        </Typography>
        {field.description ? (
          field.typeKey === "terms" ? (
            <PlateContentStatic
              value={toPlateTermsEditorValue(field.description)}
              style={{ fontSize: "0.875rem", color: "text.secondary", maxHeight: "200px", overflowY: "auto" }}
            />
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>
              {field.description}
            </Typography>
          )
        ) : null}
      </Stack>
      <LeadCaptureV2CustomerPreviewFieldInput
        field={field}
        answer={answers[field.id]}
        dimensionUnit={dimensionUnitsByFieldId[field.id]}
        projectTypes={projectTypes}
        isLoadingProjectTypes={isLoadingProjectTypes}
        organizationId={organizationId}
        organizationType={organizationType}
        leadCaptureV2Id={leadCaptureV2Id}
        isVerified={verifiedFieldIds.has(field.id)}
        onAnswerChange={onAnswerChange}
        onDimensionUnitChange={onDimensionUnitChange}
        onFieldVerifiedChange={onFieldVerifiedChange}
      />
    </Stack>
  );

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
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
            {subtitle}
          </Typography>
        ) : null}
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {resolvedFieldsToRender.length > 0 ? (
          hasGroupedContent ? (
            <Stack divider={<Divider />}>
              {serviceFieldGroups.map((group) => {
                const serviceTagline = getPreviewServiceTagline(group.service);
                const isExpanded = expandedServiceIds.has(group.service.id);

                return (
                  <Stack key={group.service.id} divider={<Divider />}>
                    <Box
                      component="button"
                      type="button"
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded
                          ? t("common.collapse")
                          : t("common.expand")
                      }
                      onClick={() => toggleServiceExpanded(group.service.id)}
                      sx={{
                        display: "block",
                        width: "100%",
                        px: isExternalPage
                          ? { xs: 2.5, sm: 3 }
                          : { xs: 2, sm: 3 },
                        py: isExternalPage
                          ? { xs: 2.25, sm: 2.25 }
                          : { xs: 2, sm: 2.25 },
                        bgcolor: "action.hover",
                        border: 0,
                        cursor: "pointer",
                        textAlign: "left",
                        font: "inherit",
                        color: "inherit",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                        justifyContent="space-between"
                      >
                        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: "break-word" }}>
                            {getPreviewServiceName(group.service, t)}
                          </Typography>
                          {serviceTagline ? (
                            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                              {serviceTagline}
                            </Typography>
                          ) : null}
                        </Stack>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: "text.secondary",
                            mt: 0.25,
                          }}
                        >
                          <ChevronDown
                            size={18}
                            aria-hidden
                            style={{
                              transform: isExpanded
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "transform 160ms ease",
                            }}
                          />
                        </Box>
                      </Stack>
                    </Box>
                    <Collapse in={isExpanded} timeout={160}>
                      <Stack divider={<Divider />}>
                        {group.fields.map((field) => renderField(field))}
                      </Stack>
                    </Collapse>
                  </Stack>
                );
              })}
            </Stack>
          ) : (
            <Stack divider={<Divider />}>
              {resolvedFieldsToRender.map((field) => renderField(field))}
            </Stack>
          )
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ px: 2, py: 5, textAlign: "center" }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
              {emptyText}
            </Typography>
          </Stack>
        )}
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

export default LeadCaptureV2CustomerPreviewFieldsPanel;
