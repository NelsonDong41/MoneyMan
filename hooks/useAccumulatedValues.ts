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
  const [totalIncomingTransactions, setTotalIncomingTransactions] = useState(0);
  const [totalOutgoingTransactions, setTotalOutgoingTransactions] = useState(0);

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
          spendSum += transactionData.amount;
          numIncomingTransactions += 1;
        }
      });

      setAccumulatedIncome(incomeSum);
      setAccumulatedSpend(spendSum);
      setTotalIncomingTransactions(numIncomingTransactions);
      setTotalOutgoingTransactions(numOutgoingTransactions);
    };

    getStartingIncome(startDate);
  }, [activeGraphFilters.timeRange, startDate]);
  return {
    accumuatedIncome,
    accumulatedSpend,
    accumuatedProfit,
    totalIncomingTransactions,
    totalOutgoingTransactions,
  };
}
