/** @type {import('next').NextConfig} */
const path = require("path");
const { config } = require("dotenv");

config();

const defaultWhitelistedDomains = [
  "https://intoaec-qa-core.s3.ap-south-1.amazonaws.com",
  "https://intoaec-qa-organizations.s3.ap-south-1.amazonaws.com",
  "https://intoaec-produ-us-core.s3.ap-south-1.amazonaws.com",
  "https://intoaec-prod-us-organizations.s3.ap-south-1.amazonaws.com",
];

const normalizeImageHostname = (domain) => {
  const trimmedDomain = domain?.trim();
  if (!trimmedDomain) return null;
  try {
    return new URL(trimmedDomain).hostname;
  } catch (_error) {
    return trimmedDomain.replace(/^https?:\/\//, "").split("/")[0];
  }
};

const whitelistedImageDomains = (
  process.env.NEXT_WHITELISTED_DOMAINS
    ? process.env.NEXT_WHITELISTED_DOMAINS.split(",")
    : defaultWhitelistedDomains
)
  .map(normalizeImageHostname)
  .filter(Boolean);

const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: whitelistedImageDomains,
  },
  experimental: {
    optimizePackageImports: ["@mui/material", "@mui/icons-material"],
  },
  swcMinify: true,
  transpilePackages: [
    "@mui/material",
    "@mui/system",
    "@mui/icons-material",
    "mui-tel-input",
  ],
};

module.exports = nextConfig;
