import { ImagesGetResponse } from "@/app/api/images/[transactionId]/route";
import { ImagesErrorResponse } from "@/app/api/images/route";
import { useUser } from "@/context/UserContext";
import { Tables } from "@/utils/supabase/types";
import { useState, useEffect } from "react";

export type ClientImage = {
  image_public_path: string;
  type: string;
  file: File;
  isServer: false;
  name: string;
};

export type ServerImage = Tables<"transaction_to_images"> & {
  isServer: true;
};

export type AnyImage = ClientImage | ServerImage;

export default function useTransactionImages(
  transactionId: number | undefined,
  formClientImages?: File[]
) {
  const { user } = useUser();
  const [serverImages, setServerImages] = useState<ServerImage[]>([]);
  const [clientImages, setClientImages] = useState<ClientImage[]>([]);
  const [allImages, setAllImages] = useState<AnyImage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  if (!user) {
    throw new Error("User should exist when using useTransactionImages");
  }

  useEffect(() => {
    let newImages: AnyImage[] = [];
    newImages = newImages.concat(clientImages);
    newImages = newImages.concat(serverImages);

    setAllImages(newImages);
  }, [serverImages, clientImages, setAllImages]);

  //converts the client uploaded Files into ClientImage objects
  useEffect(() => {
    let active = true;

    async function generateClientImages() {
      const urls: ClientImage[] = [];

      if (!formClientImages || formClientImages.length === 0) {
        setClientImages([]);
        return;
      }

      for (const file of formClientImages) {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([new Uint8Array(arrayBuffer)], {
          type: file.type,
        });
        const url = URL.createObjectURL(blob);
        urls.push({
          image_public_path: url,
          type: file.type,
          file,
          isServer: false,
          name: file.name,
        });
      }

      if (active) {
        setClientImages(urls);
      }
    }

    generateClientImages();

    return () => {
      active = false;
      clientImages.forEach(({ image_public_path }) =>
        URL.revokeObjectURL(image_public_path)
      );
      setClientImages([]);
    };
  }, [formClientImages]);

  useEffect(() => {
    if (!transactionId) return;
    const getServerImagesForTransaction = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/images/${transactionId}`, {
          method: "GET",
        });

        if (!response.ok) {
          const { error } = (await response.json()) as ImagesErrorResponse;
          console.error("Error updating category spend limit:", error);
          return null;
        }
        const { data } = (await response.json()) as ImagesGetResponse;

        const serverImages = data.map((fileObj) =>
          convertFileObjectToServerImage(fileObj)
        );
        setServerImages(serverImages);

        setLoading(false);
        return data;
      } catch (err) {
        setLoading(false);
        console.error("Unexpected error:", err);
        return null;
      }
    };

    getServerImagesForTransaction();
  }, [transactionId, user]);

  return {
    loading,
    clientImages,
    serverImages,
    allImages,
    setClientImages,
    setServerImages,
  };
}

export const convertFileObjectToServerImage = (
  fileObj: Tables<"transaction_to_images">
): ServerImage => {
  return {
    ...fileObj,
    isServer: true,
  };
};
