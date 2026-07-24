import { setCreateLeadFormData } from "@/features/leadCapture/setCreateFormData";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { TextField, useMediaQuery } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const RenderProjectName = ({ disabled = false }: { disabled?: boolean }) => {
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");

  const handleLeadNameChange = (leadName: string) => {
    setCreateLeadFormData({
      leadName: leadName,
    });
  };

  const { leadCaptureData } = LeadCaptureStore.useState();
  const { t } = useTranslation();
  return (
    <div>
      <TextField
        id="outlined-basic"
        placeholder={t('leadCapture.enterYourName')}
        variant="outlined"
        value={leadCaptureData?.leadName}
        disabled={disabled}
        onChange={(e) => {
          handleLeadNameChange(e.target.value);
        }}
        style={{
          width: isSmallScreen ? "100% " : "30vw",
          padding: "10px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};

export default RenderProjectName;
