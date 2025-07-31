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

export default function ImageCard({
  src,
  alt,
  type,
}: {
  src: string;
  alt?: string;
  type: string;
}) {
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const isPdf =
    type === "application/pdf" || src.toLowerCase().endsWith(".pdf");
  console.log(isPdf);

  return (
    <>
      <div
        className="flex-shrink-0 h-52 relative w-auto cursor-pointer"
        onClick={() => setPreviewOpen(true)}
      >
        {isPdf ? (
          // Show a PDF icon or preview placeholder instead of an image thumbnail if you want
          <div className="flex items-center justify-center bg-gray-200 h-full">
            <span className="text-gray-600">PDF Document</span>
          </div>
        ) : (
          <Image
            src={src}
            alt={alt || "uploaded image"}
            height={208}
            width={0}
            style={{ height: "100%", width: "auto" }}
            unoptimized
          />
        )}
      </div>

      {previewOpen && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-4">
            <DialogHeader>
              <DialogTitle>Preview</DialogTitle>
              <DialogDescription>{alt || "File preview"}</DialogDescription>
            </DialogHeader>
            {isPdf ? (
              <iframe
                src={src}
                className="w-full h-[80vh]"
                frameBorder="0"
                title={alt || "PDF Preview"}
              />
            ) : (
              <Image
                src={src}
                alt={alt || "uploaded image"}
                fill
                style={{ objectFit: "contain" }}
                unoptimized
                onClick={() => setPreviewOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
