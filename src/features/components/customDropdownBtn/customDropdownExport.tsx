import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import ExcelIcon from "@/assets/icons/excel-icon";
import PdfIcon from "@/assets/icons/pdf-icon";
import {
  formatDateBasedOnOrganizationLocalization,
  handleExcelExport,
} from "@/lib/helpers";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import { FileDown } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";

const EXPORT_TRIGGER_ICON_PX = 16;

interface ExportProps {
  isDisabled?: boolean;
  dataToExport?: any;
  fileHeaderData?: string[];
  fileName?: string;
  fileTitle?: string;
  hidePdf?: boolean;
  hideExcel?: boolean;
  onExport?: (exportType: "XLSX" | "PDF") => void | Promise<void>;
}

export const handlePdfExport = (
  bodyData: any,
  headerData: any,
  fileName: string,
  fileTitle: string,
  timeStamp: string
) => {
  const doc = new jsPDF();
  // Define the title, page number, and timestamp format
  const title = fileTitle;
  // const timestamp = new Date().toLocaleString();

  // Calculate the middle of the page
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const middleX = pageWidth / 2;

  // Define the custom header and footer functions
  const customHeader = () => {
    doc.setFontSize(16); // Adjust the font size for the title
    const titleWidth =
      (doc.getStringUnitWidth(title) * 16) / doc.internal.scaleFactor;
    doc.text(title, middleX - titleWidth / 2, 10);

    doc.setFontSize(10); // Adjust the font size for the timestamp
    const timestampWidth =
      (doc.getStringUnitWidth(timeStamp) * 10) / doc.internal.scaleFactor;
    doc.text(timeStamp, pageWidth - timestampWidth - 10, 10);
  };

  const customFooter = (page: { pageNumber: any }) => {
    doc.setFontSize(10); // Adjust the font size for page numbers and footer timestamp
    const pageNumberText = `Page ${page.pageNumber}`;
    const pageNumberWidth =
      (doc.getStringUnitWidth(pageNumberText) * 10) / doc.internal.scaleFactor;
    doc.text(pageNumberText, middleX - pageNumberWidth / 2, pageHeight - 20);

    const timestampWidth =
      (doc.getStringUnitWidth(timeStamp) * 10) / doc.internal.scaleFactor;
    doc.text(timeStamp, pageWidth - timestampWidth - 10, pageHeight - 20);
  };

  // Create the table with custom header and footer
  doc.autoTable({
    head: [headerData],
    body: bodyData,
    margin: { top: 20 }, // Adjust the top margin to make space for the header
    beforePageContent: customHeader, // Add the custom header
    afterPageContent: customFooter, // Add the custom footer
  });
  doc.save(`${fileName}.pdf`);
};
const CustomDropdownExport = ({
  isDisabled,
  dataToExport,
  fileHeaderData,
  fileName,
  fileTitle,
  hidePdf,
  hideExcel,
  onExport,
}: ExportProps) => {
  const isSmallDevice = useMediaQuery("(max-width:768px)");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [menuPaperMinWidth, setMenuPaperMinWidth] = useState<number | undefined>(
    undefined
  );
  const theme = useTheme();
  const { t } = useTranslation();
  const { localizationLoading, localizationValue, refetch } =
    useOrganizationLocalization();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    setAnchorEl(el);
    setMenuPaperMinWidth(el.offsetWidth);
    setIsMenuOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
    setMenuPaperMinWidth(undefined);
  };

  const runExport = async (exportType: "XLSX" | "PDF") => {
    if (onExport) {
      setIsExporting(true);
      try {
        await onExport(exportType);
      } catch {
        toast.error(t("toast.somethingWentWrong"));
      } finally {
        setIsExporting(false);
        handleClose();
      }
      return;
    }
    if (exportType === "PDF") {
      handlePdfExport(
        dataToExport,
        fileHeaderData,
        fileName ?? "",
        fileTitle ?? "",
        localizationValue
          ? formatDateBasedOnOrganizationLocalization(
              localizationValue,
              new Date(),
            )
          : moment(new Date()).format("hh:mm a"),
      );
    } else {
      handleExcelExport(
        dataToExport,
        fileHeaderData ?? [],
        fileName ?? "",
        fileTitle ?? "",
      );
    }
    handleClose();
  };

  return (
    <div>
      <Button
        variant="contained"
        disabled={isDisabled}
        startIcon={
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              color: "inherit",
            }}
          >
            <FileDown
              size={EXPORT_TRIGGER_ICON_PX}
              strokeWidth={1.5}
              aria-hidden
            />
          </Box>
        }
        endIcon={isMenuOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        onClick={handleMenuClick}
        sx={{
          minWidth: isSmallDevice ? "" : "150px !important",
          borderRadius: "4px",
          backgroundColor: "primary.main",
          border: "none",
          padding: " 10px",
          color: "primary.contrastText",
          boxShadow: "0px 4px 10px 0px rgba(16, 156, 241, 0.24)",
        }}
      >
        <span style={{ textTransform: "capitalize" }}>
          {t("common.export")}
        </span>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleClose}
        disableScrollLock={true}
        PaperProps={{
          sx: {
            minWidth: menuPaperMinWidth,
            maxWidth: menuPaperMinWidth,
            boxSizing: "border-box",
            "& .MuiTypography-root": {
              fontSize: "13px",
            },
          },
        }}
      >
        {!hidePdf && (
          <MenuItem
            disabled={isExporting}
            onClick={() => {
              void runExport("PDF");
            }}
          >
            <ListItemIcon>
              <PdfIcon
                style={{
                  width: "25px",
                  height: "25px",
                  fill: theme?.palette?.error?.main,
                }}
              />
            </ListItemIcon>
            <ListItemText sx={{ fontSize: "13px" }}>Pdf</ListItemText>
          </MenuItem>
        )}
        {!hideExcel && (
          <MenuItem
            disabled={isExporting}
            onClick={() => {
              void runExport("XLSX");
            }}
          >
            <ListItemIcon>
              <ExcelIcon
                style={{
                  width: "25px",
                  height: "25px",
                  fill: theme?.palette?.success?.main,
                }}
              />
            </ListItemIcon>
            <ListItemText sx={{ fontSize: "13px !important" }}>
              Excel
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default CustomDropdownExport;
