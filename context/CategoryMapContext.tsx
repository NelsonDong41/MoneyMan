"use client";
import { Type } from "@/utils/supabase/supabase";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CategoryMapContext = createContext<CategoryMapContextType | undefined>(
  undefined
);

export type CategoryMapContextType = {
  categoryMap: CategoryMap;
};

export function CategoryMapProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: CategoryMap;
}) {
  const [categoryMap, setCategoryMap] = useState<CategoryMap>(initial);
  const value = useMemo(
    () => ({
      categoryMap,
    }),
    [categoryMap]
  );

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

export type CategoryMap = Record<Type, string[]>;
