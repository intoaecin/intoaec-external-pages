import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import BoqMaterialCard from "./BoqMaterialCard";

export interface Material {
  _id: string;
  organizationId: string;
  organizationType: string;
  materialName: string;
  materialBrandName?: string;
  itemId: string;
  materialImage?: string;
  materialPrice: number;
  quantity: number;
  unitId: string;
  unitValue: string;
  rate?: string;
  description?: string;
  materialDescription?: string;
  tax: {
    value: number;
    unit: "PERCENTAGE" | string;
  };
  materialId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Scaling {
  value: number;
  unit: string;
}

export interface BoqExportProps {
  libraryItemData: {
    _id: string;
    itemName: string;
    itemId: string;
    unitType: string;
    format: string;
    description: string;
    categoryValue: string;
    categoryId: string;
    subCategoryValue: string;
    subCategoryId: string;
    typeOfWorkValue: string;
    typeOfWorkId: string;
    itemImages: string[];
    organizationId: string;
    organizationType: string;
    materials: Material[];
    scaling: Scaling[];
    itemPrice: number;
    taxesApplied: any[];
    createdAt: number;
    updatedAt: number;
  };
}

const BoqExport = ({ libraryItemData }: BoqExportProps, pdfUrl: any) => {
  return (
    <Box
      sx={{
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      <Box
        className="border-bottom"
        sx={{
          paddingBottom: "5px",
        }}
      >
        <Box className="px-2 pt-1">
          <Typography variant="h5">
            {libraryItemData?.typeOfWorkValue}
          </Typography>
          <Box className="d-flex justify-content-between my-2">
            <Box>
              <Typography>
                Categories:{" "}
                <Typography component="span" className="fs-7 fw-500">
                  {libraryItemData?.categoryValue}
                </Typography>
              </Typography>
            </Box>
            <Box>
              <Typography>
                Sub categories:{" "}
                <Typography component="span" className="fs-7 fw-500">
                  {libraryItemData?.subCategoryValue}
                </Typography>
              </Typography>
            </Box>
            <Box>
              <Typography>
                Type of work:{" "}
                <Typography component="span" className="fs-7 fw-500">
                  {libraryItemData?.typeOfWorkValue}
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box component="main" className="px-2 py-2">
        <Box component="section" className="d-flex border-bottom pb-2">
          <Box
            sx={{
              minWidth: "35%",
              minHeight: "100%",
              boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
              borderRadius: "10px",
              display: "flex",
              padding: 1,
            }}
            className="p-1"
          >
            <Box
              sx={{
                background: "#fff",
                borderRadius: "10px",
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
              className="d-flex flex-wrap"
            >
              {libraryItemData?.itemImages?.map((path: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    flex: "1 1 calc(50% - 8px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                  className="d-flex justify-content-center align-items-center"
                >
                  <img width={100} height={100} src={path} alt="item image" />
                </Box>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              minWidth: "63%",
            }}
            className="p-1"
          >
            <Box className="px-3">
              <Box className="row  border-bottom pb-3">
                <Box className="col-4">
                  <Typography className="fs-8 fw-400 mb-1">
                    Unit type
                  </Typography>
                  <Typography className="fs-7 fw-500">
                    {libraryItemData?.unitType}
                  </Typography>
                </Box>
                <Box className="col-4">
                  <Typography className="fs-8 fw-400 mb-1">Format</Typography>
                  <Typography className="fs-7 fw-500">
                    {libraryItemData?.format}
                  </Typography>
                </Box>
                <Box className="col-4">
                  <Typography className="fs-8 fw-400 mb-1">
                    Display type
                  </Typography>
                  <Typography className="fs-7 fw-500">
                    {/* {"Square Millimeter (mm"}
                    <sup>2</sup>
                    {")"} */}

                    {`${
                      libraryItemData?.scaling?.length === 3
                        ? "Cubic"
                        : libraryItemData?.scaling?.length === 2
                        ? "Square"
                        : "Running"
                    } ${libraryItemData?.unitType}`}
                  </Typography>
                </Box>
              </Box>
              <Box className="pb-3 py-3 ">
                <Box className="row mb-1">
                  <Box className="col-4">
                    <Typography className="fs-8 fw-400 mb-1 ">
                      Length
                      <Typography component={"span"} className="requiredUI">
                        *
                      </Typography>
                    </Typography>
                    <Typography className="fs-7 fw-500 ">
                      {libraryItemData?.scaling
                        ?.filter((scaling) => scaling?.unit === "L")
                        .map((scaling, index) => (
                          <div key={index}>{scaling.value}</div>
                        ))}
                    </Typography>
                  </Box>
                  <Box className="col-4">
                    <Typography className="fs-8 fw-400 mb-1 ">
                      Width
                      <Typography component={"span"} className="requiredUI">
                        *
                      </Typography>
                    </Typography>
                    <Typography className="fs-7 fw-500 ">
                      {libraryItemData?.scaling
                        ?.filter((scaling) => scaling?.unit === "W")
                        .map((scaling, index) => (
                          <div key={index}>{scaling.value}</div>
                        ))}
                    </Typography>
                  </Box>
                  <Box className="col-4">
                    <Typography className="fs-8 fw-400 mb-1 ">
                      Height
                      <Typography component={"span"} className="requiredUI">
                        *
                      </Typography>
                    </Typography>
                    <Typography className="fs-7 fw-500 ">
                      {libraryItemData?.scaling
                        ?.filter((scaling) => scaling?.unit === "H")
                        .map((scaling, index) => (
                          <div key={index}>{scaling.value}</div>
                        ))}
                    </Typography>
                  </Box>
                </Box>
                <Box className="mt-5">
                  <Typography className="mb-1">Description</Typography>
                  <Typography className="fw-500">
                    {libraryItemData?.description}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box component="section" className="py-2">
          <Typography variant="h5" className="mb-2">
            Material specification
          </Typography>
          <Box
            className="mb-6"
            sx={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: {
                md: "row",
                sm: "row",
                // maxHeight: 200,
              },
              gap: 2,
              justifyContent: "flex-start",
            }}
          >
            {libraryItemData?.materials?.map((item: any, index) => (
              <BoqMaterialCard key={index} materialData={item} />
            ))}
          </Box>
        </Box>
        <Box component="section" className="py-2">
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead
              sx={{
                backgroundColor: "primary.main",
                "&:MuiTableCell-head": { color: "#FFFFFF" },
              }}
            >
              <TableRow
                sx={{
                  "& .MuiTableCell-root": {
                    color: "#ffffff",
                  },
                  "& .MuiCheckbox-root.Mui-checked": {
                    color: "#ffffff !important",
                  },
                }}
              >
                <TableCell className="text-center">Item category</TableCell>
                <TableCell align="center">Item Name</TableCell>
                <TableCell align="center">QTY</TableCell>
                <TableCell align="center">Unit</TableCell>
                <TableCell align="center">{"Rate per unit"}</TableCell>
                <TableCell align="center">Total cost</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow
              //   key={lead.projectId}
              //   onMouseEnter={() => handleRowHover(rowIndex)}
              //   onMouseLeave={handleRowLeave}
              >
                <TableCell className="text-center">
                  {libraryItemData?.subCategoryValue}
                </TableCell>

                <TableCell className="text-center">
                  {libraryItemData?.typeOfWorkValue}
                </TableCell>
                <TableCell className="text-center"> 1</TableCell>
                <TableCell align="center" className="text-dark">
                  Nos.
                </TableCell>
                <TableCell align="center" className="text-dark">
                  {(
                    libraryItemData?.itemPrice /
                    libraryItemData?.scaling?.reduce(
                      (acc, item) => acc * Number(item.value),
                      1
                    )
                  ).toFixed(2)}
                </TableCell>

                <TableCell align="center" className="text-dark">
                  {libraryItemData?.itemPrice}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default BoqExport;
