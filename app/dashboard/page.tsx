import { createClient } from "@/utils/supabase/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Receipt } from "@/utils/supabase/supabase";

async function getData(): Promise<Receipt[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("Receipt").select("*");
  return data as Receipt[];
}

export default async function Dashboard() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
