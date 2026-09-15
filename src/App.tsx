import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { EnvProvider } from "@/features/components/providers/EnvProvider";
import { createAppTheme } from "@/styles/theme";
import HomeRedirect from "@/routes/HomeRedirect";
import LeadCapturePage from "@/pages/leadCapture";
import LeadCaptureSourcePage from "@/pages/leadCapture/[projectSource]";
import LeadCaptureThankYouPage from "@/pages/leadCapture/thankYou";
import LeadCaptureCustomerPortalPage from "@/pages/leadCapture/customer-portal/[leadId]";
import LeadCaptureV2Page from "@/pages/leadCaptureV2/[leadCaptureV2Id]";
import LeadQuestionnaireCapturePage from "@/pages/leadQuestionnaireCapture/[questionnaireId]";
import LeadQuestionnairePreviewPage from "@/pages/leadQuestionnairePreview/[questionnaireId]";
import LeadProposalPage from "@/pages/proposal/[leadProposalId]";
import ClientBoqEstimatePage from "@/pages/client-boq/[clientEstimateId]";
import ClientInvoicePage from "@/pages/client-invoice/[clientInvoiceId]";
import ClientCreditNotePage from "@/pages/client-credit-note/[creditNoteId]";
import ClientReceiptPage from "@/pages/client-receipt/[clientReceiptId]";
import VendorReceiptPage from "@/pages/vendor-receipt/[vendorReceiptId]";
import ClientRefundPage from "@/pages/client-refund/[refundId]";
import SalesOrderExternalPage from "@/pages/sales-order/[salesOrderId]";
import RfqPreviewPage from "@/pages/rfq-preview/[rfqid]";
import PoPreviewPage from "@/pages/po-preview/[poid]";
import ChangeOrderPreviewPage from "@/pages/change-order-preview/[changeOrderId]";
import ClientReportPage from "@/pages/client-report";
import SubscriptionCheckoutPage from "@/pages/subscription/checkout-payment";
import SubscriptionAddCardPage from "@/pages/subscription/addCard";
import SubscriptionPaymentSuccessPage from "@/pages/subscription/payment-success";
import SubscriptionPaymentFailedPage from "@/pages/subscription/payment-failed";
import ArchitectAvailableSlotsPage from "@/pages/architectAvailableSlots";
import ArchitectProjectSlotsPage from "@/pages/architectAvailableSlots/[projectId]";
import ArchitectSlotsThankYouPage from "@/pages/architectAvailableSlots/thankYou";
import ReportsPage from "@/pages/reportsPage";
import AssetsReportPage from "@/pages/reportsPage/Assets";
import BillsExpensesReportPage from "@/pages/reportsPage/BillsExpenses";
import ClientsReportPage from "@/pages/reportsPage/Clients";
import EmailsReportPage from "@/pages/reportsPage/Emails";
import EstimateReportPage from "@/pages/reportsPage/Estimate";
import ExpensesReportPage from "@/pages/reportsPage/Expenses";
import IncomeReportPage from "@/pages/reportsPage/Income";
import IndentReportPage from "@/pages/reportsPage/Indent";
import InventoryReportPage from "@/pages/reportsPage/Inventory";
import LeadsReportPage from "@/pages/reportsPage/Leads";
import ProposalReportPage from "@/pages/reportsPage/Proposal";
import PurchaseOrderReportPage from "@/pages/reportsPage/PurchaseOrder";
import QuestionnaireReportPage from "@/pages/reportsPage/Questionnaire";
import RfqReportPage from "@/pages/reportsPage/RFQ";
import ScheduleReportPage from "@/pages/reportsPage/Schedule";
import TasksReportPage from "@/pages/reportsPage/Tasks";
import TimeTrackingReportPage from "@/pages/reportsPage/TimeTracking";
import WorkOrderReportPage from "@/pages/reportsPage/WorkOrder";
import WorkersReportPage from "@/pages/reportsPage/Workers";

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
            </main>
          </BrowserRouter>
          <ToastContainer position="top-right" autoClose={4000} />
        </ThemeProvider>
      </EnvProvider>
    </QueryClientProvider>
  );
}
