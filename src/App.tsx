import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { EnvProvider } from "@/features/components/providers/EnvProvider";
import { createAppTheme } from "@/styles/theme";
import HomeRedirect from "@/routes/HomeRedirect";

const LeadCapturePage = lazy(() => import("@/pages/leadCapture"));
const LeadCaptureSourcePage = lazy(
  () => import("@/pages/leadCapture/[projectSource]"),
);
const LeadCaptureThankYouPage = lazy(
  () => import("@/pages/leadCapture/thankYou"),
);
const LeadCaptureCustomerPortalPage = lazy(
  () => import("@/pages/leadCapture/customer-portal/[leadId]"),
);
const LeadCaptureV2Page = lazy(
  () => import("@/pages/leadCaptureV2/[leadCaptureV2Id]"),
);
const LeadQuestionnaireCapturePage = lazy(
  () => import("@/pages/leadQuestionnaireCapture/[questionnaireId]"),
);
const LeadQuestionnairePreviewPage = lazy(
  () => import("@/pages/leadQuestionnairePreview/[questionnaireId]"),
);
const LeadProposalPage = lazy(
  () => import("@/pages/proposal/[leadProposalId]"),
);
const ClientBoqEstimatePage = lazy(
  () => import("@/pages/client-boq/[clientEstimateId]"),
);
const ClientInvoicePage = lazy(
  () => import("@/pages/client-invoice/[clientInvoiceId]"),
);
const ClientCreditNotePage = lazy(
  () => import("@/pages/client-credit-note/[creditNoteId]"),
);
const ClientReceiptPage = lazy(
  () => import("@/pages/client-receipt/[clientReceiptId]"),
);
const VendorReceiptPage = lazy(
  () => import("@/pages/vendor-receipt/[vendorReceiptId]"),
);
const ClientRefundPage = lazy(
  () => import("@/pages/client-refund/[refundId]"),
);
const SalesOrderExternalPage = lazy(
  () => import("@/pages/sales-order/[salesOrderId]"),
);
const RfqPreviewPage = lazy(() => import("@/pages/rfq-preview/[rfqid]"));
const PoPreviewPage = lazy(() => import("@/pages/po-preview/[poid]"));
const ChangeOrderPreviewPage = lazy(
  () => import("@/pages/change-order-preview/[changeOrderId]"),
);
const ClientReportPage = lazy(() => import("@/pages/client-report"));
const SubscriptionCheckoutPage = lazy(
  () => import("@/pages/subscription/checkout-payment"),
);
const SubscriptionAddCardPage = lazy(
  () => import("@/pages/subscription/addCard"),
);
const SubscriptionPaymentSuccessPage = lazy(
  () => import("@/pages/subscription/payment-success"),
);
const SubscriptionPaymentFailedPage = lazy(
  () => import("@/pages/subscription/payment-failed"),
);
const ArchitectAvailableSlotsPage = lazy(
  () => import("@/pages/architectAvailableSlots"),
);
const ArchitectProjectSlotsPage = lazy(
  () => import("@/pages/architectAvailableSlots/[projectId]"),
);
const ArchitectSlotsThankYouPage = lazy(
  () => import("@/pages/architectAvailableSlots/thankYou"),
);
const ReportsPage = lazy(() => import("@/pages/reportsPage"));
const AssetsReportPage = lazy(() => import("@/pages/reportsPage/Assets"));
const BillsExpensesReportPage = lazy(
  () => import("@/pages/reportsPage/BillsExpenses"),
);
const ClientsReportPage = lazy(() => import("@/pages/reportsPage/Clients"));
const EmailsReportPage = lazy(() => import("@/pages/reportsPage/Emails"));
const EstimateReportPage = lazy(() => import("@/pages/reportsPage/Estimate"));
const ExpensesReportPage = lazy(() => import("@/pages/reportsPage/Expenses"));
const IncomeReportPage = lazy(() => import("@/pages/reportsPage/Income"));
const IndentReportPage = lazy(() => import("@/pages/reportsPage/Indent"));
const InventoryReportPage = lazy(
  () => import("@/pages/reportsPage/Inventory"),
);
const LeadsReportPage = lazy(() => import("@/pages/reportsPage/Leads"));
const ProposalReportPage = lazy(() => import("@/pages/reportsPage/Proposal"));
const PurchaseOrderReportPage = lazy(
  () => import("@/pages/reportsPage/PurchaseOrder"),
);
const QuestionnaireReportPage = lazy(
  () => import("@/pages/reportsPage/Questionnaire"),
);
const RfqReportPage = lazy(() => import("@/pages/reportsPage/RFQ"));
const ScheduleReportPage = lazy(() => import("@/pages/reportsPage/Schedule"));
const TasksReportPage = lazy(() => import("@/pages/reportsPage/Tasks"));
const TimeTrackingReportPage = lazy(
  () => import("@/pages/reportsPage/TimeTracking"),
);
const WorkOrderReportPage = lazy(
  () => import("@/pages/reportsPage/WorkOrder"),
);
const WorkersReportPage = lazy(() => import("@/pages/reportsPage/Workers"));

