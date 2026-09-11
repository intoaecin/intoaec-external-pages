import { Box, Grid, Button } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useEffect } from "react";
import CustomDateRangePicker from "@/features/components/CustomDateRangePicker";
import { SingleSelectSearchDropDown } from "@/features/components/SingleSelectSearchDropdown";

interface InventoryReportFilterProps {
  onApplyFilters: (filters: any) => void;
  filters: {
    projectId: string | null;
    startDate: number | null;
    endDate: number | null;
  };
}

export default function InventoryReportFilter({
  onApplyFilters,
  filters,
}: InventoryReportFilterProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post: leadManagerPost } = useAxiosWithAuth(
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/fetch"
  );
  const [projectNames, setProjectNames] = useState<
    { projectId: string; projectName: string }[]
  >([]);
  const [selectedProject, setSelectedProject] = useState<{
    projectId: string;
    projectName: string;
  } | null>(null);
  const [startDate, setStartDate] = useState<number | undefined>(
    filters.startDate || undefined
  );
  const [endDate, setEndDate] = useState<number | undefined>(
    filters.endDate || undefined
  );
  const [clearKey, setClearKey] = useState(0);

  const fetchProjectNames = async () => {
    const requestData = {
      eventType: "GET_PROJECT_NAMES",
    };
    const res = await leadManagerPost(requestData);
    if (res.code === "PROJECTS_RETRIEVED") {
      setProjectNames(res.body);
    }
  };

  useEffect(() => {
    fetchProjectNames();
  }, []);

  const handleApplyFilters = () => {
    onApplyFilters({
      projectId: selectedProject?.projectId || null,
      startDate,
      endDate,
    });
  };

  const handleClearFilters = () => {
    setSelectedProject(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setClearKey((prev) => prev + 1);
    onApplyFilters({
      projectId: null,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <Box key={clearKey}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item sm={3} >
          <SingleSelectSearchDropDown
            label={t("common.projectName")}
            data={projectNames?.map((project) => ({
              id: project.projectId,
              value: project.projectName,
              label: project.projectName,
            }))}
            labelKey="label"
            idKey="id"
            variant="standard"
            disableAddNew
            selectedValue={selectedProject?.projectName || ""}
            onChange={(value) => {
              const selectedProject = projectNames.find(
                (project) => project.projectName === value.value
              );
              setSelectedProject(selectedProject || null);
            }}
          />
        </Grid>

        {/* <Grid item xs sx={{ minWidth: 200, marginTop: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <CustomDateRangePicker
              label={t("common.createdBetween")}
              onApply={(st, end) => {
                setStartDate(st?.toDate().getTime());
                setEndDate(end?.toDate().getTime());
              }}
              onClear={() => {
                setStartDate(undefined);
                setEndDate(undefined);
              }}
            />
          </LocalizationProvider>
        </Grid> */}

        <Grid item>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              height: "100%",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              sx={{
                bgcolor: "#40a9ff",
                "&:hover": { bgcolor: "#1890ff" },
              }}
              onClick={handleApplyFilters}
            >
              {t("common.apply")}
            </Button>
            <Button sx={{ color: "#F7685B" }} onClick={handleClearFilters}>
              {t("common.clear")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

