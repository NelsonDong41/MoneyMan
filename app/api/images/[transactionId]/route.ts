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

export type ImagesResponse = {
  success: true;
  data: FileObject[];
};
export type ImagesErrorResponse = {
  error: string;
  details?: any;
};

export async function GET(
  req: Request,
  { params }: { params: { transactionId: number } }
): Promise<NextResponse<ImagesResponse | ImagesErrorResponse>> {
  const transactionId = params.transactionId;

  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rootFilePathName = buildSupabaseFolderPath(user, transactionId);
  const supabase = await createClient();

  console.log("BACKEND GETTING", rootFilePathName);

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
  { params }: { params: { transactionId: number } }
): Promise<NextResponse<ImagesResponse | ImagesErrorResponse>> {
  const transactionId = params.transactionId;

  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rootFilePathName = buildSupabaseFolderPath(user, transactionId);
  const raw = await req.formData();

  const dataObj = {
    images: raw.getAll("images") as File[],
  };

  const parseResult = imagesFormSchema.safeParse(dataObj);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parseResult.error.errors },
      { status: 400 }
    );
  }

  const images = parseResult.data.images;

  if (!images) {
    return NextResponse.json({ success: true, data: [] });
  }

  const supabase = await createClient();
  const allImagePromises = images.map((image) => {
    return supabase.storage
      .from("receipts")
      .upload(`${rootFilePathName}/${image.name}-${uuidv4()}`, image, {
        cacheControl: "3600",
        upsert: false,
      });
  });

  const allImagesUploadData = await Promise.all(allImagePromises);

  const allErrors = allImagesUploadData.map((data) => {
    return data.error;
  });

  const hasSomeErrors = allErrors.some(Boolean);

  if (hasSomeErrors) {
    return NextResponse.json({ error: allErrors.join(" | ") }, { status: 500 });
  }

  const allData = allImagesUploadData.map((data) => {
    return data.data;
  });

  console.log(allData);

  return NextResponse.json({ success: true, data: allData });
}
