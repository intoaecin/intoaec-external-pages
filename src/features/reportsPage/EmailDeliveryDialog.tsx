import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
  Tab,
  Tabs,
  IconButton,
  Typography,
  Link,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useTranslation } from "react-i18next";
import { useUsersData } from "@/features/hooks/useUsersData";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { toast } from "react-toastify";
import { convertFromUTC, convertToUTC } from "./utils";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";
import { LoadingButton } from "@mui/lab";

interface EmailDeliveryDialogProps {
  reportsData?: any;
  reportType?: string;
  open: boolean;
  onClose: () => void;
}

const EmailDeliveryDialog = ({
  reportsData,
  reportType,
  open,
  onClose,
}: EmailDeliveryDialogProps) => {
  const [tabValue, setTabValue] = React.useState(0);
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const { data: session } = useSession();
  const [timeZone, setTimeZone] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post: createReports } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );
  const { usersData } = useUsersData();
  // Add this to your existing state
  // Update the emailConfig state interface
  const [emailConfig, setEmailConfig] = useState<any>({
    id: "",
    from: "",
    to: [], // Changed from '' to []
    startDate: null,
    startTime: null,
    repeat: "DAILY",
    customizeEmail: false,
    subject: "",
    message: "",
    timestamp: null,
  });
  useEffect(() => {
    if (localizationValue) {
      setTimeZone(getLocalizationValue(localizationValue, "TIMEZONE", "ID"));
    }
  }, [localizationValue]);
  useEffect(() => {
    if (reportsData && timeZone) {
      const localStartTime = convertFromUTC({
        timestamp: parseInt(reportsData.startTime),
        timezone: timeZone,
      });

      setEmailConfig({
        ...emailConfig,
        id: reportsData.reportsAutomationId,
        to: reportsData.toEmailUserIDs || [], // Changed to use the full array
        startDate: new Date(reportsData.startDate),
        startTime: localStartTime,
        repeat: reportsData.recurrenceType,
        timestamp: parseInt(reportsData.startTime),
      });
    }
  }, [reportsData, timeZone]);

  const getNextTriggerDate = (
    startDate: Date,
    recurrenceType: string
  ): number => {
    const nextDate = new Date(startDate);

    switch (recurrenceType) {
      case "DAILY":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "WEEKLY":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "MONTHLY":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      default:
        return startDate.getTime();
    }

    return nextDate.getTime();
  };

  const createReportsAutomation = async () => {
    setLoading(true);
    const convertedUtcTime = await convertToUTC({
      timestamp: emailConfig.startTime,
      timezone: timeZone,
    });
    setIsLoading(true);

    // Calculate next trigger date
    const nextTriggerDate = getNextTriggerDate(
      new Date(emailConfig.startDate),
      emailConfig.repeat
    );

    const requestData: any = {
      eventType: reportsData?.reportsAutomationId
        ? "UPDATE_REPORTS_AUTOMATION"
        : "CREATE_REPORTS_AUTOMATION",
      ...(reportsData?.reportsAutomationId
        ? { reportsAutomationId: reportsData?.reportsAutomationId }
        : {}),
      organizationId: session?.["custom:organization_id"],
      reportName: reportType,
      startTime: convertedUtcTime,
      endTime: convertedUtcTime + 3600000,
      toEmailUserIDs: emailConfig.to, // Now sending the full array
      startDate: emailConfig.startDate,
      recurrenceType: emailConfig.repeat,
      isRecurring: true,
      nextReportTriggerDate: nextTriggerDate,
    };

    try {
      const res = await createReports(requestData);
      setLoading(false);
      if (
        res?.code ===
        (reportsData?.reportsAutomationId
          ? "REPORT_AUTOMATION_UPDATED"
          : "REPORT_AUTOMATION_CREATED")
      ) {
        toast.success(
          reportsData?.reportsAutomationId
            ? "Reports automation updated"
            : "Reports automation created"
        );
        onClose();
      } else {
        toast.error("Error creating reports automation");
      }
    } catch (error: any) {
      toast.error("Network error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Modify the handleChange function to calculate timestamp when date or time changes
  // Update the handleChange function
  const handleChange = (field: string, value: any) => {
    setEmailConfig((prev: any) => {
      const newConfig = {
        ...prev,
        [field]: value,
      };

      if (field === "startTime" && value) {
        // Convert the selected time to Unix timestamp in milliseconds
        const timeDate = new Date(value);
        newConfig.startTime = timeDate.getTime() || null;
      }

      // Calculate combined timestamp when either date or time changes
      if (field === "startDate" || field === "startTime") {
        const date = field === "startDate" ? value : prev.startDate;
        const time = field === "startTime" ? value : prev.startTime;

        if (date && time) {
          const combinedDateTime = new Date(date);
          const timeDate = new Date(time);

          combinedDateTime.setHours(
            timeDate.getHours(),
            timeDate.getMinutes(),
            timeDate.getSeconds()
          );

          newConfig.timestamp = combinedDateTime.getTime();
          // Update startTime when date changes to maintain the correct timestamp
          if (field === "startDate") {
            newConfig.startTime = combinedDateTime.getTime();
          }
        }
      }

      return newConfig;
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6">{t("sidebar.reports")}</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          {/* <Tabs value={tabValue} >
            <Tab label="Settings" />
            <Tab label="Filters" />
          </Tabs> */}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            label={t("common.sendTo")}
            variant="outlined"
            value={emailConfig.to}
            onChange={(e) => handleChange("to", e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            SelectProps={{
              multiple: true,
              displayEmpty: true,
              renderValue: (selected: unknown) => {
                if (!Array.isArray(selected)) {
                  return "\u00a0";
                }
                if (selected.length === 0) {
                  return "\u00a0";
                }
                return selected
                  .map((value) => {
                    const selectedUser = usersData.find(
                      (user) => user.userId === value
                    );
                    return selectedUser?.name || String(value);
                  })
                  .join(", ");
              },
            }}
          >
            {usersData.map((user) => (
              <MenuItem key={user.userId} value={user.userId}>
                {user.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Repeat"
            value={emailConfig.repeat}
            onChange={(e) => handleChange("repeat", e.target.value)}
            fullWidth
            SelectProps={{
              native: true,
            }}
          >
            <option value="DAILY">DAILY</option>
            <option value="WEEKLY">WEEKLY</option>
            <option value="MONTHLY">MONTHLY</option>
          </TextField>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={emailConfig.startDate}
                  onChange={(date) => handleChange("startDate", date)}
                  sx={{ flex: 1 }}
                />
                <TimePicker
                  label="Start Time"
                  value={emailConfig.startTime}
                  onChange={(time) => handleChange("startTime", time)}
                  sx={{ flex: 1 }}
                  views={["hours"]}
                  ampm={true}
                  format="hh a"
                />
              </Box>
              <Typography
                variant="caption"
                sx={{ color: "error.main", mt: 0.5 }}
              >
                {emailConfig.startTime ? (
                  <>
                    Note: Reports will be sent between{" "}
                    {new Date(emailConfig.startTime).toLocaleString("en-US", {
                      hour: "numeric",
                      hour12: true,
                    })}{" "}
                    and{" "}
                    {new Date(emailConfig.startTime)
                      .toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                      .replace(":00", ":59")}
                  </>
                ) : (
                  "Note: Please select a start time for the reports"
                )}
              </Typography>
            </Box>
          </LocalizationProvider>
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
        >
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton
            loading={loading}
            onClick={() => createReportsAutomation()}
            variant="contained"
            color="primary"
          >
            Save
          </LoadingButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EmailDeliveryDialog;

