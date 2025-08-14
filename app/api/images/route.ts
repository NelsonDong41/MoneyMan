import { createClient, getUserFromRequest } from "@/utils/supabase/server";
import { Tables } from "@/utils/supabase/types";
import { NextResponse } from "next/server";
import { ImagesGetResponse } from "./[transactionId]/route";

export type ImagesDeleteResponse = {
  success: true;
  data: Tables<"transaction_to_images">[];
};
export type ImagesErrorResponse = {
  error: string;
  details?: any;
};

export async function DELETE(
  req: Request
): Promise<NextResponse<ImagesDeleteResponse | ImagesErrorResponse>> {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: number[] = await req.json();
  const supabase = await createClient();

  const transactionsImages = await Promise.all(
    body.map(async (transactionId) => {
      const { data, error } = await supabase
        .from("transaction_to_images")
        .delete()
        .eq("transaction_id", transactionId)
        .select();

      if (error) {
        return error;
      }

      return data;
    })
  );

  const errors = transactionsImages.filter((r) => "error" in r) as {
    error: string;
  }[];

  if (errors.length) {
    return NextResponse.json(
      {
        error: errors
          .map((error, i) => `(${i}) - ${JSON.stringify(error, null, 2)}`)
          .join(" | "),
      },
      { status: 500 }
    );
  }

  const validtransactionsImages = transactionsImages.filter(
    (r): r is Tables<"transaction_to_images">[] => !("error" in r)
  );

  const flattenedTransactionImages = validtransactionsImages.flat();
  const allTransactionImagesPaths = flattenedTransactionImages.map(
    (image) => image.path
  );

  if (!allTransactionImagesPaths.length) {
    return NextResponse.json({ success: true, data: [] });
  }

  const { data, error: storageError } = await supabase.storage
    .from("images")
    .remove(allTransactionImagesPaths);

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: flattenedTransactionImages,
  });
}

export async function GET(): Promise<
  NextResponse<ImagesGetResponse | ImagesErrorResponse>
> {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transaction_to_images")
    .select()
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
