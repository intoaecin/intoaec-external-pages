export const getStatusColor = (status: string, theme: any) => {
    const normalized = String(status || "")
      .trim()
      .replace(/\s+/g, "_")
      .toUpperCase();
    switch (normalized) {
        case "APPROVED":
            return {
                background: theme.palette.success.main,
                color: theme.palette.success.contrastText,
            };
        case "ACCEPTED":
        case "COMPLETED":
        case "PRICE_UPDATED":
        case "ACTIVE":
        case "SUCCESS":
            return {
                background: theme.palette.success.main,
                color: theme.palette.success.contrastText,
            };
        case "CONVERTED":
            return {
                background: theme.palette.success.dark,
                color: theme.palette.success.contrastText,
            };
        case "REJECTED":
        case "DECLINED":
        case "CANCELLED":
        case "CRITICAL":
        case "ERROR":
            return {
                background: theme.palette.error.main,
                color: theme.palette.error.contrastText,
            };
        case "PENDING_APPROVAL":
            return {
                background: theme.palette.warning.main,
                color: "#ffffff",
            };
        case "PENDING":
        case "SNOOZED":
        case "IN_PROGRESS":
        case "STARTED":
        case "READY":
        case "WARNING":
            return {
                background: theme.palette.warning.main,
                color: "#ffffff",
            };
        case "ALERT":
            return {
                background: "rgba(249, 115, 22, 1)",
                color: "#ffffff",
            };
        case "INFO":
            return {
                background: theme.palette.info.main,
                color: theme.palette.info.contrastText,
            };
        case "DEFAULT":
        case "NO":
            return {
                background: theme.palette.grey[600],
                color: theme.palette.common.white,
            };
        case "ARCHIVED":
            return {
                background: theme.palette.grey[600],
                color: theme.palette.common.white,
            };
        case "SENT":
            return {
                background: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
            };
        case "DELIVERED":
            return {
                background: theme.palette.success.light,
                color: theme.palette.success.contrastText,
            };
        case "READ":
            return {
                background: theme.palette.success.main,
                color: theme.palette.success.contrastText,
            };
        case "FAILED":
            return {
                background: theme.palette.error.main,
                color: theme.palette.error.contrastText,
            };
        case "CREATED":
            return {
                background: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
            };
        case "RAISED":
            return {
                background: theme.palette.info.main,
                color: theme.palette.info.contrastText,
            };
        case "DRAFT":
            return {
                background: theme.palette.grey[500],
                color: theme.palette.common.white,
            };
        case "EDITED":
            return {
                background: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText || theme.palette.common.white,
            };
        default:
            return {
                background: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
            };
    }
};
