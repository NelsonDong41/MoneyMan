import { useMemo } from "react";
import { getAllDatesInRange } from "@/utils/utils";
import useAccumulatedIncome from "@/hooks/useAccumulatedIncome";
import { useTransactions } from "@/context/TransactionsContext";
import { Type } from "@/utils/supabase/supabase";

export type CategoryChartDataEntry = {
  date: string;
  amount: number;
  [k: string]: string | number;
};

export default function useInteractiveCategoryAreaChartData(type: Type) {
  const { allTransactions, displayedTransactions, activeGraphFilters } =
    useTransactions();

  const categoryDefaultObject = Object.fromEntries(
    activeGraphFilters.categories.map((cat) => [cat, 0])
  );

  let accumulatedBalance = useAccumulatedIncome();

  const dataTableEntries = useMemo(() => {
    let hasEntryInRange = false;
    const transactionsByDate = new Map<string, CategoryChartDataEntry>();

    displayedTransactions.forEach(
      ({ date, type: transactionType, amount, status, category }) => {
        if (transactionType !== type) return;
        if (!transactionsByDate.has(date)) {
          transactionsByDate.set(date, {
            date,
            amount,
            ...categoryDefaultObject,
          });
        } else {
          const entry = transactionsByDate.get(date)!;
          entry.amount += amount;
          entry.categories[category.name] =
            entry.categories[category.name] + amount;
        }
      }
    );

    const allDates = getAllDatesInRange(
      activeGraphFilters.timeRange,
      allTransactions[0].date
    );
    const result: CategoryChartDataEntry[] = [];

    for (const date of allDates) {
      const databaseEntry = transactionsByDate.get(date);
      if (databaseEntry) {
        hasEntryInRange = true;
        accumulatedBalance += (type === "Income" ? databaseEntry.amount : 0)
      }
      const entry = databaseEntry || {
        date,
        amount: type === "Income" ?
        ...categoryDefaultObject,
      };
      balance += entry.balance;
      balance -= entry.expense;
      result.push({
        date,
        ...entry,
        balance,
      });
    }

    if (!hasEntryInRange) return [];

    return result;
  }, [activeGraphFilters]);

  return { dataTableEntries };
}
