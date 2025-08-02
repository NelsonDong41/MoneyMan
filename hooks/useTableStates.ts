import { TransactionInsert } from "@/components/dataTable/data-table";
import { createClient } from "@/utils/supabase/client";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { Row } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { TableSheetForm } from "@/utils/schemas/tableSheetFormSchema";

export default function useTableStates() {
  const { user } = useUser();
  const [loadingRows, setLoadingRows] = useState<Set<number>>(new Set());
  const [activeSheetData, setActiveSheetData] =
    useState<Partial<TransactionWithCategory> | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();

  const upsertRow = useCallback(
    async (values: TableSheetForm) => {
      setLoadingRows((prev) => {
        if (values.id) {
          return new Set(prev).add(values.id);
        }
        return prev;
      });

      const formData = new FormData();
      const { images, ...clientFormValues } = values;
      images?.forEach((file) => {
        formData.append("images", file);
      });

      Object.entries(clientFormValues).forEach(([key, entry]) => {
        if (
          Array.isArray(entry) &&
          entry.length > 0 &&
          typeof entry[0] !== "object"
        ) {
          entry.forEach((v) => formData.append(key, v));
        } else if (typeof entry === "object" && entry !== null) {
          formData.append(key, JSON.stringify(entry));
        } else if (entry !== undefined && entry !== null) {
          formData.append(key, String(entry));
        }
      });

      const response = await fetch("/api/transactions", {
        method: "PUT",
        body: formData,
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

      console.log("user before making delete reqeuest", user);
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
