import { transactionEventBus } from "@/app/eventBus";
import { TransactionInsert } from "@/app/transactions/data-table";
import { TableData } from "@/app/transactions/page";
import { FormTransaction } from "@/utils/schemas/transactionFormSchema";
import { createClient } from "@/utils/supabase/client";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";

export default function useTableStates(data: TableData) {
  const [tableData, setTableData] = useState(data.transactions);
  const [loadingRows, setLoadingRows] = useState<Set<number>>(new Set());
  const [activeSheetData, setActiveSheetData] =
    useState<TransactionWithCategory | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const upsertRow = async (values: FormTransaction) => {
    setLoadingRows((prev) => {
      if (values.id) {
        return new Set(prev).add(values.id);
      }
      return prev;
    });

    const transactionInsert: TransactionInsert = {
      ...values,
      id: values.id || undefined,
      date: new Date(values.date).toISOString(),
      userId: data.user.id,
      updated_at: new Date().toISOString(),
      amount: parseFloat(values.amount.replace(",", "")),
      subtotal: values.subtotal
        ? parseFloat(values.subtotal.replace(",", ""))
        : undefined,
      tip: values.tip ? parseFloat(values.tip.replace(",", "")) : undefined,
      tax: values.tax ? parseFloat(values.tax.replace(",", "")) : undefined,
    };

    console.log("insert", transactionInsert);

    const { data: insertedData, error } = await createClient()
      .from("Transaction")
      .upsert(transactionInsert)
      .select();

    if (error) {
      console.error("Error upserting transaction:", error);
      return null;
    }

    console.log("result", insertedData);

    const insertedDataWithNestedCategory = {
      ...insertedData[0],
      category: { category: insertedData[0].category },
    };

    transactionEventBus.emit("transaction:updated", {
      prev: activeSheetData,
      current: insertedDataWithNestedCategory,
    });

    setActiveSheetData(null);
    setIsSheetOpen(false);
    setTableData((prev) => {
      if (values.id) {
        return prev.map((transaction) =>
          transaction.id === values.id
            ? insertedDataWithNestedCategory
            : transaction
        );
      }
      return [...prev, insertedDataWithNestedCategory];
    });
    setLoadingRows((prev) => {
      if (activeSheetData?.id) {
        const newSet = new Set(prev);
        newSet.delete(activeSheetData.id);
        return newSet;
      }
      return prev;
    });
  };

  const deleteRows = async (ids: number[]) => {
    const idSet = new Set(ids);
    setLoadingRows((prev) => {
      return new Set(prev).union(idSet);
    });
    const { data: deletedData, error } = await createClient()
      .from("Transaction")
      .delete()
      .match({ userId: data.user.id })
      .in("id", ids)
      .select();

    if (error) {
      console.error("Error upserting transaction:", error);
      return null;
    }

    const deletedDataWithNestedCategory = deletedData.map((data) => {
      return {
        ...data,
        category: { category: data.category },
      };
    });

    deletedDataWithNestedCategory.forEach((data) => {
      transactionEventBus.emit("transaction:deleted", {
        prev: activeSheetData,
        current: data,
      });
    });

    setActiveSheetData(null);
    setTableData((prev) =>
      prev.filter((transaction) => !ids.includes(transaction.id))
    );
    setLoadingRows((prev) => {
      return prev.difference(idSet);
    });
  };

  const handleTableCellClick = (row: Row<TransactionWithCategory>) => {
    setActiveSheetData(row.original);
    setIsSheetOpen(true);
  };

  return {
    tableData,
    setTableData,
    loadingRows,
    setLoadingRows,
    activeSheetData,
    setActiveSheetData,
    isSheetOpen,
    setIsSheetOpen,
    upsertRow,
    deleteRows,
    handleTableCellClick,
  };
}
