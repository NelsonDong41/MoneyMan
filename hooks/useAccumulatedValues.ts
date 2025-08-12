import { useTransactions } from "@/context/TransactionsContext";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function useAccumulatedValues({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const { user } = useUser();
  if (!user) {
    throw new Error("User should exist when using useAccumulatedValues");
  }
  const { activeGraphFilters } = useTransactions();
  const [accumulatedIncome, setAccumulatedIncome] = useState(0);
  const [accumulatedSpend, setAccumulatedSpend] = useState(0);
  const accumuatedProfit = accumulatedIncome - accumulatedSpend;
  const [totalIncomingTransactions, setTotalIncomingTransactions] = useState(0);
  const [totalOutgoingTransactions, setTotalOutgoingTransactions] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    if (!endDate) return setAccumulatedIncome(0);
    const getStartingIncome = async () => {
      let supabaseQuery = supabase
        .from("transaction")
        .select("amount, type")
        .eq("user_id", user.id)
        .neq("status", "Canceled");
      if (startDate) {
        supabaseQuery = supabaseQuery.gt("date", startDate);
      }
      if (endDate) {
        supabaseQuery = supabaseQuery.lt("date", endDate);
      }

      const { data: transactionData, error } = await supabaseQuery;

      if (error) {
        console.error(
          "Error fetching transactions to calculate starting balance:",
          error
        );
        throw error;
      }

      let incomeSum = 0;
      let spendSum = 0;
      let numIncomingTransactions = 0;
      let numOutgoingTransactions = 0;
      transactionData.forEach((transactionData) => {
        if (transactionData.type === "Expense") {
          spendSum += transactionData.amount;
          numOutgoingTransactions += 1;
        }
        if (transactionData.type === "Income") {
          incomeSum += transactionData.amount;
          numIncomingTransactions += 1;
        }
      });

      setAccumulatedIncome(incomeSum);
      setAccumulatedSpend(spendSum);
      setTotalIncomingTransactions(numIncomingTransactions);
      setTotalOutgoingTransactions(numOutgoingTransactions);
    };

    getStartingIncome();
  }, [activeGraphFilters.timeRange, startDate, endDate]);
  return {
    accumulatedIncome,
    accumulatedSpend,
    accumuatedProfit,
    totalIncomingTransactions,
    totalOutgoingTransactions,
  };
}
