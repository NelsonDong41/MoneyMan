import { columns } from "@/components/dataTable/columns";
import { DataTable } from "../../components/dataTable/data-table";
import InteractiveTransactionAreaChart from "@/components/charts/InteractiveTransactionArea/InteractiveTransactionAreaChart";
import { UserProvider } from "@/context/UserContext";
import { CategoryMapProvider } from "@/context/CategoryMapContext";
import { TransactionProvider } from "@/context/TransactionsContext";
import { getDashboardData } from "@/lib/server/utils";

export default async function Transactions() {
  const { user, transactions, categoryMap } = await getDashboardData();

  return (
    <div className="sm:py-10 max-w-full sm:max-w-screen-2xl w-full sm:max-h-screen-2xl">
      <UserProvider initial={user}>
        <TransactionProvider initial={transactions}>
          <CategoryMapProvider initial={categoryMap}>
            <div className="w-full h-[60dvh] sm:h-[40dvh]">
              <InteractiveTransactionAreaChart />
            </div>
            <DataTable columns={columns} />
          </CategoryMapProvider>
        </TransactionProvider>
      </UserProvider>
    </div>
  );
}
