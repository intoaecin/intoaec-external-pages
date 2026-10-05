import { Fragment, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { PlannerWorkerEntry } from "../utils/plannerWorkerEntries";
import { PlannerGroupByTabs, type PlannerGroupByProps } from "./PlannerGroupByTabs";
import { PlannerListPanelShell } from "./PlannerListPanelShell";
import {
  PlannerChildRow,
  PlannerParentRow,
  PlannerTotalsLabelRow,
} from "./PlannerListRows";

interface PlannerWorkerListPanelProps extends PlannerGroupByProps {
  workerEntries: PlannerWorkerEntry[];
  bodyHeightPx: string;
  expandedWorkerIds: Set<string>;
  headerHeightPx: number;
  scrollTopPx: number;
  scrollRef: RefObject<HTMLDivElement>;
  onToggleWorker: (workerId: string) => void;
  onWheelScroll: (deltaY: number) => void;
}

export function PlannerWorkerListPanel({
  workerEntries,
  bodyHeightPx,
  expandedWorkerIds,
  headerHeightPx,
  scrollTopPx,
  scrollRef,
  onToggleWorker,
  onWheelScroll,
  groupBy,
  onGroupByChange,
}: PlannerWorkerListPanelProps) {
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
      {workerEntries.map(({ workerId, workerName, groups, shiftCount }) => {
        const isExpanded = expandedWorkerIds.has(workerId);

        return (
          <Fragment key={workerId}>
            <PlannerParentRow
              label={workerName}
              count={shiftCount}
              countTooltip={t("schedule.plannerWorkerShiftCount", {
                defaultValue: "{{count}} shifts",
                count: shiftCount,
              })}
              isExpanded={isExpanded}
              onToggle={() => onToggleWorker(workerId)}
            />
            {isExpanded &&
              groups.map(({ key, scheduleName, group }, index) => (
                <PlannerChildRow
                  key={key}
                  label={`${group.shiftName} · ${scheduleName}`}
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
