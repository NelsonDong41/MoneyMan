import { useMemo } from "react";
import {
  formatDateDash,
  getAggregatedPeriodsInRange,
  mapDateToPeriodKey,
} from "@/utils/utils";
import useAccumulatedIncome from "@/hooks/useAccumulatedValues";
import { useTransactions } from "@/context/TransactionsContext";
import { format } from "date-fns";

export type InteractiveChartDataEntry = {
  date: string;
  balance?: number;
  expense?: number;
} & {
  [key: string]: number | string;
};

export type AggregationPeriod = "day" | "week" | "month";

export default function useInteractiveTransactionAreaChartData() {
  const { allTransactions, transactionsInRange, activeGraphFilters } =
    useTransactions();

  const categories = activeGraphFilters.categories.length
    ? activeGraphFilters.categories
    : [];

  const categoryDefaultObject = Object.fromEntries(
    categories.map((cat) => [cat, 0])
  );

  const { accumuatedProfit } = useAccumulatedIncome(
    activeGraphFilters.timeRange[0]
  );

  const { periods: aggregatedPeriods, periodType } = useMemo(() => {
    return getAggregatedPeriodsInRange(
      activeGraphFilters.timeRange,
      allTransactions[0]?.date ?? formatDateDash()
    );
  }, [activeGraphFilters.timeRange, allTransactions]);

  const dataTableEntries = useMemo(() => {
    const aggregatedTransactions = new Map<
      string,
      { balance: number; expense: number; [key: string]: number }
    >();

    for (const period of aggregatedPeriods) {
      aggregatedTransactions.set(period, {
        balance: 0,
        expense: 0,
        ...categoryDefaultObject,
      });
    }

    transactionsInRange.forEach(({ date, type, amount, status, category }) => {
      if (status === "Canceled") return;

      const periodKey = mapDateToPeriodKey(date, periodType);
      const entry = aggregatedTransactions.get(periodKey);
      if (!entry) return;

      if (type === "Income") {
        entry.balance += amount;
      } else if (type === "Expense") {
        entry.expense += amount;

        const catName = category.name;
        if (categories.includes(catName)) {
          entry[catName] = (entry[catName] ?? 0) + amount;
        }
      }
    });

    let balance = accumuatedProfit;
    const result: InteractiveChartDataEntry[] = [];

    for (const period of aggregatedPeriods) {
      const entry = aggregatedTransactions.get(period);
      if (!entry) continue;

      balance += entry.balance;
      balance -= entry.expense;

      result.push({
        date: period,
        ...entry,
        balance,
      });
    }

    return result;
  }, [
    aggregatedPeriods,
    transactionsInRange,
    periodType,
    accumuatedProfit,
    categoryDefaultObject,
    categories,
  ]);

  return { dataTableEntries, periodType };
}
