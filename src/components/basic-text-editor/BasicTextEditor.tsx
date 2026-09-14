import React, { useCallback, useEffect, useRef, useState } from "react";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import {
  Box,
  FormHelperText,
  IconButton,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type EditorCommand =
  | "bold"
  | "italic"
  | "underline"
  | "insertUnorderedList"
  | "insertOrderedList";

type ColorCommand = "foreColor" | "hiliteColor" | "backColor";
type ColorStateKey = "textColor" | "highlightColor";

interface ToolbarOption {
  command: EditorCommand;
  icon: React.ReactNode;
  labelKey: string;
}

export interface BasicTextEditorProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  helperText?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  isPreview?: boolean;
  minHeight?: number;
  maxVisibleLines?: number;
  onChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
}

const toolbarOptions: ToolbarOption[] = [
  {
    command: "bold",
    icon: <FormatBoldIcon fontSize="small" />,
    labelKey: "basicTextEditor.bold",
  },
  {
    command: "italic",
    icon: <FormatItalicIcon fontSize="small" />,
    labelKey: "basicTextEditor.italic",
  },
  {
    command: "underline",
    icon: <FormatUnderlinedIcon fontSize="small" />,
    labelKey: "basicTextEditor.underline",
  },
  {
    command: "insertUnorderedList",
    icon: <FormatListBulletedIcon fontSize="small" />,
    labelKey: "basicTextEditor.bulletList",
  },
  {
    command: "insertOrderedList",
    icon: <FormatListNumberedIcon fontSize="small" />,
    labelKey: "basicTextEditor.numberedList",
  },
];

const normalizeEditorValue = (value: string) => {
  const trimmedValue = value.trim();

  if (trimmedValue === "<br>" || trimmedValue === "<div><br></div>") {
    return "";
  }

  return value;
};

const getSelectedElement = (editor: HTMLDivElement) => {
  const selection = window.getSelection();
  const selectedNode = selection?.anchorNode;

  if (!selectedNode || !editor.contains(selectedNode)) {
    return null;
  }

  return selectedNode.nodeType === Node.ELEMENT_NODE
    ? (selectedNode as Element)
    : selectedNode.parentElement;
};

const isEmptyListItem = (listItem: HTMLElement) =>
  listItem.textContent?.replace(/\u00a0/g, " ").trim() === "";

const moveSelectionToElement = (element: HTMLElement) => {
  const selection = window.getSelection();
  const range = document.createRange();

  range.selectNodeContents(element);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);
};

const createEmptyParagraph = () => {
  const paragraph = document.createElement("div");
  paragraph.innerHTML = "<br>";

  return paragraph;
};

const splitOrderedListAtSelection = (editor: HTMLDivElement) => {
  const selectedElement = getSelectedElement(editor);
  const listItem = selectedElement?.closest("li");
  const currentList = listItem?.parentElement;

  if (
    !listItem ||
    !currentList ||
    currentList.tagName.toLowerCase() !== "ol" ||
    !listItem.previousElementSibling
  ) {
    return;
  }

  const nextList = document.createElement("ol");
  nextList.setAttribute("start", "1");

  let itemToMove: ChildNode | null = listItem;

  while (itemToMove) {
    const nextItem: ChildNode | null = itemToMove.nextSibling;
    nextList.appendChild(itemToMove);
    itemToMove = nextItem;
  }

  currentList.parentElement?.insertBefore(nextList, currentList.nextSibling);
  moveSelectionToElement(listItem);
};

const normalizeCssColor = (color: string | null | undefined) => {
  if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") {
    return "";
  }

  return color;
};

const findSelectionColor = (
  editor: HTMLDivElement,
  cssProperty: "color" | "backgroundColor"
) => {
  let selectedElement = getSelectedElement(editor);

  while (selectedElement && selectedElement !== editor) {
    const styles = window.getComputedStyle(selectedElement);
    const color = normalizeCssColor(styles[cssProperty]);

    if (color) {
      return color;
    }

    selectedElement = selectedElement.parentElement;
  }

  return "";
};

const colorOptions: {
  command: ColorCommand;
  fallbackCommand?: ColorCommand;
  icon: React.ReactNode;
  labelKey: string;
  stateKey: ColorStateKey;
}[] = [
  {
    command: "foreColor",
    icon: <FormatColorTextIcon fontSize="small" />,
    labelKey: "basicTextEditor.textColor",
    stateKey: "textColor",
  },
  {
    command: "hiliteColor",
    fallbackCommand: "backColor",
    icon: <FormatColorFillIcon fontSize="small" />,
    labelKey: "basicTextEditor.highlightColor",
    stateKey: "highlightColor",
  },
];

