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

export async function getCategories() {
  const supabase = await createClient();
  const response = await supabase.from("category").select("*");
  return response;
}

export const dynamic = "force-static";

export async function GET(
  req: NextRequest
): Promise<NextResponse<CategoriesResponse | CategoriesErrorResponse>> {
  const { data, error } = await getCategories();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
