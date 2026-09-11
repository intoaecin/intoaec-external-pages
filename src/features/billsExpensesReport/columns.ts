import { useTranslation } from "react-i18next";

export const useBillsExpensesColumns = () => {
  const { t } = useTranslation();

  const columns = [
    { display: t("common.projectName"), field: "projectName", isSort: true },
    { display: t("common.name"), field: "name", isSort: true },
    { display: t("receipt.receiverName"), field: "receiverName" },
    { display: t("reports.source"), field: "source" },
    { display: t("reports.dueDate"), field: "dueDate", isSort: true },
    { display: t("common.qty"), field: "qty" },
    { display: t("common.unit"), field: "unit" },
    {
      display: t("reports.amount"),
      field: "totalAmount",
      isSort: true,
      showCurrency: true,
    },
    { display: t("reports.modeOfPayment"), field: "modeOfPayment" },
    { display: t("reports.status"), field: "status" },
  ];

  return { columns };
};

