import { LoadingButton } from "@mui/lab";
import { Button, CircularProgress, Dialog, DialogActions } from "@mui/material";
import React, {
  ReactNode,
  createContext,
  useContext,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
interface ButtonData {
  name: string;
  color: string;
}
export interface DialogContextProps {
  popup: ({
    content,
    title,
  }: {
    content: any;
    title?: React.ReactNode;
    onYes?: () => Promise<void>;
    onNo?: () => Promise<void>;
    buttons?: ButtonPropsType;
    primaryButton?: "Yes" | "No";
    disableBackdropClose?: boolean;
  }) => void;
  setPreventClose: () => void;
  closeModal: () => void;
  setPrimaryButton: React.Dispatch<React.SetStateAction<"Yes" | "No">>;
  setCustomButton: React.Dispatch<
    React.SetStateAction<
      | {
        yes?: {
          text?: string;
          color?: string;
          disable?: boolean;
          visible?: boolean;
          minWidth?: string;
        };
        no?: {
          text?: string;
          color?: string;
          disable?: boolean;
          visible?: boolean;
        };
      }
      | undefined
    >
  >;
}

interface ButtonPropsType {
  yes?: {
    text?: string;
    color?: string;
    disable?: boolean;
    visible?: boolean;
    minWidth?: string;
  };
  no?: {
    text?: string;
    color?: string;
    disable?: boolean;
    visible?: boolean;
  };
}

const DialogContext = createContext<DialogContextProps>({
  popup: ({ content }) => { },
  closeModal: () => { },
  setPreventClose: () => { },
  setPrimaryButton: () => { },
  setCustomButton: () => { },
});

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<any>();
  const [title, setTitle] = useState<React.ReactNode>();
  const [doOnyes, setOnYes] = useState<() => Promise<void>>();
  const [doOnNo, setOnNo] = useState<() => Promise<void>>();
  const [btnLoading, setBtnLoading] = useState(false);
  // const [preventClosemodal, setpreventclose] = useState(false);
  const [primaryButton, setPrimaryButton] = useState<"Yes" | "No">("Yes");
  const [customButton, setCustomButton] = useState<ButtonPropsType>();
  const [disableBackdropClose, setDisableBackdropClose] = useState(false);
  const preventClose = useRef<any>();

  const handleOpen = () => {
    setOpen(true);
  };

  const popup = ({
    content,
    title,
    onNo,
    onYes,
    buttons,
    primaryButton,
    disableBackdropClose: disableBackdropCloseProp,
  }: {
    content: React.ReactNode;
    title?: React.ReactNode;
    onYes?: () => Promise<void>;
    onNo?: () => Promise<void>;
    buttons?: ButtonPropsType;
    primaryButton?: "Yes" | "No";
    disableBackdropClose?: boolean;
  }) => {
    setContent(content);
    setTitle(title);
    setDisableBackdropClose(Boolean(disableBackdropCloseProp));
    if (buttons) {
      setCustomButton(buttons);
    }
    if (primaryButton) {
      setPrimaryButton(primaryButton);
    }
    if (onYes) {
      setOnYes(() => onYes);
    }
    setOnNo(() => onNo);
    handleOpen();
  };

  const closeModal = () => {
    // setpreventclose(true);
    preventClose.current = false;
    setOpen(false);
    setDisableBackdropClose(false);
    setTimeout(() => {
      setCustomButton(undefined);
    }, 10);
  };

  const setPreventClose = () => {
    preventClose.current = true;
    // setpreventclose(true);
  };

  // useEffect(() => {
  //   if (open) {
  //     document.documentElement.style.overflow = "hidden";
  //   } else {
  //     document.documentElement.style.overflow = "";
  //   }

  //   // Clean up the style when the component unmounts
  //   return () => {
  //     document.documentElement.style.overflow = "";
  //   };
  // }, [open]);

  return (
    <DialogContext.Provider
      value={{
        popup,
        closeModal,
        setPreventClose,
        setPrimaryButton,
        setCustomButton,
      }}
    >
      <Dialog
        open={open}
        // disableScrollLock
        onClose={(_, reason) => {
          if (
            disableBackdropClose &&
            (reason === "backdropClick" || reason === "escapeKeyDown")
          ) {
            return;
          }
          closeModal();
        }}
        sx={{
          textAlign: "center",
          "& .MuiDialog-paper": {
            overflow: "visible",
          },
          "& .MuiTypography-root": {
            padding: "5px 10px",
          },
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
{/* <DialogTitle id="alert-dialog-title" className="border-bottom"> */}
         {title}
         {/* </DialogTitle> */}
         {content}
         {/* </DialogTitle> */}
        {/* <DialogContent></DialogContent> */}
        <DialogActions className="justify-content-around mb-2 mt-1">
          <Button
            variant={primaryButton === "No" ? "contained" : "outlined"}
            disabled={customButton?.no?.disable ?? false}
            color={primaryButton === "No" ? "primary" : "error"}
            sx={{
              width: "174px",
              height: "48px",
              display: customButton?.no?.visible === false ? "none" : "",
              bgcolor: customButton?.yes?.color,
            }}
            onClick={async () => {
              setBtnLoading(false);
              if (doOnNo) await doOnNo();
              closeModal();
            }}
          >
            {customButton?.no?.text ?? t("common.no")}
          </Button>
          <LoadingButton
            loading={btnLoading}
            loadingIndicator={
              <CircularProgress size={16} color="inherit" />
            }
            disabled={customButton?.yes?.disable ?? false}
            variant={primaryButton === "Yes" ? "contained" : "outlined"}
            color={primaryButton === "Yes" ? "primary" : "error"}
            sx={{
              minWidth: customButton?.yes?.minWidth ?? "174px",
              height: "48px",
              bgcolor: customButton?.no?.color,
            }}
            onClick={async () => {
              setBtnLoading(true);
              if (doOnyes) await doOnyes();
              setBtnLoading(false);
              if (preventClose.current == undefined) {
                closeModal();
              }
              if (preventClose.current == false) {
                closeModal();
              } else {
                handleOpen();
              }
            }}
          >
            {customButton?.yes?.text ?? t("common.yes")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
      {children}
    </DialogContext.Provider>
  );
};
export const useDialog = () => useContext(DialogContext);
