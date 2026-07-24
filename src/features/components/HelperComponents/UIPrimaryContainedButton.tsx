import { LoadingButton } from "@mui/lab";
import { Button, ButtonProps, CircularProgress } from "@mui/material";

export const UIPrimaryContainedButton = (
  props: ButtonProps & { loading?: boolean }
) => {
  return (
    <LoadingButton
      {...props}
      variant="contained"
      disabled={props.loading || props.disabled} // Disable if loading or already disabled
      sx={{
        width: "160px",
        height: "42px",
        borderRadius: "4px",
        boxShadow: "0px 4px 10px 0px rgba(16, 156, 241, 0.24)",
        position: "relative", // Position relative for loading indicator
        ...props.sx,
      }}
    >
      {/* {props.loading && (
        <CircularProgress
          size={24}
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            marginLeft: "-12px",
            marginTop: "-12px",
          }}
        />
      )} */}
      {props.loading ? "Loading..." : props.children}{" "}
      {/* Show loading text or LoadingButton text */}
    </LoadingButton>
  );
};
