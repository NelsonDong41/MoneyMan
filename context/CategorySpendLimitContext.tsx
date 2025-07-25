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
  categorySpendLimits: Map<string, CategorySpendLimitRecord>;
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
    Map<string, CategorySpendLimitRecord>
  >(new Map());

  useEffect(() => {
    const arrAsMap: Map<string, CategorySpendLimitRecord> = new Map();
    initial.forEach((spendLimit) =>
      arrAsMap.set(spendLimit.category, spendLimit)
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
        const newMap = new Map(prev);
        newMap.set(data.category, data);
        return newMap;
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
