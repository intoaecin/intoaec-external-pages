"use client";

// Static import ensures the toolbar and Plate editor share the same render cycle.
// Dynamic import caused the toolbar (which uses useEditorRef) to render before
// the Plate context was mounted, breaking the toolbar UI.
import PlateEditorInner from "@/components/plate-editor-inner";

export default PlateEditorInner;
