import { LocalizedPickerProvider } from "@/components_v2/LocalizedPicker";
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import { alpha, styled } from "@mui/material/styles";

import {
  DateCalendar,
  DateRangeIcon,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

import isBetweenPlugin from "dayjs/plugin/isBetween";
import { MouseEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedDayjs } from "../hooks/useLocalizedDayjs";
import { filterStandardUnderlineFieldSx } from "@/components_v2/filterStandardFieldSx";

dayjs.extend(isBetweenPlugin);

interface CustomPickerDayProps extends PickersDayProps<Dayjs> {
  inRange: boolean;
  start: boolean;
  end: boolean;
  beforeEnd?: boolean;
}

interface DayProps {
  startDay?: Dayjs | null;
  endDay?: Dayjs | null;
  endComponent?: boolean;
  minDay?: Dayjs;
}

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== "inRange" && prop !== "isHovered",
})<CustomPickerDayProps>(
  ({ theme, inRange: isSelected, selected, day, start, end, beforeEnd }) => ({
    borderRadius: 0,
    ...(selected && {
      borderRadius: "50%",
    }),
    ...(isSelected && {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      color: theme.palette.common.black,
      "&:hover, &:focus": {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
      },
    }),
    ...((day.day() === 0 ||
      start ||
      day.isSame(day.startOf("month"), "day")) && {
      borderTopLeftRadius: "50%",
      borderBottomLeftRadius: "50%",
    }),
    ...((day.day() === 6 ||
      end ||
      day.isSame(day.endOf("month"), "day") ||
      beforeEnd) && {
      borderTopRightRadius: "50%",
      borderBottomRightRadius: "50%",
    }),
  })
) as React.ComponentType<CustomPickerDayProps>;

const isinRange = (
  day: Dayjs,
  startDay?: Dayjs | null,
  endDay?: Dayjs | null
) => {
  if (!startDay || !endDay) {
    return false;
  } else {
    return day?.isBetween(startDay, endDay);
  }
};

function areDatesEqual(date1: Dayjs, date2: Dayjs) {
  // Extract year, month, and date components from each date
  const year1 = date1.year();
  const month1 = date1.month();
  const day1 = date1.date();

  const year2 = date2.year();
  const month2 = date2.month();
  const day2 = date2.date();

  // Compare year, month, and date components
  return year1 === year2 && month1 === month2 && day1 === day2;
}
function Day(props: PickersDayProps<Dayjs> & DayProps) {
  const { day, startDay, endDay, endComponent, minDay, ...other } = props;

  return (
    <CustomPickersDay
      {...other}
      day={day}
      disableMargin
      sx={{
        border: "none",
        outline: "none",
      }}
      selected={
        (startDay ? areDatesEqual(day, startDay) : false) ||
        (endDay ? areDatesEqual(day, endDay) : false)
      }
      inRange={isinRange(day, startDay, endDay)}
      start={day.subtract(1, "day").isSame(startDay)}
      end={day.add(1, "day").isSame(endDay)}
      beforeEnd={day.isBetween(endDay?.subtract(2, "day"), endDay)}
      disabled={
        (!!minDay && day.isBefore(minDay, "day"))
      }
    />
  );
}

interface CustomDateRangePickerTypes {
  label: string;
  onApply: (startDate?: Dayjs, endDate?: Dayjs) => void;
  onClear?: () => void;
  value?: { startDate?: Dayjs; endDate?: Dayjs };
  className?: string;
  width?: string | number;
  /** Match `FilterMenu` underline fields (label + bottom border, no extra margins). */
  filterMenuField?: boolean;
}

