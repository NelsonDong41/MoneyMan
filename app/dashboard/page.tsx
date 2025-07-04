import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ChartAreaInteractive from "./chart";
import {
  STATUS_OPTIONS,
  TransactionWithCategory,
} from "@/utils/supabase/supabase";

export type ChartData = {
  transactions: TransactionWithCategory[];
};

async function getData(): Promise<ChartData> {
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
    .neq("status", "Canceled");

  if (transactionError) {
    throw new Error(
      "Error fetching data from supabase: " + transactionError?.message
    );
  }

  return {
    transactions: transactionData ?? [],
  };
}

export default async function Dashboard() {
  const { transactions } = await getData();

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
