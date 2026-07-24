import {
  RenderStar
} from "@/features/constants/constant";
import {
  Box,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup
} from "@mui/material";

export const RenderRatingScale = ({
  control,
  isAnswer,
  onChange,
  pageIndex,
}: {
  isAnswer?: boolean;
  control?: any;
  onChange?: (value?: any) => void;
  pageIndex?: number;
}) => {
  return (
    <Box>
      <Grid container direction={"row"}>
        <FormControl>
          <RadioGroup
            row={control?.options?.displayFormat === "Vertical"}
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            {control?.options?.choices?.map(
              (choice: any, choiceIndex: number) => (
                <Grid item key={"render-scale" + choiceIndex}>
                  {
                    <div className="mb-2">
                      <FormControlLabel
                        value={choice?.imgValue + "-" + choiceIndex}
                        labelPlacement={
                          control?.options?.displayFormat === "Vertical"
                            ? "top"
                            : "end"
                        }
                        disabled={!isAnswer}
                        checked={choice?.isSelected}
                        onChange={(e, c) => {
                          const newControl = {
                            ...control,
                            options: {
                              ...control?.options,
                              choices: control?.options?.choices.map(
                                (currentChoice: any, currentIndex: number) => {
                                  if (currentIndex == choiceIndex) {
                                    return {
                                      ...currentChoice,
                                      isSelected: c,
                                    };
                                  } else {
                                    return {
                                      ...currentChoice,
                                      isSelected: false,
                                    };
                                  }
                                }
                              ),
                            },
                          };
                          onChange?.(newControl);
                        }}
                        control={
                          <Radio checked={choice?.isSelected} size="small" />
                        }
                        label={
                          <div
                            className={
                              control?.options?.displayFormat === "Vertical"
                                ? ""
                                : "d-flex gap-1 align-items-center"
                            }
                          >
                            <div className="">
                              {control?.options?.reperesentationType ===
                              "Smileys" ? (
                                <div className="fs-4  d-flex justify-content-center">
                                  {choice?.imgValue &&
                                    String.fromCodePoint(choice?.imgValue)}
                                </div>
                              ) : control?.options?.reperesentationType ===
                                "Number" ? (
                                <div
                                  className={`mx-2  ${
                                    control?.options?.displayFormat ===
                                    "Vertical"
                                      ? ""
                                      : "d-flex gap-1 row-reverse"
                                  }`}
                                >
                                  {choice?.weight && (
                                    <div className="text-center d-flex justify-content-center align-items-center  round round-select">
                                      {choice?.weight}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className=" d-flex justify-content-center">
                                  {RenderStar(choice?.imgValue)}
                                </div>
                              )}
                            </div>
                            <div className="d-flex justify-content-center">
                              {choice?.label}
                            </div>
                          </div>
                        }
                      />
                    </div>
                  }
                </Grid>
              )
            )}
          </RadioGroup>
        </FormControl>
      </Grid>
    </Box>
  );
};
