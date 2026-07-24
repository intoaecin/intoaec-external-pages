import type { IFeaturePermissions } from "@/types";
import { toCamelNoSpace } from "@/utils/string";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  getUserHubPermissionTooltip,
  userHubFeaturePermissionsDetails,
} from "./userHubFeatureSettingsMeta";

type UserHubFeatureSettingsSectionProps = {
  featurePermissions: IFeaturePermissions;
  setFeaturePermissions: React.Dispatch<
    React.SetStateAction<IFeaturePermissions>
  >;
};

export function UserHubFeatureSettingsSection({
  featurePermissions,
  setFeaturePermissions,
}: UserHubFeatureSettingsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="px-3">
      <Typography
        sx={{
          fontSize: "13px",
          fontWeight: "bold",
          paddingBottom: "15px",
          paddingTop: "15px",
        }}
      >
        {t("common.settings")}
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{
          "& .MuiTypography-root": {
            fontSize: "13px",
          },
          "& .MuiCheckbox-root": {
            padding: "7px",
          },
          "& .MuiSvgIcon-root": { fontSize: 20, padding: 0 },
        }}
      >
        {Object.entries(userHubFeaturePermissionsDetails)?.map(
          ([formLabel, selectDetails]) =>
            Object.entries(selectDetails)?.map(([label, options]) => (
              <FormControl key={label} component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  {t(`featurePermissions.${formLabel}`)}
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby={`radio-group-${label}`}
                  name={t(`common.${formLabel}`)}
                  className="d-flex"
                  sx={{
                    marginLeft: 3,
                    columnGap: 1,
                  }}
                  value={
                    featurePermissions?.[
                      formLabel as keyof IFeaturePermissions
                    ]?.type as string
                  }
                  onChange={(e) => {
                    setFeaturePermissions(
                      (prev: IFeaturePermissions) => ({
                        ...prev,
                        [formLabel as string]: {
                          type: e.target.value as string,
                        },
                      }),
                    );
                  }}
                >
                  {options.map((select: string) => {
                    const tooltipText = getUserHubPermissionTooltip(
                      formLabel,
                      select,
                      t,
                    );
                    return (
                      <Tooltip
                        key={select}
                        title={tooltipText}
                        arrow
                        placement="top"
                      >
                        <span>
                          <FormControlLabel
                            value={select}
                            control={<Radio />}
                            label={t(
                              `featurePermissions.${toCamelNoSpace(select)}`,
                            )}
                          />
                        </span>
                      </Tooltip>
                    );
                  })}
                </RadioGroup>
              </FormControl>
            )),
        )}
      </Box>
    </div>
  );
}
