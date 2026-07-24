/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import React from "react";

const NextImage = ({
  src,
  alt,
  width,
  height,
  loading,
}: {
  src: string;
  width: string;
  alt: string;
  height?: string;
  loading?: "lazy" | "eager";
}) => {
  return (
    <Image
      src={src}
      style={{ height: height ?? "auto", width: width }}
      alt={alt}
      loading={loading}
      width={300}
      height={300}
    />
  );
};

export default NextImage;
