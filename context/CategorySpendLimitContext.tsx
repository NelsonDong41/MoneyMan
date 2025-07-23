"use client";
import { Type } from "@/utils/supabase/supabase";
import { Database, Tables } from "@/utils/supabase/types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CategorySpendLimitContext = createContext<
  CategorySpendLimitContextType | undefined
>(undefined);

export type CategorySpendLimitContextType = {
  categorySpendLimits: Map<string, CategorySpendLimit>;
  setCategorySpendLimits: (map: Map<string, CategorySpendLimit>) => void;
};

export function CategorySpendLimitProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: CategorySpendLimit[];
}) {
  const [categorySpendLimits, setCategorySpendLimits] = useState<
    Map<string, CategorySpendLimit>
  >(new Map());
  const value = useMemo(
    () => ({
      categorySpendLimits,
      setCategorySpendLimits,
    }),
    [categorySpendLimits]
  );

  useEffect(() => {
    const arrAsMap: Map<string, CategorySpendLimit> = new Map();
    initial.forEach((spendLimit) =>
      arrAsMap.set(spendLimit.category, spendLimit)
    );
    setCategorySpendLimits(arrAsMap);
  }, [initial]);

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

export type CategorySpendLimit = Pick<
  Tables<"category_spend_limit">,
  "category" | "limit" | "time_frame"
>;
