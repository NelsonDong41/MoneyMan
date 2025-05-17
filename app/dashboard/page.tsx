import { createClient } from "@/utils/supabase/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Category, Receipt } from "@/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";

export type TableData = {
  receipt: Receipt[];
  category: Category[];
  user: User | null;
};

async function getData(): Promise<TableData> {
  const supabase = await createClient();

  const { data: receiptData, error: receiptError } = await supabase
    .from("Receipt")
    .select("*, category(category)");

  const { data: categoryData, error: categoryError } = await supabase
    .from("Category")
    .select("*");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (receiptError || categoryError || userError) {
    throw new Error("WHUASHJDJSAD");
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
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
