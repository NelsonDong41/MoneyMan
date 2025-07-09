import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { formatDateDash } from "@/utils/utils";
import { User } from "@supabase/supabase-js";
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

export default function useAccumulatedIncome(
  data: TransactionWithCategory[],
  timeRange: [string, string]
) {
  const { user } = useUser();
  const [accumuatedIncome, setAccumulatedIncome] = useState(0);
  const [start] = timeRange;
  const supabase = createClient();

  useEffect(() => {
    const getStartingIncome = async (startDate: string) => {
      const { data, error } = await supabase
        .from("Transaction")
        .select("amount")
        .eq("userId", user.id)
        .eq("type", "Income")
        .neq("status", "Canceled")
        .lt("date", startDate);

      if (error) {
        console.error("Error fetching transactions before date:", error);
        throw error;
      }

      const sum =
        data?.reduce(
          (total, transaction) => total + (transaction.amount || 0),
          0
        ) || 0;

      setAccumulatedIncome(sum);
    };

    getStartingIncome(start);
  }, [timeRange, data]);

  return accumuatedIncome;
}
