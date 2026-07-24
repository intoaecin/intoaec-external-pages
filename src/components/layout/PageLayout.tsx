import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CustomTabs from "@/components_v2/CustomTabs";
import type { CustomTabItem } from "@/components_v2/CustomTabs";
import { NoDataVector } from "@/assets/icons/no-data-vector-common";
import {
  Box,
  Button,
  IconButton,
  Stack,
  SxProps,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Clipboard } from "lucide-react";
import { toast } from "react-toastify";
import { copyToClipboard } from "@/lib/helpers";
import {
  PAGE_HEIGHT,
  PAGE_HEIGHT_WITH_TAB,
  PAGE_HEIGHT_WITHOUT_HEADER,
  PAGE_HEIGHT_WITHOUT_HEADER_WITH_TAB,
  PAGE_LAYOUT_BODY_PADDING_X,
  PAGE_LAYOUT_BODY_PADDING_Y,
} from "./viewportChrome";
import { useProfilePageLayoutProjectName } from "./useProfilePageLayoutProjectName";

export type { CustomTabItem };

export type PageLayoutTitleBreadcrumb = {
  label: React.ReactNode;
  onClick?: () => void;
  key?: string;
};

export type PageLayoutProps = {
  /** Primary feature / page title */
  title: React.ReactNode;
  /** Optional clickable title path rendered as `segment / segment`. */
  titleBreadcrumbs?: PageLayoutTitleBreadcrumb[];
  /** Optional back control before the title */
  onBack?: () => void;
  /** Right-aligned toolbar (buttons, search, etc.) */
  actions?: React.ReactNode;
  /** Main page content below the header (and below tabs when `tabs` is true) */
  children?: React.ReactNode;
  /** Max height for the children wrapper. Use page height presets or a custom CSS height. */
  maxHeight?:
    | typeof PAGE_HEIGHT
    | typeof PAGE_HEIGHT_WITH_TAB
    | typeof PAGE_HEIGHT_WITHOUT_HEADER
    | typeof PAGE_HEIGHT_WITHOUT_HEADER_WITH_TAB
    | string;
  className?: string;
  sx?: SxProps<Theme>;
  /** Default spacing under the header row (or under the tab row when `tabs` is true) */
  gutterBottom?: boolean;
  /** When true, renders `CustomTabs` on the row directly under the title/actions header. */
  tabs?: boolean;
  /** Tab definitions; required for the tab strip to render when `tabs` is true. */
  tabItems?: CustomTabItem[];
  tabValue?: number;
  onTabChange?: (index: number) => void;
  /** When true, tabs stretch to the full row width. Default false (left-aligned, intrinsic width). */
  tabFullWidth?: boolean;
  tabAriaLabel?: string;
  /**
   * Renders on the right side of the tab row when `tabs` is enabled, or as a full-width
   * toolbar row under the title when `tabs` is false (e.g. filters + search on file lists).
   */
  secondaryActions?: React.ReactNode;
  /** Extra styles for the title / actions row; merged after defaults (white background). */
  titleRowSx?: SxProps<Theme>;
  /** Extra styles for the body scroll container. */
  bodySx?: SxProps<Theme>;
  /** Extra styles for the children wrapper inside the body. */
  contentSx?: SxProps<Theme>;
  /**
   * When true, the title row and tab strip stay pinned under the app shell while the page scrolls
   * (uses `position: sticky` within the scrolling ancestor, typically `AppContent`).
   */
  stickyHeader?: boolean;
  /** When true, the main body shows the empty-state vector instead of `children`. */
  isNoData?: boolean;
  /** When `isNoData` is true and this is true, renders a primary Add control under the vector (requires `onNoDataAdd`). */
  noDataShowAddButton?: boolean;
  /** Click handler for the empty-state Add button (used with `noDataShowAddButton`). */
  onNoDataAdd?: () => void;
  /** Optional line of copy under the vector when `isNoData` is true. */
  noDataMessage?: React.ReactNode;
  /** Label for the empty-state Add button; defaults to `common.add`. */
  noDataAddLabel?: React.ReactNode;
  /** When true, the body has a margin of 1. */
  isBodyMargin?: boolean;
  /** When false, never auto-append profile project name. Default: auto on profile routes. */
  showProfileProjectName?: boolean;
};

/** Shared primary action button styles for `PageLayout` `actions` slots. */
export const PAGE_LAYOUT_PRIMARY_ACTION_BUTTON_SX: SxProps<Theme> = {
  minWidth: { xs: "100%", sm: "150px" },
  px: 2,
  textTransform: "none",
};

/**
 * Page shell: header row (optional back, title, actions) plus optional body via `children`.
 * Used for client profile feature tabs (`/client/profile?tab=…`); other routes keep `bredcrumbUI`.
 */
