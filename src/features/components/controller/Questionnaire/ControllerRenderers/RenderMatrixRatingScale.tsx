import { MatrixChoice, Options } from "@/types";
import {
  Box,
  Checkbox,
  Grid,
  IconButton,
  Radio,
  TextField,
  MenuItem,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import PlusIcon from "@/assets/icons/plus-icon";
import Close from "@mui/icons-material/Close";
import { RenderStar } from "@/features/constants/constant";

export const RenderMatrixRatingScaleSingle = ({
  control,
  isAnswer,
  onChange,
  renderPageControl,
  handleMatrixRatingScale,
  selectedPageIndex,
}: {
  isAnswer?: boolean;
  control?: any;
  onChange?: (
    rowIndex: number,
    columnIndex: number,
    value?: any,
    other?: any
  ) => void;
  renderPageControl?: boolean;
  handleMatrixRatingScale?: (
    e: any,
    selectedPageIndex: number,
    index: number,
    type: string,
    opIndex?: number
  ) => void;
  selectedPageIndex?: number;
}) => {
  return (
    <Table
      sx={{
        minWidth: 650,
        border: "none",
        "& .MuiTableCell-root": {
          padding: "0px",
        },
      }}
      aria-label="simple table"
    >
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
                {control?.options?.reperesentationType === "Number"
                  ? column?.label
                  : control?.options?.reperesentationType === "Smileys"
                  ? column?.imgValue && String.fromCodePoint(column?.imgValue)
                  : RenderStar(column?.imgValue)}
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
                      <div className="mb-2 text-center">
                        <Radio
                          onChange={(e) => {
                            onChange?.(rowIndex, columnIndex, e.target.checked);
                          }}
                          value={row?.value + column?.value}
                          checked={
                            control?.options?.rowLabel[rowIndex]
                              .columnSelected?.[columnIndex]?.isSelected ??
                            false
                          }
                          disabled={!isAnswer}
                          // value={
                          //   control?.options?.rowLabel[rowIndex]
                          //     .columnSelected?.[columnIndex]?.isSelected
                          // }
                          // disabled={!isAnswer}
                          // inputProps={{ 'aria-label': 'A' }}
                        />
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
