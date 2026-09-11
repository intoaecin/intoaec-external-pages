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
  Checkbox,
  Box,
  Typography,
} from "@mui/material";
import AscIcon from "@/assets/icons/ascending-icon";
import DscIcon from "@/assets/icons/descending-icon";
import CustomTablePagination from "@/features/components/customTablePagination/customTablePagination";
import NoDataFound from "@/components_v2/NoDataFound";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useTranslation } from "react-i18next";

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

  return (
    <Box sx={{ pt: isExternalReport ? 0 : 5 }}>
      {
        isExternalReport ? null : (
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: "bold",
            }}
          >
            {getReportTitle()}
          </Typography>
        )
      }
      
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "none",
          marginTop: "20px",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Table
          aria-label="simple table"
          sx={{
            minWidth: 650,
            width: "100%",
            tableLayout: "auto",
          }}
        >
          <TableHead>
            {isLoading ? (
              <TableRow
                sx={{
                  backgroundColor: "primary.main",
                  "&:MuiTableCell-head": { color: "#FFFFFF" },
                  "& .MuiTableCell-root": { padding: "15px" },
                }}
              >
                {selectable && (
                  <TableCell padding="checkbox" sx={{ width: "48px" }}>
                    <Skeleton variant="rectangular" width={24} height={24} />
                  </TableCell>
                )}
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton variant="text" width="80%" height={30} />
                  </TableCell>
                ))}
              </TableRow>
            ) : (
              <TableRow
                sx={{
                  backgroundColor: "primary.main",
                  "&:MuiTableCell-head": { color: "#FFFFFF" },
                  "& .MuiTableCell-root": { padding: "15px" },
                  "& .MuiCheckbox-root.Mui-checked": {
                    color: "#ffffff !important",
                  },
                }}
              >
                {columns.map((column, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
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
          <TableBody>
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
                      <Skeleton variant="text" width="80%" height={30} />
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
                    hover={selectable}
                    selected={isItemSelected}
                    onClick={() =>
                      selectable && handleRowClick(rowId, !isItemSelected)
                    }
                    sx={{ cursor: selectable ? "pointer" : "default" }}
                  >
                    {/* {router?.query?.reportsPage ||
                      (selectable && (
                        <TableCell
                          padding="checkbox"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isItemSelected}
                            onChange={(event) =>
                              handleRowClick(rowId, event.target.checked)
                            }
                          />
                        </TableCell>
                      ))} */}
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex}>
                        {column.render
                          ? column.render(row)
                          : column.showCurrency
                          ? `${currency} ${row[column.field]}`
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
      <CustomTablePagination
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        totalPage={totalPages}
        onChangePage={onPageChange}
        onChangeRowsperPage={onRowsPerPageChange}
      />
    </Box>
  );
};

export default ReportsTable;

