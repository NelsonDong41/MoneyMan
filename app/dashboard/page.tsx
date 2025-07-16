import { UserProvider } from "@/context/UserContext";
import {
  CategoryMap,
  CategoryMapProvider,
  CategoryToParentMap,
} from "@/context/CategoryMapContext";
import { TransactionProvider } from "@/context/TransactionsContext";
import DashboardGrid from "./DashboardGrid";
import { getDashboardData } from "@/lib/server/utils";
import { User } from "@supabase/supabase-js";
import { TransactionWithCategory } from "@/utils/supabase/supabase";

export default async function Dashboard() {
  const data = await getDashboardData();
  return (
    <div className="container mx-auto py-10 max-w-">
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
  categoryToParentMap,
  children,
}: {
  user: User;
  transactions: TransactionWithCategory[];
  categoryMap: CategoryMap;
  categoryToParentMap: CategoryToParentMap;
  children: React.ReactNode;
}) {
  return (
    <UserProvider initial={user}>
      <TransactionProvider initial={transactions}>
        <CategoryMapProvider initial={[categoryMap, categoryToParentMap]}>
          {children}
        </CategoryMapProvider>
      </TransactionProvider>
    </UserProvider>
  );
}
