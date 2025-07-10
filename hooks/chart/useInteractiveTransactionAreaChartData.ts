import { useEffect, useMemo, useState } from "react";
import { formatDateDash } from "@/utils/utils";
import useAccumulatedIncome from "../useAccumulatedIncome";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import { InteractiveChartTimeRanges } from "@/components/charts/InteractiveTransactionAreaChart";

export type ChartAreaDataEntry = {
  date: string;
  balance: number;
  expense: number;
};

export default function useChartData(
  data: TransactionWithCategory[],
  selectedTimeRange: InteractiveChartTimeRanges
) {
  const currentYear = new Date().getFullYear();
  const yearDefaultStartAndEnd = [
    formatDateDash(new Date(currentYear, 0, 1)),
    formatDateDash(new Date()),
  ] as [string, string];

  const [timeRange, setTimeRange] = useState<[string, string]>(
    yearDefaultStartAndEnd
  );

  const firstDate = data.length ? data[0] : null;

  useEffect(() => {
    if (selectedTimeRange === "all" && firstDate) {
      setTimeRange([firstDate.date, formatDateDash(new Date())]);
      return;
    }
    setTimeRange(
      convertSelectedTimeRange(
        selectedTimeRange as Exclude<
          InteractiveChartTimeRanges,
          "all" | "custom"
        >
      )
    );
  }, [selectedTimeRange]);

  const accumulatedBalance = useAccumulatedIncome(data, timeRange);

  const dataTableEntries = useMemo(() => {
    const transactionsByDate = new Map<
      string,
      { income: number; expense: number }
    >();

    data.forEach(({ date, type, amount, status }) => {
      if (date < timeRange[0] || date > timeRange[1]) return;
      if (!transactionsByDate.has(date)) {
        transactionsByDate.set(date, { income: 0, expense: 0 });
      }
      const entry = transactionsByDate.get(date)!;
      if (type === "Income") {
        entry.income += amount;
      } else if (type === "Expense" && status !== "Canceled") {
        entry.expense += amount;
      }
    });
    const allDates = getAllDatesInRange(...timeRange);
    let balance = accumulatedBalance;
    const result: ChartAreaDataEntry[] = [];

    for (const date of allDates) {
      const entry = transactionsByDate.get(date) || { income: 0, expense: 0 };
      balance += entry.income;
      balance -= entry.expense;
      result.push({
        date,
        balance,
        expense: entry.expense,
      });
    }

    return result;
  }, [data, accumulatedBalance, timeRange]);

  return { timeRange, setTimeRange, dataTableEntries };
}

const convertSelectedTimeRange = (
  selectedTimeRange: Exclude<InteractiveChartTimeRanges, "all" | "custom">
): [string, string] => {
  const today = new Date();

  switch (selectedTimeRange) {
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
      throw new Error("Converting Invalid time range", selectedTimeRange);
  }
};

function getAllDatesInRange(start: string, end: string): string[] {
  if (start === end) return [start];
  const dates: string[] = [];
  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [endYear, endMonth, endDay] = end.split("-").map(Number);

  let startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  while (startDate <= endDate) {
    dates.push(formatDateDash(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }

  return dates;
}
