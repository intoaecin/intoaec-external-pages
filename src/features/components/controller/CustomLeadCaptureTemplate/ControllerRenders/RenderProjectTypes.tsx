import useGetProjectType from "@/features/components/preferences/hooks/useGetProjectType";
import { setCreateLeadFormData } from "@/features/leadCapture/setCreateFormData";
import ProjectTypeCheck from "@/assets/icons/project-type-check";
import { base64ToBlob, formatSeedValues } from "@/lib/helpers";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { ProjectType } from "@/types";
import {
  Box,
  Card,
  CircularProgress,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { ImageUploader } from "@/components/ImageUploaderForOrg";
import { useFileUpload } from "@/features/hooks/useFileUpload";
import { useCreateProjectType } from "@/features/components/preferences/hooks/useCreateProjectType";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useRouter } from "next/router";

export interface RenderProjectTypesHandle {
  openCustomize: () => void;
}

interface RenderProjectTypesProps {
  disabled?: boolean;
}

const RenderProjectTypes = forwardRef<
  RenderProjectTypesHandle,
  RenderProjectTypesProps
>(({ disabled = false }, ref) => {
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");
  const router = useRouter();
  // const [selectedType, setSelectedType] = React.useState<string>();
  const { organizationId, organizationType } = useOrganization();
  const [projectTypes, setProjectTypes] = useState<Array<ProjectType>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [activeProjectType, setActiveProjectType] =
    useState<ProjectType | null>(null);
  const [updatingTypeId, setUpdatingTypeId] = useState<string | null>(null);
  const imageUploaderRef = useRef<any>(null);
  const selectedType = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.projectType,
  );
  const handleProjectTypeChange = (selectedTypeValue: string) => {
    setCreateLeadFormData({ projectType: selectedTypeValue });
  };
  const { getProjectTypes } = useGetProjectType();
  const { updateProjectTypeDefault } = useCreateProjectType();
  const { uploadFile, isUploading } = useFileUpload({
    basePath: "PROJECT_TYPES",
    eventSource: "PROJECT_TYPES",
  });

  const { t } = useTranslation();
  useImperativeHandle(ref, () => ({
    openCustomize: () => setIsCustomizeOpen(true),
  }));
  const handleCardClick = (typeValue: string) => {
    if (disabled) return;

    handleProjectTypeChange(typeValue);
    // if (type === "Others") {
    //   setSelectedType("Others");
    // } else {
    //   setSelectedType(type);
    // }
  };
  const fetchProjectTypes = async () => {
    if (!organizationId || !organizationType) return;
    setIsLoading(true);
    try {
      const response = await getProjectTypes({
        organizationId,
        organizationType,
      });
      if (response?.success) {
        setProjectTypes(response?.data || []);
      } else {
        setProjectTypes([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectTypes();
  }, [organizationId, organizationType]);

  const resolveUploadFile = (
    file: {
      buffer?: string | ArrayBuffer | null;
      fileType?: string;
      fileExtension?: string;
      url?: string;
    },
    fallbackName: string,
  ) => {
    if (!file?.buffer) return null;
    let blob: Blob;
    if (typeof file.buffer === "string" && file.buffer.startsWith("data")) {
      blob = base64ToBlob(file.buffer.split(",").slice(1).join(","));
    } else if (file.buffer instanceof ArrayBuffer) {
      blob = new Blob([file.buffer], { type: file.fileType || "image/png" });
    } else {
      return null;
    }
    const extension =
      file.fileExtension || file.fileType?.split("/").pop() || "png";
    return new File([blob], `${fallbackName}.${extension}`, {
      type: file.fileType || "image/png",
    });
  };

  const updateProjectTypeImage = async (imageUrl: string) => {
    if (!activeProjectType?.projectTypeId) return false;
    if (!organizationId || !organizationType) return false;
    const updatedBy = session?.username || "";
    if (!updatedBy) return false;

    setUpdatingTypeId(activeProjectType.projectTypeId);
    const response = await updateProjectTypeDefault({
      organizationId,
      organizationType,
      projectTypes: [
        {
          projectTypeId: activeProjectType.projectTypeId,
          projectTypeImageUrl: imageUrl,
        },
      ],
      updatedBy,
      showToast: true,
    });
    if (response?.success) {
      setProjectTypes((prev) =>
        prev.map((type) =>
          type.projectTypeId === activeProjectType.projectTypeId
            ? { ...type, projectTypeImageUrl: imageUrl }
            : type,
        ),
      );
    }
    setUpdatingTypeId(null);
    return !!response?.success;
  };

  const handleUploadProjectTypeImage = async (
    files: Array<{
      buffer?: string | ArrayBuffer | null;
      fileType?: string;
      fileExtension?: string;
      url?: string;
    }>,
  ) => {
    const currentTypeId = activeProjectType?.projectTypeId;
    if (!currentTypeId) return [];
    if (!organizationId || !organizationType || !session?.username) {
      toast.error(t("common.requiredField"));
      return [];
    }
    const file = files?.[0];
    if (!file) return [];

    if (file.url) {
      const updated = await updateProjectTypeImage(file.url);
      return updated ? [file.url] : [];
    }

    const uploadableFile = resolveUploadFile(
      file,
      `project-type-${currentTypeId}`,
    );
    if (!uploadableFile) {
      toast.error(t("toast.somethingWentWrong"));
      return [];
    }

    try {
      const uploadedUrl = await uploadFile(
        uploadableFile,
        `${currentTypeId}-${Date.now()}`,
      );
      if (!uploadedUrl) {
        toast.error(t("toast.somethingWentWrong"));
        return [];
      }
      const updated = await updateProjectTypeImage(uploadedUrl);
      return updated ? [uploadedUrl] : [];
    } catch (error) {
      console.error(error);
      toast.error(t("toast.somethingWentWrong"));
      return [];
    }
  };

  const handleSelectProjectTypeImage = (type: ProjectType) => {
    setActiveProjectType(type);
    imageUploaderRef?.current?.handleOpenModal?.();
  };

  return (
    <div
      style={{
        fontSize: "20px",
        fontWeight: 600,
        width: isSmallScreen ? "100% " : "50vw",
        color: "black",
        margin: isSmallScreen ? "auto " : "0",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "content-box",
      }}
    >
      <Box
        // className="row col-lg-7 justify-content-center"
        sx={{
          flexWrap: "wrap",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: {
            xs: "space-evenly",
            sm: "start",
          },
        }}
      >
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center w-100">
            <CircularProgress size={28} />
          </div>
        ) : (
          projectTypes.map((type, index) => (
            <Box
              sx={{
                width: "100px",
                padding: isSmallScreen ? "10px " : "30px",
                height: "100px",
                minWidth: "100px",
              }}
              key={type?.projectTypeId}
            >
              <Card
                className="d-flex justify-content-center align-items-center "
                style={{
                  padding: isSmallScreen ? "0 " : "10px",
                  position: "relative",
                  width: "100px",
                  height: "100px",
                  minWidth: "100px",
                  backgroundImage: `url(${type?.projectTypeImageUrl})`,
                  backgroundSize: "cover",
                  minHeight: "100px",
                  color: "white",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.6 : 1,
                }}
                sx={{
                  margin: {
                    xs: ".0rem",
                    sm: "1rem",
                  },
                }}
                // sx={{
                //   ":hover .project-type-name":{
                //     color:""
                //   }
                // }}
                onClick={() =>
                  handleCardClick(String(type.projectTypeValue ?? ""))
                }
                onMouseEnter={(e) => {
                  if (disabled) return;
                  const overlay = e.currentTarget.querySelector(
                    ".overlay",
                  ) as HTMLElement | null;
                  if (overlay) {
                    overlay.style.opacity = "0.3";
                  }
                }}
                onMouseLeave={(e) => {
                  if (disabled) return;
                  const overlay = e.currentTarget.querySelector(
                    ".overlay",
                  ) as HTMLElement | null;
                  if (overlay) {
                    overlay.style.opacity = "1";
                  }
                }}
              >
                <div
                  className="overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0, 0, 0, 0.5)",
                    opacity: 1,
                    transition: "opacity 0.3s",
                  }}
                ></div>
                <div
                  className="d-flex column align-items-end overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 1,
                    background:
                      selectedType === String(type?.projectTypeValue ?? "") ||
                      selectedType === String(type?.projectTypeId)
                        ? "rgba(0, 0, 0, 0.5)"
                        : "transparent",
                  }}
                >
                  {(selectedType === String(type?.projectTypeValue ?? "") ||
                    selectedType === String(type?.projectTypeId)) && (
                    <ProjectTypeCheck width={"30px"} />
                  )}
                </div>
                <div
                  style={{
                    zIndex: 1,
                    fontSize: "12px",
                    textShadow: "2px 2px 2px #000",
                  }}
                  className="project-type-name"
                >
                  {t(
                    `projectType.${formatSeedValues(type?.projectTypeValue)}`,
                    {
                      defaultValue: formatSeedValues(type?.projectTypeValue),
                    },
                  )}
                </div>
              </Card>
            </Box>
          ))
        )}
      </Box>

      <Drawer
        anchor="right"
        open={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            maxWidth: "100%",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #E7E7E7",
          }}
        >
          <Typography style={{ fontWeight: 600, fontSize: "16px" }}>
            {t("common.customize", { defaultValue: "Customize" })}
          </Typography>
          <IconButton onClick={() => setIsCustomizeOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
        <div
          style={{
            padding: "16px",
            overflowY: "auto",
          }}
        >
          {projectTypes.length === 0 ? (
            <Typography
              style={{
                color: "#6E6E71",
                fontSize: "14px",
              }}
            >
              {t("common.noOptions")}
            </Typography>
          ) : (
            projectTypes
              .filter((type) => type.projectTypeValue)
              .map((type) => {
                const value = type.projectTypeValue || "";
                const imageUrl = type.projectTypeImageUrl || "";
                const isUpdating = updatingTypeId === type.projectTypeId;
                return (
                  <div
                    key={type.projectTypeId || value}
                    style={{
                      border: "1px solid #E7E7E7",
                      borderRadius: "8px",
                      padding: "12px",
                      marginBottom: "14px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "140px",
                        borderRadius: "8px",
                        backgroundColor: "#F5F5F5",
                        backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        border: "1px solid #E7E7E7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#6E6E71",
                        fontSize: "12px",
                      }}
                    >
                      {!imageUrl &&
                        t("common.noImage", { defaultValue: "No image" })}
                    </div>
                    <Typography
                      style={{
                        marginTop: "10px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#192A3E",
                      }}
                    >
                      {formatSeedValues(value)}
                    </Typography>
                    <LoadingButton
                      loading={isUpdating || isUploading}
                      variant="outlined"
                      color="primary"
                      onClick={() => handleSelectProjectTypeImage(type)}
                      disabled={isUpdating || isUploading}
                      style={{ marginTop: "10px", height: "36px" }}
                      sx={{ color: "primary.main" }}
                    >
                      {t("common.upload", { defaultValue: "Upload Image" })}
                    </LoadingButton>
                  </div>
                );
              })
          )}
        </div>
      </Drawer>

      <ImageUploader
        ref={imageUploaderRef}
        maxFiles={1}
        accept=".jpg,.jpeg,.png"
        onUpload={handleUploadProjectTypeImage}
        onSelectExisting={async (imageUrl) => {
          await updateProjectTypeImage(imageUrl);
        }}
        onClose={() => setActiveProjectType(null)}
      />
    </div>
  );
});

RenderProjectTypes.displayName = "RenderProjectTypes";

export default RenderProjectTypes;
