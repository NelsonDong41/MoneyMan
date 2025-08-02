import { TransactionInsert } from "@/components/dataTable/data-table";
import { createClient } from "@/utils/supabase/client";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { Row } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { TableSheetForm } from "@/utils/schemas/tableSheetFormSchema";
import {
  TransactionsErrorResponse,
  TransactionsResponse,
} from "@/app/api/transactions/route";
import {
  ImagesErrorResponse,
  ImagesGetResponse,
  ImagesPutResponse,
} from "@/app/api/images/[transactionId]/route";
import { toast } from "sonner";

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

      const transactionFormData = new FormData();
      const { imagesToAdd, imagesToDelete, ...clientFormValues } = values;

      Object.entries(clientFormValues).forEach(([key, entry]) => {
        if (
          Array.isArray(entry) &&
          entry.length > 0 &&
          typeof entry[0] !== "object"
        ) {
          entry.forEach((v) => transactionFormData.append(key, v));
        } else if (typeof entry === "object" && entry !== null) {
          transactionFormData.append(key, JSON.stringify(entry));
        } else if (entry !== undefined && entry !== null) {
          transactionFormData.append(key, String(entry));
        }
      });

      const transactionsResponse = await fetch("/api/transactions", {
        method: "PUT",
        body: transactionFormData,
      });

      if (!transactionsResponse.ok) {
        const { error } =
          (await transactionsResponse.json()) as TransactionsErrorResponse;
        toast.error("Error upserting transaction", { description: error });
        console.error("Error upserting transaction:", error);
        return null;
      }

      const { data: transactionData } =
        (await transactionsResponse.json()) as TransactionsResponse;

      if (transactionData.length > 1) {
        toast.error("Should have only uploaded 1 transaction", {
          description: JSON.stringify(
            transactionData.map((data) => data.description).join(" | ")
          ),
        });

        console.error(
          "Should have only uploaded 1 transaction",
          JSON.stringify(
            transactionData.map((data) => data.description).join(" | ")
          )
        );
      }

      const uploadedTransaction = transactionData[0];
      const imagesFormData = new FormData();

      imagesToAdd?.forEach((file) => {
        imagesFormData.append("imagesToAdd", file);
      });
      imagesToDelete?.forEach((file) => {
        imagesFormData.append("imagesToDelete", file);
      });

      const imagesResponse = await fetch(
        `/api/images/${uploadedTransaction.id}`,
        {
          method: "PUT",
          body: imagesFormData,
        }
      );

      if (!imagesResponse.ok) {
        const { error } = (await imagesResponse.json()) as ImagesErrorResponse;
        toast.error("Error inserting images", {
          description: error,
        });
        console.error("Error inserting images:", error);
        return null;
      }

      const { data: imagesData } =
        (await imagesResponse.json()) as ImagesPutResponse;

      router.refresh();

      toast.success(`Transaction ${values.id ? "Updated" : "Created"}`, {
        description: values.description,
      });

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
