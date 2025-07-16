import { CategoryMap, CategoryToParentMap } from "@/context/CategoryMapContext";
import { createClient } from "@/utils/supabase/server";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { categoryDataToMap, categoryDataToParentMap } from "@/utils/utils";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
export type DashboardData = {
  transactions: TransactionWithCategory[];
  categoryMap: CategoryMap;
  categoryToParentMap: CategoryToParentMap;
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
      .from("Transaction")
      .select("*, category(category)")
      .eq("userId", user.id)
      .neq("status", "Canceled")
      .order("date"),
    supabase.from("Category").select("*").order("category"),
  ]);

  if (transactionError || categoryError) {
    throw new Error(
      "Error fetching data from supabase: " +
        (transactionError?.message || categoryError?.message)
    );
  }

  const categoryMap = categoryDataToMap(categoryData);
  const categoryToParentMap = categoryDataToParentMap(categoryData);

  return {
    transactions: transactionData ?? [],
    categoryMap,
    categoryToParentMap,
    user,
  };
}