const CustomDateRangePicker = ({
  label,
  onApply,
  onClear,
  value,
  className,
  width,
  filterMenuField = false,
}: CustomDateRangePickerTypes) => {
  const [anchorEl, setAnchorEl] = useState<
    (EventTarget & HTMLDivElement) | null
  >(null);
  const [startDate, setStartDate] = useState<Dayjs>();
  const { t } = useTranslation();
  const [hoveredDay, setHoveredDay] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs>();
  const isSmallDevice = useMediaQuery("(max-width:768px)");
  const {
    dateFormat,
    organizationTimezone,
    toLocalizedDayjs,
    getCurrentLocalizedDay,
  } = useLocalizedDayjs();
  const handleOpenPopover = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleDateClick = (e: Dayjs | null) => {
    if (!e) return;
    const selected = toLocalizedDayjs(e) ?? e;

    if (!startDate || (startDate && endDate)) {
      // Start new selection or reset if already full
      setStartDate(selected);
      setEndDate(undefined);
    } else {
      // Complete selection
      if (selected.isBefore(startDate, "day")) {
        // If clicked before start, make it the new start
        setStartDate(selected);
        setEndDate(undefined);
      } else {
        setEndDate(selected.endOf("day"));
      }
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "date-range-popover" : undefined;

  useEffect(() => {
    if (value) {
      setStartDate(
        value.startDate ? toLocalizedDayjs(value.startDate) ?? undefined : undefined
      );
      setEndDate(
        value.endDate ? toLocalizedDayjs(value.endDate) ?? undefined : undefined
      );
    }
  }, [organizationTimezone, value]);

  const formatRangeDate = (valueToFormat?: Dayjs) => {
    if (!valueToFormat) return "";

    const localizedValue = toLocalizedDayjs(valueToFormat);
    if (!localizedValue) return "";

    return localizedValue.format(dateFormat);
  };

  const minAllowedDate = getCurrentLocalizedDay().subtract(6, "month");

  const wrapperClassName = filterMenuField
    ? ""
    : className !== undefined
      ? className
      : "mt-1 mb-2";

  return (
    <LocalizedPickerProvider>
      <div className={wrapperClassName}>
        <TextField
          label={label}
          variant="standard"
          size={filterMenuField ? "small" : "medium"}
          onClick={handleOpenPopover}
          aria-readonly
          fullWidth
          InputLabelProps={{
            shrink: filterMenuField ? true : undefined,
          }}
          sx={{
            cursor: "pointer",
            width: width || "100%",
            ...(filterMenuField ? filterStandardUnderlineFieldSx : {}),
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <DateRangeIcon />
              </InputAdornment>
            ),
          }}
          value={
            startDate && endDate
              ? `${formatRangeDate(startDate)} - ${formatRangeDate(endDate)}`
              : ""
          }
        />
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          disableScrollLock
          anchorOrigin={{
            vertical: "bottom",
            horizontal: isSmallDevice ? -200 : -300,
          }}
        >
          <Box sx={{ p: 0 }}>
            <Grid container direction={"row"} p={0}>
              <DateCalendar
                autoFocus
                timezone={organizationTimezone}
                onChange={handleDateClick}
                sx={{
                  ".MuiDayCalendar-weekDayLabel": {
                    margin: 0,
                  },
                  ".MuiPickersDay-today": {
                    border: "none",
                  },
                  ".Mui-selected": {
                    bgcolor: "black",
                  },
                }}
                shouldDisableMonth={(month) =>
                  month.isBefore(minAllowedDate, "month")
                }
                slots={{ day: Day }}
                defaultCalendarMonth={getCurrentLocalizedDay()}
                slotProps={{
                  day: (ownerState) => ({
                    startDay: startDate,
                    minDay: minAllowedDate,
                    onPointerEnter: () => setHoveredDay(ownerState.day),
                    onPointerLeave: () => setHoveredDay(null),
                    endDay: endDate,
                  }),
                  calendarHeader: () => ({
                    sx: { marginX: 2 },
                  }),
                }}
              />
              <Divider orientation="vertical" flexItem />
              <DateCalendar
                autoFocus
                timezone={organizationTimezone}
                sx={{
                  ".MuiDayCalendar-weekDayLabel": {
                    margin: 0,
                  },
                  ".Mui-selected": {
                    bgcolor: "black",
                  },
                }}
                shouldDisableMonth={(month) =>
                  month.isSame(startDate, "month") ||
                  month.isBefore(startDate, "month")
                }
                onChange={handleDateClick}
                slots={{ day: Day }}
                defaultCalendarMonth={getCurrentLocalizedDay().add(1, "month")}
                slotProps={{
                  day: (ownerState) => ({
                    startDay: startDate,
                    minDay: minAllowedDate,
                    hoveredDay,
                    onPointerEnter: () => setHoveredDay(ownerState.day),
                    onPointerLeave: () => setHoveredDay(null),
                    endDay: endDate,
                    endComponent: true,
                  }),
                  calendarHeader: () => ({
                    sx: { marginX: 2 },
                  }),
                }}
              />
            </Grid>
            <Divider orientation="horizontal" flexItem />
            <Grid
              container
              justifyContent={"space-between"}
              marginLeft={"auto"}
              direction={"row"}
              mx={1}
              px={1}
            >
              {/* <Box
                sx={(theme) => ({
                  "& .MuiButtonBase-root": {
                    textTransform: "Capitalize",
                    padding: "0 6px",
                    margin: "6px",
                    background: "secondary.main",
                    color: "#000000",
                    ":hover": {
                      background: "theme.palette.primary.main",
                      color: "#ffffff",
                    },
                  },
                })}
              >
                <Button
                  onClick={() => {
                    if (startDate) {
                      const date = dayjs().toDate()?.setHours(23, 59, 59, 999);
                      setEndDate(dayjs(date));
                    } else {
                      setStartDate(dayjs());
                    }
                  }}
                >
                  Today
                </Button>
                <Button
                  onClick={() => {
                    if (startDate) {
                      const date = dayjs().subtract(1, "day").toDate();
                      date?.setHours(23, 59, 59, 999);
                      setEndDate(dayjs(date));
                    } else {
                      setStartDate(dayjs().subtract(1, "day"));
                    }
                  }}
                >
                  Yesterday
                </Button>
              </Box> */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography
                  className={`${startDate == undefined ? "invisible" : "visible"
                    }`}
                >
                  {startDate ? formatRangeDate(startDate) : dateFormat}
                </Typography>
                &nbsp;-&nbsp;
                <Typography>
                  {endDate ? formatRangeDate(endDate) : ""}
                </Typography>
              </Box>
              <Box
                sx={(theme) => ({
                  "& .MuiButtonBase-root": {
                    textTransform: "Capitalize",
                    padding: "0 6px",
                    margin: "6px",

                    color: "#ffff",
                    // ":hover": {
                    //   background: "primary.main",
                    //   color: "#ffffff",
                    // },
                    ":disabled": {
                      opacity: "0.4",
                    },
                  },
                })}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                    onApply(undefined, undefined);
                    handleClosePopover();
                    onClear?.();
                  }}
                  sx={{
                    background: "#f7685b",
                    ":hover": {
                      background: "#f7685b",
                      color: "#ffffff",
                    },
                  }}
                >
                  {t("common.clear")}
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    background: "primary.main",
                  }}
                  onClick={() => {
                    onApply(startDate, endDate);
                    handleClosePopover();
                  }}
                >
                  {t("common.apply")}
                </Button>
              </Box>
            </Grid>
          </Box>
        </Popover>
      </div>
    </LocalizedPickerProvider>
  );
};

export default CustomDateRangePicker;

