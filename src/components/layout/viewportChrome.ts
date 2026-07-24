import type { SxProps, Theme } from "@mui/material";

/**
 * Viewport chrome helpers for panels that must not overflow the main scroll container by a few pixels.
 *
 * ## When to use what
 *
 * 1. **Preferred — pure flex**
 *    If every ancestor up to `AppLayout` / `AppContent` is `display: flex`, `flex: 1`, `minHeight: 0`, let the
 *    feature fill `PageLayout`’s body with `flex: 1`, `minHeight: 0`, `overflow: hidden`, and scroll *inside*
 *    the panel. No `100dvh` math.
 *
 * 2. **Fallback — viewport cap**
 *    If a parent uses content height (e.g. Bootstrap `container` / `row` without a bounded flex chain), cap the
 *    panel with `viewportConstrainedMaxHeightCss()` or `viewportConstrainedFlexSx()` so height ≤ visible area.
 *
 * 3. **Pick `outsideShellPx`**
 *    Sum everything from the top of the **viewport** (or `AppContent` top) down to the **top of your
 *    `PageLayout`** (breadcrumbs, extra toolbars, padding). Tune once per host layout; add named presets here
 *    when a route is reused (see `CLIENT_PROFILE_OUTSIDE_PAGE_LAYOUT_SHELL_PX`).
 *
 * 4. **Match `pageLayoutTabs`**
 *    Pass `true` only if the parent `PageLayout` renders the tab strip; it adds `PAGE_LAYOUT_TAB_STRIP_APPROX_PX`.
 */

/** MUI `PageLayout` title + actions row (see `PageLayout.tsx`). */
export const PAGE_LAYOUT_TITLE_ACTIONS_APPROX_PX = 56;

/** Tab + secondary-actions row when `tabs` is enabled. */
export const PAGE_LAYOUT_TAB_STRIP_APPROX_PX = 58;

/** Horizontal padding on `PageLayout`’s body `Box` (`sx.px: 2`). */
export const PAGE_LAYOUT_BODY_PADDING_X = 2;

/** Vertical padding on `PageLayout`’s body `Box` (`sx.py: 1`). */
export const PAGE_LAYOUT_BODY_PADDING_Y = 1;

/**
 * Vertical padding on `PageLayout`’s body `Box` (`sx.py: 1` → spacing 1 top + bottom).
 * Default MUI spacing unit is 8px, so 8 + 8 = 16. Keep in sync with `PageLayout.tsx`.
 */
export const PAGE_LAYOUT_BODY_PADDING_VERTICAL_PX = 16;

/** Sub-pixel / `dvh` rounding / borders — avoids a 1–3px outer scrollbar. */
export const VIEWPORT_OVERFLOW_BUFFER_PX = 5;

/** App header bar height (matches `AppHeader` in `AppLayout.tsx`). */
export const APP_HEADER_HEIGHT_PX = 56;

/** Extra reserve below the app header for page shells (template-center / profile feature tabs). */
export const APP_PAGE_SHELL_EXTRA_PX = 16;

/** CSS height for a full-viewport page shell directly under the app header. */
export function appPageShellHeightCss(): string {
  return `calc(100dvh - ${
    APP_HEADER_HEIGHT_PX +
    VIEWPORT_OVERFLOW_BUFFER_PX +
    APP_PAGE_SHELL_EXTRA_PX
  }px)`;
}

/** `sx` for the outer viewport shell that bounds `PageLayout` to the visible area. */
export const appPageShellSx: SxProps<Theme> = {
  height: appPageShellHeightCss(),
  maxHeight: appPageShellHeightCss(),
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  bgcolor: "background.paper",
};

/** `sx` for `PageLayout` when it is a flex child of {@link appPageShellSx}. */
export const appPageShellLayoutSx: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  height: "auto",
  maxHeight: "none",
};

/**
 * Default “chrome above `PageLayout`” on client profile feature tabs (`/client/profile?tab=…`).
 * Adjust if breadcrumbs or headers change.
 */
export const CLIENT_PROFILE_OUTSIDE_PAGE_LAYOUT_SHELL_PX = 48;

/** Top-level routes under AppLayout (MiniDrawer AppBar only, no client-profile breadcrumb). */
export const APP_SHELL_OUTSIDE_PAGE_LAYOUT_SHELL_PX = 56;

/** Immersive `/chat` workspace — full content height below the app header. */
export const CHAT_PAGE_HEIGHT = `calc(100dvh - ${
  APP_SHELL_OUTSIDE_PAGE_LAYOUT_SHELL_PX + VIEWPORT_OVERFLOW_BUFFER_PX + 8
}px)`;

export function pageLayoutViewportHeaderReservePx(options: {
  tabs: boolean;
}): number {
  return (
    PAGE_LAYOUT_TITLE_ACTIONS_APPROX_PX +
    (options.tabs ? PAGE_LAYOUT_TAB_STRIP_APPROX_PX : 0)
  );
}

