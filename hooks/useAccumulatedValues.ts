import { useTransactions } from "@/context/TransactionsContext";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function useAccumulatedValues(startDate: string) {
  const { user } = useUser();
  const { activeGraphFilters } = useTransactions();
  const [accumuatedIncome, setAccumulatedIncome] = useState(0);
  const [accumulatedSpend, setAccumulatedSpend] = useState(0);
  const accumuatedProfit = accumuatedIncome - accumulatedSpend;

  const supabase = createClient();

  useEffect(() => {
    if (!startDate) return setAccumulatedIncome(0);
    const getStartingIncome = async (startDate: string) => {
      const { data: transactionData, error } = await supabase
        .from("transaction")
        .select("amount, type")
        .eq("user_id", user.id)
        .neq("status", "Canceled")
        .lt("date", startDate);

      if (error) {
        console.error(
          "Error fetching transactions to calculate starting balance:",
          error
        );
        throw error;
      }

      const incomeSum = transactionData!.reduce(
        (total, transaction) =>
          transaction.type === "Income" ? total + transaction.amount : total,
        0
      );
      const spendSum = transactionData!.reduce(
        (total, transaction) =>
          transaction.type === "Expense" ? total + transaction.amount : total,
        0
      );

      setAccumulatedIncome(incomeSum);
      setAccumulatedSpend(spendSum);
    };

    getStartingIncome(startDate);
  }, [activeGraphFilters.timeRange, startDate]);
  return { accumuatedIncome, accumulatedSpend, accumuatedProfit };
}
