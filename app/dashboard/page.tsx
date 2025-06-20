import { createClient } from "@/utils/supabase/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Category } from "@/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { Transaction } from "@/utils/schemas/transactionSchema";

export type TableData = {
  transaction: Transaction[];
  category: Category[];
  user: User | null;
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

  console.log("Transaction Data:", transactionData);

  if (transactionError || categoryError) {
    throw new Error("Error fetching data from supabase: " +
      (transactionError?.message || categoryError?.message));
  }

  return {
    transaction: transactionData as Transaction[],
    category: categoryData as Category[],
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
