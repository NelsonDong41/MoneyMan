"use client";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export type TransactionContextType = {
  transactions: TransactionWithCategory[];
  setTransactions: (user: TransactionWithCategory[]) => void;
};

export function TransactionProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: TransactionWithCategory[];
}) {
  const [transactions, setTransactions] =
    useState<TransactionWithCategory[]>(initial);

  useEffect(() => {
    setTransactions(initial);
  }, [initial]);
  const value = useMemo(
    () => ({ transactions, setTransactions }),
    [transactions]
  );

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider"
    );
  }
  return context;
}
