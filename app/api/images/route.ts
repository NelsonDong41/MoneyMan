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

  const allFilesToDeletePromise = foldersToDelete.map((folder) => {
    return supabase.storage
      .from("images")
      .list(folder)
      .then((response) => {
        if (response.error || !response.data) {
          return;
        }
        supabase.storage
          .from("images")
          .remove(response.data.map((fileObj) => `${folder}/${fileObj.name}`));
      });
  });

  const allFilesToDelete = await Promise.all(allFilesToDeletePromise);

  console.log(JSON.stringify(allFilesToDelete, null, 2));
  //   allFilesToDelete.map((file) => {
  //     supabase.storage.from("images").remove(file);
  //   });

  const { data, error } = await supabase.storage.from("images").remove([""]);

  if (error) {
    return NextResponse.json({ error: error.message, status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
