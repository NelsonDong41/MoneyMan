import { useEffect, useMemo } from "react";
import {
  convertSelectedTimeRange,
  formatDateDash,
  getAllDatesInRange,
} from "@/utils/utils";
import useAccumulatedIncome from "@/hooks/useAccumulatedIncome";
import {
  ChartOptions,
  InteractiveChartTimeRanges,
  useTransactions,
} from "@/context/TransactionsContext";

export type InteractiveChartDataEntry = {
  date: string;
  balance?: number;
  expense?: number;
} & {
  [key: string]: number | string;
};

export default function useInteractiveTransactionAreaChart() {
  const { allTransactions, displayedTransactions, activeGraphFilters } =
    useTransactions();

  const categoryDefaultObject = Object.fromEntries(
    activeGraphFilters.categories.map((cat) => [cat, 0])
  );

  const accumulatedBalance = useAccumulatedIncome();

  const dataTableEntries = useMemo(() => {
    let hasEntryInRange = false;
    const transactionsByDate = new Map<
      string,
      { balance: number; expense: number; [x: string]: number }
    >();

    displayedTransactions.forEach(
      ({ date, type, amount, status, category }) => {
        if (!transactionsByDate.has(date)) {
          const entry: {
            balance: number;
            expense: number;
            [x: string]: number;
          } = { balance: 0, expense: 0, ...categoryDefaultObject };

          transactionsByDate.set(date, entry);
        }
        const entry = transactionsByDate.get(date)!;

        if (
          type === "Income" &&
          (activeGraphFilters.type === "Balance" ||
            activeGraphFilters.type === "Both")
        ) {
          entry.balance += amount;
        } else if (
          type === "Expense" &&
          status !== "Canceled" &&
          (activeGraphFilters.type === "Expense" ||
            activeGraphFilters.type === "Both")
        ) {
          entry.expense += amount;
          const catName = category.name;
          if (activeGraphFilters.categories.includes(catName)) {
            if (entry[catName] !== undefined) {
              entry[catName] += amount;
            }
          }
        }
      }
    );

    const allDates = getAllDatesInRange(
      activeGraphFilters.timeRange,
      allTransactions[0].date
    );
    let balance = accumulatedBalance;
    const result: InteractiveChartDataEntry[] = [];

    for (const date of allDates) {
      const databaseEntry = transactionsByDate.get(date);
      if (databaseEntry) {
        hasEntryInRange = true;
      }
      const entry = databaseEntry || {
        balance: 0,
        expense: 0,
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
  }, [accumulatedBalance, activeGraphFilters]);

  return { dataTableEntries };
}
