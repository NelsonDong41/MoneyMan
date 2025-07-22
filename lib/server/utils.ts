import { CategoryMap } from "@/context/CategoryMapContext";
import { createClient } from "@/utils/supabase/server";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
export type DashboardData = {
  transactions: TransactionWithCategory[];
  categoryMap: CategoryMap;
  user: User;
};

export async function getDashboardData(): Promise<DashboardData> {
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
  ] = await Promise.all([
    supabase
      .from("transaction")
      .select("*, category(name)")
      .eq("user_id", user.id)
      .neq("status", "Canceled")
      .order("date"),
    supabase.from("category").select("*").order("name"),
  ]);

  if (transactionError || categoryError) {
    throw new Error(
      "Error fetching data from supabase: " +
        (transactionError?.message || categoryError?.message)
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
    transactions: transactionData ?? [],
    categoryMap,
    user,
  };
}
