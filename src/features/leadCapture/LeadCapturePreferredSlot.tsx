import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import ArrowRightIcons from "@/assets/icons/arrow-right";
import NoAvailableSlotsIcon from "@/assets/icons/no-available-slots";
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
import { useEffect, useState } from "react";
import CustomCircularProgressbar from "./LeadCaptureCircularProgressbar";
import { setCreateLeadFormData } from "./setCreateFormData";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { useTranslation } from "react-i18next";

const LeadCapturePreferredSLot = ({handleNextQuestions,handlePreviousQuestions}:{handleNextQuestions:()=>void,handlePreviousQuestions:()=>void}) => {
  const { push } = useRouter();
  const router = useRouter();
  const theme = useTheme();
  const { organizationId, organizationType, logoUrl } = useOrganization();
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
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/integrations"
  );
  const getCurrentIntegration = async (currentIntegration: string) => {
    setFetchDetailsLoading(true);
    const result = await postIntegrations({
      eventType: "GET_INTEGRATION_DETAILS",
      name: currentIntegration,
      organizationId: organizationId,
      organizationType: organizationType,
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
    getCurrentIntegration("GOOGLE_CALENDAR");
  }, []);
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
    `${NEXT_PUBLIC_MEETANDNOTE_ENDPOINT}/session`
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
    try {
      const requestData = {
        eventType: "GET_ORGANIZATION_SLOTS",
        organizationId: organizationId,
        organizationType: organizationType,
        startTime: Date.now(),
        startDate: leadCaptureData?.selectedDate,
        startMonth: leadCaptureData?.selectedMonth,
        startYear: leadCaptureData?.selectedYear,
        timeZone: "IST",
      };
      const data = await fetchData(requestData);
      if (data.code === "ORGANIZATION_SLOTS_FOUND") {
        const result: any = formatFetchResult(data?.body);
        setTimeSlots(result);
        // setSlotsData(data?.body);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (leadCaptureData?.selectedDate) {
      fetchSlots();
    }
  }, [leadCaptureData?.selectedDate]);
  const handleModeChange = (event: any) => {
    console.log();

    setCreateLeadFormData({
      // preferredSlot: selectedSlot,
      meetingType: event.target.value.toUpperCase(),
    });
    // setPreferredMode(event.target.value);
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
  // const handleNextQuestions = (questionNumber: any) => {
  //   router.push({
  //     pathname: router.pathname,
  //     query: {
  //       ...router.query,
  //       question: questionNumber,
  //     },
  //   });
  // };
  // const handlePreviousQuestions = (questionNumber: any) => {
  //   router.push({
  //     pathname: router.pathname,
  //     query: {
  //       ...router.query,
  //       question: questionNumber,
  //     },
  //   });
  // };
  const { t } = useTranslation();
  return (
    <div
      className="d-flex column justify-content-center"
      style={{
        backgroundImage: 'url("/images/leadCapturePreferredTime.svg")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div
        className="d-flex justify-content-start ml-4  "
    
      >
        <img
          alt="Remy Sharp"
          src={logoUrl}
          style={{
            width: "200px",
            height: "70px",
            objectFit: "contain",
            objectPosition: "left",
          }}
        />
      </div>
      <div
        style={{
          fontSize: "20px",
          fontWeight: 600,
          width: isSmallScreen ? "100% " : "50vw",
          color: "black",
          margin: isSmallScreen ? "auto " : "0 auto",
          minHeight: "60vh",
          height: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="d-flex justify-content-center align mb-4">
          5. When is the most convenient time for us to connect with you?
        </div>
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
                      cursor: "pointer",
                      transition: "background-color 0.3s ease",
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
                    <div> {t('architectSlotBooking.noAvailableSlotsFound')} </div>
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
                            disabled={slots.availableSlotCount <= 0}
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
                              cursor: "pointer",
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
                              control={<Radio />}
                              label="Online"
                            />
                          )}
                          <FormControlLabel
                            value="OFFLINE"
                            control={<Radio />}
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
        <div className="mt-4">
          <Button
            variant="outlined"
            sx={(theme) => ({
              width: "150px",
              color: theme.palette.primary.dark,
              marginRight: "20px",
            })}
            onClick={() => handlePreviousQuestions?.()}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            sx={(theme) => ({
              backgroundColor: theme.palette.primary.dark,
              width: "150px",
            })}
            onClick={() => handleNextQuestions?.()}
          >
            Next &nbsp; <ArrowRightIcons />
          </Button>
        </div>
      </div>
      <div
        className={`d-flex ${
          isSmallScreen ? "justify-content-center " : "justify-content-end"
        } mt-4`}
      >
        <div
          style={{
            width: isSmallScreen ? "150px " : "8vw",
            marginRight: isSmallScreen ? "0 " : "50px",
            marginBottom: "40px",
          }}
        >
          <CustomCircularProgressbar value={currentQuestionNumber} />
        </div>
      </div>
    </div>
  );
};

export default LeadCapturePreferredSLot;
