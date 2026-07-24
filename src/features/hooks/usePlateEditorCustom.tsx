import { useContext } from "react";
import { PlateContext } from "../components/providers/PlateProvider";

export const usePlateEditorCustom = () => {
  const {
    editMode,
    externalToolbar,
    setEditMode,
    setExternalToolBar,
    showShapeEditorToolbar,
    setShowShapeEditorToolbar,
  } = useContext(PlateContext);
  return {
    editMode,
    externalToolbar,
    setEditMode,
    setExternalToolBar,
    showShapeEditorToolbar,
    setShowShapeEditorToolbar,
  };
};
