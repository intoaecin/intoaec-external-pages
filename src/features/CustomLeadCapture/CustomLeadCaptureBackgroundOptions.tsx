import ColorPicker from "@/components/ColorPicker";
import { ImageUploader } from "@/components/ImageUploaderForOrg";
import { useFileUpload } from "@/features/hooks/useFileUpload";
import ImageIcon from "@mui/icons-material/Image";
import PaletteIcon from "@mui/icons-material/Palette";
import {
  Box,
  Button,
  IconButton,
  Popover,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Trash2 } from "lucide-react";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { HexColorPicker } from "react-colorful";

type LeadCaptureBackgroundType = {
  fill?: string | null;
  overlayFill?: string | null;
  bgImageUrl?: string | null;
  opacity?: number | null;
};

const defaultLeadCapturePageBackgroundImage =
  "/images/lead%20capture%20intro%20page.svg";

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const isValidHexColor = (value: string) =>
  /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);

const normalizeHexColor = (value?: string | null) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!isValidHexColor(withHash)) return null;
  if (withHash.length === 4) {
    return `#${withHash[1]}${withHash[1]}${withHash[2]}${withHash[2]}${withHash[3]}${withHash[3]}`.toUpperCase();
  }
  return withHash.toUpperCase();
};

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = normalizeHexColor(hex) ?? "#000000";
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  const safeAlpha = clampNumber(alpha, 0, 1);
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
};

const normalizeBackgroundImage = (bgImageUrl?: string | null) => {
  const source = String(bgImageUrl ?? "").trim();
  if (!source) return "none";
  return source.startsWith("url(") ? source : `url(${source})`;
};

const mergeBackground = (
  currentBackground: LeadCaptureBackgroundType | undefined,
  patch: Partial<LeadCaptureBackgroundType>,
) => ({
  ...(currentBackground ?? {}),
  ...patch,
});

export const getLeadCaptureBackgroundStyle = (
  background?: LeadCaptureBackgroundType,
  fallbackFill = "#F5F5F5",
) => {
  const bgImage = normalizeBackgroundImage(background?.bgImageUrl);
  return {
    backgroundColor: bgImage !== "none" ? "transparent" : background?.fill || fallbackFill,
    backgroundImage: (() => {
    const layers: string[] = [];
    const overlayFill = background?.overlayFill;
    if (overlayFill) {
      layers.push(
        `linear-gradient(${hexToRgba(overlayFill, 0.35)}, ${hexToRgba(
          overlayFill,
          0.35,
        )})`,
      );
    }

    const imageOpacity = clampNumber(
      typeof background?.opacity === "number" ? background.opacity : 100,
      0,
      100,
    );
    if (bgImage !== "none" && imageOpacity < 100) {
      const overlayOpacity = (100 - imageOpacity) / 100;
      layers.push(
        `linear-gradient(rgba(255, 255, 255, ${overlayOpacity}), rgba(255, 255, 255, ${overlayOpacity}))`,
      );
    }

    if (bgImage !== "none") {
      layers.push(bgImage);
    }
    return layers.length ? layers.join(", ") : "none";
    })(),
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };
};

const applyBackgroundPatchToPage = (
  pages: any[] | undefined,
  pageIndex: number,
  patch: Partial<LeadCaptureBackgroundType>,
) => {
  if (!Array.isArray(pages) || pageIndex < 0 || pageIndex >= pages.length) {
    return pages;
  }

  return pages.map((page: any, index: number) => {
    if (index !== pageIndex) return page;
    const pageBackground = mergeBackground(page?.background, patch);
    const updatedController = (page?.controller ?? []).map((control: any) => ({
      ...control,
      background: mergeBackground(control?.background ?? pageBackground, patch),
    }));
    return {
      ...page,
      background: pageBackground,
      controller: updatedController,
    };
  });
};

export const setLeadCapturePageBackgroundColor = (
  pages: any[] | undefined,
  pageIndex: number,
  color: string,
) =>
  applyBackgroundPatchToPage(pages, pageIndex, {
    fill: color,
    bgImageUrl: null,
    overlayFill: null,
    opacity: null,
  });

