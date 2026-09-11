import PreferredDate from "@/features/components/architectAvailabilityPreview/PreferredDate";
import {
  OrganizationDetailsOverrideProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { setCreateLeadFormData } from "@/features/leadCapture/setCreateFormData";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type LeadCaptureV2PreferredSlotsProps = {
  disabled?: boolean;
  embedded?: boolean;
  organizationId?: string;
  organizationType?: string;
};

type BookingSlotSummary = {
  availableSlotCount: number;
  endTime: number | string;
  generatedSlotId: string;
  from: string;
  startTime: number | string;
  timeZone?: string;
  to: string;
};

const buildDateKey = (
  selectedDate?: number | string,
  selectedMonth?: string,
  selectedYear?: number | string,
): string | undefined => {
  if (!selectedDate || !selectedMonth || !selectedYear) {
    return undefined;
  }

  const monthIndex = Number.parseInt(String(selectedMonth), 10) - 1;
  if (Number.isNaN(monthIndex)) {
    return undefined;
  }

  return `${selectedYear}-${monthIndex}-${selectedDate}`;
};

const buildDateLabel = (
  selectedDate?: number | string,
  selectedMonth?: string,
  selectedYear?: number | string,
): string => {
  const dateKey = buildDateKey(selectedDate, selectedMonth, selectedYear);
  if (!dateKey) {
    return "";
  }

  const monthIndex = Number.parseInt(String(selectedMonth), 10) - 1;
  const date = new Date(Number(selectedYear), monthIndex, Number(selectedDate));
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const LeadCaptureV2SlotSetupPicker = ({
  disabled = false,
  embedded = false,
  organizationId,
  organizationType,
}: LeadCaptureV2PreferredSlotsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { VITE_USERHUB_ENDPOINT } = useEnv();
  const { post: postIntegrations } = useAxios(
    `${VITE_USERHUB_ENDPOINT}/integrations`,
    false,
  );
  const { leadCaptureData } = LeadCaptureStore.useState();

  const [onlineIntegrated, setOnlineIntegrated] = useState(false);
  const [fetchDetailsLoading, setFetchDetailsLoading] = useState(false);
  const [selectedDateLabel, setSelectedDateLabel] = useState(() =>
    buildDateLabel(
      leadCaptureData?.selectedDate,
      leadCaptureData?.selectedMonth,
      leadCaptureData?.selectedYear,
    ),
  );

  const preferredMode = leadCaptureData?.meetingType ?? "OFFLINE";
  const selectedSlot =
    (leadCaptureData?.preferredSlot as BookingSlotSummary | undefined) ?? null;
  const initialDateKey = buildDateKey(
    leadCaptureData?.selectedDate,
    leadCaptureData?.selectedMonth,
    leadCaptureData?.selectedYear,
  );

  const architectData = useMemo(
    () => ({
      organizationId: organizationId ?? "",
      organizationType: organizationType ?? "",
    }),
    [organizationId, organizationType],
  );

  useEffect(() => {
    if (!organizationId || !organizationType) {
      return;
    }

    const getCurrentIntegration = async () => {
      setFetchDetailsLoading(true);
      try {
        const result = await postIntegrations({
          eventType: "GET_INTEGRATION_DETAILS",
          name: "GOOGLE_CALENDAR",
          organizationId,
          organizationType,
        });

        if (result?.code === "INTEGRATIONS_RETRIEVED") {
          const gmailId = (
            result.body as Array<{ keyName: string; valueofKey?: string }>
          )?.find((entry) => entry.keyName === "gmailId")?.valueofKey;

          if (gmailId) {
            setOnlineIntegrated(true);
            if (!leadCaptureData?.meetingType) {
              setCreateLeadFormData({ meetingType: "ONLINE" });
            }
            return;
          }
        }

        setOnlineIntegrated(false);
        if (!leadCaptureData?.meetingType) {
          setCreateLeadFormData({ meetingType: "OFFLINE" });
        }
      } finally {
        setFetchDetailsLoading(false);
      }
    };

    void getCurrentIntegration();
  }, [organizationId, organizationType]);

  useEffect(() => {
    if (!fetchDetailsLoading && !onlineIntegrated && preferredMode === "ONLINE") {
      setCreateLeadFormData({ meetingType: "OFFLINE" });
    }
  }, [fetchDetailsLoading, onlineIntegrated, preferredMode]);

  const handleModeChange = (value: string) => {
    if (disabled || value === preferredMode) {
      return;
    }

    setSelectedDateLabel("");
    setCreateLeadFormData({
      meetingType: value,
      preferredSlot: undefined,
      selectedDate: undefined,
      selectedMonth: undefined,
      selectedYear: undefined,
    });
  };

  const handleDatePartsChange = (parts: {
    selectedDate: number;
    selectedMonth: string;
    selectedYear: number;
  }) => {
    setCreateLeadFormData({
      selectedDate: parts.selectedDate,
      selectedMonth: parts.selectedMonth,
      selectedYear: parts.selectedYear,
      preferredSlot: undefined,
    });
  };

  const handleSlotSelect = (slot: BookingSlotSummary | null) => {
    if (disabled) {
      return;
    }

    setCreateLeadFormData({
      preferredSlot: slot ?? undefined,
    });
  };

  const modeOptions = [
    ...(onlineIntegrated
      ? [
          {
            helperText: t("architectSlotBooking.onlineMeetingHelper"),
            label: t("architectSlotBooking.onlineMeeting"),
            value: "ONLINE",
          },
        ]
      : []),
    {
      helperText: t("architectSlotBooking.inPersonHelper"),
      label: t("architectSlotBooking.inPerson"),
      value: "OFFLINE",
    },
  ];

  const modeGridColumns =
    modeOptions.length === 1
      ? { xs: "1fr", sm: "1fr" }
      : { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" };

  const content = (
    <>
      <Typography sx={{ fontSize: "14px", fontWeight: 600, mb: 2 }}>
        {t("architectSlotBooking.preferredModeOfContact")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: modeGridColumns,
          mb: 3,
        }}
      >
        {modeOptions.map((option) => {
          const selected = preferredMode === option.value;
          return (
            <Button
              key={option.value}
              disabled={disabled}
              onClick={() => handleModeChange(option.value)}
              sx={{
                alignItems: "center",
                border: `1px solid ${
                  selected ? theme.palette.primary.dark : theme.palette.divider
                }`,
                borderRadius: 1.5,
                color: "text.primary",
                justifyContent: "flex-start",
                minHeight: 70,
                opacity: disabled ? 0.6 : 1,
                p: 2,
                textAlign: "left",
                textTransform: "none",
                "&:hover": {
                  borderColor: theme.palette.primary.dark,
                  bgcolor: disabled ? "transparent" : "primary.light",
                },
              }}
              variant="outlined"
            >
              <Box>
                <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                  {option.label}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "11px" }}>
                  {option.helperText}
                </Typography>
              </Box>
            </Button>
          );
        })}
      </Box>

      <PreferredDate
        key={preferredMode}
        architectData={architectData}
        disabled={disabled}
        initialDateKey={initialDateKey}
        initialSelectedDate={
          leadCaptureData?.selectedDate
            ? Number(leadCaptureData.selectedDate)
            : null
        }
        initialSelectedMonth={leadCaptureData?.selectedMonth ?? null}
        initialSelectedYear={
          leadCaptureData?.selectedYear
            ? Number(leadCaptureData.selectedYear)
            : null
        }
        preferredMode={preferredMode}
        selectedSlot={selectedSlot}
        selectedSlotDateLabel={selectedDateLabel}
        onDatePartsChange={handleDatePartsChange}
        onDateSelect={setSelectedDateLabel}
        onSlotSelect={handleSlotSelect}
      />
    </>
  );

  if (embedded) {
    return <Box>{content}</Box>;
  }

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        boxShadow: theme.shadows[1],
        p: { xs: 2, md: 3 },
      }}
    >
      {content}
    </Box>
  );
};

