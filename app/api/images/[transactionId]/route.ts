import { imagesFormSchema } from "@/utils/schemas/imagesFormSchema";
import { createClient, getUserFromRequest } from "@/utils/supabase/server";
import { Database, Tables, TablesInsert } from "@/utils/supabase/types";
import { buildSupabaseFolderPath } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export interface Bucket {
  id: string;
  name: string;
  owner: string;
  file_size_limit?: number;
  allowed_mime_types?: string[];
  created_at: string;
  updated_at: string;
  public: boolean;
}

export type ImagesGetResponse = {
  success: true;
  data: Tables<"transaction_to_images">[];
};
export type ImagesErrorResponse = {
  error: string;
  details?: any;
};
export type ImagesPutResponse = {
  success: true;
  data: {
    inserted: Tables<"transaction_to_images">[];
    deleted: Tables<"transaction_to_images">[] | null;
  } | null;
};

export async function GET(
  req: Request,
  props: { params: Promise<{ transactionId: number }> }
): Promise<NextResponse<ImagesGetResponse | ImagesErrorResponse>> {
  const params = await props.params;
  const transactionId = params.transactionId;

  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transaction_to_images")
    .select()
    .eq("transaction_id", transactionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ transactionId: number }> }
): Promise<NextResponse<ImagesPutResponse | ImagesErrorResponse>> {
  const params = await props.params;
  const transactionId = params.transactionId;

  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rootFilePathName = buildSupabaseFolderPath(user, transactionId);
  const raw = await req.formData();

  const dataObj = {
    imagesToAdd: raw.getAll("imagesToAdd") as File[],
    imagesToDelete: raw.getAll("imagesToDelete") as string[],
  };

  const parseResult = imagesFormSchema.safeParse(dataObj);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parseResult.error.errors },
      { status: 400 }
    );
  }

  const { imagesToAdd, imagesToDelete } = parseResult.data;

  if (!imagesToAdd?.length && !imagesToDelete?.length) {
    return NextResponse.json({ success: true, data: null });
  }

  if (
    (!imagesToAdd || !imagesToAdd.length) &&
    (!imagesToDelete || !imagesToDelete.length)
  ) {
    return NextResponse.json({ success: true, data: null });
  }

  const supabase = await createClient();

  const uploadResults = await Promise.all(
    (imagesToAdd || []).map(async (image: File) => {
      const path = `${rootFilePathName}/${uuidv4()}-${image.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("images")
        .upload(path, image, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        return uploadError;
      }

      const publicUrl = supabase.storage.from("images").getPublicUrl(path)
        .data.publicUrl;

      return {
        transaction_id: transactionId,
        image_id: uploadData.id,
        path: uploadData.path,
        image_public_path: publicUrl,
        bucket: "images",
        name: image.name,
        type: image.type,
        user_id: user.id,
      } as TablesInsert<"transaction_to_images">;
    })
  );

  const deleteResults =
    imagesToDelete &&
    imagesToDelete.length &&
    (await supabase.storage.from("images").remove(imagesToDelete));

  const errors = uploadResults.filter((r) => "error" in r) as {
    error: string;
  }[];

  if (deleteResults && deleteResults.error) {
    errors.push({ error: deleteResults.error.message });
  }

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

  const validInserts = uploadResults.filter(
    (r): r is TablesInsert<"transaction_to_images"> => !("error" in r)
  );

  let insertedRows: Tables<"transaction_to_images">[] = [];
  if (validInserts.length > 0) {
    const { data: insertData, error: insertError } = await supabase
      .from("transaction_to_images")
      .insert(validInserts)
      .select();

    if (insertError) {
      errors.push({ error: insertError.message });
    } else {
      insertedRows = insertData || [];
    }
  }
  if (imagesToDelete && imagesToDelete.length) {
    const { data, error } = await supabase
      .from("transaction_to_images")
      .delete()
      .in("path", imagesToDelete)
      .select();

    if (error) {
      return NextResponse.json(
        { error: errors.concat([{ error: error.message }]).join(" | ") },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { inserted: insertedRows, deleted: data },
    });
  }

  if (errors.length) {
    return NextResponse.json(
      {
        error: errors
          .map((error) => JSON.stringify(error, null, 2))
          .join(" | "),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { inserted: insertedRows, deleted: [] },
  });
}
