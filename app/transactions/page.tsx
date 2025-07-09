import { createClient } from "@/utils/supabase/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { TransactionWithCategory, Type } from "@/utils/supabase/supabase";
import ChartAreaInteractive from "@/components/charts/chartAreaInteractive";
import { categoryDataToMap } from "@/utils/utils";
import { UserProvider } from "@/context/UserContext";
import { CategoryMap, CategoryMapProvider } from "@/context/CategoryMapContext";
import { TransactionProvider } from "@/context/TransactionsContext";

export type TransactionPageProps = {
  transactions: TransactionWithCategory[];
  categoryMap: CategoryMap;
  user: User;
};

async function getData(): Promise<TransactionPageProps> {
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

  const categoryMap = categoryDataToMap(categoryData);

  return {
    transactions: transactionData ?? [],
    categoryMap,
    user,
  };
}

export default async function Transactions() {
  const { user, transactions, categoryMap } = await getData();

  return (
    <div className="container mx-auto py-10 max-w-8xl">
      <UserProvider initial={user}>
        <TransactionProvider initial={transactions}>
          <CategoryMapProvider initial={categoryMap}>
            <ChartAreaInteractive />
            <DataTable columns={columns} />
          </CategoryMapProvider>
        </TransactionProvider>
      </UserProvider>
    </div>
  );
}