export type ViewportConstrainedMaxHeightOptions = {
  /** Pixels from viewport (or main content) top down to the top of the surrounding `PageLayout`. */
  outsideShellPx: number;
  /** Same as parent `PageLayout` `tabs` prop. */
  pageLayoutTabs: boolean;
  /** Extra reserve; defaults to {@link VIEWPORT_OVERFLOW_BUFFER_PX}. */
  bufferPx?: number;
  /** `dvh` tracks dynamic toolbars; `svh` is stabler on some mobile browsers. */
  viewportUnit?: "dvh" | "svh" | "vh";
};

export function viewportConstrainedMaxHeightCss(
  options: ViewportConstrainedMaxHeightOptions,
): string {
  const buffer = options.bufferPx ?? VIEWPORT_OVERFLOW_BUFFER_PX;
  const unit = options.viewportUnit ?? "dvh";
  const header = pageLayoutViewportHeaderReservePx({
    tabs: options.pageLayoutTabs,
  });
  const totalPx =
    options.outsideShellPx +
    header +
    buffer +
    PAGE_LAYOUT_BODY_PADDING_VERTICAL_PX;
  return `calc(100${unit} - ${totalPx}px)`;
}

/**
 * Preset for any tabbed {@link PageLayout} embedded under client profile (e.g. `/client/profile?tab=…`).
 * Uses {@link CLIENT_PROFILE_OUTSIDE_PAGE_LAYOUT_SHELL_PX} and includes tab strip + body `py: 1` in the calc
 * via {@link viewportConstrainedMaxHeightCss}.
 */
export const CLIENT_PROFILE_TABBED_PAGE_LAYOUT_VIEWPORT_OPTIONS = {
  outsideShellPx: CLIENT_PROFILE_OUTSIDE_PAGE_LAYOUT_SHELL_PX,
  pageLayoutTabs: true,
} satisfies ViewportConstrainedMaxHeightOptions;

export const PAGE_HEIGHT = viewportConstrainedMaxHeightCss({
  outsideShellPx: CLIENT_PROFILE_OUTSIDE_PAGE_LAYOUT_SHELL_PX,
  pageLayoutTabs: false,
  bufferPx: VIEWPORT_OVERFLOW_BUFFER_PX,
});

export const PAGE_HEIGHT_WITH_TAB = viewportConstrainedMaxHeightCss({
  ...CLIENT_PROFILE_TABBED_PAGE_LAYOUT_VIEWPORT_OPTIONS,
  bufferPx: VIEWPORT_OVERFLOW_BUFFER_PX,
});

export const PAGE_HEIGHT_WITHOUT_HEADER = `calc(100dvh - ${
  CLIENT_PROFILE_OUTSIDE_PAGE_LAYOUT_SHELL_PX +
  PAGE_LAYOUT_BODY_PADDING_VERTICAL_PX +
  VIEWPORT_OVERFLOW_BUFFER_PX
}px)`;

export const PAGE_HEIGHT_WITHOUT_HEADER_WITH_TAB = `calc(100dvh - ${
  CLIENT_PROFILE_OUTSIDE_PAGE_LAYOUT_SHELL_PX +
  PAGE_LAYOUT_TAB_STRIP_APPROX_PX +
  PAGE_LAYOUT_BODY_PADDING_VERTICAL_PX +
  VIEWPORT_OVERFLOW_BUFFER_PX
}px)`;

/**
 * Kanban board body on lead master (`/leadmanager/master?view=kanban`): PageLayout chrome +
 * {@link PAGE_LAYOUT_TITLE_ACTIONS_APPROX_PX}, tab strip, body padding, toolbar row, and `mt: 1` gap.
 */
export const LEAD_MASTER_KANBAN_TOOLBAR_APPROX_PX = 52;

/** Room for the board’s horizontal scrollbar under the column row. */
export const LEAD_MASTER_KANBAN_HORIZONTAL_SCROLLBAR_PX = 12;

export const LEAD_MASTER_KANBAN_BOARD_HEIGHT = `calc(100dvh - ${
  CLIENT_PROFILE_OUTSIDE_PAGE_LAYOUT_SHELL_PX +
  PAGE_LAYOUT_TITLE_ACTIONS_APPROX_PX +
  PAGE_LAYOUT_TAB_STRIP_APPROX_PX +
  PAGE_LAYOUT_BODY_PADDING_VERTICAL_PX +
  VIEWPORT_OVERFLOW_BUFFER_PX +
  LEAD_MASTER_KANBAN_TOOLBAR_APPROX_PX +
  8 +
  LEAD_MASTER_KANBAN_HORIZONTAL_SCROLLBAR_PX
}px)`;

/**
 * Common `sx` for a `PageLayout` child that should flex-fill but stay within the viewport when the flex chain
 * does not bound height.
 */
export function viewportConstrainedFlexSx(
  options: ViewportConstrainedMaxHeightOptions,
): SxProps<Theme> {
  return {
    flex: 1,
    minHeight: 0,
    maxHeight: viewportConstrainedMaxHeightCss(options),
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };
}
