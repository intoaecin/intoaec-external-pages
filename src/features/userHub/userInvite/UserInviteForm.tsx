import { emailPattern } from "@/lib/regex";
import Autocomplete from "@/components_v2/Autocomplete";
import { FormInputTypes, IFeaturePermissions, ModuleTypes } from "@/types";
import { normalizeUserHubPermissionPath } from "@/features/userHub/utils/normalizeUserHubPermissionPath";
import { Box, TextField } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import UserWorkingCalendarPreference from "@/features/components/preferences/UserWorkingCalendarPreference";
import { UserWorkingCalendarData } from "@/features/hooks/useUserWorkingCalendar";
import { UserHubFeatureSettingsSection } from "../components/UserHubFeatureSettingsSection";
import { UserHubPermissionsSection } from "../components/UserHubPermissionsSection";

/** Canonical path after normalization — omit from User Hub invite / role permission UI. */
const FILE_UPLOAD_FEATURE_PERMISSION = "FEATURES/FILE_UPLOAD";

const isFileUploadFeaturePermission = (path: string) =>
  normalizeUserHubPermissionPath(path) === FILE_UPLOAD_FEATURE_PERMISSION;

/** Re-export for existing imports across the app. */
export { UserHubAntSwitch as AntSwitch } from "../components/UserHubAntSwitch";

interface UserInviteFormPropsTypes {
  setDesignation: React.Dispatch<React.SetStateAction<FormInputTypes>>;
  setFirstname: React.Dispatch<React.SetStateAction<FormInputTypes>>;
  setLastName: React.Dispatch<React.SetStateAction<FormInputTypes>>;
  setEmail: React.Dispatch<React.SetStateAction<FormInputTypes>>;
  setModulePermissions: React.Dispatch<React.SetStateAction<string[]>>;
  modulePermissions: string[];
  firstName: FormInputTypes;
  lastName: FormInputTypes;
  email: FormInputTypes;
  designation: FormInputTypes;
  modules: ModuleTypes[];
  isEmailDisabled: boolean;
  featurePermissions?: IFeaturePermissions | null;
  setFeaturePermissions?: React.Dispatch<
    React.SetStateAction<IFeaturePermissions>
  >;
  existingEmails?: string[];
  /** When false, hides user identity row (used for role template screens). */
  showUserFields?: boolean;
  /** Role template: name + description instead of user fields. */
  roleName?: FormInputTypes;
  setRoleName?: React.Dispatch<React.SetStateAction<FormInputTypes>>;
  roleDescription?: FormInputTypes;
  setRoleDescription?: React.Dispatch<React.SetStateAction<FormInputTypes>>;
  roleOptions?: Array<{ label: string; value: string }>;
  selectedRoleId?: string;
  isRolesLoading?: boolean;
  isRoleSelectionDisabled?: boolean;
  onRoleChange?: (roleId: string | null) => void;
  onAddRoleFromInvite?: (roleName: string) => void;
  showWorkingCalendar?: boolean;
  workingCalendarUserId?: string;
  readOnlyExceptWorkingCalendar?: boolean;
  /** When false, hides module + feature permission sections. */
  showPermissions?: boolean;
  onWorkingCalendarStateChange?: (state: {
    calendar: UserWorkingCalendarData;
    isValid: boolean;
    hasChanges: boolean;
  }) => void;
}

