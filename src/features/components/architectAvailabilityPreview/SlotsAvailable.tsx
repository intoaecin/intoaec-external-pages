import { Box, Button, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type BookingSlot = {
  availableSlotCount: number;
  endTime: number | string;
  from: string;
  generatedSlotId: string;
  startTime: number | string;
  timeZone?: string;
  to: string;
};

const SlotsAvailable = (props: {
  selectedDateLabel?: string;
  selectedSlot: BookingSlot | null;
  timeSlots: BookingSlot[] | undefined;
  onSlotSelect?: (slot: BookingSlot | null) => void;
  disabled?: boolean;
}) => {
  const [slots, setSlots] = useState<BookingSlot[]>();
  const theme = useTheme();
  const { t } = useTranslation();

  const handleSlotClick = (slot: BookingSlot) => {
    if (props.disabled) {
      return;
    }
    if (props.selectedSlot?.generatedSlotId === slot.generatedSlotId) {
      return;
    }
    props.onSlotSelect?.(slot);
  };

  useEffect(() => {
    setSlots(props?.timeSlots);
  }, [props.timeSlots]);

  return (
    <div>
      {!slots?.length ? (
        <Box
          sx={{
            alignItems: "center",
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 2,
            color: "text.secondary",
            display: "flex",
            fontSize: "14px",
            justifyContent: "center",
            minHeight: 140,
            mt: 3,
            textAlign: "center",
          }}
        >
          {t("architectSlotBooking.noAvailableSlotsFound")}
        </Box>
      ) : (
        <>
          <Box
            sx={{
              alignItems: "baseline",
              display: "flex",
              gap: 1,
              mt: 3,
            }}
          >
            <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
              {t("architectSlotBooking.availableTimeSlots")}
            </Typography>
            {props.selectedDateLabel && (
              <Typography sx={{ color: "text.secondary", fontSize: "11px" }}>
                {props.selectedDateLabel}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: "grid",
              gap: 1,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              mt: 1.5,
            }}
          >
            {slots.map((slot) => (
              <Button
                key={slot.generatedSlotId}
                onClick={() => {
                  handleSlotClick(slot);
                }}
                disabled={props.disabled || slot.availableSlotCount <= 0}
                sx={{
                  borderColor:
                    props.selectedSlot?.generatedSlotId === slot?.generatedSlotId
                      ? theme?.palette?.primary?.main
                      : theme.palette.divider,
                  color:
                    props.selectedSlot?.generatedSlotId === slot?.generatedSlotId
                      ? theme?.palette?.primary?.main
                      : "text.primary",
                  border: "1px solid",
                  fontSize: "13px",
                  fontWeight: 500,
                  minHeight: 38,
                  backgroundColor:
                    slot?.availableSlotCount <= 0
                      ? theme.palette.action.disabledBackground
                      : theme.palette.background.paper,
                  borderRadius: "7px",
                  cursor: "pointer",
                  textTransform: "none",
                  width: "100%",
                }}
              >
                {slot.from} - {slot.to}
              </Button>
            ))}
          </Box>
        </>
      )}
    </div>
  );
};

export default SlotsAvailable;
