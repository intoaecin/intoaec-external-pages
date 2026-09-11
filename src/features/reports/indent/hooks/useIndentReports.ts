import { useQuery } from "@tanstack/react-query";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useState, useEffect } from "react";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue, formatNumberITL, formatSeedValues, formatToCamelCaseWithAmpersand, formatDateBasedOnOrganizationLocalization } from "@/lib/helpers";
import { useTranslation } from "react-i18next";

import { useProjectNames } from "./useProjectNames";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";

export const useIndentReports = () => {
    const { organizationId, organizationName, organizationType, logoUrl } = useOrganization();
    const { t, i18n } = useTranslation();
    const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT, NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
    const { post } = useAxiosWithAuth<any>(NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/session");
    const { post: fetchReports } = useAxiosWithAuth(NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports");
    const { data: session } = useSession();
    const router = useRouter();
    const projectId = router.query.projectId as string;
    const { localizationValue } = useOrganizationLocalization();

    const { projectNames } = useProjectNames(organizationId);

    const [filters, setFilters] = useState<any>({});
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currency, setCurrency] = useState<string>();
    const [reportsConfig, setReportsConfig] = useState<any>();

    useEffect(() => {
        if (localizationValue) {
            setCurrency(getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ?? "");
        }
    }, [localizationValue]);



    const getProjectName = (projectIdToSearch: string, fallbackProjectName?: string) => {
        const project = projectNames?.find((p: any) => p.projectId === projectIdToSearch);
        return project?.projectName || fallbackProjectName || "-";
    }

    const createReportsAutomation = async () => {
        const requestData: any = {
            eventType: "FETCH_REPORTS_AUTOMATION",
            organizationId: organizationId ?? session?.["custom:organization_id"],
            reportName: "INDENT",
        };

        try {
            const res = await fetchReports(requestData);
            if (res?.code === "REPORT_AUTOMATION_RETRIEVED") {
                setReportsConfig(res.body);
            }
        } catch (error: any) {
            console.error("Error creating reports automation:", error);
        }
    };

    useEffect(() => {
        createReportsAutomation();
    }, [session?.["custom:organization_id"]]);

    const getSortByField = (field: string) => {
        const mapping: Record<string, string> = {
            projectName: "projectName",
            "indentNo": "indentSerial",
            issuedOn: "issuedOn",
            indentType: "indentType",
            status: "status",
        };
        return mapping[field] || field;
    };

    const { 
        data: responseData, 
        isLoading, 
        refetch: fetchIndents
    } = useQuery({
        queryKey: ["indentReports", organizationId, projectId, filters, sortOrder, sortBy, currentPage, rowsPerPage, i18n.language],
        queryFn: async () => {
            if (!organizationId) return { result: [], pageCount: 0 };

            const requestData: any = {
                eventType: "FETCH_INDENT",
                organizationId: organizationId ?? session?.["custom:organization_id"],
                organizationType: organizationType ?? session?.["custom:organization_type"],
                sortOrder,
                sortBy: getSortByField(sortBy),
                page: currentPage,
                rowsPerPage,
                ...filters
            };

            // Handle projectIds carefully
            if (filters.projectIds && filters.projectIds.length > 0) {
                requestData.projectIds = filters.projectIds;
            } else if (projectId) {
                requestData.projectIds = [projectId];
            }
            
            const response = await post(requestData);
            if (response.code === "INDENT_RETRIEVED") {
                return {
                    result: response.body?.result || [],
                    pageCount: response.body?.pageCount || 1,
                };
            }
            return { result: [], pageCount: 0 };
        },
        enabled: !!organizationId,
        staleTime: 5 * 60 * 1000,
    });

    const handleSort = (order: "ASC" | "DESC", column: string) => {
        setSortOrder(order);
        setSortBy(column);
    };

    const handleApplyFilters = (newFilters: any) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const tableData = responseData?.result?.map((indent: any, index: number) => {
        return {
            id: indent.indentId || String(index),
            projectName: getProjectName(indent?.projectId, indent?.projectName),
            indentNo: indent.indentSerial || "-",
            status: indent.status || "-",
            issuedOn: indent.issuedOn ? formatDateBasedOnOrganizationLocalization(localizationValue, indent.issuedOn, true) : "-",
            indentType: t(`indentType.${indent.indentType}`) || "-",
        };
    }) || [];

    const translatedTableData = tableData.map((item: any) => {
        const translatedStatus = t(`indentContent.${item.status}`);
        return {
            ...item,
            status: (translatedStatus && translatedStatus !== `indentContent.${item.status}`) 
                ? translatedStatus 
                : formatSeedValues(item.status),
        };
    });

    return {
        isLoading,
        tableData: translatedTableData,
        sortOrder,
        sortBy,
        currentPage,
        rowsPerPage,
        totalPages: responseData?.pageCount || 1,
        filters,
        currency,
        localizationValue,
        reportsConfig,
        createReportsAutomation,
        handleSort,
        setSortBy,
        handleApplyFilters,
        setCurrentPage,
        setRowsPerPage,
    };
};

