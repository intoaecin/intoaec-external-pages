import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ProgressClaimStatement as Statement } from "../utils/progressClaimStatement";
import StatementRow from "./ProgressClaimStatementRow";

interface ProgressClaimStatementProps {
  statement: Statement;
  retentionPct: number;
  loading?: boolean;
  formatMoney: (amount: number) => string;
}

const HEADER_ROW_SX = {
  "& .MuiTableCell-root": {
    color: "primary.contrastText",
    bgcolor: "primary.main",
    fontWeight: 500,
    whiteSpace: "nowrap",
    borderBottom: "none",
    height: 50,
  },
};

/** Summary tab: the claim laid out as a progress claim statement (work done → payable). */
const ProgressClaimStatement = ({
  statement,
  retentionPct,
  loading = false,
  formatMoney,
}: ProgressClaimStatementProps) => {
  const { t } = useTranslation();

  return (
    <TableContainer
      component={Paper}
      sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none" }}
    >

      <Table size="small" sx={{ tableLayout: "fixed", minWidth: 480 }}>
        <colgroup>
          <col style={{ width: 64 }} />
          <col />
          <col style={{ width: 200 }} />
        </colgroup>
        <TableHead>
          <TableRow sx={HEADER_ROW_SX}>
            <TableCell align="center">{t("common.no")}</TableCell>
            <TableCell>{t("common.description")}</TableCell>
            <TableCell>{t("common.amount")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <StatementRow marker="A" label={t("progressClaim.statement.workDone")} variant="section" />
          {statement.workDoneLines.map((line, index) => (
            <StatementRow
              key={line.id}
              marker={String(index + 1)}
              label={line.name}
              amount={formatMoney(line.amount)}
              loading={loading}
            />
          ))}
          <StatementRow
            label={t("progressClaim.statement.totalWorkDone")}
            amount={formatMoney(statement.workDoneTotal)}
            loading={loading}
            variant="total"
          />

          <StatementRow
            marker="B"
            label={t("progressClaim.statement.variationOrder")}
            variant="section"
          />
          {statement.variationOrderLines.length > 0 ? (
            statement.variationOrderLines.map((line, index) => (
              <StatementRow
                key={line.id}
                marker={String(index + 1)}
                label={line.name}
                amount={formatMoney(line.amount)}
                loading={loading}
              />
            ))
          ) : (
            <StatementRow label="-" />
          )}
          <StatementRow
            label={t("progressClaim.statement.totalVariationOrders")}
            amount={formatMoney(statement.variationOrderTotal)}
            loading={loading}
            variant="total"
          />

          <StatementRow
            marker="C"
            label={t("progressClaim.statement.totalAB")}
            amount={formatMoney(statement.total)}
            loading={loading}
            variant="total"
          />
          <StatementRow
            marker="D"
            label={t("progressClaim.statement.retentionAt", { rate: retentionPct })}
            amount={formatMoney(statement.retentionAmount)}
            loading={loading}
          />
          <StatementRow
            marker="E"
            label={t("progressClaim.statement.netOfRetention")}
            amount={formatMoney(statement.netOfRetention)}
            loading={loading}
            variant="total"
          />

          <StatementRow marker="F" label={t("progressClaim.statement.less")} variant="section" />
          <StatementRow
            marker="1"
            label={t("progressClaim.previousAcceptedTotal")}
            amount={formatMoney(statement.previousAcceptedNet)}
            loading={loading}
          />

          <StatementRow
            label={t("progressClaim.totalThisPeriod")}
            amount={formatMoney(statement.thisPeriodNet)}
            loading={loading}
            variant="highlight"
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProgressClaimStatement;
