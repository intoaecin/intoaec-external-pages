import type { ComponentType } from "react";
import ExternalReportsTable from "@/features/reportsPage/ReportsTable";
import { useBillsExpensesColumns } from "../columns";
import type { BillsExpensesRow } from "../types";

interface BillsExpensesTableProps {
  isExternalReport?: boolean;
  ReportsTableComponent?: ComponentType<any>;
  rows: BillsExpensesRow[];
  isLoading: boolean;
  sortOrder: "ASC" | "DESC";
  onSort: (order: "ASC" | "DESC", column: string) => void;
  currentPage: number;
  rowsPerPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectRow?: (id: string, checked: boolean) => void;
  onSelectAllRows?: (checked: boolean) => void;
  currency?: string;
}

const BillsExpensesTable = ({
  isExternalReport = false,
  ReportsTableComponent,
  rows,
  isLoading,
  sortOrder,
  onSort,
  currentPage,
  rowsPerPage,
  totalPages,
  onPageChange,
  onRowsPerPageChange,
  selectable = false,
  selectedRows,
  onSelectRow,
  onSelectAllRows,
  currency,
}: BillsExpensesTableProps) => {
  const { columns } = useBillsExpensesColumns();
  const SelectedReportsTable = ReportsTableComponent ?? ExternalReportsTable;
  const sharedProps = {
    columns,
    data: rows,
    isLoading,
    sortOrder,
    onSort: (order: "ASC" | "DESC", column: string) => {
      const columnDef = columns.find((c) => c.display === column);
      if (columnDef) {
        onSort(order, columnDef.field);
      }
    },
    currentPage,
    rowsPerPage,
    totalPages,
    onPageChange,
    onRowsPerPageChange,
    selectable,
    selectedRows,
    onSelectRow,
    onSelectAllRows,
    rowIdField: "id",
    currency: currency ?? "",
  };

  return <SelectedReportsTable {...sharedProps} />;
};

export default BillsExpensesTable;
