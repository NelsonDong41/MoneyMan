import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { PhotoView } from "react-photo-view";

export default function ImageCard({
  src,
  alt,
  index,
}: {
  src: string;
  alt?: string;
  index: number;
}) {
  return (
    <PhotoView src={src} key={index}>
      <div className="flex-shrink-0 h-52 relative" style={{ width: "auto" }}>
        <Image
          src={src}
          alt={alt || "uploaded image"}
          height={208}
          width={0}
          style={{ height: "100%", width: "auto" }}
          unoptimized
        />
      </div>
    </PhotoView>
  );
}
