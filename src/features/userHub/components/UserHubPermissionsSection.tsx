import type { ModuleTypes } from "@/types";
import { normalizeUserHubPermissionPath } from "@/features/userHub/utils/normalizeUserHubPermissionPath";
import {
  getUserHubPermissionLabel,
  getUserHubPermissionTranslationKey,
} from "@/features/userHub/utils/getUserHubPermissionTranslationKey";
import {
  Box,
  FormGroup,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { UserHubAntSwitch } from "./UserHubAntSwitch";

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 0.2fr)",
  gap: "16px",
};

type UserHubPermissionsSectionProps = {
  modules: ModuleTypes[];
  modulePermissions: string[];
  setModulePermissions: React.Dispatch<React.SetStateAction<string[]>>;
};

const defaultModulePermissions = [
  "MY_PROFILE",
  "MY_ORGANIZATION",
  "DASHBOARD",
  "DASHBOARD/LEAD_DASHBOARD",
  "DASHBOARD/REVENUE_DASHBOARD",
  "DASHBOARD/PROJECT_DASHBOARD",
];

const normalizeFeatureModule = (module: string) =>
  normalizeUserHubPermissionPath(module);

export function UserHubPermissionsSection({
  modules,
  modulePermissions,
  setModulePermissions,
}: UserHubPermissionsSectionProps) {
  const { t } = useTranslation();
  const isSmallDevice = useMediaQuery("(max-width:900px)");
  const normalizedModules = useMemo(() => {
    const deduped = new Map<string, ModuleTypes>();

    modules.forEach((value) => {
      const normalizedModule = normalizeFeatureModule(value.module);
      if (!deduped.has(normalizedModule)) {
        deduped.set(normalizedModule, {
          ...value,
          module: normalizedModule,
        });
      }
    });

    const hasFeaturesSubModules = [...deduped.keys()].some((module) =>
      module.startsWith("FEATURES/"),
    );

    if (hasFeaturesSubModules && !deduped.has("FEATURES")) {
      deduped.set("FEATURES", {
        permissionId: "FEATURES",
        module: "FEATURES",
        createdAt: "",
      });
    }

    return [...deduped.values()];
  }, [modules]);

  return (
    <div className="px-3">
      <Stack direction="row" alignItems="baseline" mb={2}>
        <Typography
          sx={{ fontSize: "13px", fontWeight: "bold", marginRight: "10px" }}
        >
          {t("common.permissions")}
          <span className="requiredUI">*</span>
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontSize: "13px" }}>
            {t("common.enableSuperAccess")}
          </Typography>
          <UserHubAntSwitch
            checked={normalizedModules?.every((val) =>
              modulePermissions.includes(val.module),
            )}
            onChange={(e) => {
              if (e.target.checked) {
                setModulePermissions([
                  ...new Set(normalizedModules.map((val) => val.module)),
                ]);
              } else {
                setModulePermissions(defaultModulePermissions);
              }
            }}
            name="selectAll"
            inputProps={{ "aria-label": "ant design" }}
          />
        </Stack>
      </Stack>
      {modulePermissions.length === 0 ? (
        <Box
          sx={{
            minHeight: 180,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary">
            {t("userhubTeam.noModulesEnabled", {
              defaultValue: "No modules are enabled",
            })}
          </Typography>
        </Box>
      ) : null}
      <div className={`mt-2 ${isSmallDevice ? "row container" : ""}`}>
        <FormGroup
          className={`${isSmallDevice ? "row " : ""}`}
          style={!isSmallDevice ? gridStyle : {}}
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
          {normalizedModules.map((value) =>
            !value.module.includes("/") ? (
              <div
                key={value.permissionId}
                className={`${
                  isSmallDevice ? "col-lg-3 col-md-3 col-sm-12 " : ""
                }`}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={modulePermissions.includes(value.module)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setModulePermissions((prev) => [
                            ...new Set([
                              ...prev,
                              ...normalizedModules
                                .filter(
                                  (val) =>
                                    val.module === value.module ||
                                    val.module.startsWith(`${value.module}/`),
                                )
                                .map((val) => val.module),
                            ]),
                          ]);
                        } else {
                          if (!defaultModulePermissions.includes(value.module)) {
                            setModulePermissions((prev) =>
                              prev.filter(
                                (val) =>
                                  val !== value.module &&
                                  !val.startsWith(`${value.module}/`),
                              ),
                            );
                          }
                        }
                      }}
                      name={value.module}
                    />
                  }
                  label={t(
                    `permissions.${getUserHubPermissionTranslationKey(value.module)}`,
                    {
                      defaultValue: getUserHubPermissionLabel(value.module),
                    },
                  )}
                />
                {modulePermissions.includes(value.module) && (
                  <div className="d-flex column ml-3 ">
                    {normalizedModules.map(
                      (sub) =>
                        sub.module.includes(value.module + "/") && (
                          <FormControlLabel
                            key={sub.module}
                            control={
                              <Checkbox
                                checked={modulePermissions.includes(sub.module)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setModulePermissions((prev) => {
                                      if (prev.includes(sub.module)) {
                                        return prev;
                                      }
                                      return [...prev, sub.module];
                                    });
                                  } else {
                                    setModulePermissions((prev) => {
                                      const selectedSubModules = prev.filter(
                                        (val) =>
                                          val.startsWith(`${value.module}/`),
                                      );
                                      if (selectedSubModules.length === 1) {
                                        return prev.filter(
                                          (val) => val !== sub.module,
                                        );
                                      }
                                      return prev.filter(
                                        (val) => val !== sub.module,
                                      );
                                    });
                                  }
                                }}
                                name={value.module}
                              />
                            }
                            label={t(
                              `permissions.${getUserHubPermissionTranslationKey(sub.module)}`,
                              {
                                defaultValue: getUserHubPermissionLabel(
                                  sub.module,
                                ),
                              },
                            )}
                          />
                        ),
                    )}
                  </div>
                )}
                <div></div>
              </div>
            ) : (
              ""
            ),
          )}
        </FormGroup>
      </div>
    </div>
  );
}
