import { ProposalPageType } from "@/types";
import { Paper } from "@mui/material";
import { useEffect, useRef, useState } from "react";
const SnapShotImg = ({ page }: { page: any }) => {
  const iframeRef = useRef<any>();
  const [imgSnap, setImageSnap] = useState<string>();
  const [clonedElement, setClonedElement] = useState<HTMLElement | null>(null);

  // Constants to keep thumbnail aspect ratio in sync with main page
  const PAGE_WIDTH = 793.700787;
  const PAGE_HEIGHT = 1122.519685;
  const THUMBNAIL_SCALE = 0.2;
  const THUMBNAIL_WIDTH = PAGE_WIDTH * THUMBNAIL_SCALE; // ≈ 158.74px
  const THUMBNAIL_HEIGHT = PAGE_HEIGHT * THUMBNAIL_SCALE; // ≈ 224.5px

  // useEffect(() => {
  //   setTimeout(() => {
  //     const pageDivId = "preview-proposal-template-" + page.pageId;
  //     // const div = document.getElementById(
  //     //   "create-proposal-template-" + page.pageId
  //     // );

  //     (async () => {
  //       const div = document.getElementById(pageDivId);
  //       if (div) {
  //         const canvas = await toPng(div, { quality: 0.1 });
  //         // setCurrentPageSnapshot(canvas.toDataURL("image/png"));
  //         setImageSnap(canvas);
  //       }
  //     })();
  //   }, 1000);
  // }, [[]]);

  useEffect(() => {
    const pageDivId = "preview-proposal-template-" + page.pageId;

    const divToLoad = document.getElementById(pageDivId);
    let timeoutId: any;

    if (divToLoad) {
      timeoutId = setTimeout(() => {
        const clonedDiv = divToLoad?.cloneNode(true) as HTMLElement;
        const computedStyle = window.getComputedStyle(divToLoad);

        // Preserve page background if any
        clonedDiv.style.backgroundImage = `${computedStyle.backgroundImage}`;
        clonedDiv.id = "snapshot-of-create-" + page.pageId;

        // Scale down the full page so the entire page fits in the thumbnail
        clonedDiv.style.transformOrigin = "top left";
        clonedDiv.style.transform = `scale(${THUMBNAIL_SCALE})`;
        clonedDiv.style.width = `${PAGE_WIDTH}px`;
        clonedDiv.style.height = `${PAGE_HEIGHT}px`;

        // Reset positioning so we don't crop to just a corner
        clonedDiv.style.setProperty("margin-top", "0px", "important");
        clonedDiv.style.setProperty("top", "0px");
        clonedDiv.style.setProperty("left", "0px");
        clonedDiv.style.setProperty("background", "transparent");
        clonedDiv.style.setProperty("border", "none");

        setClonedElement(clonedDiv);
      }, 100); // Increased timeout to ensure DOM is ready
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [page]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: `${THUMBNAIL_WIDTH}px`,
        height: `${THUMBNAIL_HEIGHT}px`,
        overflow: "hidden",
      }}
    >
      {clonedElement && (
        <div
          style={{
            border: "1px solid #ddd",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
          dangerouslySetInnerHTML={{ __html: clonedElement.outerHTML }}
        />
      )}

      {/* {imgSnap && ( */}
      {/* {imgSnap && (
        <img
          style={{
            width: 158.7401574,
            height: 224.503937,
            border: "1px solid #ccc",
          }}
          src={imgSnap}
        />
      )} */}
      {/* <iframe
        ref={iframeRef}
        // src={imgSnap}
        style={{
          backgroundImage: page?.backgroundImage
            ? `url(${page?.backgroundImage})`
            : "",
          width: "158.7401574px",
          height: "224.503937px",
          objectFit: "contain",
          border: "1px solid #d1d1d1",
          overflow: "hidden", // Hide the scrollbar
          pointerEvents: "none",
        }}
        scrolling="no" // Hide the scrollbar
      /> */}

      {/* )} */}
    </div>
  );
};

const PreviewProposalPageSection = ({
  pages,
  leadProposalId,
}: {
  pages: Array<ProposalPageType>;
  leadProposalId?: string;
}) => {
  const handlePageClick = (pageId: string) => {
    const element = document.getElementById(
      `preview-proposal-template-${pageId}`
    );
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Paper
      className="border"
      sx={{
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "8px 0",
        }}
      >
        {pages?.map((page, index) => (
          <div
            key={index}
            className="pb-2 border-bottom bg-white cursor-pointer"
            onClick={() => handlePageClick(page.pageId)}
          >
            <div className="d-flex justify-content-between align-items-center py-1">
              <div className="pb-2 px-2 fs-8">
                {page?.pageName || `Page ${index + 1}`}
              </div>
            </div>
            <div className="d-flex justify-content-center ">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "4px 0",
                }}
              >
                <SnapShotImg
                  page={page}
                  key={"preview-proposal-page-section-" + page?.pageId}
                />
              </div>
              {/* {currentPageSnapshot && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentPageSnapshot[page.pageId] ?? ""}
                  style={{
                    width: "auto",
                    height: "200px",
                    objectFit: "contain",
                    border: "1px solid #d1d1d1",
                  }}
                />
              )} */}
              {/* <span>
            <DragIcon
              style={{ width: "30px", height: "20px", fill: "#f5f5f5" }}
            />
          </span> */}
            </div>
          </div>
        ))}
      </div>
    </Paper>
  );
};

export default PreviewProposalPageSection;
