import { MenuItem, TextField } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const customStyles = {
  "& .Mui-disabled": {
    cursor: "not-allowed !important",
    PointerEvents: "auto",
  },
  "& .Mui-selected": {
    backgroundColor: "#2F80ED !important", // Set the background color for selected page
    color: "white !important",
    borderRadius: "2px",
  },
  "& .MuiPaginationItem-root": {
    backgroundColor: "white",
    border: "none", // Set the background color for non-selected pages
  },
  "& .MuiButtonBase-root.MuiIconButton-root.MuiPaginationItem-iconButton": {
    "&.Mui-selected": {
      backgroundColor: "blue", // Set the background color for selected arrow
      color: "white", // Set the text color for selected arrow
    },
  },
};

interface CustomTablePaginationProps {
  currentPage: number;
  rowsPerPage: number;
  totalPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsperPage: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isModal?: boolean;
}

const CustomTablePagination: React.FC<CustomTablePaginationProps> = ({
  currentPage,
  rowsPerPage,
  onChangePage,
  onChangeRowsperPage,
  totalPage,
  isModal = false,
}) => {
  const { t } = useTranslation();

  const MenuProps = {
    PaperProps: {
      sx: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        minWidth: isModal ? 110 : 100,
        fontSize: 12,
        "& .MuiMenuItem-root": {
          whiteSpace: "nowrap",
        },
      },
    },
  };

  return (
    <div
      className={`my-3 d-flex  justify-content-between
       `}
      style={{ alignItems: "center", flexWrap: "wrap", rowGap: 8 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>{t("common.show") + " "}</span>
        <TextField
          select
          value={rowsPerPage}
          onChange={onChangeRowsperPage}
          size="small"
          sx={{
            minWidth: isModal ? 110 : 100,
            "& .MuiInputBase-root": {
              height: 32,
              padding: 0,
              background: "#fff",
              borderColor: "#fff !important",
            },
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              padding: "4px 24px 4px 8px !important",
              whiteSpace: "nowrap",
            },
          }}
          variant="outlined"
          SelectProps={{
            MenuProps: {
              ...MenuProps,
              disableScrollLock: true,
            },
          }}
        >
          <MenuItem value={10}>{`  10 ${t("common.rows")}`}</MenuItem>
          <MenuItem value={25}>{` 25 ${t("common.rows")}`}</MenuItem>
          <MenuItem value={50}>{` 50 ${t("common.rows")}`}</MenuItem>
          <MenuItem value={100}>{` 100 ${t("common.rows")}`}</MenuItem>
        </TextField>
      </div>
      <div>
        <Pagination
          count={totalPage}
          page={currentPage}
          onChange={(e, page) => {
            onChangePage(page);
          }}
          variant="outlined"
          shape="rounded"
          color="primary"
          showFirstButton
          showLastButton
          sx={customStyles}
        />
      </div>
    </div>
  );
};

export default CustomTablePagination;
