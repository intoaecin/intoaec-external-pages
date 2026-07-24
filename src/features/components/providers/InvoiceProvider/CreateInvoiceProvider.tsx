import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import PageLoader from "../../Loader/PageLoader";
import { useEnv } from "@/features/hooks/useEnv";
import { v4 } from "uuid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { fetchContentFromS3 } from "@/lib/helpers";
import dayjs from "dayjs";
import {
  calculateSequentialDiscounts,
  calculateSequentialTaxes,
} from "@/utils/sequentialDiscountCalculator";
import { base64Decode } from "@/utils/string";
import { useTranslation } from "react-i18next";

export interface InvoiceLineItem {
  itemName: string;
  invoiceLineItemId: string;
  itemDescription?: string;
  itemImage?: string;
  quantity: number;
  price: number;
  currency?: string;
  taxPercentage?: number;
  totalTaxAmount?: number;
  TotalAmount?: number;
  isNonEditable?: boolean;
  reservedFieldName1?: string;
  reservedFieldValue1?: string;
  reservedFieldName2?: string;
  reservedFieldValue2?: string;
  reservedFieldName3?: string;
  reservedFieldValue3?: string;
  reservedFieldName4?: string;
  reservedFieldValue4?: string;
  reservedFieldName5?: string;
  reservedFieldValue5?: string;
}

export interface InvoicePaymentSchedule {
  senderId?: string;
  isDeposit: boolean;
  senderType?: string;
  receiverId?: string;
  invoicePaymentScheduleId: string;
  receiverType?: string;
  paymentName?: string;
  amount?: number;
  enteredAmount?: number;
  previousPaidAmount?: number;
  isEnteredAmount?: boolean;
  amountInPercentage?: number;
  balanceAmount: number;
  invoiceGrandTotal: number;
  paymentTerms?: string;
  paymentScheduleDueDate: any;
  paymentSchedulestatus: string;
  isAutoPay?: boolean;
  autoPayTriedOn?: number;
}

export interface PaymentReminder {
  invoicePaymentTermId: string;
  remindOn: number; // Timestamp for reminder
  isReminded: boolean;
  isActive: boolean;
  remindedAt?: number; // Timestamp for when reminder was sent
}

export interface InvoicePaymentTerm {
  invoicePaymentTermId: string;
  paymentName: string; // DEPOSIT or PAYMENT
  amount: number;
  amountInPercentage?: number;
  paymentTerms: string; // NET_15, NET_30, etc.
  paymentScheduleDueDate: number;
  isActive: boolean;
  reminders: PaymentReminder[];
}

export interface InvoiceData {
  invoiceId?: string;
  senderId: string;
  senderType: "AEC" | "VENDOR";
  receiverId: string;
  receiverType: string;
  invoiceAgainstEntity: string;
  // | "NEW"
  // | "PROPOSAL"
  // | "ESTIMATE"
  // | "PURCHASE_ORDER"
  // | "CHANGE_ORDER"
  // | "INVOICE";
  invoiceSerial?: string;
  invoiceName?: string;
  invoiceMode?: string;
  entityId?: string;
  invoiceCurrency?: string;
  isDiscountApplied?: boolean;
  discountAmount?: number;
  isTaxApplied?: boolean;
  taxAmount?: number;
  discountApplied?: {
    discountName: string;
    discountValue: number;
    discountId?: string;
    /** Supports fixed-amount discounts coming from proposals/estimates. */
    discountAmountUnit?: "FIXED" | "PERCENTAGE";
    discountFixedAmount?: number;
  }[];
  taxApplied?: { taxName: string; taxValue: number; taxId?: string }[];
  subTotal?: number;
  totalAmount?: number;
  balanceAmount?: number;
  isPaymentsScheduled?: boolean;
  showBankDetailsOnInvoice?: boolean;
  termsAndConditionData?: any[];
  termsAndConditionUrl?: string;
  notes?: string;
  isTaxDisplay?: boolean;
  invoiceIssuedDate?: number;
  invoiceDueDate?: number;
  invoiceLineItems?: InvoiceLineItem[];
  invoicePaymentSchedules?: InvoicePaymentSchedule[];
  invoicePaymentTerms?: InvoicePaymentTerm[];
  createdBy?: string;
  isNonEditable?: boolean;
  invoiceStatus?: string;
}

interface InvoiceContextProps {
  createInvoiceData?: InvoiceData;
  setCreateInvoiceData?: Dispatch<SetStateAction<InvoiceData>>;
  calculateTotals?: () => { subTotal: number; totalAmount: number };
  requestDeposit?: (
    depositValue: number,
    dueDate: any,
    paymentTerm: any,
    paymentUnit: string
  ) => void;
  addSchedulePayment?: () => void;
  onChangePaymentSchedules?: (
    index: number,
    value: Partial<InvoicePaymentSchedule>
  ) => void;
  onChangePaymentTerms?: (
    index: number,
    value: Partial<InvoicePaymentSchedule>
  ) => void;
  removeRow?: (id: string, index: number) => void;
  totalAmount?: number;
  subTotal?: number;
  totalTaxAmount?: number;
  totalDiscountAmount?: number;
  amountAfterDiscounts?: number;
  calculateExcessAmount?: () => void;
  updatePaymentScheduleReminders?: (
    index: number,
    reminders: PaymentReminder[]
  ) => void;
  addPaymentTerm?: () => void;
  removePaymentTerm?: (index: number) => void;
  addReminderToPaymentTerm?: (
    termIndex: number,
    reminder: PaymentReminder[]
  ) => void;
  removeReminderFromPaymentTerm?: (
    termIndex: number,
    reminderIndex: number
  ) => void;
}

