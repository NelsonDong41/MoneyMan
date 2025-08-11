import { CategoryMap, CategoryMapProvider } from "@/context/CategoryMapContext";
import { CategorySpendLimitRecord } from "@/utils/supabase/supabase";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CategorySpendLimitProvider } from "@/context/CategorySpendLimitContext";
import SettingsForm from "./SettingsForm";

async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const [
    { data: categoryData, error: categoryError },
    { data: spendLimitData, error: spendLimitError },
  ] = await Promise.all([
    supabase.from("category").select("*"),
    supabase.from("category_spend_limit").select("*").eq("user_id", user.id),
  ]);

  if (categoryError || spendLimitError) {
    throw new Error(
      "Error fetching data from supabase: " +
        (categoryError?.message || spendLimitError?.message)
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
    categoryMap,
    categorySpendLimits: spendLimitData,
  };
}

export default async function Settings() {
  const data = await getDashboardData();
  return (
    <>
      <div className="max-w-full sm:max-w-screen-2xl w-full">
        <h1 className="text-2xl font-bold mb-6 pt-6">Dashboard</h1>
        <Providers {...data}>
          <SettingsForm />
        </Providers>
      </div>
    </>
  );
}

function Providers({
  categoryMap,
  categorySpendLimits,
  children,
}: {
  categoryMap: CategoryMap;
  categorySpendLimits: CategorySpendLimitRecord[];
  children: React.ReactNode;
}) {
  return (
    <CategoryMapProvider initial={categoryMap}>
      <CategorySpendLimitProvider initial={categorySpendLimits}>
        {children}
      </CategorySpendLimitProvider>
    </CategoryMapProvider>
  );
}
