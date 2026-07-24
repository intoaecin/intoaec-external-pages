import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  ListItemText,
  OutlinedInput,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Upload, X } from "lucide-react";
import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { ProjectType } from "@/types";
import {
  formatLeadCaptureV2ProjectTypeLabel,
  getLeadCaptureV2ProjectTypeOptions,
  isLeadCaptureV2ProjectTypeField,
} from "../../leadCaptureV2ProjectTypeField";
import type { LeadCaptureV2FormField } from "../leadCaptureV2LayoutConfig";
import {
  parseLeadCaptureV2FileAnswer,
  serializeLeadCaptureV2FileAnswer,
  buildLeadCaptureV2UploadPath,
} from "../../leadCaptureV2FileAnswer";
import UISignatureUploader from "@/features/components/HelperComponents/UISignatureUploader";
import { useLeadCaptureV2FileUpload } from "../../hooks/useLeadCaptureV2FileUpload";
import { isLeadCaptureV2OtpEligibleField } from "../../leadCaptureV2OtpField";
import LeadCaptureV2OtpVerifiedFieldInput from "./LeadCaptureV2OtpVerifiedFieldInput";
import LeadCaptureV2CustomerPreviewDimensionInput from "./LeadCaptureV2CustomerPreviewDimensionInput";
import LeadCaptureV2CustomerPreviewPhoneInput from "./LeadCaptureV2CustomerPreviewPhoneInput";
import type { LeadCaptureV2PreviewAnswer } from "./leadCaptureV2CustomerPreviewTypes";
import { getPreviewFieldTitle } from "./leadCaptureV2CustomerPreviewUtils";
import {
  validateLeadCaptureV2Email,
  validateLeadCaptureV2Phone,
} from "../../validation/leadCaptureV2Validation";

const DROPDOWN_MENU_MAX_HEIGHT = 240;

type LeadCaptureV2CustomerPreviewFieldInputProps = {
  field: LeadCaptureV2FormField;
  answer: LeadCaptureV2PreviewAnswer | undefined;
  dimensionUnit?: string;
  projectTypes?: ProjectType[];
  isLoadingProjectTypes?: boolean;
  organizationId?: string;
  organizationType?: string;
  leadCaptureV2Id?: string;
  isVerified?: boolean;
  onAnswerChange: (
    fieldId: string,
    nextAnswer: LeadCaptureV2PreviewAnswer,
  ) => void;
  onDimensionUnitChange?: (fieldId: string, nextUnit: string) => void;
  onFieldVerifiedChange?: (fieldId: string, verified: boolean) => void;
};

