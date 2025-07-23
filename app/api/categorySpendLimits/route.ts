import { categorySpendLimitFormSchema } from "@/utils/schemas/categorySpendLimitFormSchema";
import { createClient, getUserFromRequest } from "@/utils/supabase/server";
import { CategorySpendLimitRecord } from "@/utils/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";

export type CategorySpendLimitResponse = {
  success: true;
  record: CategorySpendLimitRecord;
};
export type CategorySpendLimitErrorResponse = {
  error: string;
  details?: any;
};

export async function PUT(req: NextRequest) {
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
    .upsert(raw)
    .eq("user_id", user.id)
    .select("id, category, limit, time_frame")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
