import { Download, X } from "lucide-react";
import Image from "next/image";
import { AnyImage } from "../dataTable/tableSheet";
import { cn } from "@/lib/utils";

type ImageCardProps = {
  image: AnyImage;
  handleClick: (index: number) => void;
  handleDelete: (image: AnyImage) => void;
  index: number;
};

export default function ImageCard({
  image,
  handleClick,
  handleDelete,
  index,
}: ImageCardProps) {
  const { url, type, isServer, name } = image;
  const handleDownload = async (e: any) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = url;
    link.download = name;

    if (isServer) {
      const urlWithDownload =
        url + (url.includes("?") ? "&" : "?") + "download";
      link.href = urlWithDownload;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="flex-shrink-0 h-52 relative w-auto cursor-pointer hover:scale-105"
      onClick={(e) => {
        e.preventDefault();
        handleClick(index);
      }}
    >
      <div
        className="absolute top-5 right-5 z-50 hover:scale-125"
        onClick={handleDownload}
      >
        <Download />
      </div>
      <div
        className="absolute top-0 left-0 z-50 bg-red-500 hover:scale-125"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(image);
        }}
      >
        <X />
      </div>
      {type === "application/pdf" ? (
        <iframe
          src={url}
          className={cn(
            "transition-transform h-full w-auto pointer-events-none"
          )}
        />
      ) : (
        <Image
          src={url}
          alt={`image-${index}`}
          height={300}
          width={0}
          className=" transition-transform h-full w-auto"
          unoptimized
        />
      )}
    </div>
  );
}
