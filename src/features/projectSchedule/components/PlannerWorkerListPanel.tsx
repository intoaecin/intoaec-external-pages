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
import { PlannerWageAmount } from "./PlannerWageAmount";
import {
  getWorkerShiftWage,
  getWorkerWage,
  type ShiftWorkerWages,
} from "../utils/plannerWages";

interface PlannerWorkerListPanelProps extends PlannerGroupByProps {
  workerEntries: PlannerWorkerEntry[];
  bodyHeightPx: string;
  expandedWorkerIds: Set<string>;
  headerHeightPx: number;
  scrollTopPx: number;
  scrollRef: RefObject<HTMLDivElement>;
  onToggleWorker: (workerId: string) => void;
  onWheelScroll: (deltaY: number) => void;
  /** When given, each row ends with its wage. */
  wageByShiftWorker?: ShiftWorkerWages;
  /** Wage of every shift listed, for the totals row. */
  totalWage?: number;
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
  wageByShiftWorker,
  totalWage,
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
      <PlannerTotalsLabelRow
        aside={totalWage !== undefined ? <PlannerWageAmount amount={totalWage} isTotal /> : null}
      />
      {workerEntries.map((entry) => {
        const { workerId, workerName, groups, shiftCount } = entry;
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
              aside={
                wageByShiftWorker ? (
                  <PlannerWageAmount amount={getWorkerWage(entry, wageByShiftWorker)} />
                ) : null
              }
            />
            {isExpanded &&
              groups.map((workerGroup, index) => (
                <PlannerChildRow
                  key={workerGroup.key}
                  label={`${workerGroup.group.shiftName} · ${workerGroup.scheduleName}`}
                  color={workerGroup.group.days[0].shift.generatedShiftColor}
                  isLast={index === groups.length - 1}
                  aside={
                    wageByShiftWorker ? (
                      <PlannerWageAmount
                        amount={getWorkerShiftWage(workerId, workerGroup, wageByShiftWorker)}
                      />
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
