import { MatrixChoice } from "@/types";
import { Box, Grid, Radio, TextField } from "@mui/material";
import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useTranslation } from "react-i18next";

export const RenderMatrixChoiceSingle = ({
  control,
  isAnswer,
  onChange,
}: {
  isAnswer?: boolean;
  control: MatrixChoice;
  onChange?: (
    rowIndex: number,
    columnIndex: number,
    value: any,
    other?: any
  ) => void;
}) => {
  const { t } = useTranslation();
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
                {t("common.other")}
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
                        <Radio
                          onChange={(e) => {
                            onChange?.(rowIndex, columnIndex, e.target.checked);
                          }}
                          disabled={!isAnswer}
                          value={row?.value + column?.value}
                          checked={
                            control?.options?.rowLabel[rowIndex]
                              .columnSelected?.[columnIndex]?.isSelected ??
                            false
                          }
                        />
                      </TableCell>
                    );
                  }
                )}
                {control?.isOtherEnabled && (
                  <TableCell sx={{ width: "150px", border: "none" }}>
                    <div className="d-flex">
                      <Radio
                        onChange={(e) => {
                          onChange?.(
                            rowIndex,
                            control?.options?.columnLabel?.length,
                            e.target.checked
                          );
                        }}
                        inputProps={{}}
                        checked={
                          control?.options?.rowLabel[rowIndex].columnSelected?.[
                            control?.options?.columnLabel?.length
                          ]?.isSelected ?? false
                        }
                        name="radio-buttons"
                        disabled={
                          !isAnswer ||
                          !control?.options?.rowLabel[rowIndex]
                            .columnSelected?.[
                            control?.options?.columnLabel?.length
                          ]?.value
                        }
                        // inputProps={{ 'aria-label': 'A' }}
                      />
                      <TextField
                        sx={{
                          "& .MuiSelect-select ": { padding: "10px 5px " },
                        }}
                        fullWidth
                        defaultValue={""}
                        onChange={(e) => {
                          onChange?.(
                            rowIndex,
                            control?.options?.columnLabel?.length,
                            true,
                            { value: e.target.value }
                          );
                        }}
                        disabled={!isAnswer}
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
