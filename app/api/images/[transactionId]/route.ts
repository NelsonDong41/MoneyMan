import { imagesFormSchema } from "@/utils/schemas/imagesFormSchema";
import { createClient, getUserFromRequest } from "@/utils/supabase/server";
import { Tables } from "@/utils/supabase/types";
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

export interface FileObject {
  name: string;
  bucket_id: string;
  owner: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
  buckets: Bucket;
}

export type ImagesGetResponse = {
  success: true;
  data: FileObject[];
};
export type ImagesErrorResponse = {
  error: string;
  details?: any;
};
export type ImagesPutResponse = {
  success: true;
  data: {
    inserted: ({
      id: string;
      path: string;
      fullPath: string;
    } | null)[];
    deleted: FileObject[] | null;
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

  const rootFilePathName = buildSupabaseFolderPath(user, transactionId);
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from("images")
    .list(rootFilePathName, {
      limit: 100, // optional: max number of files to return
      offset: 0, // optional: offset for pagination
      sortBy: {
        // optional: sort files by name, ascending or descending
        column: "name",
        order: "asc",
      },
    });
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

  if (
    (!imagesToAdd || !imagesToAdd.length) &&
    (!imagesToDelete || !imagesToDelete.length)
  ) {
    return NextResponse.json({ success: true, data: null });
  }

  const supabase = await createClient();
  const allImagesToAddPromises = imagesToAdd?.map((image) => {
    return supabase.storage
      .from("images")
      .upload(`${rootFilePathName}/${image.name}-${uuidv4()}`, image, {
        cacheControl: "3600",
        upsert: false,
      });
  });

  const imagesToDeletePaths = imagesToDelete?.map(
    (image) => `${rootFilePathName}/${image}`
  );
  const allImageToDeletePromises =
    imagesToDeletePaths &&
    imagesToDeletePaths.length &&
    supabase.storage.from("images").remove(imagesToDeletePaths);

  const allImagesInsertionResponse =
    allImagesToAddPromises &&
    allImagesToAddPromises.length &&
    (await Promise.all(allImagesToAddPromises));
  const allImagesDeletionResponse =
    allImageToDeletePromises && (await allImageToDeletePromises);

  const allErrors = (allImagesInsertionResponse || [])
    .map((data) => {
      return data.error;
    })
    .concat(!!allImagesDeletionResponse ? allImagesDeletionResponse.error : []);

  const hasSomeErrors = allErrors.some(Boolean);

  if (hasSomeErrors) {
    return NextResponse.json(
      {
        error: allErrors
          .map((error) => JSON.stringify(error, null, 2))
          .join(" | "),
      },
      { status: 500 }
    );
  }

  const allInsertionData =
    !!allImagesInsertionResponse &&
    allImagesInsertionResponse.map((data) => {
      return data.data;
    });
  const allDeletionData =
    !!allImagesDeletionResponse && allImagesDeletionResponse.data;

  return NextResponse.json({
    success: true,
    data: { inserted: allInsertionData || [], deleted: allDeletionData || [] },
  });
}
