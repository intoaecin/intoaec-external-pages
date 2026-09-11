import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import CloseIcon from "@/assets/icons/close-icon";
import NoDataColorIcon from "@/assets/icons/noDataColor-icon";
import { fetchContentFromS3, formatSeedValues } from "@/lib/helpers";
import { routeList } from "@/lib/routeList";
import { LoadingButton } from "@mui/lab";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useRouter } from "next/router";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const ChooseTermsAndConditionsModal = forwardRef(
  (
    {
      onChange,
      withoutUniqueController,
    }: {
      onChange: (id: string, pageIndex: number, value: any) => void;
      withoutUniqueController?: boolean;
    },

    ref
  ) => {
    const [open, setOpen] = useState(false);

    const [uniqueControllerId, setControllerId] = useState<string>();
    const [pageIndex, setPageIndex] = useState<number>();
    const [termsAndConditionUrl, setTermsAndConditionUrl] = useState<string>();
    const [controller, setController] = useState<any>();

    const [termsAndConditionData, setTermsAndConditionData] = useState<any>();
    const router = useRouter();

    const handleOpen = () => {
      setTermsAndConditionUrl(undefined);
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };

    const { VITE_USERHUB_ENDPOINT } = useEnv();
    const { post } = useAxiosWithAuth(
      VITE_USERHUB_ENDPOINT + "/terms-and-conditions"
    );

    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();
    useEffect(() => {
      fetchTermsAndCondition();
    }, []);

    //fetch Taxes
    const fetchTermsAndCondition = async () => {
      const requestData = {
        eventType: "FETCH_TERMS_AND_CONDITIONS",
        isVisible: true,
      };
      const response = await post(requestData);

      if (response?.code === "TERMS_AND_CONDTITION_FETCH_SUCCESSFUL") {
        setTermsAndConditionData(response?.body?.result);
      } else {
        if (response?.error) {
          toast.error(response?.error?.message ?? response?.error);
        } else {
          toast.error("Some error occured");
        }
      }
    };

    const fetchTermsAndConditionsTextValue = async (s3Link: string) => {
      try {
        return JSON.parse(await fetchContentFromS3(s3Link));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    useImperativeHandle(ref, () => ({
      handleClose,
      handleOpen,
      setControllerId,
      setPageIndex,
      setController,
    }));

    return (
      <Dialog
        disableScrollLock
        open={open}
        maxWidth={"lg"}
        onClose={() => {
          handleClose();
        }}
      >
        <DialogTitle className="text-center">
          {t("templateCenter.proposal.addTermsAndConditions")}
          <span style={{ position: "absolute", right: 0 }}>
            <IconButton className="mr-1" onClick={handleClose}>
              <CloseIcon
                style={{ width: "20px", height: "20px", fill: "#ccc" }}
              />
            </IconButton>
          </span>
        </DialogTitle>
        <Divider />
        {termsAndConditionData?.length === 0 ? (
          <div className="p-3 mx-4">
            <NoDataColorIcon style={{ width: "300px", height: "300px" }} />
            <div className="text-center">
              <span className="fw-600">
                {t("common.noTermsAndConditionsFound")}
              </span>
            </div>

            <div
              onClick={() => {
                router.push({
                  pathname:
                    routeList.TEMPLATE_CENTER.path +
                    routeList.TEMPLATE_CENTER.childPaths.termsAndConditions
                      .path,
                });
              }}
              style={{ color: "primary.main", cursor: "pointer" }}
              className="mt-1 text-center"
            >
              {t("svg.clickHere")}&nbsp;
              <span className="text-dark">
                {t("common.toAddTermsAndConditions")}
              </span>
            </div>
          </div>
        ) : (
          <>
            <DialogContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead
                    sx={{
                      backgroundColor: "primary.main",
                      "& .MuiTableCell-head": {
                        color: "#FFFFFF",
                        padding: "10px",
                      },
                      "& .MuiTableCell-Root": { padding: "0px" },
                    }}
                  >
                    <TableRow>
                      <TableCell
                        style={{ width: "20px", textAlign: "left" }}
                      ></TableCell>
                      <TableCell style={{ width: "150px", textAlign: "left" }}>
                        {t("table.templateName")}
                      </TableCell>
                      <TableCell
                        style={{ width: "150px", textAlign: "center" }}
                      >
                        {t("table.templateCategory")}
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody
                    role="radiogroup"
                    aria-label={t("templateCenter.proposal.addTermsAndConditions")}
                    sx={{ "& .MuiTableCell-root": { padding: "8px" } }}
                  >
                    {termsAndConditionData?.map((row: any) => (
                      <TableRow key={row?.termsAndConditionId}>
                        <TableCell>
                          <Radio
                            name="terms-and-conditions-template"
                            checked={
                              termsAndConditionUrl ===
                              row.termsAndConditionContentUrl
                            }
                            onChange={() => {
                              setTermsAndConditionUrl(
                                row.termsAndConditionContentUrl
                              );
                            }}
                            value={row.termsAndConditionContentUrl}
                            inputProps={{
                              "aria-label": row?.termsAndConditionName,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <span>{row?.termsAndConditionName}</span>
                        </TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          {formatSeedValues(row?.termsAndConditionCategory)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions className="justify-content-center">
              <div className="d-flex justify-content-center my-2">
                <LoadingButton
                  variant="contained"
                  disabled={!termsAndConditionUrl}
                  sx={{
                    // "&.MuiButton-contained": {
                    borderRadius: "0",
                    boxShadow: "none",
                    width: "200px",
                    height: "50px",
                    bgcolor: "primary.main",
                    // },
                  }}
                  loading={loading}
                  onClick={async () => {
                    if (
                      termsAndConditionUrl &&
                      (withoutUniqueController ||
                        (uniqueControllerId && pageIndex !== undefined))
                    ) {
                      setLoading(true);
                      fetchTermsAndConditionsTextValue(termsAndConditionUrl)
                        .then((data) => {
                          onChange?.(uniqueControllerId ?? "", pageIndex ?? 0, {
                            ...controller,
                            controllerId: uniqueControllerId,
                            value: data,
                          });
                        })
                        .finally(() => {
                          setLoading(false);
                          setOpen(false);
                        });
                    }
                  }}
                >
                  {t("common.add")}
                </LoadingButton>
              </div>
            </DialogActions>
          </>
        )}
      </Dialog>
    );
  }
);

ChooseTermsAndConditionsModal.displayName = "ChooseTermsAndConditionsModal";
