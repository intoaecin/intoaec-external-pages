import React from "react";
import { RfqCommentPopup } from "@/features/components/RFQ/RfqCommentPopup";
import { v4 } from "uuid";
import { getCommentParties } from "@/features/RFQAndPO/utils/commentParties";
import type { CreateRFQPOPreviewProps } from "./clientRfqPreviewTypes";

export function ClientRFQPOPreviewCommentHandler({
  commentPopupRef,
  data,
  structuredRfqComments,
  addComments,
  setStructuredRfqComments,
}: {
  commentPopupRef: React.MutableRefObject<any>;
  data: CreateRFQPOPreviewProps["data"];
  structuredRfqComments: any;
  addComments?: (id: string, text: string) => void;
  setStructuredRfqComments: (updater: any) => void;
}) {
  return (
    <RfqCommentPopup
      onChange={(commentText, currentId) => {
        console.log(
          "Current structuredRfqComments:",
          structuredRfqComments,
        );
        addComments?.(currentId, commentText);
        const { sender, receiver } = getCommentParties(data as any);
        // Step 1: Find the corresponding vendorRfqLineItemName based on currentId (vendorRfqLineItemId)
        const vendorRfqLineItem = data?.vendorRfqLineItems.find(
          (item) => item.vendorRfqLineItemId === currentId,
        );

        if (vendorRfqLineItem) {
          const { vendorRfqLineItemName } = vendorRfqLineItem;

          const newComment = {
            vrlicId: v4(),
            vendorRfqLineItemId: currentId,
            senderId: sender.id ?? "",
            senderName: sender.name ?? null,
            senderType: sender.type,
            receiverType: receiver.type,
            comment: commentText,
            createdBy: "Shree Ve",
            createdAt: Date.now().toString(),
            updatedBy: "Shree Ve",
            updatedAt: Date.now().toString(),
          };

          // Step 3: Update the comments in structuredRfqComments
          setStructuredRfqComments((prevComments: any) => {
            const updatedComments = { ...prevComments };

            // If the section for the vendorRfqLineItemName exists, update it
            if (updatedComments[vendorRfqLineItemName]) {
              updatedComments[vendorRfqLineItemName] = [
                ...updatedComments[vendorRfqLineItemName],
                newComment,
              ];
            } else {
              // If not, create a new section
              updatedComments[vendorRfqLineItemName] = [newComment];
            }

            return updatedComments;
          });
        }
      }}
      ref={commentPopupRef}
    />
  );
}
