// Trimmed port: the client page only renders a saved claim's change order
// lines read-only, so the draft hook (which builds a claim from the project's
// accepted change orders, an authenticated admin flow) stays in intoaec-UI.
export interface ChangeOrderClaimLine {
  changeOrderId: string;
  name: string;
  /** Full additive variation amount (the CO's price delta). */
  variationAmount: number;
  /** Accepted in previous claims. */
  previousClaimedAmount: number;
  /** What the user is claiming this period. */
  claimedThisPeriod: number | "";
  /** previousClaimedAmount + claimedThisPeriod (capped to variationAmount). */
  totalToDateAmount: number;
  selected: boolean;
}
