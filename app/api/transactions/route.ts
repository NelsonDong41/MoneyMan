import { NextRequest, NextResponse } from "next/server";
import { transactionFormSchema } from "@/utils/schemas/transactionFormSchema";
import { createClient, getUserFromRequest } from "@/utils/supabase/server";
import { z } from "zod";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";

export type TransactionsResponse = {
  success: true;
  data: TransactionWithCategory[];
};
export type TransactionsErrorResponse = {
  error: string;
  details?: any;
};

export async function GET(): Promise<
  NextResponse<TransactionsResponse | TransactionsErrorResponse>
> {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: transactionData, error: transactionError } = await supabase
    .from("transaction")
    .select("*, category(name)")
    .eq("user_id", user.id)
    .order("date");

  if (transactionError) {
    return NextResponse.json(
      { error: transactionError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: transactionData });
}

function transformFormToInsert(
  values: z.infer<typeof transactionFormSchema>,
  userId: string
) {
  return {
    ...values,
    id: values.id || undefined,
    date: values.date,
    user_id: userId,
    updated_at: new Date().toUTCString(),
    amount: parseFloat(values.amount.replace(/,/g, "")),
    subtotal: values.subtotal
      ? parseFloat(String(values.subtotal).replace(/,/g, ""))
      : undefined,
    tip: values.tip
      ? parseFloat(String(values.tip).replace(/,/g, ""))
      : undefined,
    tax: values.tax
      ? parseFloat(String(values.tax).replace(/,/g, ""))
      : undefined,
  };
}

export async function PUT(
  req: NextRequest
): Promise<NextResponse<TransactionsResponse | TransactionsErrorResponse>> {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.formData();

  const dataObj = {
    id: raw.get("id") ? Number(raw.get("id")) : undefined,
    amount: raw.get("amount") as string,
    category: raw.get("category") as string,
    date: raw.get("date") as string,
    description: raw.get("description") as string,
    merchant: raw.get("merchant") as string | undefined,
    notes: raw.get("notes") as string | null | undefined,
    status: raw.get("status") as string,
    subtotal: raw.get("subtotal") as string | null | undefined,
    tax: raw.get("tax") as string | null | undefined,
    tip: raw.get("tip") as string | null | undefined,
    type: raw.get("type") as string,
    images: raw.getAll("images") as File[],
  };

  const parseResult = transactionFormSchema.safeParse(dataObj);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parseResult.error.errors },
      { status: 400 }
    );
  }

  const transactionInsert = transformFormToInsert(parseResult.data, user.id);

  const supabase = await createClient();
  const { data: transactionUploadData, error: transactionUploadError } =
    await supabase
      .from("transaction")
      .upsert(transactionInsert)
      .select("*, category(name)")
      .single();

  if (transactionUploadError) {
    return NextResponse.json(
      { error: transactionUploadError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: [transactionUploadData] });
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.json();
  const supabase = await createClient();

  const { error } = await supabase
    .from("transaction")
    .delete()
    .match({ user_id: user.id })
    .in("id", raw);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
