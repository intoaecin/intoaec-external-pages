import { Button, ButtonProps } from "@mui/material";
import React from "react";

export const UISecondaryOutlinedButton = (props: ButtonProps) => {
  return (
    <Button
      variant="outlined"
      {...props}
      sx={{
        width: "160px",
        height: "42px",
        borderRadius: "4px",
        boxShadow: "0px 4px 10px 0px rgba(16, 156, 241, 0.24)",
        ...props.sx,
      }}
    />
  );
};
