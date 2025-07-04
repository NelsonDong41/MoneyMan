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
    const dataSortedByType = new Map<string, ChartAreaDataEntry>();
    let accumuatedIncome = 0.0;

    data.forEach(({ date, type, amount }) => {
      const dataEntry = dataSortedByType.get(date) || {
        date,
      };
      if (type === "Expense") {
        dataEntry.expense = (dataEntry.expense || 0) + amount;
      } else {
        accumuatedIncome += amount;
      }
      dataEntry.income = accumuatedIncome;
      dataSortedByType.set(date, dataEntry);
    });
    setDataByType(dataSortedByType);
  }, [data]);

  return [dataByType, setDataByType];
}
