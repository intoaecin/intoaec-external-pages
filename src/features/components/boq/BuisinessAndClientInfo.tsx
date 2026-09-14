import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import EstimateEmailIcon from "@/assets/icons/BoqLeadPreviewIcon/email-icon";
import LocationIcon from "@/assets/icons/BoqLeadPreviewIcon/localtion-icon";
import OrganizationIcon from "@/assets/icons/BoqLeadPreviewIcon/organization-icon";
import WebsiteIcon from "@/assets/icons/BoqLeadPreviewIcon/webiste-icon";
import TaxIcon from "@/assets/icons/tax-icon";
import UserIcon from "@/assets/icons/user-icon";
import PhoneIcon from "@/assets/phoneNumber-icon";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";

import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
// import NextImage from "../NextImage";

const BusinessAndClientInfo = ({
  type,
  projectId,
  organizationId,
  withAuth,
  defaultClientDetails,
  defaultOrganizationDetails,
  pdf,
  onChangeIsTaxDisplay,
  vendor,
  defaultReceiverDetails,
  isTaxDisplay,
  isPreview = false,
  Display = true,
  fullWidth = false,
  singleRow = false,
}: {
  type: "CLIENT" | "ADMIN";
  projectId: string;
  organizationId: string;
  withAuth: boolean;
  defaultOrganizationDetails?: {
    organizationName?: string;
    organizationWebsite?: string;
    organizationLocation?: string;
    mobileNumber?: string;
    emailId?: string;
    organizationLogo?: string;
    logoUrl?: string;
    taxId?: string;
    taxName?: string;
  };
  defaultReceiverDetails?: {
    organizationName?: string;

    organizationLocation?: string;
    mobileNumber?: string;
    emailId?: string;
  };
  defaultClientDetails?: {
    clientName?: string;
    clientEmailAddress?: string;
    clientContactNumber?: string;
    clientLocation?: string;
  };
  vendor?: boolean;
  pdf?: boolean;
  isTaxDisplay?: boolean;
  onChangeIsTaxDisplay?: (value: boolean) => void;
  isPreview?: boolean;
  Display?: boolean;
  fullWidth?: boolean;
  singleRow?: boolean;
}) => {
  const { t } = useTranslation();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT, NEXT_PUBLIC_LEADMANAGER_ENDPOINT } =
    useEnv();
  const [organizationDetails, setOrganizationDetails] = useState<{
    organizationName?: string;
    organizationWebsite?: string;
    organizationLocation?: string;
    mobileNumber?: string;
    emailId?: string;
    organizationLogo?: string;
    taxId?: string;
    taxName?: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [clientDetails, setClientDetails] = useState<{
    clientName?: string;
    clientEmailAddress?: string;
    clientContactNumber?: string;
    clientLocation?: string;
  }>();

  const [receiverOrganizationDetails, setReceiverOrganizationDetails] =
    useState<{
      organizationName?: string;

      organizationLocation?: string;
      mobileNumber?: string;
      emailId?: string;
    }>();
  const [isDimmed, setIsDimmed] = useState(!isTaxDisplay);

  useEffect(() => {
    setIsDimmed(!isTaxDisplay);
  }, [isTaxDisplay]);

  const isVendor = vendor ? true : false;
  const { post: fetchOrganization } = useAxios(
    `${NEXT_PUBLIC_USERHUB_ENDPOINT}/organization`,
    withAuth,
  );
  const { post: fetchUserHub } = useAxios(
    `${NEXT_PUBLIC_USERHUB_ENDPOINT}/myorganization`,
    withAuth,
  );
  const { post: fetchUserHubOrg } = useAxios(
    `${NEXT_PUBLIC_USERHUB_ENDPOINT}/organization`,
    withAuth,
  );
  const { post: fetchOrganizationSuperAdmin } = useAxios(
    `${NEXT_PUBLIC_USERHUB_ENDPOINT}/session`,
    withAuth,
  );

  const { post } = useAxios<any>(
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/fetch",
    withAuth,
  );

  const resolvedTaxName =
    organizationDetails?.taxName?.trim() ||
    defaultOrganizationDetails?.taxName?.trim() ||
    "-";

  const resolvedTaxId =
    organizationDetails?.taxId?.trim() ||
    defaultOrganizationDetails?.taxId?.trim() ||
    "-";

  // Toggle on icon click
  const handleToggleTax = () => {
    setIsDimmed(!isDimmed);
    onChangeIsTaxDisplay?.(isDimmed);
  };

  const fetchReceiverOrganizationDetails = async (organizationId: string) => {
    setLoading(true);
    try {
      const response = await fetchOrganization({
        eventType: "GET_ORGANIZATION_DETAILS",
        organizationId: organizationId,
      });
      if (response?.code === "ORGANIZATION_DETAILS_RETRIEVED") {
        setReceiverOrganizationDetails({
          organizationName: response?.body?.organizationName,
          mobileNumber: response?.body?.superAdmin?.mobile,
          emailId: response?.body?.superAdmin?.email,
          organizationLocation: response?.body?.organizationAddressInfo?.city,
        });
      }
    } catch (error) {
      console.log("SADKJH::", error);
    }
  };
  // const { data: receiverOrganizationDetails } = useOrganizationDetails({
  //   organizationId: projectId,
  // });

  const fetchOrganizationDetails = async (organizationId: string) => {
    try {
      const requestData: any = {
        eventType: "FETCH_ORGANIZATION_SOCIAL_MEDIA",
        // estimateId: "fc4ede06-1d18-435b-b1e7-8ee65f8f3494",
        senderId: organizationId,
      };
      const data: any = await fetchUserHub(requestData);
      // console.log(data.body?.Organizations_logoUrl, "organization detail");
      if (data.code === "ORGANIZATION_SOCIAL_MEDIA_FETCH_SUCCESS") {
        setOrganizationDetails((prev) => ({
          ...(prev ?? {}),
          organizationName: data.body.organizationName,
          organizationWebsite: data.body.websiteOrBlog,
          organizationLogo:
            data.body?.Organizations_logoUrl ?? data.body?.org_logoUrl,
          taxId: data.body.taxId,
          taxName: data.body.taxName,
        }));
      }
    } catch (error: any) {
      console.log("SADKJH::", error);
    }
  };

  const fetchOrganizationAddressDetails = async (organizationId: string) => {
    try {
      const requestData: any = {
        eventType: "GET_ORGANIZATION_ADDRESS_INFO",
        // estimateId: "fc4ede06-1d18-435b-b1e7-8ee65f8f3494",
        senderId: organizationId,
      };
      const data: any = await fetchUserHubOrg(requestData);

      if (data.code === "ORGANIZATION_DETAILS_RETRIEVED") {
        setOrganizationDetails((prev) => ({
          ...(prev ?? {}),
          organizationLocation: data.body?.city,
        }));
      }
    } catch (error: any) {
      console.log("SADKJH::", error);
    }
  };
  const fetchOrganizationSuperAdminDetails = async (organizationId: string) => {
    try {
      const requestData: any = {
        eventType: "GET_ORGANIZATION_SUPER_USER",
        // estimateId: "fc4ede06-1d18-435b-b1e7-8ee65f8f3494",
        organizationId,
      };
      const data: any = await fetchOrganizationSuperAdmin(requestData);

      if (data.code === "ORGANIZATION_SUPER_USER_DETAILS_RETRIEVED") {
        setOrganizationDetails((prev) => ({
          ...(prev ?? {}),
          emailId: data.body[0]?.emailId,
          mobileNumber: data.body[0]?.mobileNumber,
        }));
      }
    } catch (error: any) {
      console.log("SADKJH::", error);
    }
  };
  const fetchData = async (projectId: string) => {
    try {
      const data = await post({ eventType: "GET_LEAD_BY_ID", projectId });
      console.log("Fetch after update status ssss ss business", data);
      if (data.code === "LEAD_RETRIEVED") {
        setClientDetails((prev) => ({
          ...(prev || {}),
          clientName: data.body.lead.leadName,
          clientEmailAddress: data.body.lead.leadEmail,
          clientContactNumber: data.body.lead.leadMobile,
          clientLocation: data.body.lead.leadCity,
        }));
      }
    } catch (error: any) {
      console.log("SADKJH::", error);
    }
  };
  // const updateOrganizationDetailState = () => {
  //   setOrganizationDetails((prev) => ({
  //     ...(prev ?? {}),
  //     organizationLocation: org?.address,
  //     organizationName: org?.organizationName,
  //     organizationWebsite: org?.website,
  //   }));
  // };
  // console.log(organizationDetails, "organization detail sinfor");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        await fetchOrganizationDetails(organizationId);
        await fetchOrganizationAddressDetails(organizationId);
        await fetchOrganizationSuperAdminDetails(organizationId);
        if (isVendor) {
          await fetchReceiverOrganizationDetails(projectId);
        } else {
          await fetchData(projectId);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    if (
      !defaultOrganizationDetails ||
      !defaultClientDetails ||
      !defaultReceiverDetails
    ) {
      fetchDetails();
    } else {
      console.log(
        "ASDKDSA",
        defaultClientDetails,
        defaultOrganizationDetails,
        defaultReceiverDetails,
      );
      setClientDetails(defaultClientDetails);
      setOrganizationDetails(defaultOrganizationDetails);
      setReceiverOrganizationDetails(defaultReceiverDetails);
    }
  }, [
    organizationId,
    projectId,
    defaultOrganizationDetails,
    defaultClientDetails,
  ]);
  // PDF export fetches SSR HTML; MUI `sx`/Emotion styles are often missing there.
  // Keep critical layout on inline styles + utility classes so production PDFs don't collapse.
  const cardWidth = fullWidth ? "49%" : "45%";
  const infoCardStyle: CSSProperties | undefined = pdf
    ? {
        flex: singleRow ? "1 1 0" : undefined,
        width: singleRow ? undefined : cardWidth,
        minWidth: singleRow ? 0 : cardWidth,
        maxWidth: singleRow ? "none" : cardWidth,
        minHeight: "100%",
        borderRadius: "6px",
        border: "2px solid #E4E4E4",
        boxShadow: "4px 4px 10px 0px rgb(0 0 0 / 5%)",
        boxSizing: "border-box",
      }
    : undefined;
  const clientCardStyle: CSSProperties | undefined = pdf
    ? {
        ...infoCardStyle,
        backgroundColor: "#F9F9FA",
        alignSelf: "stretch",
      }
    : undefined;

  return (
    <div>
      <Box
        className={`d-flex align-items-center ${
          singleRow || pdf ? "no-wrap" : "flex-wrap"
        } ${
          fullWidth
            ? "px-0"
            : `px-sm-0 ${pdf ? "px-md-1" : "px-md-3"} px-5`
        } ${singleRow ? "py-0" : "py-2"} gap-2`}
        style={
          pdf
            ? {
                display: "flex",
                alignItems: "stretch",
                flexWrap: singleRow ? "nowrap" : "wrap",
                justifyContent: "space-between",
                gap: "0.5rem",
                width: "100%",
              }
            : undefined
        }
        sx={
          pdf
            ? undefined
            : {
                ...(singleRow ? { flexWrap: "nowrap !important" as const } : {}),
                justifyContent: {
                  xs: "center",
                  sm: "center",
                  md: "space-between",
                },
                rowGap: {
                  xs: ".5rem",
                  md: "0rem",
                },
              }
        }
      >
        <Box
          style={
            pdf
              ? { ...infoCardStyle, padding: "10px 12px" }
              : infoCardStyle
          }
          sx={
            pdf
              ? undefined
              : {
                  minWidth: singleRow
                    ? 0
                    : {
                        xs: "100%",
                        sm: fullWidth ? "49%" : "45%",
                        md: fullWidth ? "49%" : "45%",
                        lg: fullWidth ? "49%" : "45%",
                        xl: fullWidth ? "49%" : "45%",
                      },
                  maxWidth: singleRow
                    ? "none"
                    : {
                        xs: "100%",
                        sm: fullWidth ? "49%" : "45%",
                        md: fullWidth ? "49%" : "45%",
                        lg: fullWidth ? "49%" : "45%",
                        xl: fullWidth ? "49%" : "45%",
                      },
                  flex: singleRow ? "1 1 0" : undefined,
                  minHeight: "100%",
                  maxHeight: "100%",
                  borderRadius: "6px",
                  border: "2px solid #E4E4E4",
                  boxShadow: " 4px 4px 10px 0px rgb(0 0 0 / 5%);",
                }
          }
          className={`bg-white ${pdf ? "" : "p-sm-1 p-md-1 p-2"}`}
        >
          <Typography
            className={`fw-500 ${pdf ? "mb-1" : "mb-sm-1 mb-md-1 mb-2"}`}
          >
            {pdf ? "Business Info" : t("common.businessInfo")}
          </Typography>
          <Box
            className="d-flex align-items-center gap-1"
            style={
              pdf
                ? {
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "100%",
                    minWidth: 0,
                  }
                : undefined
            }
          >
            <Box
              style={
                pdf
                  ? {
                      flex: "0 0 96px",
                      width: "96px",
                      maxWidth: "96px",
                      minWidth: "96px",
                    }
                  : undefined
              }
              sx={
                pdf
                  ? undefined
                  : {
                      minWidth: "25%",
                      minHeight: "25%",
                      maxWidth: "25%",
                      maxHeight: "25%",
                    }
              }
            >
              {loading && !defaultOrganizationDetails ? (
                <Skeleton
                  // className="mr-2  my-2 "
                  variant="rectangular"
                  // width={"100%"}
                  height={"100px"}
                />
              ) : (
                <img
                  src={
                    organizationDetails?.organizationLogo ??
                    defaultOrganizationDetails?.organizationLogo ??
                    "https://img.freepik.com/premium-vector/logo-real-estate-business-with-house-logo-real-estate_642771-165.jpg?w=740"
                  }
                  alt="logo"
                  width="100%"
                  height="100%"
                  style={
                    pdf
                      ? {
                          width: "96px",
                          height: "96px",
                          maxWidth: "96px",
                          objectFit: "contain",
                          display: "block",
                        }
                      : undefined
                  }
                  // loading="lazy"
                />
              )}
            </Box>
            <Box
              className={`d-flex justify-content-between align-items-start ${pdf ? "" : "word-wrap"}`}
              style={
                pdf
                  ? {
                      display: "flex",
                      flexDirection: "column",
                      rowGap: "0.3rem",
                      flex: "1 1 0",
                      minWidth: 0,
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }
                  : undefined
              }
              sx={
                pdf
                  ? undefined
                  : {
                      flexDirection: "column",
                      rowGap: ".3rem",
                    }
              }
            >
              <Box className="d-flex align-items-center">
                <OrganizationIcon width={"10px"} />
                <Typography className="ml-1 fs-7 fw-500">
                  {loading && !defaultOrganizationDetails ? (
                    <Skeleton
                      // className="mr-2  my-2 "
                      variant="text"
                      width={"100px"}
                    />
                  ) : (
                    (organizationDetails?.organizationName ??
                    defaultOrganizationDetails?.organizationName ??
                    "-")
                  )}
                </Typography>
              </Box>
              <Box
                className={`d-flex align-items-center w-100 ${pdf ? "" : "word-wrap"}`}
              >
                <EstimateEmailIcon width="10px" />
                <Typography className="ml-1 fs-7 fw-500">
                  {loading && !defaultOrganizationDetails ? (
                    <Skeleton
                      // className="mr-2  my-2 "
                      variant="text"
                      width={"100px"}
                    />
                  ) : (
                    (organizationDetails?.emailId ??
                    defaultOrganizationDetails?.emailId ??
                    "-")
                  )}
                </Typography>
              </Box>
              <Box
                className={`d-flex align-items-center w-100 ${pdf ? "" : "word-wrap"}`}
              >
                <PhoneIcon width="10px" />
                <Typography className="ml-1 fs-7 fw-500">
                  {loading && !defaultOrganizationDetails ? (
                    <Skeleton
                      // className="mr-2  my-2 "
                      variant="text"
                      width={"100px"}
                    />
                  ) : (
                    (organizationDetails?.mobileNumber ??
                    defaultOrganizationDetails?.mobileNumber ??
                    "-")
                  )}
                </Typography>
              </Box>
              <Box
                className={`d-flex align-items-center w-100 ${pdf ? "" : "word-wrap"}`}
              >
                <WebsiteIcon width="10px" />
                <Typography
                  className="ml-1 fs-7 fw-500"
                  style={
                    pdf
                      ? {
                          color:
                            organizationDetails?.organizationWebsite?.length ||
                            organizationDetails?.organizationWebsite ||
                            defaultOrganizationDetails?.organizationWebsite
                              ? "#3CA2FF"
                              : "#000000",
                        }
                      : undefined
                  }
                  sx={
                    pdf
                      ? undefined
                      : {
                          color:
                            organizationDetails?.organizationWebsite?.length ||
                            organizationDetails?.organizationWebsite ||
                            defaultOrganizationDetails?.organizationWebsite
                              ? "#3CA2FF"
                              : "#000000",
                        }
                  }
                >
                  {loading && !defaultOrganizationDetails ? (
                    <Skeleton
                      // className="mr-2  my-2 "
                      variant="text"
                      width={"100px"}
                    />
                  ) : organizationDetails?.organizationWebsite?.length ? (
                    organizationDetails?.organizationWebsite
                  ) : (
                    (defaultOrganizationDetails?.organizationWebsite ?? "-")
                  )}
                </Typography>
              </Box>
              <Box
                className={`d-flex align-items-center w-100 ${pdf ? "" : "word-wrap"}`}
              >
                <LocationIcon
                  width="10px"
                  // style={{
                  //   minWidth: "8px",
                  // }}
                />
                <Typography className="ml-1 fs-7 fw-500">
                  {loading && !defaultOrganizationDetails ? (
                    <Skeleton
                      // className="mr-2  my-2 "
                      variant="text"
                      width={"100px"}
                    />
                  ) : (
                    (organizationDetails?.organizationLocation ??
                    defaultOrganizationDetails?.organizationLocation ??
                    "-")
                  )}
                </Typography>
              </Box>
              {Display &&
                (isTaxDisplay || !isPreview || (pdf && isTaxDisplay)) && (
                  <Box
                    className={`d-flex justify-content-between gap-5 align-items-center w-100 ${pdf ? "" : "word-wrap"}`}
                  >
                    <Box className="d-flex align-items-center">
                      <TaxIcon width="10px" />

                      <Typography
                        className="ml-1 fs-7 fw-500"
                        style={{ color: isDimmed ? "#969696" : "" }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          lineHeight: 1.3,
                        }}
                      >
                        {loading && !defaultOrganizationDetails ? (
                          <Skeleton variant="text" width={"100px"} />
                        ) : (
                          <Tooltip
                            title={
                              organizationDetails?.taxName?.trim() ||
                              defaultOrganizationDetails?.taxName?.trim()
                            }
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                cursor: "default",
                              }}
                            >
                              {/* taxName with conditional width */}
                              <span
                                style={{
                                  maxWidth:
                                    (organizationDetails?.taxName?.trim() ||
                                      defaultOrganizationDetails?.taxName?.trim()) &&
                                    (organizationDetails?.taxId?.trim() ||
                                      defaultOrganizationDetails?.taxId?.trim())
                                      ? "150px"
                                      : "auto", // <-- WHEN NO DATA, NO WIDTH LIMIT
                                  display: "inline-block",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {organizationDetails?.taxName &&
                                organizationDetails.taxName.trim() !== ""
                                  ? organizationDetails.taxName
                                  : defaultOrganizationDetails?.taxName &&
                                      defaultOrganizationDetails.taxName.trim() !==
                                        ""
                                    ? defaultOrganizationDetails.taxName
                                    : "-"}
                              </span>

                              {/* colon only when data exists */}
                              {(organizationDetails?.taxName?.trim() ||
                                defaultOrganizationDetails?.taxName?.trim()) &&
                              (organizationDetails?.taxId?.trim() ||
                                defaultOrganizationDetails?.taxId?.trim())
                                ? ":"
                                : ""}

                              {/* taxId with conditional width */}
                              <span
                                style={{
                                  maxWidth:
                                    organizationDetails?.taxId?.trim() ||
                                    defaultOrganizationDetails?.taxId?.trim()
                                      ? "180px"
                                      : "auto", // <-- WHEN EMPTY, NO WIDTH, NO EXTRA SPACE
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                  lineHeight: "1.3",
                                  display: "inline-block",
                                }}
                              >
                                {organizationDetails?.taxId?.trim() ||
                                  defaultOrganizationDetails?.taxId?.trim() ||
                                  "-"}
                              </span>
                            </Box>
                          </Tooltip>
                        )}
                      </Typography>
                    </Box>

                    {!pdf &&
                      !isPreview &&
                      !(resolvedTaxName === "-" && resolvedTaxId === "-") && (
                        <Tooltip
                          title={isDimmed ? t("common.show") : t("common.hide")}
                        >
                          <Box className="d-flex align-items-center">
                            <IconButton
                              onClick={handleToggleTax}
                              sx={{ padding: 0, marginLeft: "auto" }}
                            >
                              {isDimmed ? (
                                <VisibilityOff
                                  sx={{ fontSize: 15, color: "#34AFF9" }}
                                />
                              ) : (
                                <Visibility
                                  sx={{ fontSize: 15, color: "#34AFF9" }}
                                />
                              )}
                            </IconButton>
                          </Box>
                        </Tooltip>
                      )}
                  </Box>
                )}
            </Box>
          </Box>
        </Box>
        <Box
          style={
            pdf
              ? { ...clientCardStyle, padding: "10px 12px" }
              : clientCardStyle
          }
          sx={
            pdf
              ? undefined
              : {
                  minWidth: singleRow
                    ? 0
                    : {
                        xs: "100%",
                        sm: fullWidth ? "49%" : "45%",
                        md: fullWidth ? "49%" : "45%",
                        lg: fullWidth ? "49%" : "45%",
                        xl: fullWidth ? "49%" : "45%",
                      },
                  maxWidth: singleRow
                    ? "none"
                    : {
                        xs: "100%",
                        sm: fullWidth ? "49%" : "45%",
                        md: fullWidth ? "49%" : "45%",
                        lg: fullWidth ? "49%" : "45%",
                        xl: fullWidth ? "49%" : "45%",
                      },
                  flex: singleRow ? "1 1 0" : undefined,
                  borderRadius: "6px",
                  border: "2px solid #E4E4E4",

                  backgroundColor: "#F9F9FA",
                  boxShadow: " 4px 4px 10px 0px rgb(0 0 0 / 5%);",
                  alignSelf: "stretch",
                }
          }
          className={pdf ? "" : "p-sm-1 p-md-1 p-2"}
        >
          <Box
            className={`d-flex justify-content-between align-items-start w-100 ${pdf ? "" : "word-wrap"}`}
            style={
              pdf
                ? {
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "0.3rem",
                    width: "100%",
                    minWidth: 0,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }
                : undefined
            }
            sx={
              pdf
                ? undefined
                : {
                    flexDirection: "column",
                    rowGap: ".3rem",
                  }
            }
          >
            <Typography
              className={`fw-500 ${pdf ? "mb-1" : "mb-sm-1 mb-md-1 mb-2"}`}
            >
              {isVendor
                ? pdf
                  ? "Billed To"
                  : t("common.billedTo")
                : pdf
                  ? "Client Info"
                  : t("common.clientInfo")}
            </Typography>
            <Box className="d-flex align-items-center">
              {isVendor ? (
                <OrganizationIcon width="10px" />
              ) : (
                <UserIcon width="10px" />
              )}
              <Typography
                className="ml-1 fs-7 fw-500"
                style={pdf ? { color: "#192A3E" } : undefined}
                sx={pdf ? undefined : { color: "#192A3E" }}
              >
                {loading && !defaultClientDetails ? (
                  <Skeleton
                    // className="mr-2  my-2 "
                    variant="text"
                    width={"100px"}
                  />
                ) : (
                  (clientDetails?.clientName ??
                  defaultClientDetails?.clientName ??
                  receiverOrganizationDetails?.organizationName ??
                  defaultReceiverDetails?.organizationName ??
                  "-")
                )}
              </Typography>
            </Box>
            <Box
              className={`d-flex align-items-center w-100 ${pdf ? "" : "word-wrap"}`}
            >
              <EstimateEmailIcon width="10px" />
              <Typography
                className="ml-1 fs-7 fw-500 "
                style={pdf ? { color: "#192A3E" } : undefined}
                sx={pdf ? undefined : { color: "#192A3E" }}
              >
                {loading && !defaultClientDetails ? (
                  <Skeleton
                    // className="mr-2  my-2 "
                    variant="text"
                    width={"100px"}
                  />
                ) : (
                  (clientDetails?.clientEmailAddress ??
                  defaultClientDetails?.clientEmailAddress ??
                  receiverOrganizationDetails?.emailId ??
                  defaultReceiverDetails?.emailId ??
                  "-")
                )}
              </Typography>
            </Box>
            <Box
              className={`d-flex align-items-center w-100 ${pdf ? "" : "word-wrap"}`}
            >
              <PhoneIcon width="10px" />
              <Typography
                className="ml-1 fs-7 fw-500"
                style={pdf ? { color: "#192A3E" } : undefined}
                sx={pdf ? undefined : { color: "#192A3E" }}
              >
                {loading ? (
                  <Skeleton
                    // className="mr-2  my-2 "
                    variant="text"
                    width={"100px"}
                  />
                ) : (
                  (clientDetails?.clientContactNumber ??
                  defaultClientDetails?.clientContactNumber ??
                  receiverOrganizationDetails?.mobileNumber ??
                  defaultReceiverDetails?.mobileNumber ??
                  "-")
                )}
              </Typography>
            </Box>
            <Box
              className={`d-flex align-items-center w-100 ${pdf ? "" : "word-wrap"}`}
            >
              <LocationIcon width="10px" />
              <Typography
                className="ml-1 fs-7 fw-500"
                style={pdf ? { color: "#192A3E" } : undefined}
                sx={pdf ? undefined : { color: "#192A3E" }}
              >
                {loading && !defaultClientDetails ? (
                  <Skeleton
                    // className="mr-2  my-2 "
                    variant="text"
                    width={"100px"}
                  />
                ) : (
                  (clientDetails?.clientLocation ??
                  defaultClientDetails?.clientLocation ??
                  receiverOrganizationDetails?.organizationLocation ??
                  defaultReceiverDetails?.organizationLocation ??
                  "-")
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default BusinessAndClientInfo;
