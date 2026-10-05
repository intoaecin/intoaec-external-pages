import { useTranslation } from "react-i18next";

import CustomTabs from "@/components_v2/CustomTabs";

export type PlannerGroupBy = "schedule" | "resource";

const GROUP_BY_KEYS: PlannerGroupBy[] = ["schedule", "resource"];

export interface PlannerGroupByProps {
  groupBy: PlannerGroupBy;
  onGroupByChange: (value: PlannerGroupBy) => void;
}

export function PlannerGroupByTabs({
  groupBy,
  onGroupByChange,
}: PlannerGroupByProps) {
  const { t } = useTranslation();

  return (
    <CustomTabs
      ariaLabel={t("schedule.plannerGroupBy", { defaultValue: "Group by" })}
      value={GROUP_BY_KEYS.indexOf(groupBy)}
      onChange={(index) => onGroupByChange(GROUP_BY_KEYS[index])}
      fullWidth
      items={[
        {
          label: t("schedule.plannerGroupBySchedule", { defaultValue: "Schedule" }),
        },
        {
          label: t("schedule.plannerGroupByResource", { defaultValue: "Resource" }),
        },
      ]}
    />
  );
}
