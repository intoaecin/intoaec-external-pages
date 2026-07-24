import { useContext } from "react";
import { OrganizationLocalizationContext } from "../components/providers/OrganizationLocalizationProvider";
export const useOrganizationLocalization = () => {
  const { localizationValue, fetchLocalization, localizationLoading } =
    useContext(OrganizationLocalizationContext);
  return { localizationLoading, localizationValue, refetch: fetchLocalization };
};
