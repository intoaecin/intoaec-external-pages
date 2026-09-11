import React, { useState, useEffect } from "react";

type Controller = {
  controllerId: string;
  value?: {
    shape?: "circle" | "triangle" | "rect" | string;
    isLocked?: boolean;
  };
  style?: {
    backgroundColor?: string;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    width?: number | string;
    height?: number | string;
    backgroundImage?: string;
    alt?: string;
    backgroundImageAlt?: string;
  };
};

const renderShape = (
  shapeType: string,
  controller: Controller,
  imageUrl?: string | null,
  onImageError?: () => void,
  isSvg: boolean = false
) => {
  function toNumber(
    value: string | number | undefined,
    defaultValue = 200
  ): number {
    if (typeof value === "number") return value;
    const parsed = parseFloat(value ?? "");
    return isNaN(parsed) ? defaultValue : parsed;
  }

  const defaultStyle = {
    backgroundColor: controller?.style?.backgroundColor || "#f0f0f0",
    borderWidth: controller?.style?.borderWidth ?? 1,
    borderColor: controller?.style?.borderColor || "#ccc",
    borderRadius: controller?.style?.borderRadius,
    width: toNumber(controller?.style?.width),
    height: toNumber(controller?.style?.height),
  };

  const altText =
    controller?.style?.alt ||
    controller?.style?.backgroundImageAlt ||
    `${shapeType} shape`;

  const hasBackgroundImage = !!imageUrl && imageUrl.trim() !== "";

  switch (shapeType) {
    case "circle":
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: hasBackgroundImage
              ? "transparent"
              : defaultStyle.backgroundColor,
            borderRadius: "50%",
            border: `${defaultStyle.borderWidth}px solid ${defaultStyle.borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
          aria-label={altText}
          role="img"
        >
          {imageUrl &&
            (isSvg ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
                dangerouslySetInnerHTML={{ __html: imageUrl }}
              />
            ) : (
              <img
                src={imageUrl}
                alt={altText}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
                onError={onImageError}
              />
            ))}
        </div>
      );

    case "triangle":
      return (
        <div
          style={{
            width: defaultStyle.width,
            height: defaultStyle.height,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={altText}
          role="img"
        >
          {/* Triangle with proper border using SVG approach */}
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            }}
          >
            {/* Background color or image container */}
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: hasBackgroundImage
                  ? "transparent"
                  : defaultStyle.backgroundColor,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {imageUrl &&
                (isSvg ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                    }}
                    dangerouslySetInnerHTML={{ __html: imageUrl }}
                  />
                ) : (
                  <img
                    src={imageUrl}
                    alt={altText}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                    }}
                    onError={onImageError}
                  />
                ))}
            </div>

            {/* Border using SVG */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              <polygon
                points={`${defaultStyle.width / 2},0 0,${defaultStyle.height} ${
                  defaultStyle.width
                },${defaultStyle.height}`}
                fill="none"
                stroke={defaultStyle.borderColor}
                strokeWidth={defaultStyle.borderWidth}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      );

    default: // rect / rounded
      return (
        <div
          style={{
            width: defaultStyle.width,
            height: defaultStyle.height,
            backgroundColor: hasBackgroundImage
              ? "transparent"
              : defaultStyle.backgroundColor,
            borderRadius:
              defaultStyle.borderRadius !== undefined
                ? `${defaultStyle.borderRadius}px`
                : undefined,
            border: `${defaultStyle.borderWidth}px solid ${defaultStyle.borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
          aria-label={altText}
          role="img"
        >
          {imageUrl &&
            (isSvg ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                dangerouslySetInnerHTML={{ __html: imageUrl }}
              />
            ) : (
              <img
                src={imageUrl}
                alt={altText}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={onImageError}
              />
            ))}
        </div>
      );
  }
};

const RenderShape = ({ controller }: { controller: Controller }) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isSvg, setIsSvg] = useState<boolean>(false);

  const handleImageError = () => {
    console.error(
      "Failed to load background image:",
      controller?.style?.backgroundImage
    );
    setImageLoadError(true);
  };

  // Get width and height from controller style, with fallbacks
  const controllerWidth = controller?.style?.width ?? 200;
  const controllerHeight = controller?.style?.height ?? 200;

  // Parse width and height, handling both string and number formats
  const width =
    typeof controllerWidth === "string"
      ? parseFloat(controllerWidth.replace("px", ""))
      : controllerWidth;
  const height =
    typeof controllerHeight === "string"
      ? parseFloat(controllerHeight.replace("px", ""))
      : controllerHeight;

  // Use the URL directly; can be http(s) or data: URL or blob: URL
  const imageUrl = controller?.style?.backgroundImage || null;

  const shapeKey = `${
    controller.controllerId
  }-${width}-${height}-${JSON.stringify(controller?.value)}`;

  useEffect(() => {
    console.log("controller", controller);
  }, [controller]);

  useEffect(() => {
    if (imageUrl && imageUrl?.endsWith(".svg")) {
      fetch(imageUrl)
        .then((res) => res.text())
        .then((data) => {
          setImage(data);
          console.log("ywgdhiwf9e8g9rh", data);
          setIsSvg(true);
        })
        .catch((err) => {
          console.error(err);
        });
    } else if (imageUrl) {
      setImage(imageUrl);
      setIsSvg(false);
    }
  }, [imageUrl]);

  // Reset image error state when imageUrl changes
  useEffect(() => {
    setImageLoadError(false);
  }, [imageUrl]);

  return (
    <div
      key={shapeKey}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        overflow: "hidden",
        outline: "none",
        display: "inline-block",
      }}
      tabIndex={0}
    >
      {renderShape(
        controller?.value?.shape || "square",
        controller,
        image,
        handleImageError,
        isSvg
      )}
    </div>
  );
};

export default RenderShape;
