"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ImageCard from "./imageCard";
import { Skeleton } from "./skeleton";
import { AnyImage } from "../dataTable/hooks/useTransactionImages";
import { AnimatePresence, motion, isDragging } from "framer-motion";

const CLOSE_THRESHOLD = 80;

const InteractableImageCarousel = ({
  loading,
  images,
  handleDelete,
}: {
  loading: boolean;
  images: AnyImage[];
  handleDelete: (image: AnyImage) => void;
}) => {
  const [fullscreenSrc, setFullscreenSrc] = useState<string | null>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);

  const handleImageClick = (i: number) => {
    setFullscreenSrc(images[i].image_public_path);
  };

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
      {loading && <Skeleton className="h-52 w-44" />}
      {images.map((image, i) => (
        <ImageCard
          key={image.image_public_path}
          image={image}
          index={i}
          handleClick={handleImageClick}
          handleDelete={handleDelete}
        />
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

export default InteractableImageCarousel;