const defaultInvoiceData: InvoiceData = {
  senderId: "",
  senderType: "AEC",
  invoiceSerial: "",
  receiverId: "",
  receiverType: "",
  invoiceAgainstEntity: "NEW",
  invoiceCurrency: "USD",
  isDiscountApplied: false,
  isTaxApplied: false,
  subTotal: 0,
  totalAmount: 0,
  isPaymentsScheduled: false,
  showBankDetailsOnInvoice: false,
  invoiceIssuedDate: dayjs(Date.now()).endOf("day").valueOf(),
  invoiceDueDate: dayjs(Date.now()).endOf("day").valueOf(),
  invoiceLineItems: [],
  invoicePaymentSchedules: [],
  invoicePaymentTerms: [],
  createdBy: "",
};

const InvoiceContext = createContext<InvoiceContextProps>({
  createInvoiceData: defaultInvoiceData,
  setCreateInvoiceData: () => { },
});

export const InvoiceProvider = ({
  children,
  defaultData = undefined,
  invoiceAgainstEntity,
  receiverId,
  receiverType,
  senderId,
  senderType,
  invoiceData,
  isNonEditable,
  invoiceFromScratch = false,
}: {
  children: ReactNode;
  defaultData?: Partial<InvoiceData> | undefined;
  senderId: string;
  senderType: "AEC" | "VENDOR";
  receiverId: string;
  receiverType: string;
  invoiceAgainstEntity: string;
  invoiceFromScratch?: boolean;
  invoiceData?: InvoiceData;
  isNonEditable?: boolean;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [changedPaymentSchedules, setChangedPaymentSchedules] = useState<
    string[]
  >([]);
  const { i18n } = useTranslation();
  const isSpanish = i18n.language === 'es';
  const { data: session } = useSession();
  const router = useRouter();
  const [isDefaultAdded, setIsDefaultAdded] = useState<boolean>(false);
  const [excessAmount, setExcessAmount] = useState<number>(0);
  const [createInvoiceData, setCreateInvoiceData] = useState<InvoiceData>({
    ...(defaultData ?? {}),
    invoicePaymentTerms: defaultData?.invoicePaymentTerms ?? [],
    invoiceDueDate: dayjs(Date.now()).endOf("day").valueOf(),
    invoiceIssuedDate: dayjs(Date.now()).endOf("day").valueOf(),
    invoiceMode: "CREDIT",
    invoiceAgainstEntity,
    receiverId,
    receiverType,
    senderId,
    senderType,
    invoiceLineItems:
      defaultData?.invoiceLineItems ??
      [
        // { invoiceLineItemId: v4(), itemName: "", price: 0, quantity: 0 },
      ],
  });
  function deepSanitize(data: any): any {
    if (Array.isArray(data)) {
      return data
        .filter((item) => item !== null)
        .map((item) =>
          typeof item === "object" && item !== null ? deepSanitize(item) : item
        );
    } else if (typeof data === "object" && data !== null) {
      return Object.fromEntries(
        Object.entries(data)
          .filter(([_, value]) => value !== null)
          .map(([key, value]) => [key, deepSanitize(value)])
      );
    }
    return data;
  }

  useEffect(() => {
    const normalizeTermsAndConditionData = (value: any) => {
      if (!value) return undefined;
      if (Array.isArray(value) || typeof value === "object") return value;

      if (typeof value === "string") {
        try {
          return JSON.parse(base64Decode(value));
        } catch (error) {
          try {
            return JSON.parse(value);
          } catch (innerError) {
            return undefined;
          }
        }
      }

      return undefined;
    };

    const fetchData = async () => {
      if (invoiceData) {
        const sanitizedInvoiceData = deepSanitize(invoiceData) as InvoiceData;

        setCreateInvoiceData(sanitizedInvoiceData);

        // Resolve URL from either field name variant:
        // - termsAndConditionUrl  (mapped key used in InvoiceData interface)
        // - termsAndConditionsUrl (raw key returned directly from the API on the edit page)
        const termsUrl =
          invoiceData?.termsAndConditionUrl ||
          (invoiceData as any)?.termsAndConditionsUrl;

        if (termsUrl) {
          const data = await fetchContentFromS3(termsUrl);
          const termsData = normalizeTermsAndConditionData(data);

          setCreateInvoiceData((prev) => ({
            ...prev,
            termsAndConditionData: termsData,
          }));
        } else if (invoiceData?.termsAndConditionData) {
          const termsData = normalizeTermsAndConditionData(
            invoiceData.termsAndConditionData
          );
          if (termsData) {
            setCreateInvoiceData((prev) => ({
              ...prev,
              termsAndConditionData: termsData,
            }));
          }
        }
      }
    };

    fetchData();
  }, [invoiceData]);

  // * handle when ever the issued date is changed then it will be due date and change the payment schedule date

  const calculateDueDate = (
    paymentTerm: string,
    paymentScheduleDueDate: number
  ): number => {
    // Use dayjs to get today's date and set it to the end of the day (11:59:59 PM)
    const today = dayjs(
      createInvoiceData?.invoiceIssuedDate ??
      dayjs(Date.now()).endOf("day").valueOf()
    ).endOf("day");

    let daysToAdd = 0;
    const issuedDate = dayjs(
      createInvoiceData?.invoiceIssuedDate ??
      dayjs(Date.now()).endOf("day").valueOf()
    )
      .endOf("day") // Set to 11:59:59 PM
      .toDate()
      .getTime();

    if (paymentTerm === "DUE_ON_RECEIPT") {
      return issuedDate;
    }

    if (paymentTerm === "CUSTOM") {
      return paymentScheduleDueDate > issuedDate
        ? dayjs(paymentScheduleDueDate).endOf("day").toDate().getTime()
        : issuedDate;
    }

    // Calculate days to add based on payment terms
    switch (paymentTerm) {
      case "NET_15":
        daysToAdd = 15;
        break;
      case "NET_30":
        daysToAdd = 30;
        break;
      case "NET_60":
        daysToAdd = 60;
        break;
      default:
        daysToAdd = 0; // default for immediate payment or custom terms
        break;
    }

    // Add the calculated days to today's date and set it to the end of the day
    const dueDate = today.add(daysToAdd, "days");

    return dueDate.endOf("day").toDate().getTime(); // Return timestamp in milliseconds at the end of the day
  };

  useEffect(() => {
    if (!createInvoiceData?.invoiceIssuedDate) return;
    setCreateInvoiceData((prev) => {
      const issuedDate =
        prev?.invoiceIssuedDate ?? dayjs(Date.now()).endOf("day").valueOf();
      const invoicePaymentSchedules = prev?.invoicePaymentSchedules;
      if (!invoicePaymentSchedules?.length) return prev;
      const updatedSchedules = invoicePaymentSchedules?.map((schedule) => {
        const paymentScheduleDueDate = calculateDueDate(
          schedule?.paymentTerms || "",
          schedule?.paymentScheduleDueDate
        );
        return {
          ...schedule,
          paymentScheduleDueDate: paymentScheduleDueDate,
        };
      });
      return {
        ...prev,
        invoicePaymentSchedules: updatedSchedules,
      };
    });
  }, [
    createInvoiceData.invoiceIssuedDate,
    // JSON.stringify(
    //   createInvoiceData.invoicePaymentSchedules?.map(
    //     (item: InvoicePaymentSchedule): string => item?.paymentTerms ?? ""
    //   )
    // ),
  ]);

  // ****

  // Example function to calculate totals
  const calculateTotals = (): { subTotal: number; totalAmount: number } => {
    const subTotal = createInvoiceData?.invoiceLineItems?.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalAmount =
      (subTotal ?? 0) +
      (Number(createInvoiceData.taxAmount) || 0) -
      (Number(createInvoiceData.discountAmount) || 0);
    return { subTotal: subTotal ?? 0, totalAmount };
  };

  const {
    subTotal,
    totalTaxAmount,
    totalAmount,
    totalDiscountAmount,
    amountAfterDiscounts,
  } = useMemo(() => {
    const subTotal =
      createInvoiceData?.invoiceLineItems?.reduce((prev, curr) => {
        return prev + (curr?.price ?? 0) * (curr?.quantity ?? 0);
      }, 0) ?? 0;

    let totalDiscountAmount = 0;
    let totalTaxAmount = 0;
    let amountAfterDiscounts = subTotal;

    // Check if we have discountApplied/taxApplied arrays (for proposals/estimates)
    if (
      createInvoiceData?.discountApplied?.length ||
      createInvoiceData?.taxApplied?.length
    ) {
      // Calculate sequential discounts
      const discountResult = calculateSequentialDiscounts(
        subTotal,
        createInvoiceData?.discountApplied?.map((discount) => ({
          discountId: discount.discountId || "",
          discountName: discount.discountName || "",
          discountValue: discount.discountValue || 0,
          discountAmountUnit: discount.discountAmountUnit,
          discountFixedAmount: discount.discountFixedAmount,
        })) || []
      );
      totalDiscountAmount = discountResult.totalDiscountAmount;
      amountAfterDiscounts = discountResult.amountAfterDiscounts;

      // Calculate sequential taxes on the amount after discounts
      const taxResult = calculateSequentialTaxes(
        amountAfterDiscounts,
        createInvoiceData?.taxApplied?.map((tax) => ({
          taxId: tax.taxId || "",
          taxName: tax.taxName || "",
          taxValue: tax.taxValue || 0,
        })) || []
      );
      totalTaxAmount = taxResult.totalTaxAmount;
    } else {
      // Handle individual discountAmount and taxAmount (for created invoices from scratch)
      // Convert string values to numbers to prevent string concatenation
      totalDiscountAmount = Number(createInvoiceData?.discountAmount) || 0;
      amountAfterDiscounts = subTotal - totalDiscountAmount;

      // Calculate line item taxes on the amount after discounts for invoices created from scratch
      const lineItemTaxAmount =
        createInvoiceData?.invoiceLineItems?.reduce((prev, curr) => {
          const itemSubtotal = (curr?.price ?? 0) * (curr?.quantity ?? 0);
          const itemTaxPercentage = curr?.taxPercentage || 0;

          // Calculate the proportion of this item's subtotal to the total subtotal
          const itemProportion = subTotal > 0 ? itemSubtotal / subTotal : 0;

          // Apply the same proportion of discount to this item
          const itemDiscountAmount = totalDiscountAmount * itemProportion;
          const itemAmountAfterDiscount = itemSubtotal - itemDiscountAmount;

          // Calculate tax on the discounted amount
          const itemTaxAmount = itemAmountAfterDiscount * (itemTaxPercentage / 100);
          return prev + itemTaxAmount;
        }, 0) ?? 0;

      totalTaxAmount = lineItemTaxAmount;
    }

    // Calculate total amount considering discounts and taxes
    const totalAmount = amountAfterDiscounts + totalTaxAmount;

    return {
      subTotal,
      totalTaxAmount,
      totalAmount,
      totalDiscountAmount,
      amountAfterDiscounts,
    };
  }, [
    createInvoiceData?.invoiceLineItems,
    createInvoiceData?.discountApplied,
    createInvoiceData?.taxApplied,
    createInvoiceData?.discountAmount,
  ]);

  const balanceAmount = useMemo(() => {
    if (!router?.query?.invoiceId) {
      const total = createInvoiceData?.invoicePaymentSchedules?.reduce(
        (prev, curr) => {
          return prev + (curr?.amount ?? 0);
        },
        0
      );

      const remainingAmount = (totalAmount ?? 0) - (total ?? 0);
      return remainingAmount;
    }
    return 0;
  }, [totalAmount, createInvoiceData?.invoicePaymentSchedules]);
  // useEffect(() => {
  //   console.log("Balance Amount:::", balanceAmount);

  //   setCreateInvoiceData((prev) => ({
  //     ...prev,
  //     invoicePaymentSchedules:
  //       prev.invoicePaymentSchedules?.map((schedule) => ({
  //         ...schedule,
  //         balanceAmount,
  //       })) ?? [],
  //   }));
  // }, [balanceAmount]);

  const addSchedulePayment = () => {
    const deposit = createInvoiceData?.invoicePaymentSchedules?.find(
      (val) => val.isDeposit
    );

    const remainingAmount = (totalAmount ?? 0) - (deposit?.amount ?? 0);
    const existingRegularSchedules =
      createInvoiceData?.invoicePaymentSchedules?.filter(
        (val) => !val.isDeposit
      ) ?? [];

    const newScheduleCount = existingRegularSchedules.length + 1;
    const equalSplitAmount = remainingAmount / newScheduleCount;

    setCreateInvoiceData((prev) => ({
      ...prev,
      invoicePaymentSchedules: [
        // Keep deposit if it exists
        ...(deposit ? [deposit] : []),
        // Update existing regular schedules
        ...existingRegularSchedules.map((schedule) => ({
          ...schedule,
          amount: equalSplitAmount,
          invoiceGrandTotal: totalAmount,
        })),
        // Add new schedule
        {
          isDeposit: false,
          amount: equalSplitAmount,
          invoiceGrandTotal: totalAmount,
          balanceAmount: remainingAmount - equalSplitAmount,
          senderId: session?.["custom:organization_id"],
          senderType: "AEC",
          receiverType: "CLIENT",
          receiverId: router?.query?.projectId?.toString() ?? "",
          paymentName: `Payment ${newScheduleCount}`,
          paymentSchedulestatus: "AWAITING_PAYMENT",
          paymentScheduleDueDate:
            createInvoiceData?.invoiceIssuedDate ||
            dayjs(Date.now()).endOf("day").valueOf(), // * if they select issued date then it will be due date
          invoicePaymentScheduleId: v4(),
          paymentTerms: "CUSTOM",
        },
      ],
    }));
  };
  const removeRow = (id: string, index: number) => {
    setCreateInvoiceData?.((prev) => {
      if (!prev) return prev;

      const updatedSchedules =
        prev?.invoicePaymentSchedules?.filter(
          (schedule) => schedule.invoicePaymentScheduleId !== id
        ) ?? [];

      const deposit = updatedSchedules?.find((schedule) => schedule?.isDeposit);

      const remainingAmount = (totalAmount ?? 0) - (deposit?.amount ?? 0);

      const schedulesCount = updatedSchedules?.filter(
        (schedule) => !schedule?.isDeposit
      ).length;

      const equalSplitAmount = remainingAmount / schedulesCount;

      const redistributedSchedules = updatedSchedules?.map((schedule) => {
        if (schedule?.isDeposit) {
          return schedule;
        } else {
          return {
            ...schedule,
            amount: equalSplitAmount,
          };
        }
      });

      return {
        ...prev,
        invoicePaymentSchedules: redistributedSchedules,
      };
    });
  };
  const requestDeposit = (
    depositValue: number,
    dueDate: any,
    paymentTerm: any,
    paymentUnit: string
  ) => {
    let calculatedDeposit = 0;

    if (paymentUnit === "PERCENTAGE") {
      calculatedDeposit = (depositValue / 100) * totalAmount;
    } else if (paymentUnit === "FIXED") {
      calculatedDeposit = depositValue;
    }

    if (calculatedDeposit <= totalAmount) {
      setCreateInvoiceData((prev) => {
        const existingSchedules = prev?.invoicePaymentSchedules ?? [];

        const remainingAmount = totalAmount - calculatedDeposit;
        const schedulesWithoutDeposit = existingSchedules.filter(
          (payments) => !payments.isDeposit
        );
        const scheduleCount = schedulesWithoutDeposit.length || 1;
        const equalSplitAmount = remainingAmount / scheduleCount;

        return {
          ...prev,
          invoicePaymentSchedules: [
            {
              isDeposit: true,
              amount: calculatedDeposit,
              invoiceGrandTotal: totalAmount,
              balanceAmount,
              paymentName: "Deposit",
              paymentTerms: paymentTerm,
              paymentSchedulestatus: "AWAITING_PAYMENT",
              senderType: "AEC",
              receiverType: "CLIENT",
              senderId: session?.["custom:organization_id"],
              receiverId: router?.query?.projectId?.toString() ?? "",
              paymentScheduleDueDate: dayjs(dueDate).valueOf(),
              invoicePaymentScheduleId: v4(),
            },
            ...schedulesWithoutDeposit.map((payments) => ({
              ...payments,
              amount: equalSplitAmount,
            })),
          ],
        };
      });
    }
  };

  //Payment terms
  const addPaymentTerm = () => {
    const existingTerms = createInvoiceData?.invoicePaymentTerms ?? [];

    const newTermCount = existingTerms.length + 1;
    const totalAmountValue = createInvoiceData?.totalAmount ?? 0;
    const equalSplitAmount = totalAmountValue / newTermCount;

    const updatedTerms = existingTerms.map((term, idx) => ({
      ...term,
      amount: equalSplitAmount,
    }));

    const newTerm: InvoicePaymentTerm = {
      invoicePaymentTermId: v4(),
      paymentName: `${isSpanish ? "Pago": "Payment"} ${newTermCount}`,
      amount: equalSplitAmount,
      paymentTerms: "CUSTOM",
      paymentScheduleDueDate:
        createInvoiceData?.invoiceIssuedDate ||
        dayjs(Date.now()).endOf("day").valueOf(),
      isActive: true,
      reminders: [],
    };

    setCreateInvoiceData((prev) => ({
      ...prev,
      invoicePaymentTerms: [...updatedTerms, newTerm],
    }));
  };

  const removePaymentTerm = (index: number) => {
    setCreateInvoiceData?.((prev) => {
      if (!prev) return prev;

      const existingTerms = [...(prev?.invoicePaymentTerms ?? [])];
      existingTerms.splice(index, 1); // remove by index

      const remainingCount = existingTerms.length;
      const totalAmountValue = prev?.totalAmount ?? 0;
      const equalSplitAmount =
        remainingCount > 0 ? totalAmountValue / remainingCount : 0;

      const redistributedTerms = existingTerms.map((term) => ({
        ...term,
        amount: equalSplitAmount,
      }));

      return {
        ...prev,
        invoicePaymentTerms: redistributedTerms,
      };
    });
  };

  const addReminderToPaymentTerm = (
    paymentTermIndex: number,
    reminders: PaymentReminder[]
  ) => {
    setCreateInvoiceData((prev) => {
      const updatedTerms = [...(prev?.invoicePaymentTerms ?? [])];
      if (updatedTerms[paymentTermIndex]) {
        updatedTerms[paymentTermIndex] = {
          ...updatedTerms[paymentTermIndex],
          reminders: [...reminders], // replace entire reminders array
        };
      }
      return { ...prev, invoicePaymentTerms: updatedTerms };
    });
  };

  const removeReminderFromPaymentTerm = (
    paymentTermIndex: number,
    reminderIndex: number
  ) => {
    setCreateInvoiceData((prev) => {
      const updatedTerms = [...(prev?.invoicePaymentTerms ?? [])];
      const term = updatedTerms[paymentTermIndex];
      if (term) {
        term.reminders.splice(reminderIndex, 1);
        updatedTerms[paymentTermIndex] = term;
      }
      return { ...prev, invoicePaymentTerms: updatedTerms };
    });
  };

  useEffect(() => {
    if (!createInvoiceData?.invoicePaymentSchedules?.length && totalAmount) {
      setCreateInvoiceData((prev) => ({
        ...prev,
        // invoiceLineItems: defaultData?.invoiceLineItems,
        invoicePaymentSchedules: [
          {
            isDeposit: false,
            amount: totalAmount,
            invoiceGrandTotal: totalAmount,
            balanceAmount,
            senderId: session?.["custom:organization_id"],
            receiverId: router?.query?.projectId?.toString() ?? "",
            senderType: "AEC",
            receiverType: "CLIENT",
            paymentName:
              "Payment " +
              ((createInvoiceData?.invoicePaymentSchedules?.length ?? 0) + 1),
            paymentSchedulestatus: "AWAITING_PAYMENT",
            paymentScheduleDueDate: dayjs(Date.now()).endOf("day").valueOf(),
            invoicePaymentScheduleId: v4(),
            paymentTerms: "CUSTOM",
          },
        ],
      }));
    }
  }, [createInvoiceData, totalAmount]);

  useEffect(() => {
    if (!isDefaultAdded) {
      if (defaultData?.invoiceLineItems?.length && totalAmount) {
        setCreateInvoiceData((prev) => ({
          ...prev,
          // invoiceLineItems: defaultData?.invoiceLineItems,
          invoicePaymentSchedules: [
            {
              isDeposit: false,
              amount: totalAmount,
              invoiceGrandTotal: totalAmount,
              balanceAmount,
              senderId: session?.["custom:organization_id"],
              receiverId: router?.query?.projectId?.toString() ?? "",
              senderType: "AEC",
              receiverType: "CLIENT",
              paymentName:
                "Payment " +
                ((createInvoiceData?.invoicePaymentSchedules?.length ?? 0) + 1),
              paymentSchedulestatus: "AWAITING_PAYMENT",
              paymentScheduleDueDate: dayjs(Date.now()).endOf("day").valueOf(),
              invoicePaymentScheduleId: v4(),
            },
          ],
          isNonEditable: isNonEditable,
        }));
      }
    }
  }, [defaultData, totalAmount]);

  // Add this effect to update invoiceDueDate when payment schedules change
  useEffect(() => {
    if (createInvoiceData?.invoicePaymentTerms?.length) {
      const latestDueDate = Math.max(
        ...createInvoiceData.invoicePaymentTerms.map(
          (schedule) => schedule.paymentScheduleDueDate
        )
      );

      setCreateInvoiceData((prev) => ({
        ...prev,
        invoiceDueDate: latestDueDate,
      }));
    }
  }, [createInvoiceData?.invoicePaymentTerms]);
  const onChangePaymentSchedules = (
    index: number,
    value: Partial<InvoicePaymentSchedule>
  ) => {
    setCreateInvoiceData((prev) => {
      const updatedSchedules = [
        ...(prev?.invoicePaymentSchedules?.slice(0, index) ?? []),
        {
          ...(prev?.invoicePaymentSchedules?.[index] ?? {}),
          ...(value as any),
        },
        ...(prev?.invoicePaymentSchedules?.slice(index + 1) ?? []),
      ];

      // Get the latest due date from all schedules
      const latestDueDate = Math.max(
        ...updatedSchedules.map((schedule) => schedule.paymentScheduleDueDate)
      );

      return {
        ...prev,
        invoicePaymentSchedules: updatedSchedules,
        invoiceDueDate: latestDueDate,
      };
    });
  };
  // Update the updatePaymentScheduleReminders function
  const updatePaymentScheduleReminders = (
    index: number,
    reminders: PaymentReminder[]
  ) => {
    setCreateInvoiceData((prev) => {
      const updatedPaymentTerms = [...(prev.invoicePaymentTerms || [])];
      if (updatedPaymentTerms[index]) {
        updatedPaymentTerms[index] = {
          ...updatedPaymentTerms[index],
          reminders: reminders,
        };
      }
      return {
        ...prev,
        invoicePaymentTerms: updatedPaymentTerms,
      };
    });
  };

  const onChangePaymentTerms = (
    index: number,
    value: Partial<InvoicePaymentTerm>
  ) => {
    setCreateInvoiceData((prev) => {
      const updatedTerms = [
        ...(prev?.invoicePaymentTerms?.slice(0, index) ?? []),
        {
          ...(prev?.invoicePaymentTerms?.[index] ?? {}),
          ...(value as any),
        },
        ...(prev?.invoicePaymentTerms?.slice(index + 1) ?? []),
      ];

      // Get the latest due date from all terms
      const latestDueDate = Math.max(
        ...updatedTerms.map((term) => term.paymentScheduleDueDate)
      );

      return {
        ...prev,
        invoicePaymentTerms: updatedTerms,
        invoiceDueDate: latestDueDate,
      };
    });
  };

  useEffect(() => {
    if (createInvoiceData?.invoiceLineItems) {
      const subTotal = createInvoiceData.invoiceLineItems.reduce(
        (sum, item) => sum + (item.price * item.quantity || 0),
        0
      );

      let totalDiscountAmount = 0;
      let totalTaxAmount = 0;
      let amountAfterDiscounts = subTotal;

      // Check if we have discountApplied/taxApplied arrays (for proposals/estimates)
      if (
        createInvoiceData?.discountApplied?.length ||
        createInvoiceData?.taxApplied?.length
      ) {
        // Calculate sequential discounts
        const discountResult = calculateSequentialDiscounts(
          subTotal,
          createInvoiceData?.discountApplied?.map((discount) => ({
            discountId: discount.discountId || "",
            discountName: discount.discountName || "",
            discountValue: discount.discountValue || 0,
            discountAmountUnit: discount.discountAmountUnit,
            discountFixedAmount: discount.discountFixedAmount,
          })) || []
        );
        totalDiscountAmount = discountResult.totalDiscountAmount;
        amountAfterDiscounts = discountResult.amountAfterDiscounts;

        // Calculate sequential taxes on the amount after discounts
        const taxResult = calculateSequentialTaxes(
          amountAfterDiscounts,
          createInvoiceData?.taxApplied?.map((tax) => ({
            taxId: tax.taxId || "",
            taxName: tax.taxName || "",
            taxValue: tax.taxValue || 0,
          })) || []
        );
        totalTaxAmount = taxResult.totalTaxAmount;
      } else {
        // Handle individual discountAmount and taxAmount (for created invoices from scratch)
        // Convert string values to numbers to prevent string concatenation
        totalDiscountAmount = Number(createInvoiceData?.discountAmount) || 0;
        amountAfterDiscounts = subTotal - totalDiscountAmount;

        // Calculate line item taxes on the amount after discounts for invoices created from scratch
        const lineItemTaxAmount = createInvoiceData.invoiceLineItems.reduce(
          (prev, curr) => {
            const itemSubtotal = (curr?.price ?? 0) * (curr?.quantity ?? 0);
            const itemTaxPercentage = curr?.taxPercentage || 0;

            // Calculate the proportion of this item's subtotal to the total subtotal
            const itemProportion = subTotal > 0 ? itemSubtotal / subTotal : 0;

            // Apply the same proportion of discount to this item
            const itemDiscountAmount = totalDiscountAmount * itemProportion;
            const itemAmountAfterDiscount = itemSubtotal - itemDiscountAmount;

            // Calculate tax on the discounted amount
            const itemTaxAmount = itemAmountAfterDiscount * (itemTaxPercentage / 100);
            return prev + itemTaxAmount;
          },
          0
        );

        totalTaxAmount = lineItemTaxAmount;
      }

      const newTotalAmount = amountAfterDiscounts + totalTaxAmount;

      if (invoiceData) {
        const updatedSchedules =
          createInvoiceData.invoicePaymentSchedules?.map((schedule) => ({
            ...schedule,
            invoiceGrandTotal: newTotalAmount,
            balanceAmount:
              (schedule?.amount ?? 0) -
              ((schedule?.previousPaidAmount ?? 0) || 0),
          })) ?? [];

        const updatedTerms =
          createInvoiceData.invoicePaymentTerms?.map((term) => ({
            ...term,
            amount: term.amount,
          })) ?? [];

        setCreateInvoiceData((prev) => ({
          ...prev,
          subTotal,
          totalAmount: newTotalAmount,
          taxAmount: totalTaxAmount,
          discountAmount: totalDiscountAmount,
          isDiscountApplied:
            (prev?.discountApplied?.length || 0) > 0 ||
            (Number(prev?.discountAmount) || 0) > 0,
          isTaxApplied:
            (prev?.taxApplied?.length || 0) > 0 ||
            (Number(prev?.taxAmount) || 0) > 0,
          invoicePaymentSchedules: updatedSchedules,
          invoicePaymentTerms: updatedTerms,
        }));
      } else {
        const existingSchedules =
          createInvoiceData.invoicePaymentSchedules ?? [];
        const existingTerms = createInvoiceData.invoicePaymentTerms ?? [];

        const deposit = existingSchedules.find((s) => s.isDeposit);

        let remainingAmount = newTotalAmount;
        let schedules = [...existingSchedules];

        if (deposit) {
          const depositAmount = deposit.amountInPercentage
            ? (newTotalAmount * deposit.amountInPercentage) / 100
            : deposit.amount;
          remainingAmount -= depositAmount ?? 0;

          schedules = schedules.map((schedule) =>
            schedule.isDeposit
              ? {
                ...schedule,
                amount: depositAmount,
                invoiceGrandTotal: newTotalAmount,
              }
              : schedule
          );
        }

        const regularSchedules = schedules.filter((s) => !s.isDeposit);
        const amountPerSchedule =
          regularSchedules.length > 0
            ? remainingAmount / regularSchedules.length
            : 0;

        schedules = schedules.map((schedule) =>
          !schedule.isDeposit
            ? {
              ...schedule,
              amount: amountPerSchedule,
              invoiceGrandTotal: newTotalAmount,
              balanceAmount: remainingAmount - amountPerSchedule,
            }
            : schedule
        );
        const paymentTermId = v4();
        const terms =
          existingTerms.length > 0
            ? existingTerms.map((term, idx) => ({
              ...term,
              amount: newTotalAmount / existingTerms.length,
            }))
            : [
              {
                invoicePaymentTermId: paymentTermId,
                paymentName: isSpanish ? `Pago 1`: `Payment 1`,
                isActive: true,
                paymentScheduleDueDate: dayjs(Date.now())
                  .endOf("day")
                  .valueOf(),
                paymentTerms: "DUE_ON_RECEIPT",
                amount: newTotalAmount,
                reminders: [
                  {
                    invoicePaymentTermId: paymentTermId,
                    isActive: true,
                    isReminded: false,
                    remindOn: dayjs(Date.now()).endOf("day").valueOf(),
                  },
                ],
              },
            ];

        setCreateInvoiceData((prev) => ({
          ...prev,
          subTotal,
          totalAmount: newTotalAmount,
          taxAmount: totalTaxAmount,
          discountAmount: totalDiscountAmount,
          isDiscountApplied:
            (prev?.discountApplied?.length || 0) > 0 ||
            (Number(prev?.discountAmount) || 0) > 0,
          isTaxApplied:
            (prev?.taxApplied?.length || 0) > 0 ||
            (Number(prev?.taxAmount) || 0) > 0,
          invoicePaymentSchedules: schedules,
          invoicePaymentTerms: terms,
        }));
      }
    }
  }, [
    createInvoiceData?.invoiceLineItems,
    createInvoiceData?.discountApplied,
    createInvoiceData?.taxApplied,
    createInvoiceData?.discountAmount,
  ]);

  // Recalculate payment schedules when discount or tax arrays change
  useEffect(() => {
    if (
      (createInvoiceData?.discountApplied?.length ||
        createInvoiceData?.taxApplied?.length ||
        Number(createInvoiceData?.discountAmount) ||
        Number(createInvoiceData?.taxAmount)) &&
      (createInvoiceData?.invoicePaymentSchedules?.length ?? 0) > 0
    ) {
      let totalDiscountAmount = 0;
      let totalTaxAmount = 0;
      let amountAfterDiscounts = subTotal;

      // Check if we have discountApplied/taxApplied arrays (for proposals/estimates)
      if (
        createInvoiceData?.discountApplied?.length ||
        createInvoiceData?.taxApplied?.length
      ) {
        // Calculate sequential discounts
        const discountResult = calculateSequentialDiscounts(
          subTotal,
          createInvoiceData?.discountApplied?.map((discount) => ({
            discountId: discount.discountId || "",
            discountName: discount.discountName || "",
            discountValue: discount.discountValue || 0,
            discountAmountUnit: discount.discountAmountUnit,
            discountFixedAmount: discount.discountFixedAmount,
          })) || []
        );
        totalDiscountAmount = discountResult.totalDiscountAmount;
        amountAfterDiscounts = discountResult.amountAfterDiscounts;

        // Calculate sequential taxes on the amount after discounts
        const taxResult = calculateSequentialTaxes(
          amountAfterDiscounts,
          createInvoiceData?.taxApplied?.map((tax) => ({
            taxId: tax.taxId || "",
            taxName: tax.taxName || "",
            taxValue: tax.taxValue || 0,
          })) || []
        );
        totalTaxAmount = taxResult.totalTaxAmount;
      } else {
        // Handle individual discountAmount and taxAmount (for created invoices from scratch)
        // Convert string values to numbers to prevent string concatenation
        totalDiscountAmount = Number(createInvoiceData?.discountAmount) || 0;
        amountAfterDiscounts = subTotal - totalDiscountAmount;

        // Calculate line item taxes on the amount after discounts for invoices created from scratch
        const lineItemTaxAmount =
          createInvoiceData?.invoiceLineItems?.reduce((prev, curr) => {
            const itemSubtotal = (curr?.price ?? 0) * (curr?.quantity ?? 0);
            const itemTaxPercentage = curr?.taxPercentage || 0;

            // Calculate the proportion of this item's subtotal to the total subtotal
            const itemProportion = subTotal > 0 ? itemSubtotal / subTotal : 0;

            // Apply the same proportion of discount to this item
            const itemDiscountAmount = totalDiscountAmount * itemProportion;
            const itemAmountAfterDiscount = itemSubtotal - itemDiscountAmount;

            // Calculate tax on the discounted amount
            const itemTaxAmount = itemAmountAfterDiscount * (itemTaxPercentage / 100);
            return prev + itemTaxAmount;
          }, 0) ?? 0;

        totalTaxAmount = lineItemTaxAmount;
      }

      const newTotalAmount = amountAfterDiscounts + totalTaxAmount;

      // Update existing payment schedules to reflect the new total amount
      const updatedSchedules = (
        createInvoiceData.invoicePaymentSchedules || []
      ).map((schedule) => {
        // If it's a percentage-based payment, recalculate the amount
        if (schedule.amountInPercentage) {
          const newAmount =
            (schedule.amountInPercentage / 100) * newTotalAmount;
          return {
            ...schedule,
            amount: newAmount,
            invoiceGrandTotal: newTotalAmount,
            balanceAmount: newAmount - (schedule.previousPaidAmount || 0),
          };
        }
        // For fixed amounts, recalculate based on the new total
        // If the current amount represents a percentage of the old total, maintain that percentage
        const oldTotal = subTotal + totalTaxAmount;
        if (oldTotal > 0) {
          const percentage = (schedule.amount || 0) / oldTotal;
          const newAmount = percentage * newTotalAmount;
          return {
            ...schedule,
            amount: newAmount,
            invoiceGrandTotal: newTotalAmount,
            balanceAmount: newAmount - (schedule.previousPaidAmount || 0),
          };
        }
        // Fallback: keep the same amount but update the grand total
        return {
          ...schedule,
          invoiceGrandTotal: newTotalAmount,
          balanceAmount:
            (schedule.amount || 0) - (schedule.previousPaidAmount || 0),
        };
      });

      setCreateInvoiceData?.((prev) => ({
        ...prev,
        invoicePaymentSchedules: updatedSchedules,
        totalAmount: newTotalAmount,
        taxAmount: totalTaxAmount,
        discountAmount: totalDiscountAmount,
        isDiscountApplied:
          (prev?.discountApplied?.length || 0) > 0 ||
          (Number(prev?.discountAmount) || 0) > 0,
        isTaxApplied:
          (prev?.taxApplied?.length || 0) > 0 ||
          (Number(prev?.taxAmount) || 0) > 0,
      }));
    }
  }, [
    createInvoiceData?.discountApplied,
    createInvoiceData?.taxApplied,
    createInvoiceData?.discountAmount,
    subTotal,
  ]);

  useEffect(() => {
    if (!isDefaultAdded) {
      if (defaultData) {
        if (invoiceAgainstEntity !== "PROPOSAL") {
          setCreateInvoiceData((prev) => ({
            ...(prev ?? {}),
            invoiceLineItems: defaultData?.invoiceLineItems,
            invoiceAgainstEntity: invoiceAgainstEntity,
          }));
          if (createInvoiceData?.invoiceLineItems?.length !== 0) {
            setIsDefaultAdded(true);
          }
        } else if (
          invoiceAgainstEntity === "PROPOSAL" &&
          (defaultData as any)?.pages
        ) {
          // Handle proposal data - extract line items from PRICING_TABLE
          const pricingTables = (defaultData as any).pages.flatMap(
            (page: any) =>
              page.controllers.filter(
                (controller: any) =>
                  controller.controllerName === "PRICING_TABLE"
              )
          );

          if (pricingTables.length > 0) {
            const pricingTable = pricingTables[0];
            const lineItems: any[] = [];

            if (pricingTable.content && Array.isArray(pricingTable.content)) {
              pricingTable.content.forEach((row: any[], index: number) => {
                if (row && row.length >= 3) {
                  const itemName = row[0]?.value || "";
                  const price = parseFloat(row[1]?.value || 0);
                  const quantity = parseFloat(row[2]?.value || 0);

                  if (itemName && price > 0 && quantity > 0) {
                    lineItems.push({
                      invoiceLineItemId: v4(),
                      itemName: itemName,
                      price: price,
                      quantity: quantity,
                      currency: "USD", // Default currency, can be updated based on organization settings
                    });
                  }
                }
              });
            }

            setCreateInvoiceData((prev) => ({
              ...(prev ?? {}),
              invoiceLineItems: lineItems,
              invoiceAgainstEntity: invoiceAgainstEntity,
            }));

            if (lineItems.length > 0) {
              setIsDefaultAdded(true);
            }
          }
        }
      }
    }
  }, [defaultData]);
  const calculateExcessAmount = () => {
    let excessAmount = 0;
    if (
      createInvoiceData?.invoicePaymentSchedules &&
      invoiceData?.invoicePaymentSchedules
    ) {
      createInvoiceData.invoicePaymentSchedules.forEach(
        (currentSchedule, index) => {
          const originalSchedule =
            invoiceData?.invoicePaymentSchedules?.[index];
          if (originalSchedule) {
            const paidAmount =
              (Number(originalSchedule.amount) ?? 0) -
              (Number(originalSchedule.balanceAmount) ?? 0);
            const currentAmount = Number(currentSchedule.amount) ?? 0;
            // If paid amount is greater than current schedule amount, we have excess
            if (paidAmount > currentAmount) {
              excessAmount += paidAmount - currentAmount;
              setExcessAmount(paidAmount - currentAmount);
            }
          }
        }
      );
    }
    return excessAmount;
  };

  return (
    <>
      {loading ? (
        <PageLoader />
      ) : (
        <InvoiceContext.Provider
          value={{
            createInvoiceData,
            setCreateInvoiceData,
            calculateTotals,
            requestDeposit,
            addSchedulePayment,
            onChangePaymentSchedules,
            onChangePaymentTerms,
            removeRow,
            totalAmount,
            subTotal,
            totalTaxAmount,
            totalDiscountAmount,
            amountAfterDiscounts,
            calculateExcessAmount,
            updatePaymentScheduleReminders,
            addPaymentTerm,
            removePaymentTerm,
            addReminderToPaymentTerm,
            removeReminderFromPaymentTerm,
          }}
        >
          {children}
        </InvoiceContext.Provider>
      )}
    </>
  );
};

export const useCreateInvoiceData = () => useContext(InvoiceContext);
