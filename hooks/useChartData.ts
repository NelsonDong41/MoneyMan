import { useMemo, useState } from "react";
import { formatDateDash } from "@/utils/utils";
import useAccumulatedIncome from "./useAccumulatedIncome";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";

export type ChartAreaDataEntry = {
  date: string;
  balance: number;
  expense: number;
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

export default function useChartData(data: TransactionWithCategory[]) {
  const currentYear = new Date().getFullYear();
  const yearDefaultStartAndEnd = [
    formatDateDash(new Date(currentYear, 0, 1)),
    formatDateDash(new Date()),
  ] as [string, string];

  const [timeRange, setTimeRange] = useState<[string, string]>(
    yearDefaultStartAndEnd
  );

  const accumulatedBalance = useAccumulatedIncome(data, timeRange);

  const dataTableEntries = useMemo(() => {
    const dateMap = new Map<string, ChartAreaDataEntry>();

    let cumulativeBalance = accumulatedBalance;

    data.forEach(({ date, type, amount }) => {
      if (date < timeRange[0] || date > timeRange[1]) return;

      let entry = dateMap.get(date);
      if (!entry) {
        entry = { date, balance: cumulativeBalance, expense: 0 };
      }

      if (type === "Income") {
        cumulativeBalance += amount;
        entry.balance = cumulativeBalance;
      } else if (type === "Expense") {
        entry.expense += amount;
      }
      dateMap.set(date, entry);
    });

    const allDates = getAllDatesInRange(...timeRange);
    let lastBalance = accumulatedBalance;

    const dataMap = allDates.map((date) => {
      const entry = dateMap.get(date);
      if (entry) {
        lastBalance = entry.balance;
        return entry;
      }
      return { date, balance: lastBalance, expense: 0 };
    });

    return dataMap;
  }, [data, accumulatedBalance, timeRange]);

  return { timeRange, setTimeRange, dataTableEntries };
}
