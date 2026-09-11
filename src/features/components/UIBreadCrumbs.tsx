import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Box, type SxProps, type Theme } from "@mui/material";
import { useRouter } from "@/features/reportsPage/publicRuntime";

interface UIBreadCrumbsProps {
  currentLabel: string;
  previousActionLabel: string;
  onPreviousAction?: () => void;
  containerStyle?: SxProps<Theme>;
  omitBootstrapColumn?: boolean;
}

export const UIBreadCrumbs = ({
  currentLabel,
  previousActionLabel,
  onPreviousAction,
  containerStyle,
  omitBootstrapColumn = false,
}: UIBreadCrumbsProps) => {
  const router = useRouter();
  return (
    <Box sx={{ width: omitBootstrapColumn ? "100%" : undefined, ...containerStyle }}>
      <Box
        sx={{
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          mb: 2,
          fontSize: 13,
          "& button": {
            appearance: "none",
            border: 0,
            background: "none",
            color: "inherit",
            cursor: "pointer",
            p: 0,
          },
          "& button:hover": { color: "primary.main", textDecoration: "underline" },
        }}
      >
        <button type="button" onClick={onPreviousAction ?? router.back}>
          {previousActionLabel}
        </button>
        <KeyboardArrowRightIcon fontSize="small" />
        <Box component="span" sx={{ color: "primary.main" }}>
          {currentLabel}
        </Box>
      </Box>
    </Box>
  );
};
