import Image from "next/image";
import { MouseEventHandler, useState } from "react";

type ImageCardProps = {
  src: string;
  alt?: string;
  handleClick: (index: number) => void;
  index: number;
};

export default function ImageCard({
  src,
  alt,
  handleClick,
  index,
}: ImageCardProps) {
  return (
    <div
      className="flex-shrink-0 h-52 relative w-auto cursor-pointer "
      onClick={(e) => {
        e.preventDefault();
        handleClick(index);
      }}
    >
      <Image
        src={src}
        alt={alt || "uploaded image"}
        height={300}
        width={0}
        className="hover:scale-105 transition-transform h-full w-auto"
        unoptimized
      />
    </div>
  );
}
