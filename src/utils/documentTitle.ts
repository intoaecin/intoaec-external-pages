export const DEFAULT_DOCUMENT_TITLE = "IntoAEC";

// Tab title for the org's subdomain (e.g. "acme" on acme.intoaec.ai); "IntoAEC" on localhost, IPs and www.
export const getDomainDocumentTitle = (hostname = window.location.hostname) => {
  const labels = hostname.split(".");
  const subdomain = labels.length > 2 && !/^\d+$/.test(labels[0]) ? labels[0] : undefined;
  return subdomain && subdomain !== "www" ? subdomain : DEFAULT_DOCUMENT_TITLE;
};

export const setDocumentTitle = (title?: string) => {
  document.title = title?.trim() || getDomainDocumentTitle();
};
