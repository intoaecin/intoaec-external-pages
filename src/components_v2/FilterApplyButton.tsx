import FilterIcon from "@/assets/icons/filter-icon";
import { Button, ButtonProps } from "@mui/material";
import { useTranslation } from "react-i18next";

type FilterApplyButtonProps = Omit<ButtonProps, "variant" | "startIcon">;

export default function FilterApplyButton({
  children,
  sx,
  ...buttonProps
}: FilterApplyButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      {...buttonProps}
      size={buttonProps.size ?? "medium"}
      variant="contained"
      color="primary"
      startIcon={
        <FilterIcon
          style={{
            width: 20,
            height: 20,
            display: "block",
            fill: "currentColor",
          }}
        />
      }
      sx={{
        textTransform: "none",
        "&:hover": { bgcolor: "primary.dark" },
        ...sx,
      }}
    >
      {children ?? t("common.apply")}
    </Button>
  );
}
