export interface ColorOption {
  name: string;
  shades: {
    medium: string;
    dark: string;
    extra: string;
  };
}

export const colorOptions: ColorOption[] = [
  {
    name: "red",
    shades: {
      medium: "#F7685B",
      dark: "#D94D41",
      extra: "#FFE4E1",
    },
  },
  {
    name: "pink",
    shades: {
      medium: "#F26D7D",
      dark: "#C94F5E",
      extra: "#FDEFEF",
    },
  },
  {
    name: "purple",
    shades: {
      medium: "#6F63FE",
      dark: "#5548D8",
      extra: "#B8B2FF",
    },
  },
  {
    name: "blue",
    shades: {
      medium: "#3CA2FF",
      dark: "#109CF1",
      extra: "#227391",
    },
  },
  {
    name: "cyan",
    shades: {
      medium: "#2396C1",
      dark: "#1D7EA3",
      extra: "#E5F3FF",
    },
  },
  {
    name: "green",
    shades: {
      medium: "#2ED47A",
      dark: "#05AA41",
      extra: "#E8FFF3",
    },
  },
  {
    name: "yellow",
    shades: {
      medium: "#F7AF5B",
      dark: "#D98A2F",
      extra: "#FFE5C7",
    },
  },
  {
    name: "indigo",
    shades: {
      medium: "#5C6BC0",
      dark: "#3949AB",
      extra: "#E8EAF6",
    },
  },
];

export const COLOR_PICKER_PALETTE: string[] = colorOptions.flatMap((option) => [
  option.shades.medium,
  option.shades.dark,
  option.shades.extra,
]);

export const CLIENT_REPORT_COLORS = {
  pageBackground: "#f7fafc",
  mutedText: "#6b7d92",
  sectionTitle: "#53657d",
  bodyText: "#344054",
  iconMuted: "#98a2b3",
  pdfBadge: "#ef4f45",
  border: "#dfe6ee",
  borderSoft: "#e4e9f0",
  borderMuted: "#d7e0ea",
  surfaceMuted: "#e5eef7",
  chipSelected: "#eef6ff",
  chipHover: "#f6fbff",
  paperSurface: "#ffffff",
  cardBorder: "#EAECF0",
  cardSurface: "#F9FAFB",
  pdfHeaderText: "#192a3e",
  pdfMutedSurface: "#F2F4F7",
  cardShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
  tableShadow: "0px 6px 18px 0px rgba(0, 0, 0, 0.06)",
  dialogShadow: "0px 12px 32px rgba(15, 23, 42, 0.18)",
  timeLogShadow: "0 2px 7px rgba(28, 66, 106, 0.08)",
  dimmedText: "#969696",
} as const;

export const getColorOptionShade = (
  name: string,
  shade: keyof ColorOption["shades"] = "medium",
): string | undefined =>
  colorOptions.find((option) => option.name === name)?.shades[shade];

export const getRandomColor = (): string => {
  const randomOption =
    colorOptions[Math.floor(Math.random() * colorOptions.length)];
  const shades = Object.values(randomOption.shades);
  const randomShade = shades[Math.floor(Math.random() * shades.length)];
  return randomShade;
};
