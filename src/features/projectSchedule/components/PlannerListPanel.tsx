import { Fragment, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { PlannerScheduleEntry } from "../hooks/usePlannerData";
import { PlannerGroupByTabs, type PlannerGroupByProps } from "./PlannerGroupByTabs";
import { PlannerListPanelShell } from "./PlannerListPanelShell";
import {
  PlannerChildRow,
  PlannerParentRow,
  PlannerTotalsLabelRow,
} from "./PlannerListRows";
import { PlannerWageAmount } from "./PlannerWageAmount";
import {
  getScheduleWage,
  getShiftGroupWage,
  getTotalWage,
  type ShiftWages,
} from "../utils/plannerWages";

interface PlannerListPanelProps extends PlannerGroupByProps {
  entries: PlannerScheduleEntry[];
  bodyHeightPx: string;
  expandedScheduleIds: Set<string>;
  headerHeightPx: number;
  scrollTopPx: number;
  scrollRef: RefObject<HTMLDivElement>;
  onToggleSchedule: (scheduleId: string) => void;
  onWheelScroll: (deltaY: number) => void;
  /** When given, each row ends with its wage. */
  wageByShiftId?: ShiftWages;
}

export function PlannerListPanel({
  entries,
  bodyHeightPx,
  expandedScheduleIds,
  headerHeightPx,
  scrollTopPx,
  scrollRef,
  onToggleSchedule,
  onWheelScroll,
  groupBy,
  onGroupByChange,
  wageByShiftId,
}: PlannerListPanelProps) {
  const { t } = useTranslation();

  return (
    <PlannerListPanelShell
      header={<PlannerGroupByTabs groupBy={groupBy} onGroupByChange={onGroupByChange} />}
      bodyHeightPx={bodyHeightPx}
      headerHeightPx={headerHeightPx}
      scrollTopPx={scrollTopPx}
      scrollRef={scrollRef}
      onWheelScroll={onWheelScroll}
    >
      <PlannerTotalsLabelRow
        aside={
          wageByShiftId ? (
            <PlannerWageAmount amount={getTotalWage(entries, wageByShiftId)} isTotal />
          ) : null
        }
      />
      {entries.map((entry) => {
        const { schedule, groups, shiftCount } = entry;
        const isExpanded = expandedScheduleIds.has(schedule.scheduleId);

        return (
          <Fragment key={schedule.scheduleId}>
            <PlannerParentRow
              label={schedule.scheduleName}
              count={shiftCount}
              countTooltip={t("schedule.plannerShiftCount", {
                defaultValue: "{{count}} shifts",
                count: shiftCount,
              })}
              isExpanded={isExpanded}
              onToggle={() => onToggleSchedule(schedule.scheduleId)}
              aside={
                wageByShiftId ? (
                  <PlannerWageAmount amount={getScheduleWage(entry, wageByShiftId)} />
                ) : null
              }
            />
            {isExpanded &&
              groups.map((group, index) => (
                <PlannerChildRow
                  key={group.key}
                  label={group.shiftName}
                  color={group.days[0].shift.generatedShiftColor}
                  isLast={index === groups.length - 1}
                  aside={
                    wageByShiftId ? (
                      <PlannerWageAmount amount={getShiftGroupWage(group, wageByShiftId)} />
                    ) : null
                  }
                />
              ))}
          </Fragment>
        );
      })}
    </PlannerListPanelShell>
  );
}
