import { TransactionInsert } from "@/app/transactions/data-table";
import { FormTransaction } from "@/utils/schemas/transactionFormSchema";
import { createClient } from "@/utils/supabase/client";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { Row } from "@tanstack/react-table";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function useTableStates(user: User) {
  const [loadingRows, setLoadingRows] = useState<Set<number>>(new Set());
  const [activeSheetData, setActiveSheetData] =
    useState<Partial<TransactionWithCategory> | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();

  const upsertRow = async (values: FormTransaction) => {
    setLoadingRows((prev) => {
      if (values.id) {
        return new Set(prev).add(values.id);
      }
      return prev;
    });

    console.log("upserting", values);
    const transactionInsert: TransactionInsert = {
      ...values,
      id: values.id || undefined,
      date: values.date,
      userId: user.id,
      updated_at: new Date().toUTCString(),
      amount: parseFloat(values.amount.replace(",", "")),
      subtotal: values.subtotal
        ? parseFloat(values.subtotal.replace(",", ""))
        : undefined,
      tip: values.tip ? parseFloat(values.tip.replace(",", "")) : undefined,
      tax: values.tax ? parseFloat(values.tax.replace(",", "")) : undefined,
    };

    const { error } = await createClient()
      .from("Transaction")
      .upsert(transactionInsert);

    if (error) {
      console.error("Error upserting transaction:", error);
      return null;
    }

    router.refresh();

    setActiveSheetData(null);
    setIsSheetOpen(false);
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
    const { error } = await createClient()
      .from("Transaction")
      .delete()
      .match({ userId: user.id })
      .in("id", ids);

    if (error) {
      console.error("Error upserting transaction:", error);
      return null;
    }

    router.refresh();

    setActiveSheetData(null);
    setLoadingRows((prev) => {
      return prev.difference(idSet);
    });
  };

  const handleTableCellClick = (row: Row<TransactionWithCategory>) => {
    setActiveSheetData(row.original);
    setIsSheetOpen(true);
  };

  return {
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
