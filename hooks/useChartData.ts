import {
  transactionEventBus,
  TransactionEventBusPayload,
} from "@/app/eventBus";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { formatDate } from "@/utils/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export type ChartAreaDataEntry = {
  date: string;
  income?: number;
  expense?: number;
};

export default function useChartData(
  data: TransactionWithCategory[]
): [
  Map<string, ChartAreaDataEntry>,
  Dispatch<SetStateAction<Map<string, ChartAreaDataEntry>>>,
] {
  const [dataByType, setDataByType] = useState<Map<string, ChartAreaDataEntry>>(
    new Map()
  );

  useEffect(() => {
    let dataSortedByType = new Map<string, ChartAreaDataEntry>();

    data.forEach(({ date, type, amount }) => {
      const formattedDate = formatDate(new Date(date));
      const dataEntry = dataSortedByType.get(formattedDate) || {
        date: formattedDate,
      };
      if (type === "Expense") {
        dataEntry.expense = (dataEntry.expense || 0) + amount;
      } else {
        dataEntry.income = (dataEntry.income || 0) + amount;
      }
      dataSortedByType.set(formattedDate, dataEntry);
    });
    setDataByType(dataSortedByType);
  }, [data]);

  const handleTransactionUpdated = ({
    prev,
    current,
  }: TransactionEventBusPayload) => {
    setDataByType((prevMap) => {
      const newMap = new Map(prevMap);

      if (prev) {
        const prevDate = formatDate(new Date(prev.date));
        let prevEntry = newMap.get(prevDate)
          ? { ...newMap.get(prevDate), date: prevDate }
          : { date: prevDate };
        if (prev.type === "Expense") {
          prevEntry.expense = (prevEntry.expense || 0) - prev.amount;
          if (prevEntry.expense <= 0) {
            const { expense, ...rest } = prevEntry;
            prevEntry = rest;
          }
        } else {
          prevEntry.income = (prevEntry.income || 0) - prev.amount;
          if (prevEntry.income <= 0) {
            const { income, ...rest } = prevEntry;
            prevEntry = rest;
          }
        }
        // Remove entry if both income and expense are gone
        if (!prevEntry.expense && !prevEntry.income) {
          newMap.delete(prevDate);
        } else {
          newMap.set(prevDate, prevEntry);
        }
      }

      // Add current amount to new date/type
      const currDate = formatDate(new Date(current.date));
      const currEntry = newMap.get(currDate)
        ? { ...newMap.get(currDate), date: currDate }
        : { date: currDate };
      if (current.type === "Expense") {
        currEntry.expense = (currEntry.expense || 0) + current.amount;
      } else {
        currEntry.income = (currEntry.income || 0) + current.amount;
      }
      newMap.set(currDate, currEntry);

      return newMap;
    });
  };

  const handleTransactionDeleted = ({
    current,
  }: TransactionEventBusPayload) => {
    console.log("HandleTransactionDeleted", current);

    setDataByType((p) => {
      const newMap = new Map(p);
      const formattedCurrentDate = formatDate(new Date(current.date));
      let currentEntryByDate = newMap.get(formattedCurrentDate)!;

      if (current.type === "Expense") {
        currentEntryByDate.expense! -= current.amount;
        if (currentEntryByDate!.expense === 0) {
          const { expense, ...rest } = currentEntryByDate;
          currentEntryByDate = rest;
        }
      } else {
        currentEntryByDate.income! -= current.amount;
        if (currentEntryByDate.income === 0) {
          const { income, ...rest } = currentEntryByDate;
          currentEntryByDate = rest;
        }
      }

      if (!currentEntryByDate.expense && !currentEntryByDate.income) {
        newMap.delete(formattedCurrentDate);
      }
      return newMap;
    });
  };

  useEffect(() => {
    transactionEventBus.on("transaction:updated", handleTransactionUpdated);
    transactionEventBus.on("transaction:deleted", handleTransactionDeleted);

    return () => {
      transactionEventBus.off("transaction:updated", handleTransactionUpdated);
      transactionEventBus.off("transaction:deleted", handleTransactionDeleted);
    };
  }, []);

  return [dataByType, setDataByType];
}
