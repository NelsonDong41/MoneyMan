"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CategoryMapContext = createContext<CategoryMapContextType | undefined>(
  undefined
);

export type CategoryMapContextType = {
  categoryMap: CategoryMap;
  setCategoryMap: (user: CategoryMap) => void;
};

export function CategoryMapProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: CategoryMap;
}) {
  const [categoryMap, setCategoryMap] = useState<CategoryMap>(initial);
  const value = useMemo(() => ({ categoryMap, setCategoryMap }), [categoryMap]);

  useEffect(() => {
    setCategoryMap(initial);
  }, [initial]);

  return (
    <CategoryMapContext.Provider value={value}>
      {children}
    </CategoryMapContext.Provider>
  );
}

export function useCategoryMap() {
  const context = useContext(CategoryMapContext);
  if (context === undefined) {
    throw new Error(
      "useCategoryMaps must be used within a CategoryMapProvider"
    );
  }
  return context;
}

export type CategoryMap = Record<
  "Income" | "Expense",
  Record<string, string[]>
>;
