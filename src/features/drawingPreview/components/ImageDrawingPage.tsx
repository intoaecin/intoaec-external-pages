import { useState } from "react";
import type { PageSize, SharedDrawingMarkup } from "../types";
import { DrawingPageFrame } from "./DrawingPageFrame";

interface ImageDrawingPageProps {
  fileUrl: string;
  fileName: string;
  markups: SharedDrawingMarkup[];
  onRendered: () => void;
}

export function ImageDrawingPage({
  fileUrl,
  fileName,
  markups,
  onRendered,
}: ImageDrawingPageProps) {
  const [size, setSize] = useState<PageSize | null>(null);

  return (
    <DrawingPageFrame size={size} markups={markups}>
      <img
        src={fileUrl}
        // Lets the download read the pixels back out of the canvas
        crossOrigin="anonymous"
        alt={fileName}
        onLoad={(event) => {
          setSize({
            width: event.currentTarget.naturalWidth,
            height: event.currentTarget.naturalHeight,
          });
          onRendered();
        }}
      />
    </DrawingPageFrame>
  );
}
