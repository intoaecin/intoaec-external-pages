import { useTranslation } from "react-i18next";
import { useIpBasedData } from "@/features/hooks/useIpBasedData";
import { useEffect } from "react";

function Footer() {
  const { t } = useTranslation();
  const { geoIpValue } = useIpBasedData();

  return (
    <div>
      <div
        style={{
          background: "rgb(33, 150, 243)",
          color: "rgb(255, 255, 255)",
          position: "fixed",
          bottom: 0,
          width: "100%",
          // padding:"20px",
          padding: "16px",
          // backgroundColor: "#318CE7",
          // display: "flex",
          // flexWrap: "nowrap",
          // justifyContent: "space-between",
          // alignItems: "center",
          // width: "100%",
          // height: "20px",
          // marginTop: "10px",
          // color: "white",
        }}
        className="signIn-footer row "
      >
        <div className="col-lg-9 col-md-9 col-sm-12">
          <span className="pl-2"> {t("footer.supportCall")}:</span>
          <a
            style={{ color: "inherit", textDecoration: "none" }}
            href={`tel:${geoIpValue?.phoneNumber ?? "+65 31061752"}`}
            className="fw-600"
          >
            {geoIpValue?.phoneNumber ?? "+65 31061752"}
          </a>
          <span>{" | " + t("footer.emailId")}:</span>
          <a
            style={{ color: "inherit", textDecoration: "none" }}
            href="mailto:admin@intoaec.com"
            className="fw-600"
          >
            {"support@intoaec.ai"}
          </a>
        </div>
        <div className="col-lg-3 col-md-3 col-sm-12 d-flex justify-content-end">
          <span className="pr-4">{t("common.copyright")}</span>
        </div>
      </div>
    </div>
  );
}

export default Footer;