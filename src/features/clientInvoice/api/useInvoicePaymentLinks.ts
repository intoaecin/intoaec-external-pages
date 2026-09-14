import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { decryptAES, encryptAES, getLocalizationValue } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import type { PublicInvoice } from "../types";

interface PaymentLinks {
  overall?: string;
}

export const useInvoicePaymentLinks = (invoice?: PublicInvoice) => {
  const {
    VITE_ACCESS_KEY,
    VITE_APP_URL,
    NEXT_PUBLIC_USERHUB_ENDPOINT,
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT,
  } = useEnv();
  const { post: getSuperUser } = useAxios(`${NEXT_PUBLIC_USERHUB_ENDPOINT}/session`, false);
  const { post: getOrganization } = useAxios(`${NEXT_PUBLIC_USERHUB_ENDPOINT}/organization`, false);
  const { post: getIntegration } = useAxios(`${NEXT_PUBLIC_USERHUB_ENDPOINT}/integrations`, false);
  const { post: getLocalization } = useAxios(`${NEXT_PUBLIC_USERHUB_ENDPOINT}/userhub`, false);
  const { post: getLead } = useAxios(`${NEXT_PUBLIC_LEADMANAGER_ENDPOINT}/fetch`, false);

  return useQuery<PaymentLinks>({
    queryKey: [
      "public-invoice-payment-links",
      invoice?.invoiceId,
      invoice?.senderId,
      invoice?.totalAmount,
      invoice?.balanceAmount,
      invoice?.invoicePaymentTerms,
      VITE_APP_URL,
    ],
    enabled: Boolean(invoice?.invoiceId && invoice.senderId && invoice.senderType && VITE_ACCESS_KEY && VITE_APP_URL),
    retry: false,
    queryFn: async () => {
      if (!invoice) return {};
      const [userResponse, addressResponse, organizationResponse, integrationResponse, localizationResponse, leadResponse] =
        await Promise.all([
          getSuperUser({ eventType: "GET_ORGANIZATION_SUPER_USER", organizationId: invoice.senderId }),
          getOrganization({ eventType: "GET_ORGANIZATION_ADDRESS_INFO", organizationId: invoice.senderId }),
          getOrganization({ eventType: "GET_ORGANIZATION_DETAILS", organizationId: invoice.senderId }),
          getIntegration({ eventType: "GET_INTEGRATION_DETAILS", organizationId: invoice.senderId, organizationType: invoice.senderType, name: "STRIPE" }),
          getLocalization({ eventType: "FETCH_ORGANIZATION_LOCALIZATION", organizationId: invoice.senderId, organizationType: invoice.senderType }),
          getLead({ eventType: "GET_LEAD_BY_ID", projectId: invoice.receiverId, organizationId: invoice.senderId, organizationType: invoice.senderType }),
        ]);

      const encryptedPublishKey = Array.isArray(integrationResponse?.body)
        ? integrationResponse.body.find((item: { keyName?: string; valueofKey?: string }) => item.keyName === "publishKey")?.valueofKey
        : undefined;
      const publishKey = decryptAES(encryptedPublishKey, VITE_ACCESS_KEY);
      if (!publishKey) return {};

      const user = userResponse?.body?.[0];
      const organization = organizationResponse?.body;
      const lead = leadResponse?.body?.lead;
      const localization = localizationResponse?.body;
      const basePayload = {
        fullName: user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName,
        emailId: user?.emailId,
        mobileNumber: user?.mobileNumber,
        organizationName: organization?.organizationName,
        accountId: organization?.accountNumber ?? organization?.accountId,
        organizationId: invoice.senderId,
        senderId: invoice.senderId,
        senderType: invoice.senderType,
        receiverId: invoice.receiverId,
        publishKey,
        organizationAddress: { ...addressResponse?.body },
        timeZone: getLocalizationValue(localization, "TIMEZONE", "ID"),
        dateFormat: getLocalizationValue(localization, "DATE", "FORMAT"),
        currencyCode: getLocalizationValue(localization, "CURRENCY", "CODE") ?? invoice.invoiceCurrency,
        currency: getLocalizationValue(localization, "CURRENCY", "SYMBOL") ?? invoice.invoiceCurrency,
        clientInformation: {
          fullName: invoice.clientName ?? lead?.leadName,
          emailId: invoice.clientEmailAddress ?? lead?.leadEmail,
          mobileNumber: invoice.clientContactNumber ?? lead?.leadMobile,
          projectType: invoice.projectType ?? leadResponse?.body?.projectType,
        },
        paymentTermOrder: (invoice.invoicePaymentTerms ?? []).map((term) => term.invoicePaymentTermId),
      };
      const createLink = async (payload: Record<string, unknown>) => {
        const encrypted = await encryptAES(JSON.stringify(payload), VITE_ACCESS_KEY);
        return `${VITE_APP_URL.replace(/\/$/, "")}/invoicePayments/checkout-payment?data=${encodeURIComponent(encrypted)}`;
      };
      const overall = await createLink({
        ...basePayload,
        invoiceId: invoice.invoiceId,
        invoiceSerial: invoice.invoiceSerial,
        totalAmount: invoice.totalAmount,
        amount: invoice.totalAmount,
      });
      return { overall };
    },
  });
};
