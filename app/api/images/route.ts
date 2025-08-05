import { createClient, getUserFromRequest } from "@/utils/supabase/server";
import { buildSupabaseFolderPath } from "@/utils/utils";
import { NextResponse } from "next/server";
import { FileObject } from "./[transactionId]/route";

export type ImagesDeleteResponse = {
  success: true;
  data: FileObject[];
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
  const foldersToDelete = body.map((id) => buildSupabaseFolderPath(user, id));

  const allFilesToDeletePromise = foldersToDelete.map(async (folder) => {
    return supabase.storage
      .from("images")
      .list(folder)
      .then((response) => {
        if (response.error || !response.data) {
          return;
        }
        return supabase.storage
          .from("images")
          .remove(response.data.map((fileObj) => `${folder}/${fileObj.name}`));
      });
  });

  const allFilesToDeleteResponse = await Promise.all(allFilesToDeletePromise);

  let someErrors = false;

  const allErrors = allFilesToDeleteResponse.map((response) => {
    if (response?.error) {
      someErrors = true;
    }
    return response?.error;
  });

  if (someErrors) {
    return NextResponse.json({
      error: allErrors.map((error) => error?.message).join(" | "),
      status: 500,
    });
  }

  const allData = allFilesToDeleteResponse
    .map((response) => response?.data)
    .filter((data) => !!data)
    .flat();

  console.log(allData);
  return NextResponse.json({ success: true, data: allData });
}
