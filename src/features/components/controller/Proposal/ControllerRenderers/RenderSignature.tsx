import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const RenderSignature = ({
  controller,
  organizationId,
  organizationType,
  leadSignatureUrl,
  cameraVerificationUrl,
}: {
  controller: any;
  organizationId: string;
  organizationType: string;
  leadSignatureUrl?: string;
  cameraVerificationUrl?: string;
}) => {
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { t } = useTranslation();

  const { post: fetch } = useAxios<any>(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/myorganization"
  );
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const fetchData = async () => {
    try {
      const requestData = {
        eventType: "FETCH_ESIGN",
        organizationId: organizationId,
      };
      const data = await fetch(requestData);
      if (data.code === "ORGANIZATION_ESIGN_FETCH_SUCCESS") {
        setSignatureImage(data.body.eSignUrl);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const isAdminSignature = controller.signatureType == "ADMIN";

  return (
    <div
      style={{
        ...controller?.style,
        position: "relative",
      }}
    >
      {!isAdminSignature && cameraVerificationUrl && (
        <div
          style={{
            width: "160px",
            maxWidth: "100%",
            height: "200px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            left: 0,
            bottom: "calc(100% + 8px)",
          }}
        >
          <img
            src={cameraVerificationUrl}
            alt={t("signature.cameraVerificationTitle", {
              defaultValue: "Camera Verification",
            })}
            style={{
              objectFit: "contain",
              padding: 0,
              width: "100%",
              height: "100%",
            }}
            onDrag={(e) => {
              e.preventDefault();
            }}
            onDragStart={(e) => {
              e.preventDefault();
            }}
          />
        </div>
      )}
      <img
        src={
          isAdminSignature
            ? signatureImage ?? ""
            : leadSignatureUrl ?? ""
        }
        alt={
          isAdminSignature
            ? `${t("templateCenter.proposal.architectSignature")}`
            : `${t("templateCenter.proposal.leadSignature")}`
        }
        style={{
          objectFit: "contain",
          padding: 0,
          width: "98%",
          height: "98%",
        }}
        onDrag={(e) => {
          e.preventDefault();
        }}
        onDragStart={(e) => {
          e.preventDefault();
        }}
      />
    </div>
  );
};
