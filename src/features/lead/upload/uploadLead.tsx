import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import { UIHoverTitle } from "@/features/components/HelperComponents/UIHoverTitle";
import { UIPrimaryContainedButton } from "@/features/components/HelperComponents/UIPrimaryContainedButton";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import UploadIcon from "@/assets/icons/upload-icon";
import { clientTabs, tabs } from "@/lib/constants";
import { readexcelAndReturnLeads } from "@/lib/helpers";
import { VisuallyHiddenInput } from "@/pages/leadmanager/upload";
import { LeadTypes } from "@/types";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useEnv } from "@/features/hooks/useEnv";
import { settings } from "nprogress";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

interface UploadLeadProps {
  isClient?: boolean;
}
const UploadedLead = ({ isClient }: UploadLeadProps) => {
  const LEAD_UPLOAD_RESULT_STORAGE_KEY = "leadUploadResult";
  console.log("uploaded lead component");
  const { push, back, query } = useRouter();
  const [data, setData] = useState<any>([]);
  const { t } = useTranslation();
  //upload API for lead
  // console.log("upload lead query", query.uploadedData);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUploadResult = sessionStorage.getItem(
      LEAD_UPLOAD_RESULT_STORAGE_KEY
    );
    if (storedUploadResult) {
      try {
        setData(JSON.parse(storedUploadResult));
        sessionStorage.removeItem(LEAD_UPLOAD_RESULT_STORAGE_KEY);
        return;
      } catch (error) {
        console.error("Failed to parse lead upload result from storage:", error);
      }
    }

    const encodedQueryData = query?.uploadedData as string | undefined;
    if (!encodedQueryData) {
      return;
    }

    try {
      const decodeUploadedData = atob(encodedQueryData);
      setData(JSON.parse(decodeUploadedData));
    } catch (error) {
      console.error("Failed to parse lead upload result from query:", error);
    }
  }, [query]);
  const successUploads = data.filter(
    (uploads: any) => uploads?.status === "SUCCESS"
  );
  const failureUploads = data.filter(
    (uploads: any) => uploads?.status === "FAILURE"
  );
  const { VITE_USERHUB_ENDPOINT, VITE_LEADMANAGER_ENDPOINT } =
    useEnv();
  const { post, response, error } = useAxiosWithAuth(
    VITE_LEADMANAGER_ENDPOINT + "/create"
  );
  const theme = useTheme();
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadLead = async (queryParameters: Partial<LeadTypes[]>) => {
    const requestData = {
      eventType: "UPLOAD_LEADS",
      leads: [...queryParameters],
      organizationName: session?.["custom:organization_name"],
      isConvertedToClient: isClient ? true : false,
      projectOrigin: isClient ? "CLIENT" : "LEAD",
    };

    setIsUploading(true);
    try {
      const res = await post(
        {
          ...requestData,
        },
        {
          timeout: 300000,
        }
      );
      
      setData(res?.result ?? res?.error);
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
    } finally {
      setIsUploading(false);
    }
  };

  const formatErrorReason = (reason: string, fieldNames: string[]) => {
    // eslint-disable-next-line no-useless-escape
    const nullColumnPattern = /null value in column \"([^\"]+)\"/g;
    const nullColumnMatches = reason.match(nullColumnPattern);

    if (!nullColumnMatches) {
      return "Missing some data";
    }

    const extractedNames = nullColumnMatches
      .map((match) => {
        // Extract the field name from the matched string
        const matchResult = nullColumnPattern.exec(match);
        if (matchResult && matchResult.length > 1) {
          const fieldName = matchResult[1];
          return fieldNames.includes(fieldName) ? fieldName : null; // Check if it's a desired field
        }
        return null;
      })
      .filter((name) => name !== null); // Remove any null values (fields not in fieldNames)

    return extractedNames.length > 0
      ? extractedNames.join(", ") + " column is empty."
      : "No matching null column names found.";
  };

  // only projectType and projectLocation fiedls are now mathced other name to be change as per the error name
  const fieldNames = [
    "projectType",
    "leadName",
    "email",
    "mobile",
    "address",
    "city",
    "country",
    "state",
    "zipcode",
    "source",
    "projectLocation",
    "projectArea",
  ];

  // const data = [
  //   { sheetNo: "01", status: "Success", reason: "Lease uploaded successfully" },
  //   {
  //     sheetNo: "02",
  //     status: "Success",
  //     reason: "Lead number - ME 12 Duplicate",
  //   },
  //   { sheetNo: "03", status: "Success", reason: "Lease uploaded successfully" },
  //   { sheetNo: "04", status: "Success", reason: "Lease uploaded successfully" },
  //   {
  //     sheetNo: "05",
  //     status: "Success",
  //     reason: "Lead number - ME 12 Duplicate",
  //   },
  //   { sheetNo: "06", status: "Success", reason: "Lease uploaded successfully" },
  //   { sheetNo: "07", status: "Success", reason: "Lease uploaded successfully" },
  //   {
  //     sheetNo: "08",
  //     status: "Success",
  //     reason: "Lead number - ME 12 Duplicate",
  //   },
  //   { sheetNo: "09", status: "Success", reason: "Lease uploaded successfully" },
  //   // Add more data as needed
  // ];

  const handleFileUpload = async (e: any) => {
    if (e.target) {
      const transformedData: any = await readexcelAndReturnLeads(
        e.target.files[0]
      );
      console.log("Uploaded Data: ", transformedData);
      uploadLead(transformedData).finally(() => {
        // e.currentTarget.value = null;
      });
    }
  };

  return (
    <div
      className="container"
      style={{
        backgroundImage: `url(/images/create-lead-Background.svg)`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        height: "100%",
      }}
    >
      <div className="ml-2 mt-2">
        <IconButton
          className="backButtonUI"
          onClick={() => back()}
          aria-label="delete"
        >
          <ArrowBackIosNewIcon />
          <span className="ml-1">{t("common.back")}</span>
        </IconButton>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-12 col-sm-12">
          <Box
            sx={{
              borderRadius: "10px",
              background: "#ffffff",
              boxShadow: "0px 8px 32px 0px rgba(0, 0, 0, 0.12)",
            }}
          >
            <Box>
              <div
                className="border-bottom pr-2 pt-2 row"
                style={{ position: "relative" }}
              >
                <UIHoverTitle
                  title={
                    isClient
                      ? t("leadUpload.uploadedClients")
                      : t("leadUpload.uploadedLeads")
                  }
                />

                <div style={{ position: "absolute", top: 10, right: 10 }}>
                  <UIPrimaryContainedButton
                    startIcon={
                      <UploadIcon
                        style={{
                          width: "16px",
                          height: "16px",
                          fill: "#ffffff",
                        }}
                      />
                    }
                    component="label"
                    loading={isUploading}
                  >
                    {t("common.upload")}
                    <VisuallyHiddenInput
                      type="file"
                      accept=".xlsx"
                      disabled={isUploading}
                      onChange={handleFileUpload}
                    />
                  </UIPrimaryContainedButton>
                </div>
              </div>
              <div className="container">
                <div className="row ">
                  <div className="col-12 px-4 ">
                    <div className="mt-3">
                      <Typography variant="caption">
                        {t("leadUpload.leadUploadSummary")}
                      </Typography>
                      <TableContainer
                        className="my-3"
                        sx={{ boxShadow: "0px 1px 10px rgba(0,0,0,12%)" }}
                        component={Paper}
                      >
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                {t("leadUpload.noOfUploads")}
                              </TableCell>
                              <TableCell align="right">
                                {t("leadUpload.success")}
                              </TableCell>
                              <TableCell align="right">
                                {t("leadUpload.error")}
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {data.length}
                              </TableCell>
                              <TableCell align="right">
                                {successUploads.length}
                              </TableCell>
                              <TableCell align="right">
                                {failureUploads.length}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                    <div className="mt-3">
                      <Typography variant="caption">
                        {t("leadUpload.uploadStatus")}
                      </Typography>
                      <Paper
                        className="my-3"
                        sx={{
                          width: "100%",
                          boxShadow: "0px 1px 10px rgba(0,0,0,12%)",
                        }}
                      >
                        <TableContainer
                          sx={{ maxHeight: 440, overflowX: "hidden" }}
                        >
                          <Table
                            stickyHeader
                            sx={{ minWidth: 650 }}
                            aria-label="simple table"
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell>
                                  {t("leadUpload.sheetRowNo")}
                                </TableCell>
                                <TableCell align="right">
                                  {t("leadUpload.status")}
                                </TableCell>
                                <TableCell align="right">
                                  {t("leadUpload.reason")}
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {data.map((row: any, index: number) => (
                                <TableRow
                                  key={row.sheetNo}
                                  sx={{
                                    "&:last-child td, &:last-child th": {
                                      border: 0,
                                    },
                                  }}
                                >
                                  <TableCell component="th" scope="row">
                                    {index + 1}
                                  </TableCell>
                                  <TableCell align="right">
                                    {row.status == "SUCCESS" ? (
                                      <span
                                        style={{
                                          color: theme?.palette?.success?.main,
                                        }}
                                      >
                                        {t("leadUpload.success")}
                                      </span>
                                    ) : (
                                      <span style={{ color: "red" }}>
                                        {t("leadUpload.failure")}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {row.status == "SUCCESS" ? (
                                      <span
                                        style={{
                                          color: theme?.palette?.success?.main,
                                        }}
                                      >
                                        {isClient ? "Client" : "Lead"}{" "}
                                        {t("leadUpload.uploadedSuccessfully")}
                                      </span>
                                    ) : (
                                      <span style={{ color: "red" }}>
                                        {row?.error}
                                        {/* {formatErrorReason(
                                          row.error,
                                          fieldNames
                                        )} */}
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    </div>
                    <div className="text-center mb-3">
                      <UIPrimaryContainedButton
                        onClick={() => {
                          if (isClient) {
                            push({
                              pathname: "/client",
                              query: clientTabs[0].query,
                            });
                          } else {
                            push({
                              pathname: "/leadmanager/master",
                              query: tabs[0].query,
                            });
                          }
                        }}
                      >
                        {isClient
                          ? t("leadUpload.viewClient")
                          : t("leadUpload.viewLead")}
                      </UIPrimaryContainedButton>
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default UploadedLead;
