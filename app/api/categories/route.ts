import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/utils/supabase/types";
import { NextRequest, NextResponse } from "next/server";

export type CategoriesResponse = {
  success: true;
  data: Tables<"category">[];
};
export type CategoriesErrorResponse = {
  error: string;
  details?: any;
};

export const dynamic = "force-static";

export async function GET(
  req: NextRequest
): Promise<NextResponse<CategoriesResponse | CategoriesErrorResponse>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("category").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
