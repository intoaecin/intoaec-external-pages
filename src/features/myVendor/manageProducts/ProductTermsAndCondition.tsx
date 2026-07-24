import { ChooseTermsAndConditionsModal } from "@/features/components/Modal/Proposal/ChooseTermsAndConditionsModal";

import { PlateProvider } from "@/features/components/providers/PlateProvider";
import { useProdcutData } from "@/features/components/providers/ProductandServiceProvider/CreateProductProvider";
import { PlateEditorCustomToolBar } from "@/components/custom-toolbar";
import PlateEditor from "@/components/plate-editor";
import { Box, Button, Divider, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const ProductsTermsAndConditions = (isEdit: { isEdit: boolean }) => {
  const termsAndConditionsModalRef = useRef<any>();
  const { createProductData, setCreateProductData } = useProdcutData();
  const { t } = useTranslation();

  return (
    <div className="mt-5 pb-5">
      {/* <ChooseTermsAndConditionsModal
        ref={termsAndConditionsModalRef}
        withoutUniqueController
        onChange={(id, ind, value) => {
          console.log(value?.value);
          setCreateProductData?.((prev: any) => ({
            ...prev,
            productNotes: value?.value,
          }));
        }}
      /> */}
      <Box>
        <Typography
          sx={{ color: (theme) => theme.palette.primary.main }}
          className="fs-7 fw-500"
        >
          {t("myInventory.additonalNotes")}
        </Typography>
        <PlateProvider>
          <Box
            sx={{
              bgcolor: "white",
              "& .tw-relative": {
                position: "static !important",
              },
            }}
            className="border my-2 w-100"
          >
            <PlateEditor
              editorHeight={"50px"}
              id="terms-and-conditions-create-preview"
              intialValue={
                isEdit
                  ? typeof createProductData?.productNotes != "string"
                    ? createProductData?.productNotes
                    : []
                  : createProductData?.productNotes
              }
              value={
                isEdit
                  ? typeof createProductData?.productNotes != "string"
                    ? createProductData?.productNotes
                    : []
                  : createProductData?.productNotes
              }
              onChange={(value) => {
                setCreateProductData?.((prev: any) => ({
                  ...prev,
                  productNotes: value,
                }));
              }}
            />
            {/* <div className="d-flex w-full row justify-content-between tw-py-1"> */}
            {/* <PlateEditorCustomToolBar hideEmoji /> */}
            {/* <Box className="mr-1"> */}
            {/* <Button
                  variant="contained"
                  onClick={() => {
                    termsAndConditionsModalRef?.current?.handleOpen();
                  }}
                >
                  Choose From Template
                </Button> */}
            {/* </Box> */}
            {/* </div> */}
          </Box>
        </PlateProvider>
      </Box>
    </div>
  );
};

export default ProductsTermsAndConditions;
