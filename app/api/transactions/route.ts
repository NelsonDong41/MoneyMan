import { NextRequest, NextResponse } from "next/server";
import { transactionFormSchema } from "@/utils/schemas/transactionFormSchema";
import { createClient, getUserFromRequest } from "@/utils/supabase/server";
import { TransactionInsert } from "@/components/dataTable/data-table";
import { z } from "zod";

function transformFormToInsert(
  values: z.infer<typeof transactionFormSchema>,
  userId: string
): TransactionInsert {
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

export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.json();

  const parseResult = transactionFormSchema.safeParse(raw);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parseResult.error.errors },
      { status: 400 }
    );
  }

  const transactionInsert = transformFormToInsert(parseResult.data, user.id);

  const supabase = await createClient();
  const { error } = await supabase
    .from("transaction")
    .upsert(transactionInsert);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
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
