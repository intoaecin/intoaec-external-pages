import React from "react";
import { RfqCommentPopup } from "@/features/components/RFQ/RfqCommentPopup";
import { v4 } from "uuid";

export type POPreviewCommentHandlerProps = {
  commentPopupRef: React.MutableRefObject<any>;
  data: any;
  structuredPoComments: any;
  addComments?: (id: string, text: string) => void;
  setStructuredPoComments: (updater: any) => void;
};

export function POPreviewCommentHandler({
  commentPopupRef,
  data,
  structuredPoComments,
  addComments,
  setStructuredPoComments,
}: POPreviewCommentHandlerProps) {
  return (
      <RfqCommentPopup
        onChange={async (commentText, currentId) => {
          console.log(
            "Current structuredPoComments:",
            structuredPoComments,
            commentText,
            currentId
          );
          addComments?.(currentId, commentText);
          // Step 1: Find the corresponding rfqLineItemName based on currentId (rliId)
          const rfqLineItem = await data?.poLineItems?.find(
            (item: any) => item.poliId === currentId
          );

          if (rfqLineItem) {
            const { poItemName } = rfqLineItem;

            const newComment = {
              pocId: v4(),
              poEntityId: currentId,
              poEntityType: "LINE_ITEM",
              senderId: data?.organizationId ? data?.organizationId : "",
              senderName: null,
              senderType: "AEC",
              receiverType: "VENDOR",
              comments: commentText,
              createdBy: "Shree Ve",
              createdAt: Date.now().toString(),
              updatedBy: "Shree Ve",
              updatedAt: Date.now().toString(),
            };

            // Step 3: Update the comments in structuredPoComments
            setStructuredPoComments((prevComments: any) => {
              const updatedComments = { ...prevComments };

              // If the section for the rfqLineItemName exists, update it
              if (updatedComments[poItemName]) {
                updatedComments[poItemName].push(newComment);
              } else {
                // If not, create a new section
                updatedComments[poItemName] = [newComment];
              }

              return updatedComments;
            });
          } else {
            const newComment = {
              pocId: v4(),
              poEntityId: currentId,
              poEntityType: "TERMS_AND_CONDITION",
              senderId: data?.organizationId ? data?.organizationId : "",
              senderName: null,
              senderType: "AEC",
              receiverType: "VENDOR",
              comments: commentText,
              createdBy: "Shree Ve",
              createdAt: Date.now().toString(),
              updatedBy: "Shree Ve",
              updatedAt: Date.now().toString(),
            };

            // Step 3: Update the comments in structuredPoComments
            setStructuredPoComments((prevComments: any) => {
              const updatedComments = { ...prevComments };

              // If the section for the rfqLineItemName exists, update it
              if (updatedComments["termsAndCondition"]) {
                updatedComments["termsAndCondition"].push(newComment);
              } else {
                // If not, create a new section
                updatedComments["termsAndCondition"] = [newComment];
              }

              return updatedComments;
            });
          }
        }}
        ref={commentPopupRef}
      />

  );
}
