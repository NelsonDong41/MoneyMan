import { useEffect, useMemo, useState } from "react";
import { formatDateDash, getAllDatesInRange } from "@/utils/utils";
import { TransactionWithCategory, Type } from "@/utils/supabase/supabase";
import {
  ChartOptions,
  ChartTypeOptions,
  InteractiveChartTimeRanges,
} from "@/components/charts/InteractiveTransactionArea/InteractiveTransactionAreaChart";
import useAccumulatedIncome from "@/hooks/useAccumulatedIncome";
import { CategoryMap, useCategoryMap } from "@/context/CategoryMapContext";

export type InteractiveChartDataEntry = {
  date: string;
  balance?: number;
  expense?: number;
} & {
  [key: string]: number | string;
};

export default function useInteractiveTransactionAreaChart(
  data: TransactionWithCategory[],
  selectedTimeRange: InteractiveChartTimeRanges,
  activeGraph: ChartOptions
) {
  const { type: activeType, categories: activeCategories } = activeGraph;
  const currentYear = new Date().getFullYear();
  const yearDefaultStartAndEnd = [
    formatDateDash(new Date(currentYear, 0, 1)),
    formatDateDash(new Date()),
  ] as [string, string];

  const [timeRange, setTimeRange] = useState<[string, string]>(
    yearDefaultStartAndEnd
  );
  const accumulatedBalance = useAccumulatedIncome(data, timeRange);

  const firstDate = data.length ? data[0] : null;
  useEffect(() => {
    if (selectedTimeRange === "all" && firstDate) {
      setTimeRange([firstDate.date, formatDateDash(new Date())]);
      return;
    }
    setTimeRange(
      convertSelectedTimeRange(
        selectedTimeRange as Exclude<InteractiveChartTimeRanges, "all">
      )
    );
  }, [selectedTimeRange]);

  const categoryDefaultObject = Object.fromEntries(
    activeCategories.map((cat) => [cat, 0])
  );

  const dataTableEntries = useMemo(() => {
    let hasEntryInRange = false;
    const transactionsByDate = new Map<
      string,
      { balance: number; expense: number; [x: string]: number }
    >();

    // TODO: Splice data here before iterating
    data.forEach(({ date, type, amount, status, category }) => {
      if (date < timeRange[0] || date > timeRange[1]) return;
      if (!transactionsByDate.has(date)) {
        const entry: { balance: number; expense: number; [x: string]: number } =
          { balance: 0, expense: 0, ...categoryDefaultObject };

        transactionsByDate.set(date, entry);
      }
      const entry = transactionsByDate.get(date)!;

      if (
        type === "Income" &&
        (activeType === "Balance" || activeType === "Both")
      ) {
        entry.balance += amount;
      } else if (
        type === "Expense" &&
        status !== "Canceled" &&
        (activeType === "Expense" || activeType === "Both")
      ) {
        entry.expense += amount;
        const catName = category.category;
        if (activeCategories.includes(catName)) {
          if (entry[catName] !== undefined) {
            entry[catName] += amount;
          }
        }
      }
    });

    const allDates = getAllDatesInRange(...timeRange);
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
  }, [data, accumulatedBalance, timeRange, activeGraph]);

  return { timeRange, setTimeRange, dataTableEntries };
}

const convertSelectedTimeRange = (
  selectedTimeRange: Exclude<InteractiveChartTimeRanges, "all">
): [string, string] => {
  const today = new Date();

  switch (selectedTimeRange) {
    case "custom":
      return [formatDateDash(today), formatDateDash(today)];
    case "year":
      return [
        formatDateDash(new Date(today.getFullYear(), 0, 1)),
        formatDateDash(today),
      ];
    case "3m": {
      const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return [formatDateDash(start), formatDateDash(end)];
    }
    case "1m": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return [formatDateDash(start), formatDateDash(end)];
    }
    case "7d": {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      const end = today;
      return [formatDateDash(start), formatDateDash(end)];
    }
    default:
      throw new Error(`Converting Invalid time range ${selectedTimeRange}`);
  }
};

function extractCategoryName(cat: string) {
  const parts = cat.split(":");
  return parts[1];
}

function flattenCategoryMapWithFilter(
  map: CategoryMap,
  activeType: ChartTypeOptions,
  activeCategories?: string[]
): string[] {
  const typesToCheck: Type[] =
    activeType === "Both"
      ? ["Income", "Expense"]
      : activeType === "Balance"
        ? ["Income"]
        : ["Expense"];

  let result: string[] = [];

  for (const type of typesToCheck) {
    const categories = map[type];
    if (!categories) continue;

    if (activeCategories && activeCategories.length > 0) {
      for (const activeCategory of activeCategories) {
        // If the activeCategory exists as a key, return all its items for this type
        if (categories[activeCategory]) {
          result.push(
            ...categories[activeCategory].map((item) => `${type}:${item}`)
          );
        } else {
          // Otherwise, check if the category is a child (item) of any parent category
          Object.entries(categories).forEach(([_parent, items]) => {
            if (items.includes(activeCategory)) {
              result.push(`${type}:${activeCategory}`);
            }
          });
        }
      }
    } else {
      // No activeCategories: flatten everything for this type
      Object.entries(categories).forEach(([_parent, items]) => {
        result.push(...items.map((item) => `${type}:${item}`));
      });
    }
  }

  return result;
}
