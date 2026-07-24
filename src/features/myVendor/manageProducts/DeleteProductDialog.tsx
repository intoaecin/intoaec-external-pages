import { DialogContent, DialogTitle, Divider, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

const DeleteProductDialog = ({
  onReasonChange,
}: {
  onReasonChange?: (e: any) => void;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <DialogTitle id="alert-dialog-title" className="d-inline-block">
        <span className="underline-on-hover">
          {`${t("modal.areYouSure")} ${t("myInventory.deleteProduct")}`}
        </span>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <TextField
          required
          label={t("common.reason")}
          placeholder={t("common.typeReason", {
            defaultValue: "Type your reason",
          })}
          name="deleteProductReason"
          multiline
          rows={4}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(e) => {
            onReasonChange?.(e.target.value);
          }}
          fullWidth
        />
      </DialogContent>
    </>
  );
};

export default DeleteProductDialog;
