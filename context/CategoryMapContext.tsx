"use client";
import { Type } from "@/utils/supabase/supabase";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CategoryMapContext = createContext<CategoryMapContextType | undefined>(
  undefined
);

export type CategoryMapContextType = {
  categoryMap: CategoryMap;
  setCategoryMap: (map: CategoryMap) => void;
  categoryToParentMap: CategoryToParentMap;
  setCategoryToParentMap: (map: CategoryToParentMap) => void;
};

export function CategoryMapProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: [CategoryMap, CategoryToParentMap];
}) {
  const [categoryMap, setCategoryMap] = useState<CategoryMap>(initial[0]);
  const [categoryToParentMap, setCategoryToParentMap] =
    useState<CategoryToParentMap>(initial[1]);
  const value = useMemo(
    () => ({
      categoryMap,
      setCategoryMap,
      categoryToParentMap,
      setCategoryToParentMap,
    }),
    [categoryMap, categoryToParentMap]
  );

  useEffect(() => {
    setCategoryMap(initial[0]);
    setCategoryToParentMap(initial[1]);
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

export type CategoryMap = Record<Type, Record<string, string[]>>;

export type CategoryToParentMap = Record<string, string | null>;
