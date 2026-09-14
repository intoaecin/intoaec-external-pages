import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, Typography, useMediaQuery, useTheme, Link, Card, CardMedia, CardContent } from "@mui/material";
import { Download, ExternalLink } from "lucide-react";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ArchitectureOutlinedIcon from "@mui/icons-material/ArchitectureOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { useTranslation } from "react-i18next";
import { downloadFileFromS3 } from "@/lib/helpers";


interface PreviewAttachmentProps {
    items: string[] | string | any;
    label?: string;
    pdf?: boolean;
    grSerialNumber?: string;
}

type AttachmentItem = {
    url: string;
    fileName?: string;
};

const PreviewAttachment: React.FC<PreviewAttachmentProps> = ({
    items,
    label = "Attachments",
    pdf = false,
    grSerialNumber,
}) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [fileObjectUrls, setFileObjectUrls] = useState<string[]>([]);

    const isImage = (url: string) => {
        const imageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];
        return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    };

    const getFileExtension = (url: string) => {
        try {
            const sanitized = url.split("?")[0].split("#")[0];
            const fileName = sanitized.split("/").pop() || "";
            const dotIndex = fileName.lastIndexOf(".");
            return dotIndex > -1 ? fileName.slice(dotIndex + 1).toLowerCase() : "";
        } catch (e) {
            return "";
        }
    };

    const getFileTypeConfig = (url: string) => {
        const ext = getFileExtension(url);

        if (ext === "pdf") {
            return {
                icon: <PictureAsPdfOutlinedIcon sx={{ fontSize: 48, color: "#DC2626" }} />,
                bg: "#FEF2F2",
                label: "PDF",
            };
        }

        if (["dwg", "dxf", "cad", "step", "stp", "igs", "iges"].includes(ext)) {
            return {
                icon: <ArchitectureOutlinedIcon sx={{ fontSize: 48, color: "#0F766E" }} />,
                bg: "#F0FDFA",
                label: "CAD",
            };
        }

        if (["doc", "docx", "txt", "rtf"].includes(ext)) {
            return {
                icon: <DescriptionOutlinedIcon sx={{ fontSize: 48, color: "#1D4ED8" }} />,
                bg: "#EFF6FF",
                label: "DOC",
            };
        }

        if (["xls", "xlsx", "csv"].includes(ext)) {
            return {
                icon: <TableChartOutlinedIcon sx={{ fontSize: 48, color: "#15803D" }} />,
                bg: "#F0FDF4",
                label: "SHEET",
            };
        }

        if (["ppt", "pptx"].includes(ext)) {
            return {
                icon: <SlideshowOutlinedIcon sx={{ fontSize: 48, color: "#C2410C" }} />,
                bg: "#FFF7ED",
                label: "PPT",
            };
        }

        if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
            return {
                icon: <ArchiveOutlinedIcon sx={{ fontSize: 48, color: "#334155" }} />,
                bg: "#F8FAFC",
                label: "ARCHIVE",
            };
        }

        if (["json", "xml", "js", "ts", "sql", "md"].includes(ext)) {
            return {
                icon: <CodeOutlinedIcon sx={{ fontSize: 48, color: "#7C3AED" }} />,
                bg: "#F5F3FF",
                label: "CODE",
            };
        }

        return {
            icon: <InsertDriveFileOutlinedIcon sx={{ fontSize: 48, color: "#64748B" }} />,
            bg: "#F8FAFC",
            label: ext ? ext.toUpperCase() : "FILE",
        };
    };

    const getFileName = (url: string, index?: number) => {
        if (grSerialNumber && typeof index === "number") {
            const ext = getFileExtension(url);
            return `${grSerialNumber}_attachment_${index + 1}${ext ? `.${ext}` : ""}`;
        }
        try {
            const decodedUrl = decodeURIComponent(url);
            return decodedUrl.split("/").pop()?.split("?")[0] || "Attachment";
        } catch (e) {
            return "Attachment";
        }
    };

    const handleDownload = async (url: string, fileName: string) => {
        await downloadFileFromS3(url, fileName);
    };

    useEffect(() => {
        if (!Array.isArray(items)) {
            setFileObjectUrls([]);
            return;
        }

        const urls = items
            .filter((entry): entry is File => entry instanceof File)
            .map((file) => URL.createObjectURL(file));

        setFileObjectUrls(urls);

        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [items]);

    const attachmentItems = useMemo<AttachmentItem[]>(() => {
        // If items is a string, try to parse or extract URLs
        if (typeof items === "string") {
            try {
                // Try JSON parsing first
                const parsed = JSON.parse(items);
                if (Array.isArray(parsed)) {
                    return parsed
                        .map((entry) => {
                            if (typeof entry === "string") return { url: entry };
                            if (entry && typeof entry === "object" && "url" in entry) {
                                return {
                                    url: String((entry as any).url),
                                    fileName: (entry as any).fileName ? String((entry as any).fileName) : undefined,
                                };
                            }
                            return null;
                        })
                        .filter((entry): entry is AttachmentItem => Boolean(entry?.url));
                }
                if (parsed && typeof parsed === "object") {
                    return Object.values(parsed)
                        .filter((val) => typeof val === "string")
                        .map((url) => ({ url: String(url) }));
                }
            } catch (e) {
                // Fallback: Check if it's the legacy format like {"url1", "url2"}
                // or just contains URLs
                const urlPattern = /https?:\/\/[^\s,"'}]+/g;
                const matches = items.match(urlPattern);
                if (matches) {
                    return Array.from(new Set(matches)).map((url) => ({ url })); // Deduplicate
                }
            }
            return [];
        }

        if (Array.isArray(items)) {
            let fileIndex = 0;
            return items
                .map((entry) => {
                    if (typeof entry === "string") return { url: entry };
                    if (entry instanceof File) {
                        const objectUrl = fileObjectUrls[fileIndex];
                        const normalizedItem = objectUrl
                            ? { url: objectUrl, fileName: entry.name }
                            : null;
                        fileIndex += 1;
                        return normalizedItem;
                    }
                    if (entry && typeof entry === "object" && "url" in entry) {
                        return {
                            url: String((entry as any).url),
                            fileName: (entry as any).fileName ? String((entry as any).fileName) : undefined,
                        };
                    }
                    return null;
                })
                .filter((entry): entry is AttachmentItem => Boolean(entry?.url));
        }
        if (items && typeof items === "object") {
            return Object.values(items)
                .filter((val) => typeof val === "string")
                .map((url) => ({ url: String(url) }));
        }
        return [];
    }, [fileObjectUrls, items]);

    if (!attachmentItems || attachmentItems.length === 0) return null;

    const pdfPreviewHeight = 96;

    return (
        <Box
            component={pdf ? "section" : "div"}
            sx={{
                mt: 3,
                mb: 2,
                px: isMobile ? 1 : 2,
                ...(pdf && {
                    pageBreakInside: "avoid",
                    breakInside: "avoid",
                }),
            }}
        >
            {label && (
                <Box className="pb-2">
                    <span className={`fw-600 ${isMobile ? "fs-8" : "fs-7"}`}>
                        {pdf ? "Attachment" : label}
                    </span>
                </Box>
            )}

            <Grid container spacing={2}>
                {attachmentItems.map((item, index) => {
                    const url = item.url;
                    const isImg = isImage(url);
                    const fileName = item.fileName || getFileName(url, index);
                    const fileType = getFileTypeConfig(url);

                    return (
                        <Grid
                            item
                            xs={12}
                            sm={pdf ? 6 : 6}
                            md={pdf ? 4 : 4}
                            lg={pdf ? 3 : 3}
                            key={index}
                            sx={
                                pdf
                                    ? {
                                          pageBreakInside: "avoid",
                                          breakInside: "avoid",
                                      }
                                    : undefined
                            }
                        >
                            <Card
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    border: "1px solid #E2E8F0",
                                    boxShadow: "none",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    ...(pdf
                                        ? {
                                              pageBreakInside: "avoid",
                                              breakInside: "avoid",
                                          }
                                        : {
                                              "&:hover": {
                                                  borderColor: theme.palette.primary.main,
                                                  boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                                              },
                                          }),
                                }}
                            >
                                {isImg ? (
                                    <Box sx={{ position: "relative" }}>
                                        <CardMedia
                                            component="img"
                                            image={url}
                                            alt={fileName}
                                            crossOrigin="anonymous"
                                            sx={{
                                                height: pdf ? pdfPreviewHeight : 140,
                                                objectFit: "cover",
                                                backgroundColor: "#F8FAFC",
                                            }}
                                        />
                                        {!pdf && (
                                            <Link
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hide-in-pdf"
                                                sx={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                    bgcolor: "rgba(255, 255, 255, 0.8)",
                                                    borderRadius: "4px",
                                                    p: 0.5,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "text.primary",
                                                    "&:hover": { bgcolor: "white" }
                                                }}
                                            >
                                                <ExternalLink size={14} />
                                            </Link>
                                        )}
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            height: pdf ? pdfPreviewHeight : 140,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexDirection: "column",
                                            gap: 1,
                                            bgcolor: fileType.bg,
                                            position: "relative",
                                        }}
                                    >
                                        {fileType.icon}
                                        <Typography
                                            sx={{
                                                fontSize: "0.7rem",
                                                fontWeight: 700,
                                                letterSpacing: "0.4px",
                                                color: "#334155",
                                                backgroundColor: "rgba(255,255,255,0.7)",
                                                border: "1px solid #E2E8F0",
                                                borderRadius: "999px",
                                                px: 1,
                                                py: 0.2,
                                            }}
                                        >
                                            {fileType.label}
                                        </Typography>
                                    </Box>
                                )}
                                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, flexGrow: 1 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 500,
                                            color: "#1E293B",
                                            display: "block",
                                            mb: 1,
                                            overflow: pdf ? "visible" : "hidden",
                                            textOverflow: pdf ? "clip" : "ellipsis",
                                            whiteSpace: pdf ? "normal" : "nowrap",
                                            wordBreak: pdf ? "break-all" : "normal",
                                        }}
                                    >
                                        {fileName}
                                    </Typography>
                                    {!pdf && (
                                        <Link
                                            component="button"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                void handleDownload(url, fileName);
                                            }}
                                            className="hide-in-pdf"
                                            sx={{
                                                textDecoration: "none",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                fontSize: "0.75rem",
                                                color: theme.palette.primary.main,
                                                fontWeight: 600,
                                                background: "none",
                                                border: "none",
                                                p: 0,
                                                cursor: "pointer",
                                                "&:hover": {
                                                    textDecoration: "underline",
                                                },
                                            }}
                                        >
                                            <Download size={14} style={{ marginRight: "4px" }} />
                                            {t("common.download")}
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default PreviewAttachment;