const UserInviteForm = ({
  setDesignation,
  setFirstname,
  setEmail,
  setLastName,
  setModulePermissions,
  designation,
  email,
  firstName,
  lastName,
  modulePermissions,
  modules,
  isEmailDisabled,
  featurePermissions,
  setFeaturePermissions,
  existingEmails = [],
  showUserFields = true,
  roleName,
  setRoleName,
  roleDescription,
  setRoleDescription,
  roleOptions = [],
  selectedRoleId,
  isRolesLoading = false,
  isRoleSelectionDisabled = false,
  onRoleChange,
  onAddRoleFromInvite,
  showWorkingCalendar = false,
  workingCalendarUserId,
  readOnlyExceptWorkingCalendar = false,
  showPermissions = true,
  onWorkingCalendarStateChange,
}: UserInviteFormPropsTypes) => {
  const { t } = useTranslation();

  const modulesForInvite = useMemo(
    () => modules.filter((m) => !isFileUploadFeaturePermission(m.module)),
    [modules],
  );

  useEffect(() => {
    setModulePermissions((prev) => {
      if (!prev.some(isFileUploadFeaturePermission)) {
        return prev;
      }
      return prev.filter((p) => !isFileUploadFeaturePermission(p));
    });
  }, [modulePermissions, setModulePermissions]);

  return (
    <div>
      {showUserFields ? (
        <div className="container my-3">
          <Box
            sx={{
              opacity: readOnlyExceptWorkingCalendar ? 0.6 : 1,
              pointerEvents: readOnlyExceptWorkingCalendar ? "none" : "auto",
            }}
          >
            <div className="row">
              <div className="col-lg-3 px-3">
              <TextField
                label={
                  <span>
                    {t("common.firstName")}
                    <span className="requiredUI">*</span>
                  </span>
                }
                name="FirstName"
                fullWidth
                helperText=" "
                value={firstName.value}
                onChange={(e) => {
                  setFirstname({
                    value: e.target.value,
                    error: e.target.value == "",
                  });
                }}
                variant="standard"
                defaultValue={""}
              />
            </div>
            <div className="col-lg-3 px-3">
              <TextField
                label={
                  <span>
                    {t("common.lastName")}
                    <span className="requiredUI">*</span>
                  </span>
                }
                name="LastName"
                fullWidth
                helperText=" "
                value={lastName.value}
                onChange={(e) => {
                  setLastName({
                    value: e.target.value,
                    error: e.target.value == "",
                  });
                }}
                variant="standard"
                defaultValue={""}
              />
            </div>
            <div className="col-lg-3 px-3">
              <TextField
                label={
                  <span>
                    {t("common.email")}
                    <span className="requiredUI">*</span>
                  </span>
                }
                name="userEmail"
                type="email"
                value={email.value}
                disabled={isEmailDisabled}
                onChange={(e) => {
                  const value = e.target.value;
                  const isDuplicate = existingEmails.some(
                    (em) => em.toLowerCase() === value.toLowerCase(),
                  );
                  const error = !emailPattern.test(value) || isDuplicate;
                  setEmail({ error, value: value });
                }}
                fullWidth
                variant="standard"
                error={email.error || email.value == ""}
                helperText={
                  email.value == "" ? (
                    <i>{t("common.requiredField")}</i>
                  ) : email.error ? (
                    existingEmails.some(
                      (e) => e.toLowerCase() === email.value.toLowerCase(),
                    ) ? (
                      <i style={{ color: "#d32f2f" }}>
                        {t("userhub.userWithSameEmailAlreadyExist", {
                          defaultValue: "User with same email already exist",
                        })}
                      </i>
                    ) : (
                      <i>{t("common.invalidEmailId")}</i>
                    )
                  ) : (
                    ""
                  )
                }
                defaultValue={""}
              />
            </div>
            <div className="col-lg-3 px-3">
              <Autocomplete
                label={
                  <span>
                    {t("common.role")}
                    <span className="requiredUI">*</span>
                  </span>
                }
                options={roleOptions}
                value={selectedRoleId || designation.value || ""}
                onChange={(value: string | null) => {
                  onRoleChange?.(value);
                }}
                isAddNewItem
                onAddItem={onAddRoleFromInvite}
                addItemText={t("userhubTeam.addRole", { defaultValue: "Add role" })}
                placeholder={t("userhubTeam.selectRole", {
                  defaultValue: "Select role",
                })}
                isLoading={isRolesLoading}
                disabled={isRoleSelectionDisabled}
                underline
              />
              </div>
            </div>
          </Box>
          {showWorkingCalendar && workingCalendarUserId ? (
            <div className="mt-2">
              <UserWorkingCalendarPreference
                userId={workingCalendarUserId}
                hideUserSelector
                hideSelectedUserLabel
                hideActions
                embeddedLayout
                onStateChange={onWorkingCalendarStateChange}
              />
            </div>
          ) : null}
          {showPermissions ? (
            <Box
              sx={{
                opacity: readOnlyExceptWorkingCalendar ? 0.6 : 1,
                pointerEvents: readOnlyExceptWorkingCalendar ? "none" : "auto",
              }}
            >
              <div className="container">
                <div>
                  <UserHubPermissionsSection
                    modules={modulesForInvite}
                    modulePermissions={modulePermissions}
                    setModulePermissions={setModulePermissions}
                  />
                  {featurePermissions && setFeaturePermissions && (
                    <UserHubFeatureSettingsSection
                      featurePermissions={featurePermissions}
                      setFeaturePermissions={setFeaturePermissions}
                    />
                  )}
                </div>
              </div>
            </Box>
          ) : null}
        </div>
      ) : (
        roleName &&
        setRoleName &&
        roleDescription !== undefined &&
        setRoleDescription && (
          <div className="container my-3">
            <div className="row">
              <div className="col-lg-6 px-3">
                <TextField
                  label={
                    <span>
                      {t("userhubTeam.roleName", { defaultValue: "Role name" })}
                      <span className="requiredUI">*</span>
                    </span>
                  }
                  name="roleName"
                  fullWidth
                  helperText=" "
                  value={roleName.value}
                  onChange={(e) => {
                    setRoleName({
                      value: e.target.value,
                      error: e.target.value == "",
                    });
                  }}
                  variant="standard"
                  placeholder={t("userhubTeam.roleNamePlaceholder", {
                    defaultValue: "e.g. Project Manager",
                  })}
                />
              </div>
              <div className="col-lg-6 px-3">
                <TextField
                  label={t("userhubTeam.roleDescription", {
                    defaultValue: "Description",
                  })}
                  name="roleDescription"
                  fullWidth
                  helperText=" "
                  multiline
                  minRows={1}
                  value={roleDescription.value}
                  onChange={(e) =>
                    setRoleDescription({ value: e.target.value, error: false })
                  }
                  variant="standard"
                  placeholder={t("userhubTeam.roleDescriptionPlaceholder", {
                    defaultValue: "Brief description of this role",
                  })}
                />
              </div>
            </div>
            <div className="container">
              <div>
                <UserHubPermissionsSection
                  modules={modulesForInvite}
                  modulePermissions={modulePermissions}
                  setModulePermissions={setModulePermissions}
                />
                {featurePermissions && setFeaturePermissions && (
                  <UserHubFeatureSettingsSection
                    featurePermissions={featurePermissions}
                    setFeaturePermissions={setFeaturePermissions}
                  />
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default UserInviteForm;
