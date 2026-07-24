import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useState,
} from "react";

interface CellPropertiesTypes {
  width?: number;
  borderColor?: string;
  backgroundColor?: string;
  backGroundTextEditorColor?: string;
  cellBackgroundColor?: string;
}
interface CellPropertiesProviderProps {
  cellProperties?: CellPropertiesTypes;
  setCellProperties?: Dispatch<SetStateAction<CellPropertiesTypes | undefined>>;
}

export const CellPropertiesContext = createContext<CellPropertiesProviderProps>(
  {}
);

export const CellPropertiesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [cellProperties, setCellProperties] = useState<CellPropertiesTypes>();
  return (
    <CellPropertiesContext.Provider
      value={{ cellProperties, setCellProperties }}
    >
      {children}
    </CellPropertiesContext.Provider>
  );
};
