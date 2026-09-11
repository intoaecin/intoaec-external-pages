import React, { useEffect, useState } from "react";
import PreferredDate from "./PreferredDate";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { GeoIPResType, LeadDetailsTypes } from "@/types";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

type BookingSlotSummary = {
  availableSlotCount: number;
  displayDate?: string;
  endTime: number | string;
  generatedSlotId: string;
  from: string;
  startTime: number | string;
  timeZone?: string;
  to: string;
};

const PreferredMode = (props: {
  architectData: {
    organizationId: string;
    organizationType: string;
    organizationName: string;
    email?: string;
    mobile?: string;
  };
  initialLeadData?: LeadDetailsTypes;
}) => {
  const router = useRouter();
  const { push } = router;
  const [preferredMode, setPreferredMode] = useState("OFFLINE");
  const [selectedDateLabel, setSelectedDateLabel] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<BookingSlotSummary | null>(
    null,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [meetingPurpose, setMeetingPurpose] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [leadData, setLeadData] = useState<LeadDetailsTypes | undefined>(
    props.initialLeadData,
  );
  const [assigneeData, setAssigneeData] = useState<{ emailId?: string }>();
  const [geoIpValue, setGeoIpValue] = useState<GeoIPResType>();
  const [currentIntegrationDetails, setCurrentIntegrationDetails] =
    useState<
      Array<{ valueofKey?: string; keyName: string; keyLabel: string }>
    >();

  const handleModeChange = (value: string) => {
    if (value === preferredMode) {
      return;
    }
    setPreferredMode(value);
    setSelectedDateLabel("");
    setSelectedSlot(null);
  };
  const [onlineIntegrated, setOnlineIntegrated] = useState(false);
  const viewerTimeZone =
    geoIpValue?.location?.timeZone ??
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [fetchDetailsLoading, setFetchDetailsLoading] = useState(true);

  const {
    VITE_LEADMANAGER_ENDPOINT,
    VITE_MEETANDNOTE_ENDPOINT,
    VITE_USERHUB_ENDPOINT,
  } = useEnv();
  const { post: postIntegrations } = useAxios(
    VITE_USERHUB_ENDPOINT + "/integrations",
  );
  const { post: fetchData, response } = useAxios(
    `${VITE_LEADMANAGER_ENDPOINT}/session`,
  );
  const { post: fetchCurrentUserData } = useAxios(
    VITE_USERHUB_ENDPOINT + "/userhub",
  );
  const { post: createSlot } = useAxios(
    `${VITE_MEETANDNOTE_ENDPOINT}/session`,
  );
  const { post: fetchIpLocationPost } = useAxiosWithAuth(
    VITE_USERHUB_ENDPOINT + "/session",
  );

  const { t } = useTranslation();
  const theme = useTheme();
  const getCurrentIntegration = async (currentIntegration: string) => {
    setFetchDetailsLoading(true);
    try {
      const result = await postIntegrations({
        eventType: "GET_INTEGRATION_DETAILS",
        name: currentIntegration,
        organizationId: props?.architectData?.organizationId,
        organizationType: props?.architectData?.organizationType,
      });
      if (result?.code == "INTEGRATIONS_RETRIEVED") {
        setCurrentIntegrationDetails(result?.body);
        // setGmailId(result?.body?.gmailId);
        // setConfigured(!result?.body?.accountExpired);
      }
    } finally {
      setFetchDetailsLoading(false);
    }
  };
  useEffect(() => {
    getCurrentIntegration("GOOGLE_CALENDAR");
  }, []);

  const fetchIpLocation = async () => {
    const res = await fetchIpLocationPost({ eventType: "GET_IP_LOCATION" });
    if (res?.code == "IP_LOCATION_RETRIEVED") {
      setGeoIpValue(res?.body as GeoIPResType);
    }
  };

  const fetchLeadData = async (projectId: string) => {
    try {
      const data = await fetchData({
        eventType: "GET_LEAD_BY_ID",
        projectId: projectId,
        organizationId: props.architectData.organizationId,
        organizationType: props.architectData.organizationType,
      });
      if (response()?.ok && data?.code === "LEAD_RETRIEVED") {
        setLeadData(data.body as LeadDetailsTypes);
      }
    } catch {
      toast.error(t("toast.somethingWentWrong"));
    }
  };

  const fetchUserData = async () => {
    const requestData = {
      eventType: "GET_USER_BY_ID",
      userId: leadData?.projectOwnerId,
    };
    const data = await fetchCurrentUserData(requestData);
    if (data) {
      if (data.code === "USERS_RETRIEVED") {
        setAssigneeData(data.body as { emailId?: string });
      } else {
        toast.error(data.error as string);
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchIpLocation();
      } catch {
        setGeoIpValue(undefined);
      }
    })();
  }, []);

  useEffect(() => {
    if (leadData) {
      setName(leadData.lead.leadName ?? "");
      setEmail(leadData.lead.leadEmail ?? "");
      (async () => {
        await fetchUserData();
      })();
    }
  }, [leadData]);

  useEffect(() => {
    if (props.initialLeadData) {
      setLeadData(props.initialLeadData);
      return;
    }
    if (router.query?.projectId && props.architectData?.organizationId) {
      fetchLeadData(router.query.projectId as string);
    }
  }, [router.query?.projectId, props.architectData?.organizationId, props.initialLeadData]);

  useEffect(() => {
    if (currentIntegrationDetails) {
      const value = currentIntegrationDetails?.find(
        (val) => val.keyName === "gmailId",
      )?.valueofKey;

      if (value) {
        setOnlineIntegrated(true);
        setPreferredMode("ONLINE");
        // setGmailId(value);
      } else {
        setOnlineIntegrated(false);
        setPreferredMode("OFFLINE");
      }
    } else {
      if (!fetchDetailsLoading) {
        setOnlineIntegrated(false);
        setPreferredMode("OFFLINE");
      }
    }
  }, [currentIntegrationDetails, fetchDetailsLoading]);

  const createSlotsForLead = async (slot: BookingSlotSummary) => {
    const requestData = {
      eventType: "CREATE_MEETING_BY_LEAD",
      organizationId: props.architectData.organizationId,
      organizationType: props.architectData.organizationType,
      entityId: leadData?.projectId,
      projectAssigneeEmail: assigneeData?.emailId,
      participants: [email || leadData?.lead.leadEmail],
      entityName: name || leadData?.lead.leadName,
      title: ` ${name || leadData?.lead.leadName}(${leadData?.projectType}) `,
      generatedSlotId: slot.generatedSlotId,
      meetingType: preferredMode,
      notificationType: "EMAIL",
      notifyBefore: 1800000,
      startTime: slot.startTime,
      endTime: slot.endTime,
      timeZone:
        geoIpValue?.location?.timeZone ?? viewerTimeZone ?? slot.timeZone,
    };
    const data = await createSlot(requestData);
    if (data?.code === "MEETING_SCHEDULED") {
      toast.success(t("toast.meetingScheduledSuccessfully"));
      push({
        pathname: "/architectAvailableSlots/thankYou",
        query: { redirect: router.query.redirect },
      });
    }
  };

  const createSlots = async (slot: BookingSlotSummary) => {
    const requestData = {
      eventType: "CREATE_MEETING_FOR_GLOBAL_AVAILABILITY",
      organizationId: props.architectData.organizationId,
      organizationType: props.architectData.organizationType,
      attendeeEmail: email,
      participants: [email, props.architectData.email],
      entityName: name,
      attendeeName: name,
      title: ` ${name}(Global availability) `,
      generatedSlotId: slot.generatedSlotId,
      meetingType: preferredMode,
      notificationType: "EMAIL",
      notifyBefore: 1800000,
      startTime: slot.startTime,
      endTime: slot.endTime,
      timeZone:
        geoIpValue?.location?.timeZone ?? viewerTimeZone ?? slot.timeZone,
    };
    const data = await createSlot(requestData);
    if (data?.code === "MEETING_SCHEDULED") {
      toast.success(data?.message as string);
      push({
        pathname: "/architectAvailableSlots/thankYou",
      });
    }
  };

  const hasProjectId = Boolean(router.query?.projectId);
  const nameError = submitAttempted && !name.trim();
  const emailError = submitAttempted && !email.trim();
  const purposeError = submitAttempted && !meetingPurpose.trim();

  const handleConfirmBooking = () => {
    setSubmitAttempted(true);
    if (
      !selectedSlot ||
      !name.trim() ||
      !email.trim() ||
      !meetingPurpose.trim()
    ) {
      return;
    }

    setIsLoading(true);
    const request = hasProjectId
      ? createSlotsForLead(selectedSlot)
      : createSlots(selectedSlot);
    request
      .catch(() => {
        toast.error(t("toast.somethingWentWrong"));
      })
      .finally(() => setIsLoading(false));
  };

  const handleSlotSelect = (slot: BookingSlotSummary | null) => {
    setSelectedSlot(slot);
    if (slot?.displayDate) {
      setSelectedDateLabel(slot.displayDate);
    }
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

  return (
    <Box
      sx={{
        alignItems: "stretch",
        display: "grid",
        gap: 3,
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
      }}
    >
      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          p: { xs: 2, md: 3 },
        }}
      >
        <Typography sx={{ fontSize: "14px", fontWeight: 600, mb: 2 }}>
          {t("architectSlotBooking.preferredModeOfContact")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            mb: 3,
          }}
        >
          {fetchDetailsLoading ? (
            [0, 1].map((item) => (
              <Skeleton
                key={item}
                variant="rounded"
                sx={{ borderRadius: 1.5, minHeight: 70 }}
              />
            ))
          ) : (
            modeOptions.map((option) => {
              const selected = preferredMode === option.value;
              return (
                <Button
                  key={option.value}
                  onClick={() => handleModeChange(option.value)}
                  sx={{
                    alignItems: "center",
                    border: `1px solid ${
                      selected
                        ? theme.palette.primary.dark
                        : theme.palette.divider
                    }`,
                    borderRadius: 1.5,
                    color: "text.primary",
                    justifyContent: "flex-start",
                    minHeight: 70,
                    p: 2,
                    textAlign: "left",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: theme.palette.primary.dark,
                      bgcolor: "primary.light",
                    },
                  }}
                  variant="outlined"
                >
                  <Box>
                    <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                      {option.label}
                    </Typography>
                    <Typography
                      sx={{ color: "text.secondary", fontSize: "11px" }}
                    >
                      {option.helperText}
                    </Typography>
                  </Box>
                </Button>
              );
            })
          )}
        </Box>

        {!fetchDetailsLoading && (
          <PreferredDate
            preferredMode={preferredMode}
            architectData={props.architectData}
            selectedSlotDateLabel={selectedDateLabel}
            selectedSlot={selectedSlot}
            onDateSelect={setSelectedDateLabel}
            onSlotSelect={handleSlotSelect}
            viewerTimeZone={viewerTimeZone}
          />
        )}
      </Box>

      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          display: "flex",
          flexDirection: "column",
          p: { xs: 2, md: 3 },
        }}
      >
        <Typography sx={{ fontSize: "14px", fontWeight: 600, mb: 2.5 }}>
          {t("architectSlotBooking.bookingSummary")}
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ color: "text.secondary", fontSize: "11px" }}>
              {t("architectSlotBooking.mode")}
            </Typography>
            <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
              {preferredMode === "ONLINE"
                ? t("architectSlotBooking.onlineMeeting")
                : t("architectSlotBooking.inPerson")}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ color: "text.secondary", fontSize: "11px" }}>
              {t("common.date")}
            </Typography>
            <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
              {selectedDateLabel || t("architectSlotBooking.notSelected")}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ color: "text.secondary", fontSize: "11px" }}>
              {t("common.time")}
            </Typography>
            <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
              {selectedSlot
                ? `${selectedSlot.from} - ${selectedSlot.to}`
                : t("architectSlotBooking.notSelected")}
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={1.5} sx={{ mt: 3 }}>
          <Box>
            <Typography sx={{ fontSize: "13px", mb: 0.5 }}>
              {t("architectSlotBooking.name")}
              <span className="requiredUI">*</span>
            </Typography>
            <TextField
              error={nameError}
              fullWidth
              helperText={nameError ? t("common.requiredField") : ""}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("architectSlotBooking.enterYourName")}
              size="small"
              value={name}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "13px", mb: 0.5 }}>
              {t("common.emailAddress")}
              <span className="requiredUI">*</span>
            </Typography>
            <TextField
              error={emailError}
              fullWidth
              helperText={emailError ? t("common.requiredField") : ""}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("leadCapture.enterYourEmail")}
              size="small"
              value={email}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "13px", mb: 0.5 }}>
              {t("architectSlotBooking.meetingPurpose")}
            </Typography>
            <TextField
              error={purposeError}
              fullWidth
              helperText={purposeError ? t("common.requiredField") : ""}
              onChange={(event) => setMeetingPurpose(event.target.value)}
              placeholder={t("architectSlotBooking.enterMeetingPurpose")}
              size="small"
              value={meetingPurpose}
            />
          </Box>
        </Stack>
        <Typography
          sx={{
            color: "error.main",
            fontSize: "12px",
            mt: 2.5,
          }}
        >
          {t("architectSlotBooking.rescheduleNote")}{" "}
          <Box component="a" href={`mailto:${props.architectData?.email}`}>
            {props.architectData?.email}
          </Box>{" "}
          {props?.architectData?.mobile ? `${t("common.or")}` : ""}{" "}
          <Box component="a" href={`tel:${props.architectData?.mobile}`}>
            {props.architectData?.mobile}
          </Box>
        </Typography>
        <LoadingButton
          disabled={!selectedSlot}
          fullWidth
          loading={isLoading}
          onClick={handleConfirmBooking}
          sx={{ mt: 3, textTransform: "none" }}
          variant="contained"
        >
          {t("architectSlotBooking.confirmBooking")}
        </LoadingButton>
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "11px",
            mt: 2,
            textAlign: "center",
          }}
        >
          {t("architectSlotBooking.confirmationEmailNote")}
        </Typography>
      </Box>
    </Box>
  );
};

export default PreferredMode;
