import React, { useRef } from "react";
import { withRef } from "@udecode/cn";
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  insertImage,
  useMediaToolbarButton,
} from "@udecode/plate-media";

import { Icons } from "@/components/icons";

import { ToolbarButton } from "./toolbar";
import { useMyEditorRef } from "@/lib/plate/plate-types";
import { UIImageUploader } from "@/features/components/HelperComponents/UIImageUploader";
import { base64ToBlob } from "@/lib/helpers";
import axios from "axios";
import { useEnv } from "@/features/hooks/useEnv";
import { useSession } from "next-auth/react";

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    onUpload?:(e:string)=>void;
    nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
    parentUploadPath?: string;
  }
>(({ nodeType, parentUploadPath,onUpload, ...rest }, ref) => {
  const { props } = useMediaToolbarButton({ nodeType });
  const editor = useMyEditorRef();
  const imageUploaderRef = useRef<any>();
  const { VITE_MEETANDNOTE_ENDPOINT } = useEnv();
  const { data: session } = useSession();

  const helperUpload = async (file: any) => {
    const filePath: any = `${parentUploadPath}`;
    let blob;
    if (file?.buffer?.startsWith("data")) {
      blob = base64ToBlob(
        file?.buffer
          ?.split(",")
          .filter((val: any, index: number) => index !== 0)
          .join(",")
      );
    } else {
      const buffer = Buffer.from(file?.buffer as ArrayBuffer);
      blob = new Blob([buffer], { type: file?.fileType });
    }

    const formData = new FormData();

    formData.append("file", blob, {
      filename: file?.fileName || "file ",
    } as any);
    if (file?.fileName?.split(".")[1]) {
      formData.append("fileExtension", file?.fileName?.split(".")[1]);
    } else {
      formData.append("fileExtension", file?.fileExtension);
    }
    formData.append("filePath", filePath);
    formData.append("eventType", "ADD_MEDIA");
    formData.append("eventSource", "QUESTIONNAIRE");

    const { data } = await axios.post(
      VITE_MEETANDNOTE_ENDPOINT + "/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${session?.IdToken}`,
        },
      }
    );
    if (data) {
      // onUpload(data?.body[0]?.uri)
      return {
        fileName: file?.name || "file",
        fileType: file?.fileType || "images/jpeg",
        url: data?.body[0]?.uri ?? "",
        description: file?.description ?? "",
      };
    }
  };
  return (
    <>
      <UIImageUploader
        accept=".jpg,.png,.jpeg"
        maxFiles={1}
        ref={imageUploaderRef}
        onUpload={async (files) => {
          const result = await Promise.all(
            files.map(async (file) => {
              if (file?.buffer) {
                return await helperUpload(file);
              } else {
                return file;
              }
            })
          );
          onUpload?.(result?.[0]?.url);
          insertImage(editor, result?.[0]?.url);
        }}
      />
      <ToolbarButton
        ref={ref}
        // {...props}
        onClick={() => {
          imageUploaderRef?.current?.handleOpenModal();
        }}
        {...rest}
      >
        <Icons.image />
      </ToolbarButton>
    </>
  );
});
