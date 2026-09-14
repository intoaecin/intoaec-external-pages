import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Alert,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import type { DialogProps, ButtonProps, SxProps, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import WarningIcon from "@mui/icons-material/Warning";
import { UIHoverTitle } from "@/features/components/HelperComponents/UIHoverTitle";

export interface UIDialogActionConfig {
  label: React.ReactNode;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  variant?: "text" | "outlined" | "contained";
  color?: ButtonProps["color"];
  /** Merged into the action button `sx` (e.g. legacy brand colors). */
  sx?: SxProps<Theme>;
  fullWidth?: boolean;
}

export interface UIDialogProps {
  open: boolean;
  title?: React.ReactNode;
  onClose: (event?: any, reason?: any) => void;
  children: React.ReactNode;
  maxWidth?: DialogProps["maxWidth"];
  fullWidth?: boolean;
  contentAlign?: "left" | "center" | "right";
  primaryAction?: UIDialogActionConfig;
  secondaryAction?: UIDialogActionConfig;
  PaperProps?: DialogProps["PaperProps"];
  /** Applied to `DialogContent` (padding, alignment, etc.). */
  contentSx?: SxProps<Theme>;
  /** Renders a full-width `Divider` between the title and content. */
  dividerAfterTitle?: boolean;
  /** Merged into `DialogActions` `sx`. */
  actionsSx?: SxProps<Theme>;
  /**
   * When both actions exist, show a vertical divider between them (default true).
   * Set false for side-by-side full-width buttons (e.g. confirm dialogs).
   */
  showBetweenActionDivider?: boolean;
  /** When false, no horizontal divider above the action row (default true). */
  showActionsTopDivider?: boolean;
  /** Keep the action row fixed to the dialog bottom while content scrolls. */
  fixedActions?: boolean;
}

export const UIDialog: React.FC<UIDialogProps> = ({
  open,
  title,
  onClose,
  children,
  maxWidth = "sm",
  fullWidth = true,
  contentAlign = "left",
  primaryAction,
  secondaryAction,
  PaperProps,
  contentSx,
  dividerAfterTitle = false,
  actionsSx,
  showBetweenActionDivider = true,
  showActionsTopDivider = true,
  fixedActions = true,
}) => {
  const hasActions = primaryAction || secondaryAction;

  const defaultActionsSx: SxProps<Theme> = {
    justifyContent: "flex-end",
    px: 2,
    pb: 2,
  };

  const fixedActionsSx: SxProps<Theme> = fixedActions
    ? {
        position: "sticky",
        bottom: 0,
        zIndex: 1,
        backgroundColor: "background.paper",
      }
    : {};

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableScrollLock
      PaperProps={PaperProps}
    >
      {title && (
        <>
          <DialogTitle>
            {typeof title === "string" ? (
              <>
                <UIHoverTitle title={title} />
              </>
            ) : (
              title
            )}
          </DialogTitle>
          {dividerAfterTitle ? <Divider sx={{ borderColor: "divider" }} /> : null}
        </>
      )}
      <DialogContent
        sx={[{ textAlign: contentAlign }, contentSx].filter(Boolean) as SxProps<Theme>}
      >
        {children}
      </DialogContent>
      {hasActions && (
        <>
          {showActionsTopDivider ? <Divider /> : null}
          <DialogActions
            sx={
              [defaultActionsSx, fixedActionsSx, actionsSx].filter(Boolean) as SxProps<Theme>
            }
          >
            {secondaryAction && (
              <LoadingButton
                variant={secondaryAction.variant ?? "outlined"}
                color={secondaryAction.color ?? "primary"}
                onClick={() => {
                  void secondaryAction.onClick();
                }}
                disabled={secondaryAction.disabled}
                loading={Boolean(secondaryAction.loading)}
                fullWidth={secondaryAction.fullWidth}
                sx={
                  [
                    { minWidth: secondaryAction.fullWidth ? undefined : 100 },
                    secondaryAction.sx,
                  ].filter(Boolean) as SxProps<Theme>
                }
              >
                {secondaryAction.label}
              </LoadingButton>
            )}
            {secondaryAction &&
              primaryAction &&
              showBetweenActionDivider && (
                <Divider orientation="vertical" flexItem />
              )}
            {primaryAction && (
              <LoadingButton
                variant={primaryAction.variant ?? "contained"}
                color={primaryAction.color ?? "primary"}
                onClick={() => {
                  void primaryAction.onClick();
                }}
                disabled={primaryAction.disabled}
                loading={Boolean(primaryAction.loading)}
                fullWidth={primaryAction.fullWidth}
                sx={
                  [
                    { minWidth: primaryAction.fullWidth ? undefined : 100 },
                    primaryAction.sx,
                  ].filter(Boolean) as SxProps<Theme>
                }
              >
                {primaryAction.label}
              </LoadingButton>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export const ConfirmDialog = ({
  titleKey,
  onReasonChange,
  isReason = false,
  isMandatoryReason = false,
  warningContent,
}: {
  titleKey: string;
  isReason: boolean;
  isMandatoryReason?: boolean;
  onReasonChange?: (e: any) => void;
  warningContent?: string;
}) => {
  const { t } = useTranslation();
  return (
    <>
      <DialogTitle
        id="alert-dialog-title"
        className="d-inline-block mb-2 mt-1 w-[100%]"
      >
        <span className="">{titleKey}</span>
      </DialogTitle>
      <Divider />
      {warningContent && (
        <DialogContent>
          <Alert severity="warning" icon={<WarningIcon />}>
            {warningContent}
          </Alert>
        </DialogContent>
      )}
      {isReason && (
        <DialogContent sx={{}}>
          <TextField
            label={
              <>
                {t("common.reason")}
                {isMandatoryReason && <span className="requiredUI">*</span>}
              </>
            }
            name="projectDescription"
            multiline
            rows={2}
            onChange={(e) => {
              onReasonChange?.(e.target.value);
            }}
            fullWidth
          />
        </DialogContent>
      )}
    </>
  );
};
