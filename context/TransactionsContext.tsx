"use client";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { convertSelectedTimeRange } from "@/utils/utils";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export type TransactionContextType = {
  allTransactions: TransactionWithCategory[];
  transactionsInRange: TransactionWithCategory[];
  activeGraphFilters: ChartOptions;
  setActiveGraphFilterTimeRange: (payload: [string, string]) => void;
  setActiveGraphFilterType: (payload: ChartTypeOptions) => void;
  setActiveGraphFilterCategories: (payload: string[]) => void;
};

export type InteractiveChartTimeRanges =
  | "all"
  | "custom"
  | "year"
  | "3m"
  | "1m"
  | "7d";

export type ChartTypeOptions = "Balance" | "Expense" | "Both";

export type ChartOptions = {
  type: ChartTypeOptions;
  categories: string[];
  timeRange: [string, string];
};

const DEFAULT_CHART_OPTION: ChartOptions = {
  type: "Expense",
  categories: [],
  timeRange: convertSelectedTimeRange("3m"),
};

export function TransactionProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: TransactionWithCategory[];
}) {
  const [transactions, setTransactions] =
    useState<TransactionWithCategory[]>(initial);
  const [activeGraphFilters, setActiveGraphFilters] =
    useState<ChartOptions>(DEFAULT_CHART_OPTION);

  useEffect(() => {
    setTransactions(initial);
  }, [initial]);

  const transactionsInRange = useMemo(
    () =>
      spliceTransactionDatabyDate(transactions, activeGraphFilters.timeRange),
    [transactions, activeGraphFilters]
  );

  const setActiveGraphFilterTimeRange = (payload: [string, string]) => {
    setActiveGraphFilters((prev) => ({
      ...prev,
      timeRange: payload,
    }));
  };
  const setActiveGraphFilterType = (payload: ChartTypeOptions) => {
    setActiveGraphFilters((prev) => ({
      ...prev,
      type: payload,
    }));
  };
  const setActiveGraphFilterCategories = (payload: string[]) => {
    setActiveGraphFilters((prev) => ({
      ...prev,
      categories: payload,
    }));
  };

  const value = {
    allTransactions: transactions,
    transactionsInRange,
    activeGraphFilters,
    setActiveGraphFilterTimeRange,
    setActiveGraphFilterType,
    setActiveGraphFilterCategories,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider"
    );
  }
  return context;
}

export function spliceTransactionDatabyDate(
  transactions: TransactionWithCategory[],
  timeRange: [string, string]
): TransactionWithCategory[] {
  if (transactions.length === 0) return [];
  if (timeRange[0] === "" && timeRange[1] === "") return transactions;

  const [start, end] = timeRange;
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();

  let left = 0;
  let right = transactions.length - 1;
  let startIdx = transactions.length;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midDate = new Date(transactions[mid].date).getTime();

    if (midDate < startDate) {
      left = mid + 1;
    } else {
      startIdx = mid;
      right = mid - 1;
    }
  }

  left = 0;
  right = transactions.length - 1;
  let endIdx = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midDate = new Date(transactions[mid].date).getTime();

    if (midDate > endDate) {
      right = mid - 1;
    } else {
      endIdx = mid;
      left = mid + 1;
    }
  }

  if (startIdx <= endIdx) {
    return transactions.slice(startIdx, endIdx + 1);
  }

  return [];
}
