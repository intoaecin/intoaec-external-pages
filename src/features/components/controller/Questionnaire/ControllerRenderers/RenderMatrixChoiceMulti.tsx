import { MatrixChoice } from "@/types";
import { TextField } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";

export const RenderMatrixChoiceMulti = ({
  control,
  isAnswer,
  onChange,
}: {
  control: MatrixChoice;
  isAnswer?: boolean;
  onChange?: (
    rowIndex: number,
    columnIndex: number,
    value: any,
    other?: any
  ) => void;
}) => {
  return (
    <>
      <Table sx={{ minWidth: 650, border: "none" }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ width: "100px", border: "none" }}
              key={"default"}
            ></TableCell>
            {control?.options?.columnLabel?.map(
              (column: any, index: number) => {
                return (
                  <TableCell
                    sx={{ width: "100px", border: "none" }}
                    key={index}
                  >
                    {column.value}
                  </TableCell>
                );
              }
            )}
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
                <TableCell
                  sx={{ width: "100px", border: "none" }}
                  key={rowIndex}
                >
                  {row?.value}
                </TableCell>
                {control?.options?.columnLabel?.map(
                  (column: any, columnIndex: number) => {
                    return (
                      <TableCell
                        sx={{ width: "100px", border: "none" }}
                        key={columnIndex}
                      >
                        <Checkbox
                          inputProps={{ "aria-label": "Checkbox demo" }}
                          onChange={(e) => {
                            onChange?.(rowIndex, columnIndex, e.target.checked);
                          }}
                          checked={
                            row?.columnSelected?.[columnIndex]?.isSelected
                          }
                          disabled={!isAnswer}
                        />
                      </TableCell>
                    );
                  }
                )}
                {control?.isOtherEnabled && (
                  <TableCell sx={{ width: "150px", border: "none" }}>
                    <div className="d-flex">
                      <Checkbox
                        inputProps={{ "aria-label": "Checkbox demo" }}
                        onChange={(e) => {
                          onChange?.(
                            rowIndex,
                            control?.options?.columnLabel?.length,
                            e.target.checked
                          );
                        }}
                        disabled={
                          !isAnswer ||
                          !control?.options?.rowLabel?.[rowIndex]
                            ?.columnSelected?.[
                            control?.options?.columnLabel?.length
                          ]?.value
                        }
                      />
                      <TextField
                        sx={{
                          "& .MuiSelect-select ": { padding: "10px 5px " },
                        }}
                        fullWidth
                        defaultValue={""}
                        disabled={!isAnswer}
                        onChange={(e) => {
                          onChange?.(
                            rowIndex,
                            control?.options?.columnLabel?.length,
                            false,
                            { value: e.target.value }
                          );
                        }}
                        placeholder="Please specify"
                      />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
