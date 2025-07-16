import { useMemo } from "react";
import { useTransactions } from "@/context/TransactionsContext";
import { useCategoryMap } from "@/context/CategoryMapContext";

export type SpendPieChartDataEntry = {
  category: string;
  amount: number;
  fill: string;
};

export default function useSpendPieChartData() {
  const { displayedTransactions, activeGraphFilters } = useTransactions();
  const { categoryToParentMap } = useCategoryMap();
  const dataTableEntries = useMemo(() => {
    const result: Record<string, SpendPieChartDataEntry> = {};

    displayedTransactions.forEach(({ type, amount, status, category }) => {
      if (type !== "Expense") return;
      const rootCategory =
        categoryToParentMap[category.category] || category.category;
      if (!result[rootCategory]) {
        result[rootCategory] = {
          category: rootCategory,
          amount: status === "Canceled" ? 0 : amount,
          fill: `var(--color-${rootCategory})`,
        };
      } else {
        result[rootCategory].amount += status === "Canceled" ? 0 : amount;
      }
    });

    return Object.values(result);
  }, [displayedTransactions, activeGraphFilters, categoryToParentMap]);

  return { dataTableEntries };
}
