import { createClient } from "@/utils/supabase/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { Tables } from "@/utils/supabase/types";

export type TransactionWithCategory = Omit<
  Tables<"Transaction">,
  "category"
> & {
  category: { category: Tables<"Category">["category"] };
};

export type TableData = {
  transaction: TransactionWithCategory[];
  category: Tables<"Category">[];
  user: User;
};

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
    transaction: transactionData ?? [],
    category: categoryData,
    user,
  };
}

export default async function Dashboard() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10 max-w-8xl">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
