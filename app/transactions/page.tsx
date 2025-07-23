import { columns } from "@/components/dataTable/columns";
import { DataTable } from "../../components/dataTable/data-table";
import InteractiveTransactionAreaChart from "@/components/charts/InteractiveTransactionArea/InteractiveTransactionAreaChart";
import { UserProvider } from "@/context/UserContext";
import { CategoryMap, CategoryMapProvider } from "@/context/CategoryMapContext";
import { TransactionProvider } from "@/context/TransactionsContext";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import TransparentCard from "@/components/ui/transparentCard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function getTransactionData() {
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
      .from("transaction")
      .select("*, category(name)")
      .eq("user_id", user.id)
      .neq("status", "Canceled")
      .order("date"),
    supabase.from("category").select("*").order("name"),
  ]);

  if (transactionError || categoryError) {
    throw new Error(
      "Error fetching data from supabase: " +
        (transactionError?.message || categoryError?.message)
    );
  }

  const initCategoryMap: CategoryMap = {
    Income: [],
    Expense: [],
  };
  const categoryMap: CategoryMap = categoryData.reduce((acc, curr) => {
    const { type, name } = curr;
    acc[type].push(name);
    return acc;
  }, initCategoryMap);

  return {
    transactions: transactionData ?? [],
    categoryMap,
    user,
  };
}
export default async function Transactions() {
  const data = await getTransactionData();

  return (
    <div className="sm:py-10 max-w-full sm:max-w-screen-2xl w-full sm:max-h-screen-2xl">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      <Providers {...data}>
        <div className="w-full h-[60dvh] sm:h-[40dvh]">
          <div className="h-full w-full">
            <TransparentCard>
              <InteractiveTransactionAreaChart />
            </TransparentCard>
          </div>
        </div>
        <DataTable columns={columns} />
      </Providers>
    </div>
  );
}

function Providers({
  user,
  transactions,
  categoryMap,
  children,
}: {
  user: User;
  transactions: TransactionWithCategory[];
  categoryMap: CategoryMap;
  children: React.ReactNode;
}) {
  return (
    <UserProvider initial={user}>
      <TransactionProvider initial={transactions}>
        <CategoryMapProvider initial={categoryMap}>
          {children}
        </CategoryMapProvider>
      </TransactionProvider>
    </UserProvider>
  );
}
