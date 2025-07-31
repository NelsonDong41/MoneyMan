"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";

interface FileViewerProps {
  src: string;
  alt?: string;
  mimeType?: string; // optional, helps detect file type explicitly
  onClose: () => void;
}

// Utility to check if file is PDF based on mimeType or file extension
const isPdf = (src: string, mimeType?: string) => {
  if (mimeType) return mimeType === "application/pdf";
  return src.toLowerCase().endsWith(".pdf");
};

export default function FileViewer({
  src,
  alt,
  mimeType,
  onClose,
}: FileViewerProps) {
  const [zoom, setZoom] = useState(1);

  const handleDownload = () => {
    // Trigger download by creating an anchor element
    const link = document.createElement("a");
    link.href = src;
    link.download = src.split("/").pop() || "file";
    link.click();
  };

  if (isPdf(src, mimeType)) {
    // PDF Preview using iframe
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center p-4 z-50">
        <Button onClick={onClose}>Close</Button>
        <button onClick={handleDownload}>Download</button>
        <iframe
          src={src}
          className="w-full h-full max-h-[90vh] max-w-[90vw] border border-gray-300 rounded"
          title={alt || "PDF preview"}
        />
      </div>
    );
  }

  // Image Preview with zoom
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center p-4 z-50">
      <div className="flex items-center space-x-2 mb-2">
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={() => setZoom((z) => Math.min(z + 0.25, 5))}
          aria-label="Zoom in"
        >
          +
        </Button>
        <Button
          onClick={() => setZoom((z) => Math.max(z - 0.25, 1))}
          aria-label="Zoom out"
        >
          –
        </Button>
        <Button onClick={handleDownload}>Download</Button>
      </div>

      <div
        className="relative border border-gray-300 rounded max-w-[70vw] max-h-[70vh] overflow-auto h-full w-full"
        style={{ touchAction: "pan-x pan-y" }}
      >
        <Image
          src={src}
          alt={alt || "image preview"}
          height={208}
          width={0}
          unoptimized
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease-out",
            height: "100",
            width: "auto",
            display: "block",
            margin: "0 auto",
          }}
          priority
        />
      </div>
    </div>
  );
}
