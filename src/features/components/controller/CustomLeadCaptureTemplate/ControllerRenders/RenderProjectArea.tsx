import { setCreateLeadFormData } from "@/features/leadCapture/setCreateFormData";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { MenuItem, TextField, useMediaQuery } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const RenderProjectArea = ({ disabled = false }: { disabled?: boolean }) => {
  const area = LeadCaptureStore.useState((s) => s.leadCaptureData?.projectArea);
  const unit = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.projectAreaUnit
  );
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");

  const handleProjectArea = (area: number) => {
    setCreateLeadFormData({
      projectArea: area,
    });
  };
  const handleProjectAreaUnit = (unit?: string) => {
    setCreateLeadFormData({
      projectAreaUnit: unit ?? "sq.ft",
    });
  };

  const { t } = useTranslation();
  return (
    <div>
      <TextField
        id="outlined-basic"
        type="number"
        placeholder={t("leadCapture.enterProjectArea")}
        variant="outlined"
        disabled={disabled}
        style={{
          width: isSmallScreen ? "100% " : "30vw",
          padding: "10px",
          boxSizing: "border-box",
        }}
        value={area ?? ""}
        inputProps={{ maxLength: 10 }}
        onChange={(e) => {
          handleProjectArea(Number(e.target.value));
        }}
        InputProps={{
          endAdornment: (
            <div style={{ marginLeft: "10px", width: "100px" }}>
              <TextField
                select
                value={unit ?? "sq.ft"}
                disabled={disabled}
                onChange={(e) => {
                  if (e.target.value.length < 11) {
                    return handleProjectAreaUnit(e.target.value);
                  }
                }}
                variant="standard"
                SelectProps={{
                  MenuProps: { disableScrollLock: true },
                }}
                sx={{
                  "& .MuiInput-root:before": {
                    borderBottom: "none",
                  },
                }}
              >
                <MenuItem selected value="sq.ft">
                  sq.ft
                </MenuItem>
                <MenuItem value="sq.mt">sq.mt</MenuItem>
                <MenuItem value="acre">acre</MenuItem>
              </TextField>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default RenderProjectArea;
