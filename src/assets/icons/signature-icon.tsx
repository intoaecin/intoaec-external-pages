import React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

const SignatureIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        d="M3 17C6.333 13.667 8 11 8 9C8 6 7 6 6 6C5 6 3.968 7.085 4 9C4.034 11.048 5.658 13.877 6.5 15C8 17 9 17.5 10 16L12 13C12.333 15.667 13.333 17 15 17C15.53 17 17.639 15 18 15C18.517 15 19.517 15.667 21 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};

export default SignatureIcon;
