import { MenuItem, Select, Stack, TextField } from "@mui/material";
import type { LeadCaptureV2FormField } from "../leadCaptureV2LayoutConfig";
import {
  LEAD_CAPTURE_V2_DIMENSION_UNIT_TYPES,
  normalizeLeadCaptureV2DimensionUnit,
} from "../../leadCaptureV2DimensionUnits";

type LeadCaptureV2CustomerPreviewDimensionInputProps = {
  field: LeadCaptureV2FormField;
  answer: string;
  selectedUnit: string;
  onAnswerChange: (fieldId: string, nextAnswer: string) => void;
  onUnitChange: (fieldId: string, nextUnit: string) => void;
};

const LeadCaptureV2CustomerPreviewDimensionInput = ({
  field,
  answer,
  selectedUnit,
  onAnswerChange,
  onUnitChange,
}: LeadCaptureV2CustomerPreviewDimensionInputProps) => {
  const allowedDimensionPattern = /^[0-9.\- "'’]*$/;
  const resolvedUnit = normalizeLeadCaptureV2DimensionUnit(
    selectedUnit || field.unitType,
  );

  const handleDimensionChange = (value: string) => {
    if (!allowedDimensionPattern.test(value)) return;
    if (value.includes("--")) return;
    onAnswerChange(field.id, value);
  };

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
      <TextField
        fullWidth
        size="small"
        type="text"
        value={answer}
        onChange={(event) => handleDimensionChange(event.target.value)}
        onKeyDown={(event) => {
          const allowedControlKeys = new Set([
            "Backspace",
            "Delete",
            "Tab",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
          ]);
          if (allowedControlKeys.has(event.key)) return;
          if (!allowedDimensionPattern.test(event.key)) {
            event.preventDefault();
          }
        }}
        sx={{ flex: 1, minWidth: 0 }}
      />
      <Select
        size="small"
        value={resolvedUnit}
        onChange={(event) => onUnitChange(field.id, String(event.target.value))}
        inputProps={{
          "aria-label": field.title ?? field.labelKey ?? field.id,
        }}
        sx={{ width: { xs: "100%", sm: 120 }, flexShrink: 0 }}
      >
        {LEAD_CAPTURE_V2_DIMENSION_UNIT_TYPES.map((unit) => (
          <MenuItem key={unit} value={unit}>
            {unit}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
};

export default LeadCaptureV2CustomerPreviewDimensionInput;
