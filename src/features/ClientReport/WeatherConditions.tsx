import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import EditIcon from "@/assets/icons/edit-icon";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useClientReportWeather } from "./hooks/useClientReportWeather";
import type { WeatherTemperature } from "./hooks/useClientReportWeather";
import type { ClientReportRecord } from "./types";

type WeatherConditionsProps = {
  report: Pick<ClientReportRecord, "weather" | "temperature" | "affectingWork">;
  isPreview?: boolean;
  disableFetch?: boolean;
  weatherCondition?: Record<string, unknown> | null;
  dateRange?: {
    startDate?: number;
    endDate?: number;
  };
  onWeatherChange?: (weather: Record<string, unknown> | null) => void;
};

type WeatherData = {
  condition: string;
  temperature: WeatherTemperature | string | null;
  feelsLikeTemperature: WeatherTemperature | string | null;
  iconUrl: string;
  affectingWork: boolean;
  notes: string;
};

const isWeatherTemperature = (value: unknown): value is WeatherTemperature =>
  Boolean(
    value &&
    typeof value === "object" &&
    typeof (value as WeatherTemperature).degrees === "number",
  );

const getTemperatureLabel = (
  temperature?: WeatherTemperature | string | null,
) => {
  if (!temperature) {
    return "";
  }

  if (typeof temperature === "string") {
    return temperature;
  }

  const degreesLabel = Number.isInteger(temperature.degrees)
    ? String(temperature.degrees)
    : temperature.degrees.toFixed(1);

  return `${degreesLabel}°`;
};

const getReportWeatherData = (
  report: Pick<ClientReportRecord, "weather" | "temperature" | "affectingWork">,
  weatherCondition?: Record<string, unknown> | null,
): WeatherData => ({
  condition:
    typeof weatherCondition?.condition === "string"
      ? weatherCondition?.condition
      : report?.weather,
  temperature: (() => {
    const temperature = weatherCondition?.temperature;
    if (isWeatherTemperature(temperature) || typeof temperature === "string") {
      return temperature ?? null;
    }
    return report.temperature ?? null;
  })(),
  feelsLikeTemperature: (() => {
    const feelsLikeTemperature = weatherCondition?.feelsLikeTemperature;
    if (
      isWeatherTemperature(feelsLikeTemperature) ||
      typeof feelsLikeTemperature === "string"
    ) {
      return feelsLikeTemperature ?? null;
    }
    return null;
  })(),
  iconUrl:
    typeof weatherCondition?.iconUrl === "string"
      ? weatherCondition?.iconUrl
      : "",
  affectingWork:
    typeof weatherCondition?.affectingWork === "boolean"
      ? weatherCondition?.affectingWork
      : report?.affectingWork,
  notes:
    typeof weatherCondition?.notes === "string" ? weatherCondition?.notes : "",
});

