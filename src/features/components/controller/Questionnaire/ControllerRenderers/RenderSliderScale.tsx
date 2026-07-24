import { SliderControlType } from "@/types";
import { Slider } from "@mui/material";
import { useTranslation } from "react-i18next";

export const RenderSliderScale = ({
  control,
  onChange,
  isAnswer,
}: {
  control: SliderControlType;
  isAnswer?: boolean;
  onChange?:
    | ((event: Event, value: number | number[], activeThumb: number) => void)
    | undefined;
}) => {
  const { t } = useTranslation();
  const formatValueLabel = (value: number) => {
    // Modify this logic based on your requirements
    return `${value}${control?.options?.isNumericFormat ? "" : "%"}`;
  };
  return (
    <div>
      <Slider
        onChange={onChange}
        aria-label="Small steps"
        value={control?.value}
        defaultValue={control?.options?.initialPosition}
        step={control?.options?.stepValue}
        min={control?.options?.startValue}
        max={control?.options?.endValue}
        disabled={!isAnswer}
        valueLabelDisplay="auto"
        valueLabelFormat={formatValueLabel}
      />
      <div className="d-flex justify-content-between">
        <span>{control?.options?.leftLabel}</span>
        <span>{control?.options?.middleLabel}</span>
        <span>{control?.options?.rightLabel}</span>
      </div>
    </div>
  );
};
