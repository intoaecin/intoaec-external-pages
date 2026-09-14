import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type ClientReportLogSection =
  | "weather"
  | "schedule"
  | "tasks"
  | "workers"
  | "inventory";

type ClientReportSideBarProps = {
  selectedSections: Record<ClientReportLogSection, boolean>;
  onToggleSection: (section: ClientReportLogSection) => void;
  disabledSections?: Partial<
    Record<ClientReportLogSection, { disabled: boolean; tooltip: string }>
  >;
  isDrawer?: boolean;
  onClose?: () => void;
};

const ClientReportSideBar = ({
  selectedSections,
  onToggleSection,
  disabledSections = {},
  isDrawer = false,
  onClose,
}: ClientReportSideBarProps) => {
  const { t } = useTranslation();
  const logItems = [
    {
      id: "weather",
      label: t("common.weather", { defaultValue: "Weather" }),
      icon: <CloudQueueIcon fontSize="small" />,
    },
    {
      id: "schedule",
      label: t("common.schedule"),
      icon: <AnalyticsOutlinedIcon fontSize="small" />,
    },
    {
      id: "tasks",
      label: t("clientReport.tasks", { defaultValue: "Tasks" }),
      icon: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
    },
    {
      id: "workers",
      label: t("common.workers"),
      icon: <GroupsOutlinedIcon fontSize="small" />,
    },
    {
      id: "inventory",
      label: t("common.inventory", { defaultValue: "Inventory" }),
      icon: <Inventory2OutlinedIcon fontSize="small" />,
    },
  ] satisfies {
    id: ClientReportLogSection;
    label: string;
    icon: ReactNode;
  }[];

  return (
    <Box
      sx={{
        width: isDrawer ? "100%" : { md: 210, lg: 230 },
        alignSelf: isDrawer ? "auto" : "stretch",
        flexShrink: 0,
        borderLeft: isDrawer ? 0 : `1px solid ${CLIENT_REPORT_COLORS.border}`,
        bgcolor: "background.paper",
        px: { xs: 2, md: 2.25 },
        py: { xs: 2, md: 2 },
        height: "auto",
        minHeight: isDrawer ? "100dvh" : "auto",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={isDrawer ? "space-between" : "center"}
      >
        <Typography
          sx={{
            color: "text.secondary",
            typography: "caption",
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: 0,
          }}
        >
          {t("common.includeInYourLog", {
            defaultValue: "Include in your log",
          })}
        </Typography>
        {isDrawer && (
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
      <Divider sx={{ my: 1, mx: 2 }} />
      <Stack spacing={1}>
        {logItems.map((item) => {
          const isSelected = selectedSections[item.id];
          const disabledSection = disabledSections[item.id];
          const isDisabled = Boolean(disabledSection?.disabled);

          return (
            <Tooltip
              key={item.id}
              title={isDisabled ? disabledSection?.tooltip ?? "" : ""}
              placement="left"
            >
              <span style={{ display: "block", width: "100%" }}>
                <Button
                  variant="outlined"
                  disabled={isDisabled}
                  startIcon={item.icon}
                  endIcon={
                    isSelected && !isDisabled ? (
                      <CheckCircleOutlineIcon fontSize="small" />
                    ) : null
                  }
                  onClick={() => {
                    if (!isDisabled) {
                      onToggleSection(item.id);
                    }
                  }}
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    textTransform: "none",
                    borderRadius: 5,
                    borderColor: isSelected
                      ? "primary.main"
                      : CLIENT_REPORT_COLORS.borderMuted,
                    color: isSelected ? "primary.main" : "text.primary",
                    bgcolor: isSelected
                      ? CLIENT_REPORT_COLORS.chipSelected
                      : "background.paper",
                    minHeight: { xs: 42, md: 36 },
                    px: 1.5,
                    "& .MuiButton-endIcon": {
                      ml: "auto",
                      mr: 0,
                    },
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: isSelected
                        ? CLIENT_REPORT_COLORS.chipSelected
                        : CLIENT_REPORT_COLORS.chipHover,
                    },
                  }}
                >
                  {item.label}
                </Button>
              </span>
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ClientReportSideBar;
