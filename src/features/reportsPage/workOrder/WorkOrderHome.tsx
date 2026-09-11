import { Box } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReportsTable from "../ReportsTable";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { useWorkOrderReports } from "@/features/reports/workOrder/hooks/useWorkOrderReports";

const WorkOrderHome = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { data: session } = useSession();

    const {
        isLoading,
        tableData,
        sortOrder,
        currentPage,
        rowsPerPage,
        totalPages,
        filters,
        handleSort,
        handleApplyFilters,
        setCurrentPage,
        setRowsPerPage,
    } = useWorkOrderReports();

    const columns = [
        { display: t("common.projectName"), field: "projectName", isSort: true },
        {
            display: t("reports.vendorOrganization"),
            field: "receiverName",
            isSort: true,
        },
        { display: t("workOrder.woNo"), field: "poSerial", isSort: true },
        { display: t("reports.vendorAmount"), field: "vendorAmount" },
        { display: t("reports.organizationStatus"), field: "aecStatus" },
        { display: t("reports.vendorStatus"), field: "vendorStatus" },
        { display: t("reports.issuedOn"), field: "issuedOn", isSort: true },
    ];

    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedRows((prev) => [...prev, id]);
        } else {
            setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
        }
    };

    const handleSelectAllRows = (checked: boolean) => {
        if (checked) {
            setSelectedRows(tableData.map((row: any) => row.id));
        } else {
            setSelectedRows([]);
        }
    };

    useEffect(() => {
        if (router.query?.startDate || router.query?.endDate) {
            handleApplyFilters({
                ...filters,
                startDate: router.query?.startDate ? Number(router.query?.startDate) : undefined,
                endDate: router.query?.endDate ? Number(router.query?.endDate) : undefined,
            });
        }
    }, [router.query?.startDate, router.query?.endDate]);

    useEffect(() => {
        setSelectedRows([]);
    }, [currentPage]);

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "white",
                position: "relative",
            }}
        >
            <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10 }}>
                <LanguageSwitcher />
            </div>

            <Box
                sx={{
                    flexGrow: 1,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    minHeight: "1200px",
                    marginX: 1,
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflowY: "auto",
                        overflowX: "auto",
                    }}
                >
                    <ReportsTable
                        columns={columns}
                        data={tableData}
                        isLoading={isLoading}
                        sortOrder={sortOrder}
                        onSort={(order, column) => {
                            const columnDef = columns.find((col) => col.display === column);
                            if (columnDef) {
                                handleSort(order, columnDef.field);
                            }
                        }}
                        currentPage={currentPage}
                        rowsPerPage={rowsPerPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        selectable={true}
                        selectedRows={selectedRows}
                        onSelectRow={handleSelectRow}
                        onSelectAllRows={handleSelectAllRows}
                        rowIdField="id"
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default WorkOrderHome;

