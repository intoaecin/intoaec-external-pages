import { Typography } from "@mui/material";

interface UIHoverTitleProps {
  title: string;
  size?: "small" | "large";
}

export const UIHoverTitle = ({ title, size }: UIHoverTitleProps) => {
  const fontSizeByVariant = {
    small: {
      xs: ".6rem",
      sm: "1rem",
    },
    default: {
      xs: ".7rem",
      sm: "1.2rem",
    },
    large: {
      xs: ".8rem",
      sm: "1.4rem",
    },
  } as const;

  const appliedFontSize =
    size === "small"
      ? fontSizeByVariant.small
      : size === "large"
        ? fontSizeByVariant.large
        : fontSizeByVariant.default;
  const typographyVariant = size === "small" ? "body1" : "h6";

  return (
    <div className="col-lg-12 col-md-12 col-sm-12   text-center">
      <Typography
        variant={typographyVariant}
        className="fw-500  underline-on-hover"
        sx={{
          fontSize: appliedFontSize,
        }}
        gutterBottom
      >
        {title}
      </Typography>
    </div>
  );
};
