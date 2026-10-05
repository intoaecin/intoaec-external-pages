import { Skeleton, TableCell, TableRow, Typography } from "@mui/material";
import type { Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";

export type StatementRowVariant = "section" | "line" | "total" | "highlight";

interface ProgressClaimStatementRowProps {
  /** Section letter (A, B, …) or line number within a section. */
  marker?: string;
  label: string;
  amount?: string;
  loading?: boolean;
  variant?: StatementRowVariant;
}

const ROW_SX: Record<StatementRowVariant, SystemStyleObject<Theme>> = {
  section: { bgcolor: "grey.50" },
  line: {},
  total: { bgcolor: "grey.50" },
  highlight: {
    bgcolor: "primary.main",
    "& .MuiTableCell-root, & .MuiTypography-root": { color: "primary.contrastText" },
  },
};

const ProgressClaimStatementRow = ({
  marker,
  label,
  amount,
  loading = false,
  variant = "line",
}: ProgressClaimStatementRowProps) => {
  const isStrong = variant !== "line";
  const fontWeight = isStrong ? 500 : undefined;

  return (
    <TableRow
      sx={[
        {
          "& .MuiTableCell-root": {
            py: 1.25,
            borderBottom: "1px solid",
            borderColor: "divider",
          },
          "& .MuiTableCell-root:not(:last-of-type)": {
            borderRight: "1px solid",
            borderRightColor: "divider",
          },
        },
        ROW_SX[variant],
      ]}
    >
      <TableCell align="center">
        <Typography variant="body2" fontWeight={fontWeight}>
          {marker}
        </Typography>
      </TableCell>
      <TableCell sx={{ pl: variant === "line" ? 3 : undefined }}>
        <Typography variant="body2" fontWeight={fontWeight}>
          {label}
        </Typography>
      </TableCell>
      <TableCell align="right">
        {amount === undefined ? null : loading ? (
          <Skeleton variant="text" width={100} sx={{ ml: "auto" }} />
        ) : (
          <Typography variant="body2" fontWeight={fontWeight} sx={{ whiteSpace: "nowrap" }}>
            {amount}
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
};

export default ProgressClaimStatementRow;
