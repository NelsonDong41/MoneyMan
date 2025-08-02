import { isPdf } from "@/utils/utils";
import { Download } from "lucide-react";
import Image from "next/image";
import { MouseEventHandler, useState } from "react";

type ImageCardProps = {
  src: string;
  alt?: string;
  handleClick: (index: number) => void;
  index: number;
  type: string;
};

export default function ImageCard({
  src,
  alt,
  handleClick,
  index,
  type,
}: ImageCardProps) {
  const handleDownload = (e: any) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = src;
    link.download = src.split("/").pop() || "file";
    link.click();
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
        className="absolute top-4 right-4 z-50 hover:scale-125"
        onClick={(e) => handleDownload(e)}
      >
        <Download />
      </div>
      {type === "application/pdf" ? (
        <iframe
          src={src}
          className="transition-transform h-full w-auto pointer-events-none"
          title={alt || "PDF preview"}
        />
      ) : (
        <Image
          src={src}
          alt={alt || "uploaded image"}
          height={300}
          width={0}
          className=" transition-transform h-full w-auto"
          unoptimized
        />
      )}
    </div>
  );
}
