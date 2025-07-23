import { UserProvider } from "@/context/UserContext";
import { CategoryMap, CategoryMapProvider } from "@/context/CategoryMapContext";
import { TransactionProvider } from "@/context/TransactionsContext";
import DashboardGrid from "./DashboardGrid";
import { User } from "@supabase/supabase-js";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  CategorySpendLimit,
  CategorySpendLimitProvider,
} from "@/context/CategorySpendLimitContext";

export async function getDashboardData() {
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
  const categorySpendLimits = spendLimitData.map(
    ({ category, limit, time_frame }) => ({
      category,
      limit,
      time_frame,
    })
  );

  return {
    transactions: transactionData ?? [],
    categoryMap,
    user,
    categorySpendLimits,
  };
}

export default async function Dashboard() {
  const data = await getDashboardData();
  return (
    <div className="sm:py-10 max-w-full sm:max-w-screen-2xl w-full">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Providers {...data}>
        <DashboardGrid />
      </Providers>
    </div>
  );
}

function Providers({
  user,
  transactions,
  categoryMap,
  categorySpendLimits,
  children,
}: {
  user: User;
  transactions: TransactionWithCategory[];
  categoryMap: CategoryMap;
  categorySpendLimits: CategorySpendLimit[];
  children: React.ReactNode;
}) {
  return (
    <UserProvider initial={user}>
      <TransactionProvider initial={transactions}>
        <CategoryMapProvider initial={categoryMap}>
          <CategorySpendLimitProvider initial={categorySpendLimits}>
            {children}
          </CategorySpendLimitProvider>
        </CategoryMapProvider>
      </TransactionProvider>
    </UserProvider>
  );
}