const LeadCaptureV2PreferredSlotsInner = ({
  disabled = false,
  embedded = false,
  organizationId: organizationIdProp,
  organizationType: organizationTypeProp,
}: LeadCaptureV2PreferredSlotsProps) => {
  const organizationFromContext = useOrganization();
  const { VITE_DEFAULT_ORGANIZATION_TYPE } = useEnv();

  const organizationId =
    organizationIdProp ?? organizationFromContext.organizationId;
  const organizationType =
    organizationTypeProp ??
    organizationFromContext.organizationType ??
    VITE_DEFAULT_ORGANIZATION_TYPE;

  return (
    <LeadCaptureV2SlotSetupPicker
      disabled={disabled}
      embedded={embedded}
      organizationId={organizationId}
      organizationType={organizationType}
    />
  );
};

/**
 * Wraps the shared slot setup UI with org context when V2 runs outside
 * OrganizationDetailsProvider (admin builder/preview).
 */
const LeadCaptureV2PreferredSlots = ({
  disabled = false,
  embedded = false,
  organizationId,
  organizationType,
}: LeadCaptureV2PreferredSlotsProps) => {
  const { VITE_DEFAULT_ORGANIZATION_TYPE } = useEnv();

  if (!organizationId) {
    return (
      <LeadCaptureV2SlotSetupPicker
        disabled={disabled}
        embedded={embedded}
        organizationId={organizationId}
        organizationType={organizationType}
      />
    );
  }

  const resolvedOrganizationType =
    organizationType ?? VITE_DEFAULT_ORGANIZATION_TYPE;

  return (
    <OrganizationDetailsOverrideProvider
      organizationId={organizationId}
      organizationType={resolvedOrganizationType}
    >
      <LeadCaptureV2PreferredSlotsInner
        disabled={disabled}
        embedded={embedded}
        organizationId={organizationId}
        organizationType={resolvedOrganizationType}
      />
    </OrganizationDetailsOverrideProvider>
  );
};

export default LeadCaptureV2PreferredSlots;
