
export const getReceiverName = (
  receiverId: string,
  receiverType: string,
  usersData: Array<any> = [],
  vendorData: Array<any> = [],
  leadData: any
) => {
  let receiverName = "-";

  switch (receiverType) {
    case "AEC": {
      // if (leadData) {
      //   const lead = leadData?.lead || leadData;
      //   if (
      //     lead?.leadId === receiverId ||
      //     leadData?.projectId === receiverId
      //   ) {
      //     receiverName = lead?.leadName || lead?.projectName;
      //   } else {
      //     receiverName = lead?.leadName || leadData?.projectName || "-";
      //   }
      // } else {
      //   const user = usersData?.find((u: any) => u?.userId === receiverId);
      //   if (user) {
      //     receiverName = user?.name ?? "-";
      //   }
      // }
      receiverName = '-'
      break;
    }
    case "USER": {
      const user = usersData?.find((u: any) => u?.userId === receiverId);
      if (user) {
        receiverName = user?.name ?? "-";
      }
      break;
    }
    case "VENDOR": {
      let vendor = vendorData?.find(
        (v: any) => v.connectedOrganizationId === receiverId
      );
      if (!vendor) {
        vendor = vendorData?.find(
          (v: any) => v.superAdminUser?.userId === receiverId
        );
      }
      if (vendor) {
        receiverName = `${vendor?.superAdminUser?.userDetails?.firstName} ${vendor?.superAdminUser?.userDetails?.lastName}`;
      }
      break;
    }
    case "CLIENT":
      // if (leadData) {
      //   const lead = leadData?.lead || leadData;
      //   if (
      //     lead?.leadId === receiverId ||
      //     leadData?.projectId === receiverId
      //   ) {
      //     receiverName = lead?.leadName || lead?.projectName;
      //   } else {
      //     receiverName = lead?.leadName || leadData?.projectName || "-";
      //   }
      // }
      receiverName = '-'
      break;
    default:
      receiverName = "-";
      break;
  }

  return receiverName;
};

export const getFileExtensionFromName = (fileName: string = "") =>
  fileName.split(".").pop()?.toLowerCase() || "";

const imageExtensions = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
  "avif",
]);

export const getAttachmentFileName = (attachmentUrl: string) => {
  const [withoutQuery] = attachmentUrl.split("?");
  const [withoutHash] = withoutQuery.split("#");
  return decodeURIComponent(withoutHash.split("/").pop() || "file");
};

export const getAttachmentExtension = (attachmentUrl: string) =>
  getFileExtensionFromName(getAttachmentFileName(attachmentUrl));

export const isPdfAttachment = (attachmentUrl: string) =>
  getAttachmentExtension(attachmentUrl) === "pdf";

export const isImageAttachment = (attachmentUrl: string) =>
  imageExtensions.has(getAttachmentExtension(attachmentUrl));

