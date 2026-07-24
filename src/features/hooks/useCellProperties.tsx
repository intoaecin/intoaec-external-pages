import { useContext } from "react";
import { CellPropertiesContext } from "../components/providers/CellPropertiesProvider";

export const useCellProperties = () => {
  const { setCellProperties, cellProperties } = useContext(
    CellPropertiesContext
  );
  return { cellProperties, setCellProperties };
};
