import { useMemo } from "react";
import { getLastDayWithTimeFrame, getNextDay } from "@/utils/utils";
import { useTransactions } from "@/context/TransactionsContext";
import { Type } from "@/utils/supabase/supabase";
import useInteractiveTransactionAreaChartData from "../../../InteractiveTransactionArea/hooks/useInteractiveTransactionAreaChartData";
import useAccumulatedCategorySpend from "@/hooks/useAcccumulatedCategorySpend";
import { useCategorySpendLimit } from "@/context/CategorySpendLimitContext";

export type CategoryChartDataEntry = {
  date: string;
  amount: number;
  [k: string]: string | number;
};

export default function useInteractiveCategoryAreaChartData(
  type: Type,
  pieSelectedCategory?: string
) {
  const { allTransactions, transactionsInRange, activeGraphFilters } =
    useTransactions();

  const { dataTableEntries: interactiveTransactionEntries, periodType } =
    useInteractiveTransactionAreaChartData();

  let accumulatedCategorySpend =
    useAccumulatedCategorySpend(pieSelectedCategory);

  const { categorySpendLimits } = useCategorySpendLimit();
  const timeFrame =
    pieSelectedCategory &&
    categorySpendLimits.get(pieSelectedCategory)?.time_frame;
  const dataTableEntries = useMemo(() => {
    const transactionsByDate = new Map<string, CategoryChartDataEntry>();

    transactionsInRange.forEach(
      ({ date, type: transactionType, amount, category }) => {
        if (transactionType !== type) return;

        if (!transactionsByDate.has(date)) {
          transactionsByDate.set(date, {
            date,
            amount,
            ...(pieSelectedCategory ? { [pieSelectedCategory]: 0 } : {}),
          });
        } else {
          const entry = transactionsByDate.get(date)!;
          entry.amount += amount;
        }

        const entry = transactionsByDate.get(date)!;

        if (entry[category.name] !== undefined) {
          entry[category.name] = Number(entry[category.name]) + amount;
        }
      }
    );

    const allDates = interactiveTransactionEntries.map((entry) => entry.date);

    const result: CategoryChartDataEntry[] = [];

    let lastDate = timeFrame && getLastDayWithTimeFrame(timeFrame, allDates[0]);

    allDates.forEach((date, i) => {
      const databaseEntry = transactionsByDate.get(date);
      const entry = databaseEntry || {
        date,
        amount: 0,
        ...(pieSelectedCategory ? { [pieSelectedCategory]: 0 } : {}),
      };

      // math for calculating accumulated balance over time already done in interactiveTransactionEntries
      if (type === "Income") {
        entry.amount = interactiveTransactionEntries[i]?.balance || 0;
      }

      if (pieSelectedCategory) {
        entry[pieSelectedCategory] =
          Number(entry[pieSelectedCategory]) + accumulatedCategorySpend;

        accumulatedCategorySpend = entry[pieSelectedCategory];
      }
      result.push(entry);

      if (timeFrame && lastDate === date) {
        accumulatedCategorySpend = 0;

        lastDate = getLastDayWithTimeFrame(timeFrame, getNextDay(lastDate));
      }
    });

    return result;
  }, [
    transactionsInRange,
    allTransactions,
    activeGraphFilters,
    pieSelectedCategory,
    interactiveTransactionEntries,
    accumulatedCategorySpend,
    categorySpendLimits,
    timeFrame,
  ]);

  return { dataTableEntries, periodType };
}
