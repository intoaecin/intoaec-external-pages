import { PlateController } from "@udecode/plate-common";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";
import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

interface PlateProviderProps {
  editMode?: boolean;
  externalToolbar?: boolean;
  showShapeEditorToolbar?: boolean;
  setEditMode?: Dispatch<SetStateAction<boolean>>;
  setExternalToolBar?: Dispatch<SetStateAction<boolean>>;
  setShowShapeEditorToolbar?: Dispatch<SetStateAction<boolean>>;
}

export const PlateContext = createContext<PlateProviderProps>({});

export const PlateProvider = ({ children }: { children: ReactNode }) => {
  const [editMode, setEditMode] = useState(false);
  const [externalToolbar, setExternalToolBar] = useState(false);
  const [showShapeEditorToolbar, setShowShapeEditorToolbar] = useState(false);
  return (
    <PlateContext.Provider
      value={{
        editMode,
        externalToolbar,
        setExternalToolBar,
        setEditMode,
        setShowShapeEditorToolbar,
        showShapeEditorToolbar,
      }}
    >
      <PlateController>{children}</PlateController>
    </PlateContext.Provider>
  );
};
