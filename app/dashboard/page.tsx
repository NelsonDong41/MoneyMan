import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  STATUS_OPTIONS,
  TransactionWithCategory,
} from "@/utils/supabase/supabase";
import { Tables } from "@/utils/supabase/types";
import { User } from "@supabase/supabase-js";
import ChartAreaInteractive from "@/components/charts/chartAreaInteractive";

export type DashboardPageProps = {
  transactions: TransactionWithCategory[];
  category: Tables<"Category">[];
  user: User;
};
async function getData(): Promise<DashboardPageProps> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: transactionData, error: transactionError } = await supabase
    .from("Transaction")
    .select("*, category(category)")
    .eq("userId", user.id)
    .neq("status", "Canceled")
    .order("date");

  const { data: categoryData, error: categoryError } = await supabase
    .from("Category")
    .select("*")
    .order("category");

  if (transactionError || categoryError) {
    throw new Error(
      "Error fetching data from supabase: " +
        (transactionError?.message || categoryError?.message)
    );
  }

  return {
    transactions: transactionData ?? [],
    category: categoryData,
    user,
  };
}

export default async function Dashboard() {
  const data = await getData();
  console.log(data);
  return (
    <div className="container mx-auto py-10 max-w-8xl">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <ChartAreaInteractive {...data} />
    </div>
  );
}
