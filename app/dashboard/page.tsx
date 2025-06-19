import { createClient } from "@/utils/supabase/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Category, Receipt } from "@/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export type TableData = {
  receipt: Receipt[];
  category: Category[];
  user: User | null;
};

async function getData(): Promise<TableData> {
  const supabase = await createClient();


  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (!user) {
  //   return redirect("/sign-in");
  // }

  const { data: receiptData, error: receiptError } = await supabase
    .from("Receipt")
    .select("*, category(category)")
    .eq("user_id", user!.id);

  const { data: categoryData, error: categoryError } = await supabase
    .from("Category")
    .select("*");

  if (receiptError || categoryError) {
    throw new Error("Error fetching data from supabase: " +
      (receiptError?.message || categoryError?.message));
  }

  return {
    receipt: receiptData as Receipt[],
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
