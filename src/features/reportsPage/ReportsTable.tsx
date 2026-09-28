import React, { ReactNode, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Skeleton,
  Box,
  Typography,
} from "@mui/material";
import AscIcon from "@/assets/icons/ascending-icon";
import DscIcon from "@/assets/icons/descending-icon";
import CustomTablePagination from "@/features/components/customTablePagination/customTablePagination";
import NoDataFound from "@/components_v2/NoDataFound";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";

interface Column {
  display: string;
  field: string;
  isSort?: boolean;
  showCurrency?: boolean;
  render?: (row: { [key: string]: any }) => ReactNode;
}

interface ReportsTableProps {
  columns: Column[];
  data: Array<{ [key: string]: any }>;
  sortOrder?: "ASC" | "DESC";
  onSort?: (order: "ASC" | "DESC", column: string) => void;
  currentPage: number;
  rowsPerPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isLoading?: boolean;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectRow?: (id: string, checked: boolean) => void;
  onSelectAllRows?: (checked: boolean) => void;
  rowIdField?: string;
  currency?: string;
  isExternalReport?: boolean;
}

const ReportsTable: React.FC<ReportsTableProps> = ({
  columns,
  data,
  sortOrder = "ASC",
  onSort,
  currentPage,
  rowsPerPage,
  totalPages,
  onPageChange,
  onRowsPerPageChange,
  isLoading = false,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAllRows,
  rowIdField = "id",
  currency,
  isExternalReport = false,
}) => {
  const [orderBy, setOrderBy] = useState<string>("");
  const router = useRouter();
  const { t } = useTranslation();
  const getReportTitle = () => {
    if (router.asPath) {
      const path = router.asPath.split("?")[0]; // Remove query parameters
      const segments = path.split("/");
      const reportType = segments[segments.length - 1]; // Get last segment
      const changeLowerCase = reportType?.[0]?.toLowerCase() + reportType?.slice(1);  // * change to lower case
      const reportTitle = t("reportsAutomations."+changeLowerCase);
      return reportTitle
    }
    return "Reports ";
  };

  const handleSort = (column: Column) => {
    if (onSort) {
      const newOrder = sortOrder === "ASC" ? "DESC" : "ASC";
      setOrderBy(column.field); 
      onSort(newOrder, column.display);
    }
  };

  const isSelected = (id: string) => selectedRows.includes(id);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAllRows) {
      onSelectAllRows(event.target.checked);
    }
  };

  const handleRowClick = (id: string, checked: boolean) => {
    if (onSelectRow) {
      onSelectRow(id, checked);
    }
  };

  const headerRowSx = {
    backgroundColor: "primary.main",
    "& .MuiTableCell-root": {
      py: 1.5,
      px: 2,
      borderBottom: "none",
    },
    "& .MuiCheckbox-root.Mui-checked": {
      color: "#ffffff !important",
    },
  };

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, pt: isExternalReport ? 0 : 3, pb: 3 }}>
      {isExternalReport ? null : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 2.5,
          }}
        >
          <Typography
            variant="h6"
            component="h1"
            sx={{ fontWeight: 400, color: "text.primary" }}
          >
            {getReportTitle()}
          </Typography>
          <LanguageSwitcher />
        </Box>
      )}

      <Paper
        variant="outlined"
        sx={{
          borderRadius: "4px",
          borderColor: "#E5E7EB",
          overflow: "hidden",
        }}
      >
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table
            aria-label={getReportTitle()}
            sx={{
              minWidth: 650,
              width: "100%",
              tableLayout: "auto",
            }}
          >
            <TableHead>
              {isLoading ? (
                <TableRow sx={headerRowSx}>
                  {selectable && (
                    <TableCell padding="checkbox" sx={{ width: "48px" }}>
                      <Skeleton variant="rectangular" width={24} height={24} />
                    </TableCell>
                  )}
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton variant="text" width="80%" height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              ) : (
                <TableRow sx={headerRowSx}>
                  {columns.map((column, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        color: "primary.contrastText",
                        fontWeight: 500,
                        fontSize: "0.8125rem",
                        whiteSpace: "nowrap",
                        cursor: column.isSort ? "pointer" : "default",
                      }}
                      onClick={() => column.isSort && handleSort(column)}
                    >
                      {column.display}
                      {onSort && column.isSort && (
                        <TableSortLabel
                          active={orderBy === column.field}
                          direction={sortOrder.toLowerCase() as "asc" | "desc"}
                          IconComponent={sortOrder === "ASC" ? AscIcon : DscIcon}
                          sx={{
                            "& .MuiTableSortLabel-icon": {
                              color: "white !important",
                            },
                          }}
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableHead>
            <TableBody
              sx={{
                "& .MuiTableCell-root": {
                  py: 1.5,
                  px: 2,
                  fontSize: "0.875rem",
                  color: "text.primary",
                  borderColor: "#EEF0F2",
                },
                "& .MuiTableRow-root:last-of-type .MuiTableCell-root": {
                  borderBottom: "none",
                },
              }}
            >
              {isLoading ? (
                Array.from({ length: 11 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Skeleton variant="rectangular" width={24} height={24} />
                      </TableCell>
                    )}
                    {Array.from({ length: columns.length }).map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton variant="text" width="80%" height={24} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center",
                        py: 4,
                      }}
                    >
                      <NoDataFound />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => {
                  const rowId = String(row[rowIdField] || rowIndex);
                  const isItemSelected = isSelected(rowId);

                  return (
                    <TableRow
                      key={rowIndex}
                      hover
                      selected={isItemSelected}
                      onClick={() =>
                        selectable && handleRowClick(rowId, !isItemSelected)
                      }
                      sx={{
                        cursor: selectable ? "pointer" : "default",
                        "&:nth-of-type(even)": { backgroundColor: "#FAFBFC" },
                      }}
                    >
                      {columns.map((column, colIndex) => (
                        <TableCell key={colIndex}>
                          {column.render
                            ? column.render(row)
                            : column.showCurrency
                            ? currency
                              ? `${currency} ${row[column.field]}`
                              : row[column.field]
                            : row[column.field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ px: 2, borderTop: "1px solid #EEF0F2" }}>
          <CustomTablePagination
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalPage={totalPages}
            onChangePage={onPageChange}
            onChangeRowsperPage={onRowsPerPageChange}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportsTable;
