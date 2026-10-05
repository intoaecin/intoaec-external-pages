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

interface PlannerListPanelProps extends PlannerGroupByProps {
  entries: PlannerScheduleEntry[];
  bodyHeightPx: string;
  expandedScheduleIds: Set<string>;
  headerHeightPx: number;
  scrollTopPx: number;
  scrollRef: RefObject<HTMLDivElement>;
  onToggleSchedule: (scheduleId: string) => void;
  onWheelScroll: (deltaY: number) => void;
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
      <PlannerTotalsLabelRow />
      {entries.map(({ schedule, groups, shiftCount }) => {
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
            />
            {isExpanded &&
              groups.map((group, index) => (
                <PlannerChildRow
                  key={group.key}
                  label={group.shiftName}
                  color={group.days[0].shift.generatedShiftColor}
                  isLast={index === groups.length - 1}
                />
              ))}
          </Fragment>
        );
      })}
    </PlannerListPanelShell>
  );
}
