import { useCategorySpendLimit } from "@/context/CategorySpendLimitContext";
import { useTransactions } from "@/context/TransactionsContext";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import { getFirstDayWithTimeFrame } from "@/utils/utils";
import { useEffect, useState } from "react";

export const getStartDate = (timeRange: string) => {
  const referenceDate = new Date();

  if (timeRange === "year") {
    return new Date(referenceDate.getFullYear(), 0, 1);
  }
  let daysToSubtract = 90;
  if (timeRange === "30d") {
    daysToSubtract = 30;
  } else if (timeRange === "7d") {
    daysToSubtract = 7;
  }
  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - daysToSubtract);
  return startDate;
};

export default function useAccumulatedCategorySpend(category?: string) {
  const { user } = useUser();
  const { activeGraphFilters } = useTransactions();
  const [accumuatedSpend, setAccumulatedSpend] = useState(0);
  const [start] = activeGraphFilters.timeRange;
  const { categorySpendLimits } = useCategorySpendLimit();
  const supabase = createClient();

  const timeFrame = category
    ? categorySpendLimits[category].time_frame
    : undefined;

  const firstDay = timeFrame && getFirstDayWithTimeFrame(timeFrame, start);

  useEffect(() => {
    if (!start) return setAccumulatedSpend(0);
    if (firstDay === start) return setAccumulatedSpend(0);
    if (!category) return setAccumulatedSpend(0);

    console.log(firstDay);

    const getStartingSpend = async (startDate: string) => {
      const { data: transactionData, error } = await supabase
        .from("transaction")
        .select("amount, type")
        .eq("user_id", user.id)
        .eq("category", category)
        .neq("status", "Canceled")
        .gt("date", firstDay)
        .lt("date", startDate);

      if (error) {
        console.error("Error fetching transactions before date:", error);
        throw error;
      }

      const sum =
        transactionData?.reduce(
          (total, transaction) =>
            transaction.type === "Expense"
              ? total + (transaction.amount || 0)
              : total,
          0
        ) || 0;

      setAccumulatedSpend(sum);
    };

    getStartingSpend(start);
  }, [activeGraphFilters.timeRange, start, category]);
  return accumuatedSpend;
}
