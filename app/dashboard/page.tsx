import { UserProvider } from "@/context/UserContext";
import { CategoryMap, CategoryMapProvider } from "@/context/CategoryMapContext";
import { TransactionProvider } from "@/context/TransactionsContext";
import DashboardGrid from "./DashboardGrid";
import { getDashboardData } from "@/lib/server/utils";
import { User } from "@supabase/supabase-js";
import { TransactionWithCategory } from "@/utils/supabase/supabase";

export default async function Dashboard() {
  const data = await getDashboardData();
  return (
    <div className="sm:py-10 max-w-full sm:max-w-screen-2xl w-full">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Providers {...data}>
        <DashboardGrid />
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
