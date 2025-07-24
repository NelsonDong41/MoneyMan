"use client";
import {
  CategorySpendLimitErrorResponse,
  CategorySpendLimitResponse,
} from "@/app/api/categorySpendLimits/route";
import { CategorySpendLimitForm } from "@/utils/schemas/categorySpendLimitFormSchema";
import { CategorySpendLimitRecord, Type } from "@/utils/supabase/supabase";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CategorySpendLimitContext = createContext<
  CategorySpendLimitContextType | undefined
>(undefined);

export type CategorySpendLimitContextType = {
  categorySpendLimits: Record<string, CategorySpendLimitRecord>;
  updateCategorySpendLimit: (
    values: CategorySpendLimitForm
  ) => Promise<CategorySpendLimitRecord | null>;
};

export function CategorySpendLimitProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: CategorySpendLimitRecord[];
}) {
  const [categorySpendLimits, setCategorySpendLimits] = useState<
    Record<string, CategorySpendLimitRecord>
  >({});

  useEffect(() => {
    const arrAsMap: Record<string, CategorySpendLimitRecord> = {};
    initial.forEach(
      (spendLimit) => (arrAsMap[spendLimit.category] = spendLimit)
    );
    setCategorySpendLimits(arrAsMap);
  }, [initial]);

  const updateCategorySpendLimit = async (
    values: CategorySpendLimitForm
  ): Promise<CategorySpendLimitRecord | null> => {
    try {
      const response = await fetch("/api/categorySpendLimits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const { error } =
          (await response.json()) as CategorySpendLimitErrorResponse;
        console.error("Error updating category spend limit:", error);
        return null;
      }

      const { data } = (await response.json()) as CategorySpendLimitResponse;

      setCategorySpendLimits((prev) => {
        return {
          ...prev,
          [data.category]: data,
        };
      });

      return data;
    } catch (err) {
      console.error("Unexpected error:", err);
      return null;
    }
  };

  const value = useMemo(
    () => ({
      categorySpendLimits,
      updateCategorySpendLimit,
    }),
    [categorySpendLimits]
  );
  return (
    <CategorySpendLimitContext.Provider value={value}>
      {children}
    </CategorySpendLimitContext.Provider>
  );
}

export function useCategorySpendLimit() {
  const context = useContext(CategorySpendLimitContext);
  if (context === undefined) {
    throw new Error(
      "useCategorySpendLimits must be used within a CategorySpendLimitProvider"
    );
  }
  return context;
}
