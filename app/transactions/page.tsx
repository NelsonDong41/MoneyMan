import { columns } from "@/components/dataTable/columns";
import { DataTable } from "../../components/dataTable/data-table";
import InteractiveTransactionAreaChart from "@/components/charts/InteractiveTransactionArea/InteractiveTransactionAreaChart";
import { UserProvider } from "@/context/UserContext";
import { CategoryMap, CategoryMapProvider } from "@/context/CategoryMapContext";
import { TransactionProvider } from "@/context/TransactionsContext";
import { getDashboardData } from "@/lib/server/utils";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";

export default async function Transactions() {
  const data = await getDashboardData();

  return (
    <div className="sm:py-10 max-w-full sm:max-w-screen-2xl w-full sm:max-h-screen-2xl">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      <Providers {...data}>
        <div className="w-full h-[60dvh] sm:h-[40dvh]">
          <InteractiveTransactionAreaChart />
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
