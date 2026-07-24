import { Button, ButtonProps } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

type FilterClearButtonProps = Omit<ButtonProps, "variant" | "startIcon" | "color">;

/**
 * Secondary “reset filters” action — outlined so it stays visually quieter than Apply.
 */
export default function FilterClearButton({
  children,
  sx,
  ...buttonProps
}: FilterClearButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      {...buttonProps}
      size={buttonProps.size ?? "medium"}
      variant="outlined"
      color="error"
      startIcon={<RotateCcw size={18} />}
      sx={{
        textTransform: "none",
        "&:hover": {
          borderColor: "error.dark",
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
        },
        ...sx,
      }}
    >
      {children ?? t("common.clear")}
    </Button>
  );
}
