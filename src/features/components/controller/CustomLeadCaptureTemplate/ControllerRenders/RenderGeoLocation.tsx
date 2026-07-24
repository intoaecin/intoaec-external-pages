import LocationMapIcon from "@/assets/icons/locationMap-icon";
import { TextField, useMediaQuery } from "@mui/material";
import React, { useRef, useState } from "react";
import { StandaloneSearchBox } from "@react-google-maps/api";
import { useEnv } from "@/features/hooks/useEnv";
import { setCreateLeadFormData } from "@/features/leadCapture/setCreateFormData";
import { useTranslation } from "react-i18next";

const RenderGeoLocation = ({ disabled = false }: { disabled?: boolean }) => {
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const inputRef = useRef<any>(null);

  const handlProjectLocationChange = () => {
    const place = inputRef.current.getPlaces()[0];

    if (place && place.address_components) {
      const addressComponents = place.address_components;

      let city = "";
      let state = "";
      let country = "";

      addressComponents.forEach((component: any) => {
        if (component.types.includes("locality")) {
          city = component.long_name;
        } else if (component.types.includes("administrative_area_level_1")) {
          state = component.long_name;
        } else if (component.types.includes("country")) {
          country = component.long_name;
        }
      });
      setSelectedLocation(`${city}, ${state}, ${country}`);
      setCreateLeadFormData({
        projectLocation: `${city}, ${state}, ${country}`,
      });
    }
  };
  const { t } = useTranslation();
  return (
    <div className="d-flex align-items-center ml-3">
      <StandaloneSearchBox
        onLoad={(ref) => (inputRef.current = ref)}
        onPlacesChanged={disabled ? undefined : handlProjectLocationChange}
      >
        <div style={{ margin: " 20px 0" }}>
          <TextField
            id="outlined-basic"
            placeholder={t("leadCapture.enterProjectLocation")}
            type="text"
            variant="outlined"
            disabled={disabled}
            style={{
              width: isSmallScreen ? "100% " : "30vw",
              padding: "10px",
              boxSizing: "border-box",
            }}
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <>
                  <LocationMapIcon width={"12px"} fill="#ACB0B4" />
                  &nbsp;&nbsp;
                </>
              ),
            }}
          />
        </div>
      </StandaloneSearchBox>
    </div>
  );
};

export default RenderGeoLocation;