export const setLeadCapturePageBackgroundImage = (
  pages: any[] | undefined,
  pageIndex: number,
  imageUrl: string,
) =>
  applyBackgroundPatchToPage(pages, pageIndex, {
    bgImageUrl: imageUrl,
    fill: null,
  });

export const setLeadCapturePageBackgroundOverlayColor = (
  pages: any[] | undefined,
  pageIndex: number,
  overlayColor: string,
) =>
  applyBackgroundPatchToPage(pages, pageIndex, {
    overlayFill: overlayColor,
  });

export const setLeadCapturePageBackgroundImageOpacity = (
  pages: any[] | undefined,
  pageIndex: number,
  opacity: number,
) =>
  applyBackgroundPatchToPage(pages, pageIndex, {
    opacity,
  });

export const clearLeadCapturePageBackground = (
  pages: any[] | undefined,
  pageIndex: number,
) =>
  applyBackgroundPatchToPage(pages, pageIndex, {
    bgImageUrl: defaultLeadCapturePageBackgroundImage,
    overlayFill: null,
    opacity: null,
    fill: null,
  });

const convertDataUrlToFile = (
  dataUrl: string,
  fileType = "image/png",
  fileExtension = "png",
) => {
  const [metadata, base64Content] = dataUrl.split(",");
  const mimeMatch = metadata?.match(/data:(.*?);base64/);
  const mimeType = fileType || mimeMatch?.[1] || "image/png";
  const binaryString = atob(base64Content ?? "");
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let index = 0; index < length; index++) {
    bytes[index] = binaryString.charCodeAt(index);
  }
  const extension = fileExtension || mimeType.split("/")[1] || "png";
  return new File([bytes], `lead-capture-bg-${Date.now()}.${extension}`, {
    type: mimeType,
  });
};

type CustomLeadCaptureBackgroundOptionsProps = {
  pages?: any[];
  selectedPageIndex?: number;
  onPagesChange: (
    updater: (prev: any[] | undefined) => any[] | undefined,
  ) => void;
  compact?: boolean;
};

