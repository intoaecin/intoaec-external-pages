import SessionTimeOutIcon from "@/assets/icons/sessionTimeout-icon";
import { Box, Modal, Typography } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { ReactNode, createContext, useState, useEffect } from "react";
import { UISecondaryOutlinedButton } from "../HelperComponents/UISecondaryOutlinedButton";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

interface AxiosProviderProps {
  url?: string;
  popupSessionTimeout: () => Promise<void>;
}

export const AxiosContext = createContext<AxiosProviderProps>({
  popupSessionTimeout: async () => {},
});

export const AxiosProvider = ({
  children,
  url,
}: {
  children: ReactNode;
  url?: string;
}) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: session } = useSession();

  const popupSessionTimeout = async () => {
    if (
      !pathname?.includes("auth") &&
      !pathname?.startsWith("/leadCapture") &&
      !pathname?.startsWith("/leadCaptureV2") &&
      !pathname?.startsWith("/leadQuestionnaireCapture") &&
      !pathname?.startsWith("/architectAvailableSlots") &&
      !pathname?.startsWith("/reportsPage") &&
      !pathname?.startsWith("/leadQuestionnairePreview") &&
      !pathname?.startsWith("/proposal") &&
      !pathname?.startsWith("/subscription/payment-success") &&
      !pathname?.startsWith("/subscription/payment-failed") &&
      !pathname?.startsWith("/boq/boqexport") &&
      !pathname?.startsWith("/client-boq") &&
      !pathname?.startsWith("/client-selection") &&
      !pathname?.startsWith("/client-receipt") &&
      !pathname?.startsWith("/client-invoice") &&
      !pathname?.startsWith("/client-report") &&
      !pathname?.startsWith("/client-credit-note") &&
      !pathname?.startsWith("/po-preview") &&
      !pathname?.startsWith("/poexport") &&
      !pathname?.startsWith("/rfq-preview") &&
      !pathname?.startsWith("/editor") &&
      !pathname?.startsWith("/subscription/checkout-payment") &&
      !pathname?.startsWith("/subscription/addCard") &&
      !pathname?.startsWith("/invoicePayments/checkout-payment") &&
      !pathname?.startsWith("/invoicePayments/payment-success") &&
      !pathname?.startsWith("/invoicePayments/payment-failed") &&
      !pathname?.startsWith("/rfqexport") &&
      !pathname?.startsWith("/client-rfqexport") &&
      !pathname?.startsWith("/client-refund")
    ) {
      setOpen(true);
      return await new Promise<void>((resolve, reject) => {});
    }
  };

  useEffect(() => {
    if (session?.error === "Refreshtoken expired") {
      popupSessionTimeout();
    }
  }, [session]);


  return (
    <AxiosContext.Provider value={{ url, popupSessionTimeout }}>
      {/* <Modal open={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 5,
          }}
        >
          <Typography>Session timed out. Please sign in again</Typography>
          <UIPrimaryContainedButton
            onClick={async () => {
              await signOut({ callbackUrl: "/auth/signIn" }).finally(() => {
                setOpen(false);
              });
            }}
          >
            Sign In
          </UIPrimaryContainedButton>
        </Box>
      </Modal> */}
      <Modal open={open}>
        <Box
          className="pb-3"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <p className="fw-600 fs-6 border-bottom w-100 text-center pb-2">
            {t("common.sessionRenewal")}
          </p>
          <SessionTimeOutIcon style={{ width: "30px", height: "60px" }} />
          <Typography className="fs-8 py-2 px-2">
            {t("common.sessionTimeout")} <span className="fs-7">⏰</span>{" "}
            <br></br>
            {t("common.sessionTimeoutWarning")}
          </Typography>
          <UISecondaryOutlinedButton
            sx={{
              border: "1px solid red",
              color: "red",
              ":hover": {
                color: "red",
                border: "1px solid red",
              },
            }}
            onClick={async () => {
              await signOut({ callbackUrl: "/auth/signIn" }).finally(() => {
                setOpen(false);
              });
            }}
          >
            {t("common.signOut")}
          </UISecondaryOutlinedButton>
        </Box>
      </Modal>
      {children}
    </AxiosContext.Provider>
  );
};