const BasicTextEditor: React.FC<BasicTextEditorProps> = ({
  id,
  name,
  value,
  defaultValue = "",
  placeholder,
  helperText,
  disabled = false,
  readOnly = false,
  error = false,
  isPreview = false,
  minHeight = 140,
  maxVisibleLines = 10,
  onChange,
  onBlur,
  onFocus,
}) => {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [activeCommands, setActiveCommands] = useState<
    Partial<Record<EditorCommand, boolean>>
  >({});
  const [selectedColors, setSelectedColors] = useState<
    Partial<Record<ColorStateKey, string>>
  >({});
  const [isFocused, setIsFocused] = useState(false);
  const isControlled = value !== undefined;
  const isEditable = !disabled && !readOnly && !isPreview;

  const updateActiveCommands = useCallback(() => {
    if (typeof document === "undefined" || !isEditable) {
      return;
    }

    const selection = window.getSelection();
    const selectedNode = selection?.anchorNode;
    const editor = editorRef.current;
    const hasEditorSelection = !!selectedNode && !!editor?.contains(selectedNode);

    if (!hasEditorSelection || !editor) {
      setActiveCommands({});
      setSelectedColors({});
      return;
    }

    setActiveCommands(
      toolbarOptions.reduce<Partial<Record<EditorCommand, boolean>>>(
        (commands, option) => ({
          ...commands,
          [option.command]: document.queryCommandState(option.command),
        }),
        {}
      )
    );
    setSelectedColors({
      textColor: findSelectionColor(editor, "color"),
      highlightColor: findSelectionColor(editor, "backgroundColor"),
    });
  }, [isEditable]);

  const emitChange = useCallback(() => {
    const nextValue = normalizeEditorValue(editorRef.current?.innerHTML ?? "");
    onChange?.(nextValue);
  }, [onChange]);

  const runCommand = (command: EditorCommand) => {
    if (!isEditable || typeof document === "undefined") {
      return;
    }

    editorRef.current?.focus();
    const selectedElement = editorRef.current
      ? getSelectedElement(editorRef.current)
      : null;
    const shouldStartNewOrderedList =
      command === "insertOrderedList" && !selectedElement?.closest("ol");

    document.execCommand(command);
    if (command === "insertOrderedList" && editorRef.current) {
      if (shouldStartNewOrderedList) {
        splitOrderedListAtSelection(editorRef.current);
      }

      editorRef.current
        .querySelectorAll("ol")
        .forEach((list) => list.setAttribute("start", "1"));
    }
    updateActiveCommands();
    emitChange();
  };

  const runColorCommand = (
    command: ColorCommand,
    color: string,
    stateKey: ColorStateKey,
    fallbackCommand?: ColorCommand
  ) => {
    if (!isEditable || typeof document === "undefined") {
      return;
    }

    editorRef.current?.focus();
    const didApplyCommand = document.execCommand(command, false, color);

    if (!didApplyCommand && fallbackCommand) {
      document.execCommand(fallbackCommand, false, color);
    }

    setSelectedColors((prev) => ({
      ...prev,
      [stateKey]: color,
    }));
    emitChange();
  };

  const handleInput = () => {
    emitChange();
    updateActiveCommands();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      typeof document !== "undefined" &&
      editorRef.current
    ) {
      const selectedElement = getSelectedElement(editorRef.current);
      const listItem = selectedElement?.closest("li") as HTMLElement | null;
      const list = listItem?.parentElement;

      if (listItem && list && isEmptyListItem(listItem)) {
        event.preventDefault();

        const paragraph = createEmptyParagraph();
        list.parentElement?.insertBefore(paragraph, list.nextSibling);
        listItem.remove();

        if (!list.querySelector("li")) {
          list.remove();
        }

        moveSelectionToElement(paragraph);
        updateActiveCommands();
        emitChange();
        return;
      }
    }

    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    const keyCommandMap: Record<string, EditorCommand> = {
      b: "bold",
      i: "italic",
      u: "underline",
    };
    const command = keyCommandMap[event.key.toLowerCase()];

    if (command) {
      event.preventDefault();
      runCommand(command);
    }
  };

  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = (event) => {
    if (!isEditable || typeof document === "undefined") {
      return;
    }

    event.preventDefault();
    document.execCommand("insertText", false, event.clipboardData.getData("text"));
    emitChange();
  };

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = (event) => {
    setIsFocused(false);
    setActiveCommands({});
    setSelectedColors({});
    onBlur?.(event);
  };

  const handleFocus: React.FocusEventHandler<HTMLDivElement> = (event) => {
    setIsFocused(true);
    updateActiveCommands();
    onFocus?.(event);
  };

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const nextValue = isControlled ? value ?? "" : defaultValue;

    if (editor.innerHTML !== nextValue) {
      editor.innerHTML = nextValue;
    }
  }, [defaultValue, isControlled, value]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateActiveCommands);

    return () => {
      document.removeEventListener("selectionchange", updateActiveCommands);
    };
  }, [updateActiveCommands]);

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          borderColor: error ? "error.main" : "divider",
          opacity: disabled ? 0.6 : 1,
          overflow: "hidden",
        }}
      >
        {!isPreview ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.default",
              px: 1,
              py: 0.5,
            }}
          >
            {toolbarOptions.map((option) => {
              const label = t(option.labelKey);

              return (
                <Tooltip key={option.command} title={label}>
                  <span>
                    <IconButton
                      aria-label={label}
                      color={
                        isFocused && activeCommands[option.command]
                          ? "primary"
                          : "default"
                      }
                      disabled={!isEditable}
                      onClick={() => runCommand(option.command)}
                      onMouseDown={(event) => event.preventDefault()}
                      size="small"
                    >
                      {option.icon}
                    </IconButton>
                  </span>
                </Tooltip>
              );
            })}
            {colorOptions.map((option) => {
              const label = t(option.labelKey);

              return (
                <Tooltip key={option.command} title={label}>
                  <span>
                    <IconButton
                      aria-label={label}
                      component="label"
                      disabled={!isEditable}
                      size="small"
                      sx={{ position: "relative" }}
                    >
                      {option.icon}
                      <Box
                        component="span"
                        sx={{
                          bgcolor:
                            selectedColors[option.stateKey] ?? "transparent",
                          border: 1,
                          borderColor: selectedColors[option.stateKey]
                            ? "divider"
                            : "text.disabled",
                          bottom: 4,
                          height: 3,
                          left: 8,
                          position: "absolute",
                          right: 8,
                        }}
                      />
                      <Box
                        component="input"
                        type="color"
                        aria-label={label}
                        disabled={!isEditable}
                        onChange={(event) =>
                          runColorCommand(
                            option.command,
                            event.target.value,
                            option.stateKey,
                            option.fallbackCommand
                          )
                        }
                        sx={{
                          border: 0,
                          height: 1,
                          opacity: 0,
                          position: "absolute",
                          width: 1,
                        }}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            })}
          </Stack>
        ) : null}

        <Box
          id={id}
          ref={editorRef}
          aria-disabled={disabled}
          aria-label={placeholder ?? t("basicTextEditor.placeholder")}
          component="div"
          contentEditable={isEditable}
          data-name={name}
          data-placeholder={placeholder ?? t("basicTextEditor.placeholder")}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={updateActiveCommands}
          onMouseUp={updateActiveCommands}
          onPaste={handlePaste}
          role="textbox"
          suppressContentEditableWarning
          sx={{
            minHeight,
            maxHeight: isPreview
              ? undefined
              : `max(${minHeight}px, calc(${maxVisibleLines * 1.5}em + 20px))`,
            overflowY: isPreview ? "visible" : "auto",
            px: 1.5,
            py: 1.25,
            typography: "body2",
            lineHeight: 1.5,
            outline: "none",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            "&:empty::before": {
              color: "text.disabled",
              content: "attr(data-placeholder)",
              pointerEvents: "none",
            },
            "& ul": {
              pl: 3,
              my: 1,
            },
            "& ol": {
              listStylePosition: "inside",
              pl: 0,
              my: 1,
            },
            "&:focus": {
              boxShadow: (theme) => `inset 0 0 0 1px ${theme.palette.primary.main}`,
            },
          }}
          tabIndex={disabled ? -1 : 0}
        />
      </Paper>

      {helperText ? (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      ) : null}
    </Box>
  );
};

export default BasicTextEditor;
