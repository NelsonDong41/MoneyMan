import { useMemo } from "react";
import { useTransactions } from "@/context/TransactionsContext";
import { Type } from "@/utils/supabase/supabase";

export type SpendPieChartDataEntry = {
  category: string;
  amount: number;
  fill: string;
};

export default function usePieChartData(type: Type) {
  const { transactionsInRange } = useTransactions();
  const pieChartData = useMemo(() => {
    const result: Record<string, SpendPieChartDataEntry> = {};

    transactionsInRange.forEach(
      ({ type: currType, amount, status, category }) => {
        if (currType !== type) return;
        if (!result[category.name]) {
          result[category.name] = {
            category: category.name,
            amount: status === "Canceled" ? 0 : amount,
            fill: `var(--color-${category.name})`,
          };
        } else {
          result[category.name].amount += status === "Canceled" ? 0 : amount;
        }
      }
    );

    return Object.values(result).sort((a, b) => b.amount - a.amount);
  }, [transactionsInRange, type]);

  return { pieChartData };
}
