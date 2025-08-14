"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ImageCard from "./imageCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselApi,
} from "./carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Skeleton } from "./skeleton";
import { AnyImage } from "../dataTable/hooks/useTransactionImages";

const InteractableImageCarousel = ({
  loading,
  images,
  handleDelete,
}: {
  loading: boolean;
  images: AnyImage[];
  handleDelete: (image: AnyImage) => void;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  const handleImageClick = (i: number) => {
    setCurrent(i);
    setDialogOpen(true);
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={
            "max-w-[100%] max-h-[100%] sm:max-w-[80%] sm:max-h-[80%] sm:w-fit sm:h-fit w-full h-full flex flex-col items-center overflow-hidden justify-center "
          }
        >
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <Carousel
            setApi={setApi}
            className="sm:mx-20 h-full w-full sm:h-fit sm:w-fit"
            opts={{
              startIndex: current,
              loop: true,
            }}
          >
            <CarouselContent className="flex items-center sm:h-fit sm:w-fit h-full w-full">
              {images.map((image) => (
                <CarouselItem
                  key={image.image_public_path}
                  className="flex justify-center items-center"
                >
                  {image.type === "application/pdf" ? (
                    <iframe
                      src={image.image_public_path}
                      className="w-hover:scale-105 transition-transform max-w-full max-h-[60vh] min-w-[60vh] min-h-[70vh] h-auto w-auto"
                    />
                  ) : (
                    <Image
                      src={image.image_public_path}
                      alt="Image"
                      height={0}
                      width={0}
                      className="max-w-full max-h-[60vh] h-auto w-auto"
                      unoptimized
                    />
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InteractableImageCarousel;
