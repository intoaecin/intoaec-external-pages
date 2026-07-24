import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CustomTabItem {
  label: React.ReactNode;
  /** MUI `Tab` only accepts a string or a single React element (not arbitrary React nodes). */
  icon?: React.ReactElement;
}

export interface CustomTabsProps {
  items: CustomTabItem[];
  value: number;
  onChange: (index: number) => void;
  fullWidth?: boolean;
  showScrollButtonsOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * Thin wrapper around MUI Tabs / Tab for icon+label strips with consistent defaults.
 */
export default function CustomTabs({
  items,
  value,
  onChange,
  fullWidth = false,
  showScrollButtonsOnHover = false,
  ariaLabel,
  className,
}: CustomTabsProps) {
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    onChange(newValue);
  };

  const updateScrollState = useCallback(() => {
    const scroller = tabsContainerRef.current?.querySelector<HTMLElement>(
      ".MuiTabs-scroller",
    );

    if (!scroller) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    if (!showScrollButtonsOnHover) return;

    const scroller = tabsContainerRef.current?.querySelector<HTMLElement>(
      ".MuiTabs-scroller",
    );

    if (!scroller) return;

    updateScrollState();

    const handleResize = () => updateScrollState();
    const handleScroll = () => updateScrollState();
    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(handleResize) : null;

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    resizeObserver?.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [showScrollButtonsOnHover, updateScrollState, items, value, fullWidth]);

  const scrollTabs = (direction: -1 | 1) => {
    const scroller = tabsContainerRef.current?.querySelector<HTMLElement>(
      ".MuiTabs-scroller",
    );

    if (!scroller) return;

    scroller.scrollBy({ left: direction * 160, behavior: "smooth" });
  };

  const tabs = (
    <Tabs
      className={className}
      value={value}
      onChange={handleChange}
      variant={fullWidth ? "fullWidth" : "scrollable"}
      scrollButtons={fullWidth || showScrollButtonsOnHover ? false : "auto"}
      allowScrollButtonsMobile
      visibleScrollbar={false}
      aria-label={ariaLabel}
      sx={{
        minHeight: 40,
        ...(!fullWidth
          ? { width: "max-content", maxWidth: "100%" }
          : { width: "100%" }),
        "& .MuiTab-root": {
          minHeight: 40,
          py: 0.75,
          px: 1.5,
          fontSize: "0.875rem",
        },
      }}
    >
      {items.map((item, index) => (
        <Tab
          key={index}
          label={item.label}
          {...(item.icon
            ? { icon: item.icon, iconPosition: "start" as const }
            : {})}
        />
      ))}
    </Tabs>
  );

  if (!showScrollButtonsOnHover) {
    return tabs;
  }

  return (
    <Box
      ref={tabsContainerRef}
      sx={{
        position: "relative",
        width: fullWidth ? "100%" : "max-content",
        maxWidth: "100%",
        "&:hover .custom-tabs-scrollButton, &:focus-within .custom-tabs-scrollButton": {
          opacity: 1,
          pointerEvents: "auto",
        },
      }}
    >
      {tabs}

      {canScrollLeft ? (
        <IconButton
          className="custom-tabs-scrollButton"
          onClick={() => scrollTabs(-1)}
          aria-label="Scroll tabs left"
          size="small"
          sx={{
            position: "absolute",
            left: -4,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            width: 28,
            height: 28,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: 1,
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 150ms ease",
            "&:hover": {
              bgcolor: "background.paper",
            },
          }}
        >
          <ChevronLeft size={16} />
        </IconButton>
      ) : null}

      {canScrollRight ? (
        <IconButton
          className="custom-tabs-scrollButton"
          onClick={() => scrollTabs(1)}
          aria-label="Scroll tabs right"
          size="small"
          sx={{
            position: "absolute",
            right: -4,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            width: 28,
            height: 28,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: 1,
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 150ms ease",
            "&:hover": {
              bgcolor: "background.paper",
            },
          }}
        >
          <ChevronRight size={16} />
        </IconButton>
      ) : null}
    </Box>
  );
}
