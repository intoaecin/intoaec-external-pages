import * as React from "react";
import Skeleton from "@mui/material/Skeleton";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { LEAD_MASTER_KANBAN_BOARD_HEIGHT } from "@/components/layout/viewportChrome";
import {
  getLeadKanbanBoardHorizontalScrollSx,
  leadKanbanBoardColumnsRowSx,
} from "./masterGridNavigation.utils";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

interface skeletonTableProps {
  numberOfHeader?: number;
  numberOfBodyColumn?: number;
  numberOfBodyRow?: number;
  marginTop?: number;
}

export function SkeletonTableGrid({
  numberOfHeader = 5,
  numberOfBodyColumn = 5,
  numberOfBodyRow = 5,
  marginTop = 5,
}: skeletonTableProps) {
  return (
    <div className={`mt-${marginTop}  `}>
      {/* <div>
        <div className="d-flex justify-content-end">
          <Skeleton
            className="mr-2  "
            variant="rounded"
            width={"30%"}
            height={30}
          />
          <Skeleton
            className="mr-2  "
            variant="rounded"
            width={"10%"}
            height={30}
          />
        </div>
      </div> */}
      <TableContainer
        style={{
          boxShadow: "none",
        }}
        component={Paper}
        className={`mt-${marginTop} `}
      >
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
              }}
            >
              {[...Array(numberOfHeader)].map((data, index) => (
                <TableCell align="center" key={index}>
                  <Skeleton
                    className="mr-2  "
                    variant="rounded"
                    width={"70%"}
                    height={20}
                  />
                </TableCell>
              ))}
              {/* <TableCell><Skeleton
                  className="mr-2"
                  variant="rounded"
                  width={'70%'}
                  height={30}
                /></TableCell>
            <TableCell align="right"><Skeleton variant="rectangular" width={'70%'} height={20} /> </TableCell>
            <TableCell align="right"> <Skeleton variant="rectangular" width={'70%'} height={20} /></TableCell>
            <TableCell align="right"><Skeleton variant="rectangular" width={'70%'} height={20} /> </TableCell>
            <TableCell align="right"> <Skeleton variant="rectangular" width={'70%'} height={20} /></TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(numberOfBodyRow)].map((data, index) => (
              <TableRow key={index}>
                <TableCell align="left">
                  <Skeleton variant="rounded" width={"40%"} height={10} />{" "}
                </TableCell>
                {[...Array(numberOfBodyColumn - 1)]?.map((_, tableIndex) => (
                  <TableCell align="center" key={tableIndex}>
                    <Skeleton variant="rounded" width={"40%"} height={10} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

const KANBAN_SKELETON_COLUMN_COUNT = 5;
const KANBAN_SKELETON_CARDS_PER_COLUMN = 4;

/** Placeholder columns/cards while Kanban data is loading (matches board layout, not the list table). */
export function SkeletonKanbanGrid() {
  const { t } = useTranslation();
  const theme = useTheme();
  const boardHorizontalScrollSx = useMemo(
    () => ({
      ...getLeadKanbanBoardHorizontalScrollSx(theme),
      height: LEAD_MASTER_KANBAN_BOARD_HEIGHT,
      maxHeight: LEAD_MASTER_KANBAN_BOARD_HEIGHT,
      flex: "0 0 auto",
    }),
    [theme],
  );

  return (
    <Box role="status" aria-label={t("common.loading")} sx={boardHorizontalScrollSx}>
      <Box sx={leadKanbanBoardColumnsRowSx}>
      {Array.from({ length: KANBAN_SKELETON_COLUMN_COUNT }).map((_, colIdx) => (
        <Box
          key={colIdx}
          sx={{
            minWidth: 365,
            maxWidth: 380,
            flexShrink: 0,
            alignSelf: "stretch",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            borderRadius: "8px",
            bgcolor: "transparent",
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: "8px",
              bgcolor: "grey.300",
            }}
          >
            <Skeleton variant="rounded" width="55%" height={22} />
          </Box>
          <Box
            sx={{
              mt: 1,
              px: 0.5,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {Array.from({ length: KANBAN_SKELETON_CARDS_PER_COLUMN }).map(
              (_, cardIdx) => (
                <Box
                  key={cardIdx}
                  sx={{
                    borderRadius: 1,
                    bgcolor: "grey.100",
                    p: 1.5,
                  }}
                >
                  <Skeleton variant="rounded" width="70%" height={14} />
                  <Skeleton
                    variant="rounded"
                    width="45%"
                    height={12}
                    sx={{ mt: 1 }}
                  />
                  <Skeleton
                    variant="rounded"
                    width="90%"
                    height={12}
                    sx={{ mt: 1.5 }}
                  />
                </Box>
              ),
            )}
          </Box>
        </Box>
      ))}
      </Box>
    </Box>
  );
}

export function SkeletonMasterGrid() {
  return (
    <div className="bg-white pb-5">
      <div className="container mx-2 pt-3 pb-5">
        <div className="row mt-5 justify-content-between mb-1">
          <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
            <div className="row align-item-center mb-4">
              <div className="mr-3">
                <Skeleton variant="rounded" width={210} height={40} />
              </div>
              <div>
                <Skeleton variant="rectangular" width={100} height={20} />
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-12 col-sm-12 text-right">
            <Skeleton
              className="float-right"
              variant="rectangular"
              width={210}
              height={50}
            />
          </div>
        </div>
        <div>
          <div>
            <Box>
              <div className="d-flex mb-5 pb-5">
                <Skeleton
                  className="mr-3"
                  variant="rounded"
                  width={210}
                  height={60}
                />
                <Skeleton
                  className="mr-3"
                  variant="rounded"
                  width={210}
                  height={60}
                />
                <Skeleton
                  className="mr-3"
                  variant="rounded"
                  width={210}
                  height={60}
                />
                <Skeleton
                  className="mr-3"
                  variant="rounded"
                  width={210}
                  height={60}
                />
                <Skeleton
                  className="mr-3"
                  variant="rounded"
                  width={210}
                  height={60}
                />
              </div>
              <Skeleton variant="rectangular" width={"100%"} height={"40vh"} />
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}
