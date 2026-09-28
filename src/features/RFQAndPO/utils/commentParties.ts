/**
 * RFQ / PO comment direction. The org-side (admin) view runs on the `app`
 * host; every other host is the vendor viewing the shared link. Comments must
 * be sent (and shown) from the viewer's side, otherwise vendor replies are
 * stored as admin comments and render on the same side of the thread.
 */
type CommentPartyData = {
  senderId?: string | null;
  senderType?: string | null;
  createdBy?: string | null;
  receiverId?: string | null;
  receiverType?: string | null;
  receiverName?: string | null;
};

export type CommentParty = {
  id?: string;
  type: string;
  name?: string;
};

/** Backend Joi schemas reject `null` and `""` for optional string fields. */
export const nonEmptyString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : undefined;

export const isAdminCommentSide = () =>
  window.location.hostname.includes("app");

export const getCommentParties = (data?: CommentPartyData) => {
  const admin: CommentParty = {
    id: nonEmptyString(data?.senderId),
    type: nonEmptyString(data?.senderType) ?? "AEC",
    name: nonEmptyString(data?.createdBy),
  };
  const vendor: CommentParty = {
    id: nonEmptyString(data?.receiverId),
    type: nonEmptyString(data?.receiverType) ?? "VENDOR",
    name: nonEmptyString(data?.receiverName),
  };

  return isAdminCommentSide()
    ? { sender: admin, receiver: vendor }
    : { sender: vendor, receiver: admin };
};
