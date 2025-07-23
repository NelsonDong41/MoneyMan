import { useMemo } from "react";
import { getAllDatesInRange } from "@/utils/utils";
import { useTransactions } from "@/context/TransactionsContext";
import { Type } from "@/utils/supabase/supabase";
import useInteractiveTransactionAreaChartData from "../../../InteractiveTransactionArea/hooks/useInteractiveTransactionAreaChartData";

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

  const { dataTableEntries: interactiveTransactionEntries } =
    useInteractiveTransactionAreaChartData();

  const dataTableEntries = useMemo(() => {
    let hasEntryInRange = false;
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

    const allDates = getAllDatesInRange(
      activeGraphFilters.timeRange,
      allTransactions[0].date
    );
    const result: CategoryChartDataEntry[] = [];

    allDates.forEach((date, i) => {
      const databaseEntry = transactionsByDate.get(date);
      if (databaseEntry) {
        hasEntryInRange = true;
      }
      const entry = databaseEntry || {
        date,
        amount: 0,
        ...(pieSelectedCategory ? { [pieSelectedCategory]: 0 } : {}),
      };

      // math for calculating accumulated balance over time already done in interactiveTransactionEntries
      if (type === "Income") {
        entry.amount = interactiveTransactionEntries[i].balance || 0;
      }
      result.push(entry);
    });

    if (!hasEntryInRange) return [];

    return result;
  }, [
    transactionsInRange,
    allTransactions,
    activeGraphFilters,
    pieSelectedCategory,
    interactiveTransactionEntries,
  ]);

  return { dataTableEntries };
}
