import { ControlType } from "@/types";
import { TextField } from "@mui/material";
import React, { useEffect } from "react";

export const RenderForm = ({
  control,
  isAnswer,
  onChange,
}: {
  control: ControlType;
  isAnswer?: boolean;
  onChange?:
    | React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    | undefined;
}) => {
 
  // Render text input logic here
  if (control?.isEnabled) {
    return (
      <div>
        <div>
          <span style={{ fontSize: "11px" }}>{control?.label}</span>
          {control?.isRequired && <span className="requiredUI"> *</span>}
        </div>
        <TextField
          value={control?.value}
          disabled={!isAnswer}
          placeholder={control?.label as string}
          fullWidth
          onChange={onChange}
        />
      </div>
    );
  }
};
