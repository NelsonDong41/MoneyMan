import ImageCard from "@/components/ui/imageCard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ImageGallery from "./ImageGallery";
import { QueryData } from "@supabase/supabase-js";

async function getGalleryData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const galleryDataQuery = supabase
    .from("transaction_to_images")
    .select("*, transaction(description)");

  const { data, error } = await galleryDataQuery.eq("user_id", user.id);

  if (error) {
    throw new Error(
      "Error fetching image data from supabase: " + error?.message
    );
  }

  type GalleryData = QueryData<typeof galleryDataQuery>;
  const galleryData: GalleryData = data;

  return { data: galleryData };
}

export default async function Gallery() {
  const { data } = await getGalleryData();

  return (
    <>
      <div className="max-w-full sm:max-w-screen-2xl w-full">
        <h1 className="text-2xl font-bold mb-6 pt-6 flex flex-col justify-between gap-5">
          Gallery
          <ImageGallery data={data} />
        </h1>
      </div>
    </>
  );
}