export const CustomLeadCaptureBackgroundOptions = ({
  pages,
  selectedPageIndex,
  onPagesChange,
  compact = false,
}: CustomLeadCaptureBackgroundOptionsProps) => {
  const uploaderRef = useRef<any>(null);
  const { t } = useTranslation();
  const { uploadFile, isUploading } = useFileUpload({
    basePath: "QUESTIONNAIRE",
    eventSource: "QUESTIONNAIRE",
  });

  const resolvedPageIndex =
    selectedPageIndex === undefined || selectedPageIndex < 0
      ? -1
      : selectedPageIndex;
  const selectedPage = resolvedPageIndex >= 0 ? pages?.[resolvedPageIndex] : null;
  const selectedColor = useMemo(() => {
    const pageLevelColor = selectedPage?.background?.fill;
    const controlLevelColor = selectedPage?.controller?.[0]?.background?.fill;
    return String(pageLevelColor || controlLevelColor || "#F5F5F5");
  }, [selectedPage]);
  const selectedOverlayColor = useMemo(() => {
    const pageLevelColor = selectedPage?.background?.overlayFill;
    const controlLevelColor =
      selectedPage?.controller?.[0]?.background?.overlayFill;
    return String(pageLevelColor || controlLevelColor || "#FFFFFF");
  }, [selectedPage]);
  const selectedImageOpacity = useMemo(() => {
    const pageLevelOpacity = selectedPage?.background?.opacity;
    const controlLevelOpacity =
      selectedPage?.controller?.[0]?.background?.opacity;
    const resolvedOpacity =
      typeof pageLevelOpacity === "number"
        ? pageLevelOpacity
        : typeof controlLevelOpacity === "number"
          ? controlLevelOpacity
          : 100;
    return clampNumber(resolvedOpacity, 0, 100);
  }, [selectedPage]);
  const hasBackgroundImage = Boolean(
    selectedPage?.background?.bgImageUrl ||
      selectedPage?.controller?.[0]?.background?.bgImageUrl,
  );
  const hasBackgroundOverlay = Boolean(
    selectedPage?.background?.overlayFill ||
      selectedPage?.controller?.[0]?.background?.overlayFill,
  );
  const canClearBackground = hasBackgroundImage || hasBackgroundOverlay;

  const [overlayAnchorEl, setOverlayAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [overlayInput, setOverlayInput] = useState<string>(selectedOverlayColor);
  const [overlayPickerColor, setOverlayPickerColor] =
    useState<string>(selectedOverlayColor);
  const overlayOpen = Boolean(overlayAnchorEl);

  const handleColorChange = (color: string) => {
    if (resolvedPageIndex < 0) return;
    onPagesChange((prev) =>
      setLeadCapturePageBackgroundColor(prev, resolvedPageIndex, color),
    );
  };

  const handleOverlayColorChange = (color: string) => {
    if (resolvedPageIndex < 0) return;
    const normalized = normalizeHexColor(color);
    if (!normalized) return;
    setOverlayPickerColor(normalized);
    setOverlayInput(normalized);
    onPagesChange((prev) =>
      setLeadCapturePageBackgroundOverlayColor(
        prev,
        resolvedPageIndex,
        normalized,
      ),
    );
  };

  const handleOverlayInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOverlayInput(value);
    const normalized = normalizeHexColor(value);
    if (normalized) {
      setOverlayPickerColor(normalized);
      onPagesChange((prev) =>
        setLeadCapturePageBackgroundOverlayColor(
          prev,
          resolvedPageIndex,
          normalized,
        ),
      );
    }
  };

  const handleImageOpacityChange = (_: Event, value: number | number[]) => {
    if (resolvedPageIndex < 0) return;
    const numericValue = Array.isArray(value) ? value[0] : value;
    onPagesChange((prev) =>
      setLeadCapturePageBackgroundImageOpacity(
        prev,
        resolvedPageIndex,
        clampNumber(numericValue, 0, 100),
      ),
    );
  };

  const handleOpenUploader = () => {
    uploaderRef?.current?.handleOpenModal?.();
  };

  const handleClearBackground = () => {
    if (resolvedPageIndex < 0) return;
    onPagesChange((prev) =>
      clearLeadCapturePageBackground(prev, resolvedPageIndex),
    );
    setOverlayAnchorEl(null);
    setOverlayInput("#FFFFFF");
    setOverlayPickerColor("#FFFFFF");
  };

  const handleUploadBackground = async (files: any[]) => {
    if (!files?.length || resolvedPageIndex < 0) return;
    try {
      const selectedFile = files[0];
      const dataUrl = String(selectedFile?.buffer ?? "");
      if (!dataUrl.startsWith("data:")) {
        toast.error(
          t("leadCapture.backgroundOptions.invalidImageSelected", {
            defaultValue: "Invalid image selected",
          }),
        );
        return;
      }
      const uploadableFile = convertDataUrlToFile(
        dataUrl,
        selectedFile?.fileType,
        selectedFile?.fileExtension,
      );
      const pageId = selectedPage?.pageId ?? `page-${resolvedPageIndex + 1}`;
      const uploadedImageUrl = await uploadFile(uploadableFile, `${pageId}-BG`);
      if (!uploadedImageUrl) return;
      onPagesChange((prev) =>
        setLeadCapturePageBackgroundImage(
          prev,
          resolvedPageIndex,
          uploadedImageUrl,
        ),
      );
      return [uploadedImageUrl];
    } catch (error) {
      console.error(error);
      toast.error(
        t("leadCapture.backgroundOptions.uploadFailed", {
          defaultValue: "Failed to upload background image",
        }),
      );
    }
  };

  const handleSelectExistingBackground = async (imageUrl: string) => {
    if (!imageUrl || resolvedPageIndex < 0) return;
    onPagesChange((prev) =>
      setLeadCapturePageBackgroundImage(prev, resolvedPageIndex, imageUrl)
    );
  };

  return (
    <Box
      className="d-flex"
      sx={
        compact
          ? { justifyContent: "flex-start", p: 0 }
          : { justifyContent: "center", pb: 3 }
      }
    >
      <Box
        className="d-flex align-items-center"
        sx={{ gap: 1, flexWrap: "nowrap" }}
      >
        {/* <ColorPicker value={selectedColor} onChange={handleColorChange} /> */}
        <Tooltip
          arrow
          placement="top"
          title={t("common.removeBackground", {
            defaultValue: "Remove background",
          })}
        >
          <span>
            <IconButton
              onClick={handleClearBackground}
              disabled={resolvedPageIndex < 0 || !canClearBackground}
              size={compact ? "small" : "medium"}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                color: "error.main",
                "&.Mui-disabled": {
                  color: "action.disabled",
                },
              }}
            >
              <Trash2 size={compact ? 16 : 18} strokeWidth={1.8} />
            </IconButton>
          </span>
        </Tooltip>
        <Button
          variant="outlined"
          onClick={handleOpenUploader}
          disabled={resolvedPageIndex < 0 || isUploading}
          startIcon={<ImageIcon />}
          size={compact ? "small" : "medium"}
          sx={
            compact
              ? {
                  textTransform: "none",
                  minWidth: "96px",
                  height: "30px",
                  fontSize: "0.72rem",
                  px: 1,
                  whiteSpace: "nowrap",
                }
              : { textTransform: "none", minWidth: "130px", height: "38px" }
          }
        >
          {t("common.background", { defaultValue: "Background" })}
        </Button>
        <Button
          variant="outlined"
          startIcon={<PaletteIcon />}
          size={compact ? "small" : "medium"}
          sx={
            compact
              ? {
                  textTransform: "none",
                  minWidth: "120px",
                  height: "30px",
                  fontSize: "0.72rem",
                  px: 1,
                  whiteSpace: "nowrap",
                }
              : { textTransform: "none", minWidth: "170px", height: "38px" }
          }
          onClick={(event) => {
            if (resolvedPageIndex < 0) return;
            const normalizedSelected =
              normalizeHexColor(selectedOverlayColor) ?? "#FFFFFF";
            setOverlayInput(normalizedSelected);
            setOverlayPickerColor(normalizedSelected);
            setOverlayAnchorEl(event.currentTarget);
          }}
          disabled={resolvedPageIndex < 0}
        >
          {t("common.backgroundOverlay", { defaultValue: "Background Overlay" })}
        </Button>
        
      </Box>
      <Popover
        disableScrollLock
        open={overlayOpen}
        anchorEl={overlayAnchorEl}
        onClose={() => setOverlayAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ p: 2, width: 260 }}>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, mb: 1 }}>
            {t("common.backgroundOverlay", { defaultValue: "Background Overlay" })}
          </Typography>
          <Box
            sx={{
              "& .react-colorful": {
                width: "100%",
                height: "180px",
              },
              "& .react-colorful__saturation-pointer": {
                width: 18,
                height: 18,
              },
              "& .react-colorful__hue-pointer": {
                width: 20,
                height: 20,
                borderRadius: 100,
              },
            }}
          >
            <HexColorPicker
              color={overlayPickerColor}
              onChange={handleOverlayColorChange}
            />
          </Box>
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "4px",
                backgroundColor:
                  normalizeHexColor(overlayInput) ?? selectedOverlayColor,
                border: "1px solid #d1d1d1",
              }}
            />
            <TextField
              size="small"
              value={overlayInput}
              onChange={handleOverlayInputChange}
              placeholder="#FFFFFF"
              inputProps={{ maxLength: 7 }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  height: 32,
                },
                "& .MuiOutlinedInput-input": {
                  py: 0.75,
                },
              }}
            />
          </Box>
          {hasBackgroundImage ? (
            <>
              <Typography sx={{ fontSize: "0.8rem", mt: 2, mb: 0.5 }}>
                {t("common.imageOpacity", { defaultValue: "Image Opacity" })}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Slider
                  value={selectedImageOpacity}
                  min={0}
                  max={100}
                  onChange={handleImageOpacityChange}
                  sx={{
                    "& .MuiSlider-thumb": {
                      width: 14,
                      height: 14,
                    },
                  }}
                />
                <Typography sx={{ width: 40, textAlign: "right" }}>
                  {selectedImageOpacity}%
                </Typography>
              </Box>
            </>
          ) : null}
        </Box>
      </Popover>
      <ImageUploader
        ref={uploaderRef}
        maxFiles={1}
        maxFileSize={5}
        accept="image/*"
        onUpload={handleUploadBackground}
        onSelectExisting={handleSelectExistingBackground}
      />
    </Box>
  );
};
