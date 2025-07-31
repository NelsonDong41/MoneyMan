"use client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import ImageCard from "./imageCard";
import TransparentCard from "./transparentCard";

const ImageGallery = ({
  images,
}: {
  images: {
    url: string;
    type: string;
  }[];
}) => {
  const [index, setIndex] = useState(-1);
  const nextImage = async () => {
    if (index + 1 == images.length) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  };

  const prevImage = async () => {
    if (index == 0) {
      setIndex(images.length - 1);
    } else {
      setIndex(index - 1);
    }
  };

  const handleImageClick = (i: number) => {
    setIndex(i);
  };

  return (
    <>
      <>
        {images.map((image, i) => (
          <ImageCard
            src={image.url}
            key={image.url}
            index={i}
            handleClick={handleImageClick}
          />
        ))}
      </>
      {index >= 0 && (
        <div className="fixed h-svh w-svw backdrop-blur-3xl top-0 left-0 z-50">
          <div
            className={`fixed h-screen left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] flex items-center justify-center`}
          >
            <div
              onClick={prevImage}
              className="hover:scale-105 rounded-full cursor-pointer p-2 absolute left-0.5 lg:relative bg-blue-900 md:me-10"
            >
              <ChevronLeft className="w-10 h-10" color="white" />
            </div>
            <div className="h-full w-full flex justify-center items-center">
              <Image
                src={index >= 0 ? images[index].url : ""}
                alt="1st Image"
                height={500}
                width={0}
                style={{ maxHeight: "90%", width: "auto" }}
                unoptimized
              />
            </div>

            <div
              onClick={nextImage}
              className="hover:scale-105 rounded-full cursor-pointer p-2 absolute left-0.5 lg:relative bg-blue-900 md:ms-10"
            >
              <ChevronRight className="w-10 h-10" color="white" />
            </div>
          </div>
          <div
            onClick={() => setIndex(-1)}
            className={`hover:scale-105 fixed top-10 right-5 lg:right-10 rounded-full cursor-pointer p-2 bg-red-900`}
          >
            <X className="w-10 h-10" color="white" />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
