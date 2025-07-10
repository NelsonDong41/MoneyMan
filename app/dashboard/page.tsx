import { UserProvider } from "@/context/UserContext";
import { CategoryMapProvider } from "@/context/CategoryMapContext";
import { TransactionProvider } from "@/context/TransactionsContext";
import DashboardGrid from "./DashboardGrid";
import { getDashboardData } from "@/lib/server/utils";

export default async function Dashboard() {
  const { user, transactions, categoryMap } = await getDashboardData();
  return (
    <div className="container mx-auto py-10 max-w-">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <UserProvider initial={user}>
        <TransactionProvider initial={transactions}>
          <CategoryMapProvider initial={categoryMap}>
            <DashboardGrid />
          </CategoryMapProvider>
        </TransactionProvider>
      </UserProvider>
    </div>
  );
}
