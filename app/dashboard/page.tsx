import { CategoryMap, CategoryMapProvider } from "@/context/CategoryMapContext";
import { TransactionProvider } from "@/context/TransactionsContext";
import DashboardGrid from "./DashboardGrid";
import {
  CategorySpendLimitRecord,
  TransactionWithCategory,
} from "@/utils/supabase/supabase";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CategorySpendLimitProvider } from "@/context/CategorySpendLimitContext";

async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const [
    { data: transactionData, error: transactionError },
    { data: categoryData, error: categoryError },
    { data: spendLimitData, error: spendLimitError },
  ] = await Promise.all([
    supabase
      .from("transaction")
      .select("*, category(name)")
      .eq("user_id", user.id)
      .neq("status", "Canceled")
      .order("date"),
    supabase.from("category").select("*").order("name"),
    supabase
      .from("category_spend_limit")
      .select("*")
      .eq("user_id", user.id)
      .order("category"),
  ]);

  if (transactionError || categoryError || spendLimitError) {
    throw new Error(
      "Error fetching data from supabase: " +
        (transactionError?.message ||
          categoryError?.message ||
          spendLimitError?.message)
    );
  }

  const initCategoryMap: CategoryMap = {
    Income: [],
    Expense: [],
  };
  const categoryMap: CategoryMap = categoryData.reduce((acc, curr) => {
    const { type, name } = curr;
    acc[type].push(name);
    return acc;
  }, initCategoryMap);

  return {
    transactions: transactionData,
    categoryMap,
    categorySpendLimits: spendLimitData,
  };
}

export default async function Dashboard() {
  const data = await getDashboardData();
  return (
    <>
      <div className="max-w-full sm:max-w-screen-2xl w-full">
        <h1 className="text-2xl font-bold mb-6 pt-6">Dashboard</h1>
        <Providers {...data}>
          <DashboardGrid />
        </Providers>
      </div>
    </>
  );
}

function Providers({
  transactions,
  categoryMap,
  categorySpendLimits,
  children,
}: {
  transactions: TransactionWithCategory[];
  categoryMap: CategoryMap;
  categorySpendLimits: CategorySpendLimitRecord[];
  children: React.ReactNode;
}) {
  return (
    <TransactionProvider initial={transactions}>
      <CategoryMapProvider initial={categoryMap}>
        <CategorySpendLimitProvider initial={categorySpendLimits}>
          {children}
        </CategorySpendLimitProvider>
      </CategoryMapProvider>
    </TransactionProvider>
  );
}
