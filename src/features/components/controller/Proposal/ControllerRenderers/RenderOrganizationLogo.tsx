import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const RenderOrganizationLogo = ({
  controller,
  organizationId,
}: {
  controller: any;
  organizationId: string;
}) => {
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { t } = useTranslation();
  const { post: fetch } = useAxios<any>(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/myorganization"
  );

  const [logoUrl, setLogoUrl] = useState("");

  const fetchData = async () => {
    try {
      const data = await fetch({
        eventType: "FETCH_LOGO",
        organizationId: organizationId,
      });

      if (data.code === "ORGANIZATION_LOGO_FETCH_SUCCESS") {
        setLogoUrl(data.body.logoUrl);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [organizationId]);
  return (
    <div style={{ ...controller?.style }}>
      <img
        alt={t("leadCapture.thankYouPageControllers.Organization Logo")}
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
        src={logoUrl}
      />
    </div>
  );
};
