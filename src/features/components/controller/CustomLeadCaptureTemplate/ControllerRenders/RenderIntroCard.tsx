import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useLeadCaptureTemplate } from "@/features/CustomLeadCapture/CustomLeadCaptureProvider";
import { macroEventEmitter } from "@/lib/event-emitters";
import { Box } from "@mui/material";
import router from "next/router";
import React, { useEffect, useRef, useState } from "react";
import type { EnvConfig } from "@/config/env";

const RenderIntroCard = ({
  controller,
  onChange,
  disabled = false,
}: {
  controller: any;
  onChange?: (value: any, optionIndex: number) => any;
  disabled?: boolean;
}) => {
  // const { leadCaptureTemplateData } = useLeadCaptureTemplate();
  const {
    leadCaptureTemplateData,
    setLeadCaptureTemplateData,
  } = useLeadCaptureTemplate();
  const { VITE_USERHUB_ENDPOINT, VITE_INTOAEC_LOGO } =
    useEnv() as EnvConfig;
  const [logoUrl, setLogoUrl] = useState("");
  const [content, setContent] = useState(controller?.options[0]?.value);
  const [lastFocused, setLastFocused] = useState<{
    range: any;
    ele: any;
  }>();

  const introTextContentRef = useRef<any>();
  const { post: fetch } = useAxiosWithAuth<any>(
    VITE_USERHUB_ENDPOINT + "/myorganization"
  );
  const fetchData = async () => {
    try {
      const requestData = {
        eventType: "FETCH_LOGO",
      };
      const data = await fetch(requestData);
      if (data?.code === "ORGANIZATION_LOGO_FETCH_SUCCESS") {
        setLogoUrl(data?.body?.logoUrl);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const target = introTextContentRef.current;
    const nextValue = controller?.options?.[0]?.value || "";

    if (target && target.textContent !== nextValue) {
      target.textContent = nextValue;
    }

    setContent(nextValue);
  }, [controller?.options]);

  const updateLastSelection = (target: any) => {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setLastFocused({ ele: target, range });
    }
  };

  const handleBlur = (event: any) => {
    const target = event.target;
    updateLastSelection(target);
    // Additional code to handle blur event
  };

  const insertMacro = (value: string) => {
    const target = introTextContentRef.current;
    if (!target) return;

    const isTargetFocused =
      document.activeElement === target || lastFocused?.ele === target;
    if (!isTargetFocused) return;

    target.focus();

    let range = lastFocused?.range;
    const selection = window.getSelection();

    if (!range && selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }

    if (!range) {
      range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(false);
    }

    const node = document.createTextNode(value);
    range.collapse(false);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);

    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    onChange?.(introTextContentRef?.current?.textContent, 0);
  };

  useEffect(() => {
    const handleCustomEvent = (msg: any) => {

      if (msg) {
        // addMacro(msg);
        insertMacro(msg?.macroParam);
        if (setLeadCaptureTemplateData) {
          setLeadCaptureTemplateData?.((prevData) => ({
            ...prevData,
            macros: [...(prevData?.macros || []), msg],
          }));
        } else {
          console.error("setLeadCaptureTemplateData is undefined");
        }
      }
    };

    macroEventEmitter.on("changeInMacro", handleCustomEvent);

    return () => {
      macroEventEmitter.removeListener("changeInMacro", handleCustomEvent);
    };
  }, [lastFocused]);
  const isPreview = router.pathname.includes("lead-capture");
  const isEditable = !disabled;

  return (
    <Box sx={{  }}>
      <Box className="d-flex justify-content-center  mb-4" 
      sx={{
        marginTop:{
          xs:".5rem",
          sm:0
        }
      }}
      >
        <img
          alt="Company Logo"
          src={logoUrl}
          style={{
            width: "200px",
            height: "70px",
            objectFit: "contain",
            objectPosition: "center",
          }}
        />
      </Box>
      <div
        style={{
          fontSize: "20px",
          fontWeight: 600,
          width: isPreview ? "60vw" : "auto",
          color: "black",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* {leadCaptureTemplateData?.pages
          ?.filter((page) => page.pageType === "INTRO")
          ?.map((item, index) => ( */}
        <Box
          // key={index}
          className="justify-content-center align mb-4"
          id="contentEditable"
          style={{
            width: "75%",
            margin: "0 auto",
            ...(router.pathname === "/preferences/lead-capture/edit"
              ? { height: "400px", overflowY: "auto" }
              : {}),
          }}
          contentEditable={isEditable ? "true" : "false"}
          suppressContentEditableWarning
          onFocus={(e) => {
            if (disabled) return;
            updateLastSelection(e.currentTarget);
          }}
          onKeyUp={(e) => {
            if (disabled) return;
            updateLastSelection(e.currentTarget);
          }}
          onMouseUp={(e) => {
            if (disabled) return;
            updateLastSelection(e.currentTarget);
          }}
          onBlur={(e) => {
            if (disabled) return;
            setContent(e?.currentTarget?.textContent);
            onChange?.(e?.currentTarget?.textContent, 0);
            handleBlur(e);
          }}
          ref={introTextContentRef}
          onInput={(e) => {
            if (disabled) return;
            // if (!setLeadCaptureTemplateData || !leadCaptureTemplateData) return;
            // const updatedPages = leadCaptureTemplateData?.pages?.map((page) => {
            //   if (page.pageType === "INTRO") {
            //     return {
            //       ...page,
            //       controller: page.controller.map((controller: any) => {
            //         return {
            //           ...controller,
            //           options: controller.options.map((option: any) => {
            //             return {
            //               ...option,
            //               value: content,
            //             };
            //           }),
            //         };
            //       }),
            //     };
            //   }
            //   return page;
            // });
            // setLeadCaptureTemplateData({
            //   ...leadCaptureTemplateData,
            //   pages: updatedPages,
            // });
          }}
          sx={{
            fontSize:{
              xs:"0.6rem",
              sm:"0.9rem",
            }
          }}
        >
          {content}
        </Box>
        {/* ))} */}
      </div>
    </Box>
  );
};

export default RenderIntroCard;