const LeadCaptureV2CustomerPreviewFieldInput = ({
  field,
  answer,
  dimensionUnit,
  projectTypes = [],
  isLoadingProjectTypes = false,
  organizationId,
  organizationType,
  leadCaptureV2Id,
  isVerified = false,
  onAnswerChange,
  onDimensionUnitChange,
  onFieldVerifiedChange,
}: LeadCaptureV2CustomerPreviewFieldInputProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const signatureUploaderRef = useRef<any>(null);
  const { uploadFieldFile, isUploading, uploadingFieldId, canUpload } =
    useLeadCaptureV2FileUpload({
      organizationId,
      organizationType,
      leadCaptureV2Id,
    });
  const textAnswer = typeof answer === "string" ? answer : "";
  const fileAnswer =
    typeof answer === "string" ? parseLeadCaptureV2FileAnswer(answer) : null;
  const selectedOptions = Array.isArray(answer) ? answer : [];
  const isProjectTypeField = isLeadCaptureV2ProjectTypeField(field);
  const projectTypeOptions = useMemo(
    () => getLeadCaptureV2ProjectTypeOptions(projectTypes, t),
    [projectTypes, t],
  );
  const options = isProjectTypeField
    ? projectTypeOptions.map((option) => option.label)
    : (field.options ?? []).map((option) => option.label);
  const isEmailField = field.typeKey === "email";
  const isPhoneField = field.typeKey === "phone";
  const isNumberField = field.typeKey === "number";

  const hasValidationError = useMemo(() => {
    const trimmed = textAnswer.trim();
    if (trimmed.length === 0) return false;
    if (isEmailField) {
      return !validateLeadCaptureV2Email(trimmed);
    }
    if (isPhoneField) {
      return !validateLeadCaptureV2Phone(textAnswer);
    }
    return false;
  }, [textAnswer, isEmailField, isPhoneField]);

  const validationHelperText = useMemo(() => {
    if (!hasValidationError) return undefined;
    return isEmailField
      ? t("leadCaptureV2.customerPreview.invalidEmail", {
          defaultValue: "Enter a valid email address.",
        })
      : t("leadCaptureV2.customerPreview.invalidPhone", {
          defaultValue: "Enter a valid phone number.",
        });
  }, [hasValidationError, isEmailField, t]);

  if (field.typeKey === "esign") {
    const s3FilePath = leadCaptureV2Id
      ? buildLeadCaptureV2UploadPath({
          leadCaptureV2Id,
          fieldId: field.id,
          fileName: "signature.jpg",
        })
      : "";

    return (
      <Stack spacing={1}>
        {textAnswer ? (
          <Box
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              p: 2,
              bgcolor: "background.paper",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={textAnswer}
              alt="Signature"
              style={{ maxHeight: "80px", maxWidth: "100%", objectFit: "contain" }}
            />
          </Box>
        ) : null}

        <Button
          variant="outlined"
          fullWidth
          onClick={() => signatureUploaderRef.current?.handleOpen()}
        >
          {textAnswer
            ? t("leadCaptureV2.customerPreview.changeSignature", {
                defaultValue: "Change Signature",
              })
            : t("leadCaptureV2.customerPreview.signHere", {
                defaultValue: "Sign here",
              })}
        </Button>

        <UISignatureUploader
          ref={signatureUploaderRef}
          s3FilePath={s3FilePath}
          eventSource="LEAD_CAPTURE_V2"
          displayButtonName={getPreviewFieldTitle(field, t)}
          onChange={(url: string) => {
            onAnswerChange(field.id, url);
          }}
        />
      </Stack>
    );
  }

  if (field.typeKey === "terms") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
          ml: 0,
          pl: 0,
        }}
      >
        <Checkbox
          checked={textAnswer === "true" || textAnswer === "Accepted"}
          onChange={(event) => {
            onAnswerChange(field.id, event.target.checked ? "Accepted" : "");
          }}
          sx={{
            flexShrink: 0,
            p: 0,
            mr: 1,
          }}
        />
        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
          {t("leadCaptureV2.customerPreview.iAgreeToTerms", {
            defaultValue: "I agree to the terms and conditions",
          })}
        </Typography>
      </Box>
    );
  }

  if (field.typeKey === "yesNo") {
    const yesNoOptions =
      options.length > 0
        ? options
        : [
            t("common.yes", { defaultValue: "Yes" }),
            t("common.no", { defaultValue: "No" }),
          ];

    return (
      <ToggleButtonGroup
        exclusive
        size="small"
        value={textAnswer}
        onChange={(_, nextValue: string | null) => {
          if (nextValue) onAnswerChange(field.id, nextValue);
        }}
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${yesNoOptions.length}, minmax(0, 1fr))`,
          width: "100%",
          "& .MuiToggleButton-root": {
            py: 1,
            typography: "body2",
          },
        }}
      >
        {yesNoOptions.map((option) => (
          <ToggleButton key={option} value={option}>
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    );
  }

  if (
    field.typeKey === "dropdown" ||
    field.typeKey === "multiSelect" ||
    field.typeKey === "checkbox"
  ) {
    if (field.typeKey === "checkbox") {
      return (
        <Stack spacing={0.5}>
          {options.map((option) => (
            <FormControlLabel
              key={option}
              sx={{ alignItems: "flex-start", mx: 0 }}
              control={
                <Checkbox
                  checked={selectedOptions.includes(option)}
                  onChange={(event) => {
                    const nextOptions = event.target.checked
                      ? [...selectedOptions, option]
                      : selectedOptions.filter(
                          (selectedOption) => selectedOption !== option,
                        );
                    onAnswerChange(field.id, nextOptions);
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ pt: 0.75 }}>
                  {option}
                </Typography>
              }
            />
          ))}
        </Stack>
      );
    }

    if (isProjectTypeField && isLoadingProjectTypes) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 1 }}>
          <CircularProgress size={24} />
        </Stack>
      );
    }

    const selectOptions =
      isProjectTypeField && projectTypeOptions.length > 0
        ? projectTypeOptions
        : (field.options ?? []).map((option) => ({
            value: option.label,
            label: isProjectTypeField
              ? formatLeadCaptureV2ProjectTypeLabel(option.label, t)
              : option.label,
          }));

    const selectLabel = t("common.select", { defaultValue: "Select" });

    const renderSelectValue = (selected: unknown) => {
      if (field.typeKey === "multiSelect") {
        const values = selected as string[];
        if (values.length === 0) {
          return (
            <Typography component="span" variant="body2" color="text.secondary">
              {selectLabel}
            </Typography>
          );
        }
        return values.join(", ");
      }

      const selectedValue = String(selected ?? "");
      if (!selectedValue) {
        return (
          <Typography component="span" variant="body2" color="text.secondary">
            {selectLabel}
          </Typography>
        );
      }

      return (
        selectOptions.find((option) => option.value === selectedValue)?.label ??
        selectedValue
      );
    };

    return (
      <FormControl size="small" fullWidth>
        <Select
          multiple={field.typeKey === "multiSelect"}
          displayEmpty
          input={<OutlinedInput />}
          MenuProps={{
            disableScrollLock: true,
            PaperProps: {
              sx: {
                maxHeight: DROPDOWN_MENU_MAX_HEIGHT,
              },
            },
          }}
          value={field.typeKey === "multiSelect" ? selectedOptions : textAnswer}
          renderValue={renderSelectValue}
          onChange={(event) => {
            onAnswerChange(
              field.id,
              field.typeKey === "multiSelect"
                ? (event.target.value as string[])
                : String(event.target.value),
            );
          }}
        >
          {field.typeKey === "dropdown" ? (
            <MenuItem value="" sx={{ display: "none" }} aria-hidden />
          ) : null}
          {selectOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {field.typeKey === "multiSelect" ? (
                <>
                  <Checkbox
                    size="small"
                    checked={selectedOptions.includes(option.value)}
                  />
                  <ListItemText primary={option.label} />
                </>
              ) : (
                option.label
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  if (field.typeKey === "fileUpload") {
    const isFieldUploading = isUploading && uploadingFieldId === field.id;

    return (
      <Stack spacing={1}>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={async (event) => {
            const selectedFile = event.target.files?.[0];
            event.target.value = "";

            if (!selectedFile) {
              return;
            }

            if (!canUpload) {
              toast.error(
                t("leadCaptureV2.customerPreview.fileUploadUnavailable", {
                  defaultValue:
                    "File upload is not available. Save the form and try again.",
                }),
              );
              return;
            }

            try {
              const uploaded = await uploadFieldFile(field.id, selectedFile);
              onAnswerChange(
                field.id,
                serializeLeadCaptureV2FileAnswer(uploaded),
              );
            } catch (error) {
              const message =
                error instanceof Error && error.message === "FILE_TOO_LARGE"
                  ? t("leadCaptureV2.customerPreview.fileTooLarge", {
                      defaultValue: "File must be 10 MB or smaller.",
                    })
                  : t("leadCaptureV2.customerPreview.fileUploadFailed", {
                      defaultValue: "Could not upload file. Please try again.",
                    });
              toast.error(message);
            }
          }}
        />

        {fileAnswer ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 1.5,
              py: 1,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body2"
              component="a"
              href={fileAnswer.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                flex: 1,
                minWidth: 0,
                color: "primary.main",
                textDecoration: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {fileAnswer.fileName}
            </Typography>
            <IconButton
              size="small"
              aria-label={t("common.remove", { defaultValue: "Remove" })}
              disabled={isFieldUploading}
              onClick={() => onAnswerChange(field.id, "")}
            >
              <X size={16} />
            </IconButton>
          </Stack>
        ) : null}

        <Button
          variant="outlined"
          fullWidth
          disabled={isFieldUploading || !canUpload}
          startIcon={
            isFieldUploading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Upload size={16} />
            )
          }
          sx={{ justifyContent: "center" }}
          onClick={() => fileInputRef.current?.click()}
        >
          {fileAnswer
            ? t("leadCaptureV2.customerPreview.changeFile", {
                defaultValue: "Change file",
              })
            : t("common.chooseFile")}
        </Button>

        {isFieldUploading ? <LinearProgress /> : null}
      </Stack>
    );
  }

  if (
    field.verificationRequired &&
    isLeadCaptureV2OtpEligibleField(field.typeKey) &&
    onFieldVerifiedChange
  ) {
    return (
      <LeadCaptureV2OtpVerifiedFieldInput
        field={field}
        value={textAnswer}
        organizationId={organizationId}
        organizationType={organizationType}
        isVerified={isVerified}
        onValueChange={(nextValue) => onAnswerChange(field.id, nextValue)}
        onVerifiedChange={(verified) =>
          onFieldVerifiedChange(field.id, verified)
        }
      />
    );
  }

  if (field.typeKey === "dimension") {
    return (
      <LeadCaptureV2CustomerPreviewDimensionInput
        field={field}
        answer={textAnswer}
        selectedUnit={dimensionUnit ?? field.unitType ?? ""}
        onAnswerChange={onAnswerChange}
        onUnitChange={(fieldId, nextUnit) =>
          onDimensionUnitChange?.(fieldId, nextUnit)
        }
      />
    );
  }

  if (isPhoneField) {
    return (
      <Stack spacing={0.5}>
        <LeadCaptureV2CustomerPreviewPhoneInput
          value={textAnswer}
          error={hasValidationError}
          onChange={(nextValue) => onAnswerChange(field.id, nextValue)}
        />
        {validationHelperText ? (
          <FormHelperText error sx={{ mx: 0 }}>
            {validationHelperText}
          </FormHelperText>
        ) : null}
      </Stack>
    );
  }

  return (
    <TextField
      fullWidth
      multiline={field.typeKey === "longText"}
      minRows={field.typeKey === "longText" ? 4 : undefined}
      size="small"
      type={
        field.typeKey === "email"
          ? "email"
          : isNumberField
            ? "number"
            : "text"
      }
      value={textAnswer}
      error={hasValidationError}
      helperText={validationHelperText}
      onKeyDown={(event) => {
        if (!isNumberField) return;
        if (["e", "E", "+", "-", "."].includes(event.key)) {
          event.preventDefault();
        }
      }}
      onChange={(event) => {
        onAnswerChange(field.id, event.target.value);
      }}
    />
  );
};

export default LeadCaptureV2CustomerPreviewFieldInput;
