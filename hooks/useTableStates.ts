import { TransactionInsert } from "@/components/dataTable/data-table";
import { FormTransaction } from "@/utils/schemas/transactionFormSchema";
import { createClient } from "@/utils/supabase/client";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { Row } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function useTableStates() {
  const { user } = useUser();
  const [loadingRows, setLoadingRows] = useState<Set<number>>(new Set());
  const [activeSheetData, setActiveSheetData] =
    useState<Partial<TransactionWithCategory> | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();

  const upsertRow = useCallback(
    async (values: FormTransaction) => {
      setLoadingRows((prev) => {
        if (values.id) {
          return new Set(prev).add(values.id);
        }
        return prev;
      });

      const response = await fetch("/api/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const { error } = await response.json();
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
    },
    [activeSheetData, router]
  );

  const deleteRows = useCallback(
    async (ids: number[]) => {
      const idSet = new Set(ids);
      setLoadingRows((prev) => {
        return new Set(prev).union(idSet);
      });
      const response = await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids),
      });

      if (!response.ok) {
        const { error } = await response.json();
        console.error("Error deleting transaction:", error);
        return null;
      }

      router.refresh();

      setActiveSheetData(null);
      setLoadingRows((prev) => {
        return prev.difference(idSet);
      });
    },
    [user, router]
  );

  const handleTableCellClick = useCallback(
    (row: Row<TransactionWithCategory>) => {
      setActiveSheetData(row.original);
      setIsSheetOpen(true);
    },
    []
  );

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