const APP_FONT_FAMILY = "'Poppins', system-ui, -apple-system, sans-serif";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnvProvider>
        <ThemeProvider theme={createAppTheme(APP_FONT_FAMILY)}>
          <CssBaseline />
          <BrowserRouter>
            <main style={{ fontFamily: APP_FONT_FAMILY }}>
              <Suspense fallback={null}>
                <Routes>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/leadCapture" element={<LeadCapturePage />} />
                <Route
                  path="/leadCapture/thankYou"
                  element={<LeadCaptureThankYouPage />}
                />
                <Route
                  path="/leadCapture/customer-portal/:leadId"
                  element={<LeadCaptureCustomerPortalPage />}
                />
                <Route
                  path="/leadCapture/:projectSource"
                  element={<LeadCaptureSourcePage />}
                />
                <Route
                  path="/leadCaptureV2/:leadCaptureV2Id"
                  element={<LeadCaptureV2Page />}
                />
                <Route path="/leadQuestionnaireCapture/:questionnaireId" element={<LeadQuestionnaireCapturePage />} />
                <Route path="/leadQuestionnairePreview/:questionnaireId" element={<LeadQuestionnairePreviewPage />} />
                <Route
                  path="/proposal/:leadProposalId"
                  element={<LeadProposalPage />}
                />
                <Route
                  path="/client-boq/:clientEstimateId"
                  element={<ClientBoqEstimatePage />}
                />
                <Route path="/client-invoice/:clientInvoiceId" element={<ClientInvoicePage />} />
                <Route path="/client-credit-note/:creditNoteId" element={<ClientCreditNotePage />} />
                <Route path="/client-receipt/:clientReceiptId" element={<ClientReceiptPage />} />
                <Route path="/vendor-receipt/:vendorReceiptId" element={<VendorReceiptPage />} />
                <Route path="/client-refund/:refundId" element={<ClientRefundPage />} />
                <Route path="/sales-order/:salesOrderId" element={<SalesOrderExternalPage />} />
                <Route
                  path="/rfq-preview/:rfqid"
                  element={<RfqPreviewPage />}
                />
                <Route
                  path="/po-preview/:poid"
                  element={<PoPreviewPage />}
                />
                <Route
                  path="/change-order-preview/:changeOrderId"
                  element={<ChangeOrderPreviewPage />}
                />
                <Route path="/client-report" element={<ClientReportPage />} />
                <Route
                  path="/subscription/checkout-payment"
                  element={<SubscriptionCheckoutPage />}
                />
                <Route
                  path="/subscription/addCard"
                  element={<SubscriptionAddCardPage />}
                />
                <Route
                  path="/subscription/payment-success"
                  element={<SubscriptionPaymentSuccessPage />}
                />
                <Route
                  path="/subscription/payment-failed"
                  element={<SubscriptionPaymentFailedPage />}
                />
                <Route
                  path="/architectAvailableSlots"
                  element={<ArchitectAvailableSlotsPage />}
                />
                <Route
                  path="/architectAvailableSlots/thankYou"
                  element={<ArchitectSlotsThankYouPage />}
                />
                <Route
                  path="/architectAvailableSlots/:projectId"
                  element={<ArchitectProjectSlotsPage />}
                />
                <Route path="/reportsPage" element={<ReportsPage />} />
                <Route path="/reportsPage/Assets" element={<AssetsReportPage />} />
                <Route path="/reportsPage/BillsExpenses" element={<BillsExpensesReportPage />} />
                <Route path="/reportsPage/Clients" element={<ClientsReportPage />} />
                <Route path="/reportsPage/Emails" element={<EmailsReportPage />} />
                <Route path="/reportsPage/Estimate" element={<EstimateReportPage />} />
                <Route path="/reportsPage/Expenses" element={<ExpensesReportPage />} />
                <Route path="/reportsPage/Income" element={<IncomeReportPage />} />
                <Route path="/reportsPage/Indent" element={<IndentReportPage />} />
                <Route path="/reportsPage/Inventory" element={<InventoryReportPage />} />
                <Route path="/reportsPage/Leads" element={<LeadsReportPage />} />
                <Route path="/reportsPage/Proposal" element={<ProposalReportPage />} />
                <Route path="/reportsPage/PurchaseOrder" element={<PurchaseOrderReportPage />} />
                <Route path="/reportsPage/Questionnaire" element={<QuestionnaireReportPage />} />
                <Route path="/reportsPage/RFQ" element={<RfqReportPage />} />
                <Route path="/reportsPage/Schedule" element={<ScheduleReportPage />} />
                <Route path="/reportsPage/Tasks" element={<TasksReportPage />} />
                <Route path="/reportsPage/TimeTracking" element={<TimeTrackingReportPage />} />
                <Route path="/reportsPage/WorkOrder" element={<WorkOrderReportPage />} />
                <Route path="/reportsPage/Workers" element={<WorkersReportPage />} />
                <Route path="*" element={<HomeRedirect />} />
                </Routes>
              </Suspense>
            </main>
          </BrowserRouter>
          <ToastContainer position="top-right" autoClose={4000} />
        </ThemeProvider>
      </EnvProvider>
    </QueryClientProvider>
  );
}
