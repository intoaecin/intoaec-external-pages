import { MenuItem, TextField } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useTranslation } from "react-i18next";

export const RenderMatrixDropdown = ({
  control,
  onChange,
  isAnswer,
}: {
  isAnswer?: boolean;
  control?: any;
  onChange?: (control: any) => void;
  renderPageControl?: boolean;

  selectedPageIndex?: number;
}) => {
  const { t } = useTranslation();
  return (
    <Table sx={{ minWidth: 650, border: "none" }} aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell
            sx={{ width: "100px", border: "none" }}
            key={"default"}
          ></TableCell>
          {control?.options?.columnLabel?.map((column: any, index: number) => {
            return (
              <TableCell
                sx={{ width: "100px", border: "none", textAlign: "center" }}
                key={index}
              >
                {column.value}
              </TableCell>
            );
          })}
          {control?.isOtherEnabled && (
            <TableCell
              sx={{ width: "150px", border: "none" }}
              key={"default-other"}
            >
              Other
            </TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {control?.options?.rowLabel?.map((row: any, rowIndex: number) => {
          return (
            <TableRow key={rowIndex}>
              <TableCell sx={{ width: "100px", border: "none" }} key={rowIndex}>
                {row?.value}
              </TableCell>
              {control?.options?.columnLabel?.map(
                (column: any, columnIndex: number) => {
                  return (
                    <TableCell
                      sx={{ width: "100px", border: "none" }}
                      key={columnIndex}
                    >
                      <div className="mb-2">
                        <TextField
                          sx={{
                            "& .MuiSelect-select ": { padding: "10px 5px " },
                          }}
                          select
                          fullWidth
                          disabled={!isAnswer}
                          defaultValue={"Select"}
                          SelectProps={{
                            MenuProps: {
                              disableScrollLock: true,
                            },
                          }}
                          value={row?.columnSelected?.[columnIndex]?.value}
                          onChange={(e) => {
                            const newControl = {
                              ...control,
                              options: {
                                ...control?.options,
                                rowLabel: [
                                  ...control?.options?.rowLabel.slice(
                                    0,
                                    rowIndex
                                  ),
                                  {
                                    ...row,
                                    columnSelected: [
                                      ...(
                                        row?.columnSelected?.slice(
                                          0,
                                          columnIndex
                                        ) ??
                                        control?.options?.columnLabel?.slice(
                                          0,
                                          columnIndex
                                        )
                                      ).map((val: any) => ({
                                        ...val,
                                        value: val.value ?? "",
                                      })),
                                      {
                                        ...column,
                                        value: e.target.value,
                                      },
                                      ...(
                                        row?.columnSelected?.slice(
                                          columnIndex + 1
                                        ) ??
                                        control?.options?.columnLabel?.slice(
                                          columnIndex + 1
                                        )
                                      ).map((val: any) => ({
                                        ...val,
                                        value: val.value ?? "",
                                      })),
                                    ],
                                  },
                                  ...control?.options?.rowLabel.slice(
                                    rowIndex + 1
                                  ),
                                ],
                              },
                            };
                            onChange?.(newControl);
                            console.log("ASLDJHKJH:::", newControl);
                          }}
                        >
                          {" "}
                          <MenuItem selected disabled value={"Select"}>
                            {t("common.select")}
                          </MenuItem>
                          {column?.options?.map(
                            (value: any, valueIndex: number) =>
                              !value?.isOther && (
                                <MenuItem
                                  // onClick={(e:any) => {
                                  //   onChange?.(e, true, valueIndex);  //need to add the functionality
                                  // }}
                                  key={valueIndex}
                                  value={value?.value}
                                >
                                  {value?.value}
                                </MenuItem>
                              )
                          )}
                        </TextField>
                      </div>
                    </TableCell>
                  );
                }
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
