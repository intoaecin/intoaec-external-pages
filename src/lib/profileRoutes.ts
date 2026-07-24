/**
 * Canonical lead vs client profile path detection (includes nested `/profile/...` routes).
 */
export const LEAD_MANAGER_PROFILE_PREFIX = "/leadmanager/profile";
export const CLIENT_PROFILE_PREFIX = "/client/profile";

export const LEAD_MANAGER_MASTER_REDIRECT = {
  pathname: "/leadmanager/master",
  query: { isActive: "true", isSnoozed: "false" } as Record<string, string>,
};

export const CLIENT_LIST_REDIRECT = {
  pathname: "/client",
  query: { isActive: "true" } as Record<string, string>,
};

export function isLeadManagerProfilePathname(pathname: string): boolean {
  const p = pathname?.trim() ?? "";
  return (
    p === LEAD_MANAGER_PROFILE_PREFIX ||
    p.startsWith(`${LEAD_MANAGER_PROFILE_PREFIX}/`)
  );
}

export function isClientProfilePathname(pathname: string): boolean {
  const p = pathname?.trim() ?? "";
  return (
    p === CLIENT_PROFILE_PREFIX || p.startsWith(`${CLIENT_PROFILE_PREFIX}/`)
  );
}

export function isProfilePathSection(pathname: string): boolean {
  return (
    isLeadManagerProfilePathname(pathname) ||
    isClientProfilePathname(pathname)
  );
}

/** Create-invoice standalone page (`/invoicePayments/create`). */
export const INVOICE_PAYMENTS_CREATE_PATHNAME = "/invoicePayments/create";

export function isInvoicePaymentsCreatePathname(pathname: string): boolean {
  const p = pathname?.trim() ?? "";
  return p === INVOICE_PAYMENTS_CREATE_PATHNAME;
}

/** Profile index or Schedule tab hides main nav sidebar (matches AuthProvider rules). */
export function isLeadOrClientProfileIndexPath(pathname: string): boolean {
  return (
    pathname === "/leadmanager/profile" ||
    pathname === "/client/profile"
  );
}