const WeatherConditions = ({
  report,
  isPreview = false,
  disableFetch = false,
  weatherCondition,
  dateRange,
  onWeatherChange,
}: WeatherConditionsProps) => {
  const { t } = useTranslation();
  const { weather: currentWeather, loading: isWeatherLoading } =
    useClientReportWeather(dateRange, { enabled: !disableFetch });
  const [isEditing, setIsEditing] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData>(() =>
    getReportWeatherData(report, weatherCondition),
  );
  const [draftWeatherData, setDraftWeatherData] = useState(weatherData);
  const shouldShowWeatherNotes =
    weatherData.affectingWork && Boolean(weatherData.notes.trim());

  useEffect(() => {
    const nextWeatherData = getReportWeatherData(report, weatherCondition);

    setWeatherData(nextWeatherData);
    setDraftWeatherData(nextWeatherData);
  }, [
    report.affectingWork,
    report.temperature,
    report.weather,
    weatherCondition,
  ]);

  useEffect(() => {
    if (!currentWeather) {
      return;
    }

    setWeatherData((prev) => ({
      ...prev,
      condition: currentWeather.condition || prev.condition,
      temperature: currentWeather.temperature ?? prev.temperature,
      feelsLikeTemperature:
        currentWeather.feelsLikeTemperature ?? prev.feelsLikeTemperature,
      iconUrl: currentWeather.iconUrl || prev.iconUrl,
    }));
    setDraftWeatherData((prev) => ({
      ...prev,
      condition: currentWeather.condition || prev.condition,
      temperature: currentWeather.temperature ?? prev.temperature,
      feelsLikeTemperature:
        currentWeather.feelsLikeTemperature ?? prev.feelsLikeTemperature,
      iconUrl: currentWeather.iconUrl || prev.iconUrl,
    }));
  }, [currentWeather]);

  useEffect(() => {
    onWeatherChange?.(weatherData);
  }, [onWeatherChange, weatherData]);

  const handleEdit = () => {
    setDraftWeatherData(weatherData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setWeatherData(draftWeatherData);
    setIsEditing(false);
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: CLIENT_REPORT_COLORS.sectionTitle,
          }}
        >
          {t("common.weatherConditions", {
            defaultValue: "Weather Conditions",
          })}
        </Typography>
        {!isPreview && isEditing && (
          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            sx={{ minWidth: 56, textTransform: "none" }}
          >
            {t("common.save", { defaultValue: "Save" })}
          </Button>
        )}
        {!isPreview && !isEditing && (
          <IconButton
            size="small"
            sx={{ color: "primary.main" }}
            onClick={handleEdit}
          >
            <EditIcon width={16} height={16} fill="currentColor" />
          </IconButton>
        )}
      </Stack>
      <Box
        sx={{
          bgcolor: "background.paper",
          border: `1px solid ${CLIENT_REPORT_COLORS.border}`,
          borderRadius: 1,
          px: { xs: 1.5, sm: 2, lg: 3 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        <Grid container alignItems="center" spacing={{ xs: 1.5, sm: 2, lg: 3 }}>
          <Grid item xs={12} sm={2} lg={1}>
            <Box
              sx={{
                width: { xs: 56, sm: 72 },
                height: { xs: 44, sm: 52 },
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                position: "relative",
                borderRight: {
                  sm: `1px solid ${CLIENT_REPORT_COLORS.borderSoft}`,
                },
              }}
            >
              {isWeatherLoading ? (
                <Skeleton variant="rounded" width={44} height={44} />
              ) : weatherData.iconUrl ? (
                <Box
                  component="img"
                  src={weatherData.iconUrl}
                  alt={weatherData.condition || "Weather"}
                  sx={{ width: { xs: 36, sm: 44 }, height: { xs: 36, sm: 44 } }}
                />
              ) : (
                <Typography variant="h6" sx={{ color: "text.secondary" }}>
                  -
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={3} lg={3}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t("common.condition")}
            </Typography>
            <Typography variant="body2">
              {isWeatherLoading ? (
                <Skeleton variant="text" width={120} />
              ) : (
                weatherData.condition || "-"
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3} lg={4}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t("common.temperature", { defaultValue: "Temperature" })}
            </Typography>
            <Typography variant="body2">
              {isWeatherLoading ? (
                <Skeleton variant="text" width={80} />
              ) : (
                <Stack direction="row" spacing={0.75} component="span">
                  <Box component="span">
                    {getTemperatureLabel(weatherData.temperature) || "-"}
                  </Box>
                  {getTemperatureLabel(weatherData.feelsLikeTemperature) && (
                    <Box component="span" sx={{ color: "text.secondary" }}>
                      {getTemperatureLabel(weatherData.feelsLikeTemperature)}
                    </Box>
                  )}
                </Stack>
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3} lg={3}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t("common.shift")}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">
                {isEditing
                  ? t("common.weatherAffectingWork", {
                      defaultValue: "Weather affecting work?",
                    })
                  : t("common.affectingWork", {
                      defaultValue: "Affecting Work",
                    })}
              </Typography>
              {isEditing ? (
                <Switch
                  checked={draftWeatherData.affectingWork}
                  onChange={(event) =>
                    setDraftWeatherData((prev) => ({
                      ...prev,
                      affectingWork: event.target.checked,
                    }))
                  }
                  size="small"
                />
              ) : (
                <Chip
                  label={
                    weatherData.affectingWork
                      ? t("common.yes", { defaultValue: "Yes" })
                      : t("common.no", { defaultValue: "No" })
                  }
                  size="small"
                  sx={{
                    height: 18,
                    bgcolor: CLIENT_REPORT_COLORS.chipSelected,
                    color: "primary.main",
                    typography: "caption",
                  }}
                />
              )}
            </Stack>
          </Grid>
          {isEditing && draftWeatherData.affectingWork && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder={t("common.enterYourNotesHere", {
                  defaultValue: "Enter your notes here",
                })}
                value={draftWeatherData.notes}
                onChange={(event) =>
                  setDraftWeatherData((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                sx={{
                  bgcolor: "background.paper",
                  "& .MuiInputBase-root": {
                    borderRadius: 1,
                    typography: "body2",
                  },
                }}
              />
            </Grid>
          )}
          {!isEditing && shouldShowWeatherNotes && (
            <Grid item xs={12}>
              <Box
                sx={{
                  borderTop: `1px dashed ${CLIENT_REPORT_COLORS.borderSoft}`,
                  pt: { xs: 1.25, sm: 1.5 },
                }}
              >
                <Typography
                  sx={{
                    color: CLIENT_REPORT_COLORS.sectionTitle,
                    typography: "body2",
                    mb: 0.5,
                  }}
                >
                  {t("common.notes", { defaultValue: "Notes" })}
                </Typography>
                <Typography
                  sx={{
                    color: CLIENT_REPORT_COLORS.bodyText,
                    typography: "body2",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                  }}
                >
                  {weatherData.notes}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default WeatherConditions;
