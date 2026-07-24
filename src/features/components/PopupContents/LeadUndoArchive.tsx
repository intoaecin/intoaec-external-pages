import {
  DialogContent,
  DialogTitle,
  Divider,
  FormHelperText,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
export const LeadUndoArchive = ({
  count,
  onReasonChange,
  isClient,
  isProjectCompleted,
}: {
  count: number;
  onReasonChange?: (e: any) => void;
  isClient?: boolean;
  isProjectCompleted?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <>
      <DialogTitle id="alert-dialog-title" className="d-inline-block mb-2 mt-1">
        {count == 1 ? (
          <>
            <span className="">{`${t("modal.areYouSure")} ${t(
              "modal.undo"
            )} ${t("modal.the")} ${
              !isProjectCompleted ? t("modal.archive") : ""
            } ${isClient ? "Project?" : "lead?"}`}</span>
          </>
        ) : (
          <>
            <span>{`${t("modal.areYouSure")} ${t("modal.undo")} ${t(
              "modal.the"
            )} `}</span>
            <span
              style={{
                color: "#FF3C5F",
              }}
            >
              {count}
            </span>
            <span>{` ${t("modal.archive")} ${
              isClient ? "Projects?" : "leads?"
            }`}</span>
          </>
        )}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <TextField
          label={t("common.reason")}
          name="projectDescription"
          multiline
          rows={4}
          onChange={(e) => {
            onReasonChange?.(e.target.value);
          }}
          fullWidth
        />
        {/* <FormHelperText style={{ color: "red" }}>
          Note: Maximum character limit is 250.
        </FormHelperText> */}
      </DialogContent>
    </>
  );
};
