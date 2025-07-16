import { useMemo } from "react";
import { useTransactions } from "@/context/TransactionsContext";
import { useCategoryMap } from "@/context/CategoryMapContext";
import { Type } from "@/utils/supabase/supabase";

export type SpendPieChartDataEntry = {
  category: string;
  amount: number;
  fill: string;
};

export default function usePieChartData(type: Type) {
  const { displayedTransactions, activeGraphFilters } = useTransactions();
  const { categoryToParentMap } = useCategoryMap();
  const dataTableEntries = useMemo(() => {
    const result: Record<string, SpendPieChartDataEntry> = {};

    displayedTransactions.forEach(
      ({ type: currType, amount, status, category }) => {
        if (currType !== type) return;
        const rootCategory =
          categoryToParentMap[category.name] || category.name;
        if (!result[rootCategory]) {
          result[rootCategory] = {
            category: rootCategory,
            amount: status === "Canceled" ? 0 : amount,
            fill: `var(--color-${rootCategory})`,
          };
        } else {
          result[rootCategory].amount += status === "Canceled" ? 0 : amount;
        }
      }
    );

    return Object.values(result);
  }, [displayedTransactions, activeGraphFilters, categoryToParentMap]);

  return { dataTableEntries };
}