export function PageLayout({
  title,
  titleBreadcrumbs,
  onBack,
  actions,
  children,
  className,
  sx,
  gutterBottom = true,
  tabs = false,
  tabItems,
  tabValue,
  onTabChange,
  tabFullWidth,
  tabAriaLabel,
  secondaryActions,
  titleRowSx,
  bodySx,
  contentSx,
  stickyHeader = true,
  isNoData = false,
  noDataShowAddButton = false,
  onNoDataAdd,
  noDataMessage,
  noDataAddLabel,
  maxHeight = PAGE_HEIGHT,
  showProfileProjectName,
}: PageLayoutProps) {
  const { t } = useTranslation();
  const profileProject = useProfilePageLayoutProjectName(
    showProfileProjectName !== false,
  );
  const hasTitleBreadcrumbs = Boolean(titleBreadcrumbs?.length);
  const showTabStrip =
    tabs &&
    tabItems &&
    tabItems.length > 0 &&
    typeof tabValue === "number" &&
    onTabChange !== undefined;

  const showSecondaryToolbarOnly = Boolean(secondaryActions) && !showTabStrip;

  return (
    <Box
      className={className}
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        minWidth: 0,
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        ...sx,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: "100%",
          ...(stickyHeader
            ? {
                position: "sticky",
                top: 0,
                zIndex: (theme) => theme.zIndex.appBar - 1,
                bgcolor: "background.paper",
                borderBottom: 1,
                borderColor: "divider",
                boxShadow: (theme) =>
                  theme.palette.mode === "light"
                    ? "0 1px 2px rgba(0, 0, 0, 0.06)"
                    : "0 1px 2px rgba(0, 0, 0, 0.24)",
              }
            : {}),
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          useFlexGap
          spacing={1}
          sx={{
            color: "text.primary",
            flexShrink: 0,
            width: "100%",
            px: 2,
            py: 1,
            rowGap: 1,
            columnGap: 1,
            ...(gutterBottom &&
            !showTabStrip &&
            !stickyHeader &&
            !showSecondaryToolbarOnly
              ? { mb: 2 }
              : {}),
            bgcolor: stickyHeader ? "transparent" : "background.paper",
            /** Line under title when a second header row follows (tabs or toolbar-only `secondaryActions`). */
            borderBottom:
              stickyHeader && (showTabStrip || showSecondaryToolbarOnly)
                ? 1
                : stickyHeader
                  ? 0
                  : 1,
            borderColor: "divider",
            ...titleRowSx,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ minWidth: 0, flex: "1 1 auto" }}
          >
            {onBack ? (
              <IconButton
                aria-label={t("common.back")}
                onClick={onBack}
                size="small"
                edge="start"
                sx={{
                  color: "text.secondary",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 22 }} />
              </IconButton>
            ) : null}
            <Typography
              component="div"
              variant="h6"
              sx={{
                cursor: "default",
                fontWeight: 500,
                color: "text.primary",
                minWidth: 0,
                flex: "1 1 auto",
                alignSelf: "stretch",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 0.5,
                }}
              >
                {hasTitleBreadcrumbs ? (
                  <>
                    {titleBreadcrumbs?.map((crumb, index) => (
                      <React.Fragment key={crumb.key ?? `title-crumb-${index}`}>
                        {index > 0 ? (
                          <Box
                            component="span"
                            sx={{ color: "text.secondary" }}
                          >
                            /
                          </Box>
                        ) : null}
                        <Box
                          component={crumb.onClick ? "button" : "span"}
                          {...(crumb.onClick
                            ? {
                                type: "button" as const,
                                onClick: crumb.onClick,
                              }
                            : {})}
                          sx={{
                            border: 0,
                            bgcolor: "transparent",
                            p: 0,
                            m: 0,
                            font: "inherit",
                            color:
                              index === titleBreadcrumbs.length - 1
                                ? "text.primary"
                                : "inherit",
                            cursor: crumb.onClick ? "pointer" : "default",
                            "&:hover": crumb.onClick
                              ? { textDecoration: "underline" }
                              : undefined,
                          }}
                        >
                          {crumb.label}
                        </Box>
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  title
                )}
                {profileProject ? (
                  <Box sx={{ pl: 1 }}>
                    <Box component="span" sx={{ color: "text.secondary" }}>
                      -{" "}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        color: "primary.main",
                        fontWeight: 400,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {profileProject.name}
                      <Tooltip title={t("common.copyProjectId")}>
                        <IconButton
                          size="small"
                          aria-label={t("common.copyProjectId")}
                          onClick={async () => {
                            await copyToClipboard(profileProject.projectId);
                          }}
                          sx={{
                            p: 0.25,
                            color: "primary.main",
                            verticalAlign: "middle",
                          }}
                        >
                          <Clipboard size={14} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ) : null}
              </Box>
            </Typography>
          </Stack>
          {actions ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ flexShrink: 0 }}
            >
              {actions}
            </Stack>
          ) : null}
        </Stack>
        {showTabStrip ? (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            useFlexGap
            spacing={1}
            sx={{
              width: "100%",
              flexShrink: 0,
              px: 2,
              py: 0.25,
              rowGap: 1,
              ...(stickyHeader ? { bgcolor: "transparent" } : {}),
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                minWidth: 0,
                flex: "0 1 auto",
                maxWidth: "100%",
              }}
            >
              <CustomTabs
                items={tabItems}
                value={tabValue}
                onChange={onTabChange}
                fullWidth={tabFullWidth ?? false}
                ariaLabel={tabAriaLabel}
              />
            </Box>
            {secondaryActions ? (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ flexShrink: 0, ml: { xs: 0, sm: "auto" } }}
              >
                {secondaryActions}
              </Stack>
            ) : null}
          </Stack>
        ) : showSecondaryToolbarOnly ? (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            useFlexGap
            spacing={1}
            sx={{
              width: "100%",
              flexShrink: 0,
              px: 2,
              py: 1,
              rowGap: 1,
              ...(stickyHeader ? { bgcolor: "transparent" } : {}),
              ...(gutterBottom && !stickyHeader ? { mb: 1 } : {}),
            }}
          >
            <Box
              aria-hidden
              sx={{
                flex: "1 1 auto",
                minWidth: 0,
                minHeight: 0,
              }}
            />
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              sx={{ flexShrink: 0, ml: { xs: 0, sm: "auto" } }}
            >
              {secondaryActions}
            </Stack>
          </Stack>
        ) : null}
      </Box>
      <Box
        sx={[
          {
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            overflowX: "hidden",
            overflowY: stickyHeader ? "hidden" : "auto",
            /**
             * Tab / Bootstrap hosts often omit a height-bounded flex parent, so `flex: 1` alone
             * does not grow. For empty states, reserve viewport space so content can center vertically.
             */
            ...(isNoData
              ? {
                  minHeight: "max(320px, calc(100dvh - 220px))",
                }
              : {}),
          },
          ...(Array.isArray(bodySx) ? bodySx : [bodySx]),
        ]}
      >
        {isNoData ? (
          <Box
            role="status"
            sx={{
              flex: 1,
              minHeight: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: { xs: 2, sm: 3 },
              px: 2,
              boxSizing: "border-box",
            }}
          >
            <Stack
              alignItems="center"
              spacing={1}
              sx={{
                flexShrink: 0,
                width: "100%",
                maxWidth: 440,
                textAlign: "center",
              }}
            >
              <Stack alignItems="center" spacing={0.25} sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    lineHeight: 0,
                    /**
                     * Vector viewBox is 750×500 — only constrain width and let height follow
                     * so we do not letterbox the art (which looked like a huge gap above the text).
                     */
                    "& svg": {
                      width: { xs: "min(100%, 220px)", sm: 260, md: 280 },
                      height: "auto",
                      maxWidth: "100%",
                      display: "block",
                    },
                  }}
                >
                  <NoDataVector />
                </Box>
                {noDataMessage ? (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      maxWidth: 400,
                      mx: "auto",
                      m: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {noDataMessage}
                  </Typography>
                ) : null}
              </Stack>
              {noDataShowAddButton && onNoDataAdd ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={onNoDataAdd}
                >
                  {noDataAddLabel ?? t("common.add")}
                </Button>
              ) : null}
            </Stack>
          </Box>
        ) : (
          <Box
            sx={[
              { p: 1 },
              ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
            ]}
          >
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export {
  APP_SHELL_OUTSIDE_PAGE_LAYOUT_SHELL_PX,
  CHAT_PAGE_HEIGHT,
  APP_HEADER_HEIGHT_PX,
  APP_PAGE_SHELL_EXTRA_PX,
  appPageShellHeightCss,
  appPageShellLayoutSx,
  appPageShellSx,
  CLIENT_PROFILE_OUTSIDE_PAGE_LAYOUT_SHELL_PX,
  PAGE_HEIGHT,
  PAGE_HEIGHT_WITH_TAB,
  PAGE_HEIGHT_WITHOUT_HEADER,
  PAGE_HEIGHT_WITHOUT_HEADER_WITH_TAB,
  LEAD_MASTER_KANBAN_BOARD_HEIGHT,
  LEAD_MASTER_KANBAN_TOOLBAR_APPROX_PX,
  PAGE_LAYOUT_BODY_PADDING_X,
  PAGE_LAYOUT_BODY_PADDING_Y,
  PAGE_LAYOUT_BODY_PADDING_VERTICAL_PX,
  PAGE_LAYOUT_TAB_STRIP_APPROX_PX,
  PAGE_LAYOUT_TITLE_ACTIONS_APPROX_PX,
  CLIENT_PROFILE_TABBED_PAGE_LAYOUT_VIEWPORT_OPTIONS,
  VIEWPORT_OVERFLOW_BUFFER_PX,
  pageLayoutViewportHeaderReservePx,
  viewportConstrainedFlexSx,
  viewportConstrainedMaxHeightCss,
  type ViewportConstrainedMaxHeightOptions,
} from "./viewportChrome";
