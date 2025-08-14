"use client";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDateHuman } from "@/utils/utils";

interface ImageGalleryProps {
  data: {
    created_at: string; // ISO string
    image_public_path: string;
    name: string;
    transaction: { description?: string };
  }[];
}

const CLOSE_THRESHOLD = 80;

const ImageGallery = ({ data }: ImageGalleryProps) => {
  const [fullscreenSrc, setFullscreenSrc] = useState<string | null>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // Group images by date (YYYY-MM-DD)
  const grouped = data.reduce<Record<string, typeof data>>((acc, img) => {
    const dateKey = formatDateHuman(img.created_at);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(img);
    return acc;
  }, {});

  const startDrag = (clientY: number) => {
    setStartY(clientY);
    setIsDragging(true);
    setDragY(0);
  };

  const moveDrag = (clientY: number) => {
    if (!isDragging || startY === null) return;
    setDragY(clientY - startY);
  };

  const endDrag = () => {
    if (Math.abs(dragY) > CLOSE_THRESHOLD) setFullscreenSrc(null);
    setIsDragging(false);
    setDragY(0);
    setStartY(null);
  };

  return (
    <>
      {Object.entries(grouped).map(([date, images]) => (
        <div key={date} className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{date}</h2>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(clamp(160px,18vw,240px),1fr))] sm:gap-4 lg:gap-5">
            {images.map((image, i) => (
              <div key={image.image_public_path} className="relative">
                <motion.div
                  layoutId={image.image_public_path}
                  className="relative aspect-square w-full overflow-hidden rounded-lg cursor-pointer group "
                  onClick={() => setFullscreenSrc(image.image_public_path)}
                  onMouseOver={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Image
                    src={image.image_public_path}
                    alt={`Transaction image ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 hover:blur-lg"
                    sizes="(max-width: 640px) 50vw,
                           (max-width: 1024px) 33vw,
                           (max-width: 1440px) 20vw,
                           240px"
                    priority={i < 5}
                  />
                </motion.div>
                {hovered === i && (
                  <>
                    <div
                      key={`${image.transaction.description}-label`}
                      className="absolute top-5 left-5 z-50 pointer-events-none"
                    >
                      {image.transaction.description}
                    </div>
                    <div
                      key={`${image.name}-label`}
                      className="absolute left-5 bottom-5 z-50 pointer-events-none"
                    >
                      {image.name}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {fullscreenSrc && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenSrc(null)}
            onTouchStart={(e) => startDrag(e.touches[0].clientY)}
            onTouchMove={(e) => moveDrag(e.touches[0].clientY)}
            onTouchEnd={endDrag}
            onMouseDown={(e) => startDrag(e.clientY)}
            onMouseMove={(e) => {
              if (e.buttons === 1) moveDrag(e.clientY);
            }}
            onMouseUp={endDrag}
          >
            <motion.div
              layoutId={!isDragging ? fullscreenSrc : undefined}
              className="relative w-full h-full max-w-7xl max-h-[90%] cursor-grab"
              onClick={(e) => e.stopPropagation()}
              animate={{
                y: isDragging ? dragY : 0,
                opacity: 1 - Math.min(Math.abs(dragY) / 200, 0.5),
              }}
              transition={{
                type: isDragging ? undefined : "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <Image
                src={fullscreenSrc}
                alt="Fullscreen image"
                fill
                className="object-contain select-none"
                sizes="100vw"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;
