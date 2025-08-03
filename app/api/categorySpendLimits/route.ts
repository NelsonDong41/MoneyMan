import { categorySpendLimitFormSchema } from "@/utils/schemas/categorySpendLimitFormSchema";
import { createClient, getUserFromRequest } from "@/utils/supabase/server";
import { CategorySpendLimitRecord } from "@/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export type CategorySpendLimitResponse = {
  success: true;
  data: CategorySpendLimitRecord[];
};
export type CategorySpendLimitErrorResponse = {
  error: string;
  details?: any;
};

export async function GET(
  req: NextRequest
): Promise<
  NextResponse<CategorySpendLimitResponse | CategorySpendLimitErrorResponse>
> {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("category_spend_limit")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PUT(
  req: NextRequest
): Promise<
  NextResponse<CategorySpendLimitResponse | CategorySpendLimitErrorResponse>
> {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.json();

  const parseResult = categorySpendLimitFormSchema.safeParse(raw);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parseResult.error.errors },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("category_spend_limit")
    .upsert(
      { ...raw, user_id: user.id },
      {
        onConflict: "id",
      }
    )
    .eq("user_id", user.id)
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
