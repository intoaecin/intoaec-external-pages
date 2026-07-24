import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { setCreateLeadFormData } from "@/features/leadCapture/setCreateFormData";
import NoAvailableSlotsIcon from "@/assets/icons/no-available-slots";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import {
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type RenderPreferredSlotsProps = {
  disabled?: boolean;
  organizationId?: string;
  organizationType?: string;
};

const RenderPreferredSlots = ({
  disabled = false,
  organizationId: organizationIdProp,
  organizationType: organizationTypeProp,
}: RenderPreferredSlotsProps) => {
  const router = useRouter();
  const theme = useTheme();
  const organizationFromContext = useOrganization();
  const { NEXT_PUBLIC_DEFAULT_ORGANIZATION_TYPE } = useEnv();
  const organizationId =
    organizationIdProp ?? organizationFromContext.organizationId;
  const organizationType =
    organizationTypeProp ??
    organizationFromContext.organizationType ??
    NEXT_PUBLIC_DEFAULT_ORGANIZATION_TYPE;
  const currentQuestionNumber = router.query.question;
  const currentDate = new Date();
  // const [selectedDate, setSelectedDate] = useState<any>(null);
  // const [selectedMonth, setSelectedMonth] = useState<any>();
  // const [selectedYear, setSelectedYear] = useState<any>();

  const [timeSlots, setTimeSlots] = useState<any>();
  const [hoveredDate, setHoveredDate] = useState(null);

  const { leadCaptureData } = LeadCaptureStore.useState();
  const { NEXT_PUBLIC_MEETANDNOTE_ENDPOINT } = useEnv();
  const [currentIntegrationDetails, setCurrentIntegrationDetails] =
    useState<
      Array<{ valueofKey?: string; keyName: string; keyLabel: string }>
    >();
  const [onlineIntegrated, setOnlineIntegrated] = useState(false);

  const [fetchDetailsLoading, setFetchDetailsLoading] = useState(false);

  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post: postIntegrations } = useAxios(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/integrations",
    false,
  );

  const { t } = useTranslation();
  const getCurrentIntegration = async (currentIntegration: string) => {
    if (!organizationId || !organizationType) return;

    setFetchDetailsLoading(true);
    const result = await postIntegrations({
      eventType: "GET_INTEGRATION_DETAILS",
      name: currentIntegration,
      organizationId,
      organizationType,
    }).finally(() => {
      setFetchDetailsLoading(false);
    });
    if (result?.code == "INTEGRATIONS_RETRIEVED") {
      setCurrentIntegrationDetails(result?.body);
      // setGmailId(result?.body?.gmailId);
      // setConfigured(!result?.body?.accountExpired);
    }
  };
  useEffect(() => {
    void getCurrentIntegration("GOOGLE_CALENDAR");
  }, [organizationId, organizationType]);
  useEffect(() => {
    if (currentIntegrationDetails) {
      const value = currentIntegrationDetails?.find(
        (val) => val.keyName === "gmailId"
      )?.valueofKey;

      if (value) {
        setOnlineIntegrated(true);
        setCreateLeadFormData({ meetingType: "OFFLINE" });
        // setGmailId(value);
      } else {
        setOnlineIntegrated(false);
        setCreateLeadFormData({ meetingType: "OFFLINE" });
      }
    } else {
      if (!fetchDetailsLoading) {
        setOnlineIntegrated(false);
        setCreateLeadFormData({ meetingType: "OFFLINE" });
      }
    }
  }, [currentIntegrationDetails]);
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");

  const { post: fetchData } = useAxios<any>(
    `${NEXT_PUBLIC_MEETANDNOTE_ENDPOINT}/session`,
    false,
  );

  useEffect(() => {
    if (!leadCaptureData?.meetingType) {
      setCreateLeadFormData({ meetingType: "OFFLINE" });
    }
  }, [leadCaptureData]);

  const formatFetchResult = (result: Array<any>) => {
    return result?.map((value) => {
      const fromHour = value.startHour;
      const fromMinutes = value.startMinutes;
      const toHour = value.endHour;
      const toMinutes = value.endMinutes;
      // Create Date objects for start and end times
      const fromTime = new Date();
      const toTime = new Date();

      // Set hours and minutes for start time
      fromTime.setHours(fromHour);
      fromTime.setMinutes(fromMinutes);

      // Set hours and minutes for end time
      toTime.setHours(toHour);
      toTime.setMinutes(toMinutes);

      // Format start time
      const formattedFromTime = fromTime.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Format end time
      const formattedToTime = toTime.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        availableSlotCount: value.availableSlotCount,
        generatedSlotId: value.generatedSlotId,
        startTime: value.startTime,
        endTime: value.endTime,
        from: formattedFromTime,
        to: formattedToTime,
      };
    });
  };
  const handleSlotClick = (index: any) => {
    setCreateLeadFormData({
      preferredSlot: timeSlots[index],
      // meetingType: preferredMode.toUpperCase(),
    });
    // setSelectedSlot(timeSlots[index]);
  };
  useEffect(() => {}, []);
  const fetchSlots = async () => {
    if (
      !organizationId ||
      !organizationType ||
      !leadCaptureData?.selectedDate ||
      !leadCaptureData?.selectedMonth ||
      !leadCaptureData?.selectedYear
    ) {
      return;
    }

    try {
      const requestData = {
        eventType: "GET_ORGANIZATION_SLOTS",
        organizationId,
        organizationType,
        startTime: Date.now(),
        startDate: leadCaptureData.selectedDate,
        startMonth: leadCaptureData.selectedMonth,
        startYear: leadCaptureData.selectedYear,
        timeZone: "IST",
      };
      const data = await fetchData(requestData);
      if (data.code === "ORGANIZATION_SLOTS_FOUND") {
        const result: Array<unknown> = formatFetchResult(data?.body);
        setTimeSlots(result);
      } else {
        setTimeSlots([]);
      }
    } catch {
      setTimeSlots([]);
    }
  };
  useEffect(() => {
    if (leadCaptureData?.selectedDate) {
      void fetchSlots();
    }
  }, [
    leadCaptureData?.selectedDate,
    leadCaptureData?.selectedMonth,
    leadCaptureData?.selectedYear,
    organizationId,
    organizationType,
  ]);
  const handleModeChange = (event: any) => {
    console.log();

    setCreateLeadFormData({
      meetingType: event.target.value.toUpperCase(),
    });
  };
  const handleDateClick = (value: any) => {
    const selectedDay = value.nextDate;
    selectedDay.setDate(selectedDay.getDate());

    const month = (selectedDay.getMonth() + 1).toString().padStart(2, "0");

    setCreateLeadFormData({
      selectedDate: selectedDay.getDate(),
      selectedMonth: month,
      selectedYear: selectedDay.getFullYear(),
    });
  };


  const handleDateHover = (dayOfMonth: any) => {
    setHoveredDate(dayOfMonth);
  };
  const renderNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + i);

      const dayName = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
      }).format(nextDate);
      const dayOfMonth = nextDate.getDate();
      const monthName = new Intl.DateTimeFormat("en-US", {
        month: "short",
      }).format(nextDate);

      days.push({
        dayOfMonth,
        monthName,
        nextDate,
        dayName,
      });
    }
    return days;
  };


  return (
    <div>
      <div className="d-flex align-items-center ml-3">
        <div
          style={{ textAlign: "center", color: "black" }}
          className="align-items-center column d-flex"
        >
          <div className="row col-lg-7 justify-content-center">
            {renderNext7Days()?.map((value, i) => {
              const isSelected =
                value.dayOfMonth === leadCaptureData?.selectedDate;
              const isHovered = value.dayOfMonth === hoveredDate;

              return (
                <button
                  key={i}
                  disabled={disabled}
                  className="col"
                  onClick={() => handleDateClick(value)}
                  onMouseEnter={() => handleDateHover(value?.dayOfMonth)}
                  onMouseLeave={() => setHoveredDate(null)}
                  style={{
                    border: "1px solid #0D1C82",
                    padding: "10px",
                    borderRadius: "4px",
                    margin: "20px 10px",
                    width: "80px",
                    maxWidth: "80px",
                    boxShadow:
                      "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px",
                    backgroundColor:
                      isSelected || isHovered
                        ? `${theme.palette.primary.dark}`
                        : "transparent",
                    color: isSelected || isHovered ? "#fff" : "#000",
                    cursor: disabled ? "not-allowed" : "pointer",
                    transition: "background-color 0.3s ease",
                    opacity: disabled ? 0.6 : 1,
                  }}
                >
                  <div style={{ fontSize: "15px" }}>{value?.dayName}</div>
                  <div
                    style={{
                      fontSize: "20px",
                      color: isSelected || isHovered ? "#fff" : "#0D1C82",
                    }}
                  >
                    {value?.dayOfMonth}
                  </div>
                  <div
                    style={{
                      margin: "5px 0",
                      fontSize: "10px",
                      color: isSelected || isHovered ? "#fff" : "#909090",
                    }}
                  >
                    {value?.monthName},{value?.nextDate.getFullYear()}
                  </div>
                </button>
              );
            })}
          </div>

          {leadCaptureData?.selectedDate ? (
            <>
              {timeSlots?.length <= 0 ? (
                <div>
                  <div>
                    <NoAvailableSlotsIcon width={"15vw"} />
                  </div>
                  <div> {t('architectSlotBooking.noAvailableSlotsFound')}</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: "15px", marginTop: "40px" }}>
                    Please find our firm's available timeslot below.
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      margin: "20px 0",
                    }}
                  >
                    {timeSlots?.map((slots: any, index: any) => {
                      // const isSelected = leadCaptureData?.preferredSlot === index; // Check if the slot is selected
                      return (
                        <Button
                          key={slots?.generatedSlotId}
                          // onClick={() => {
                          //   if (slot.availableSlotCount <= 0) {
                          //     toast.error("This slot is booked already");
                          //   } else {
                          //     handleSlotClick(slot);
                          //   }
                          // }}
                          onClick={() => {
                            handleSlotClick(index);
                          }}
                          disabled={disabled || slots.availableSlotCount <= 0}
                          style={{
                            border: "1px solid",
                            borderColor:
                              leadCaptureData?.preferredSlot
                                ?.generatedSlotId === slots?.generatedSlotId
                                ? theme?.palette?.primary?.main
                                : "grey",
                            width: "fit-content",
                            backgroundColor:
                              slots.availableSlotCount <= 0
                                ? "#E9E7E7"
                                : "white",
                            color:
                              leadCaptureData?.preferredSlot
                                ?.generatedSlotId === slots?.generatedSlotId
                                ? theme?.palette?.primary?.main
                                : "black",
                            padding: "10px",
                            borderRadius: "5px",
                            marginRight: "10px",
                            marginBottom: "10px",
                            cursor: disabled ? "not-allowed" : "pointer",
                            opacity: disabled ? 0.6 : 1,
                          }}
                        >
                          {slots.from} - {slots.to}
                        </Button>
                      );
                    })}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "40px",
                      color: "black",
                      alignItems: "center",
                    }}
                  >
                    {" "}
                    Meeting Mode: &nbsp;&nbsp;&nbsp;
                    <FormControl>
                      <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        value={leadCaptureData?.meetingType}
                        onChange={handleModeChange}
                      >
                        {onlineIntegrated && (
                          <FormControlLabel
                            value="ONLINE"
                            control={<Radio disabled={disabled} />}
                            label="Online"
                          />
                        )}
                        <FormControlLabel
                          value="OFFLINE"
                          control={<Radio disabled={disabled} />}
                          label="Offline"
                        />
                      </RadioGroup>
                    </FormControl>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div
                style={{
                  marginTop: "10px",
                  fontWeight: 500,
                  fontSize: "18px",
                }}
              >
               {t('leadCapture.choosePreferredDate')}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RenderPreferredSlots;
