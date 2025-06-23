import { redirect } from "next/navigation";
import { TableData } from "../transactions/page";
import { createClient } from "@/utils/supabase/server";
import ChartAreaInteractive from "./chart";

async function getData(): Promise<TableData> {
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
    .eq("userId", user.id);

  const { data: categoryData, error: categoryError } = await supabase
    .from("Category")
    .select("*");

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
  const { transactions, category, user } = await getData();

  return (
    <div className="container mx-auto py-10 max-w-8xl">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p className="text-gray-700">
        This is the dashboard page. You can add your components here.
      </p>
      <ChartAreaInteractive data={transactions} />
    </div>
  );
}
