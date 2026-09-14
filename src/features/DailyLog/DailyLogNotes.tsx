import BasicTextEditor from "@/components/basic-text-editor/BasicTextEditor";
import { UIDialog } from "@/components_v2/DialogModal";
import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import EditIcon from "@/assets/icons/edit-icon";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DailyLogNotePayload, DailyLogRecord } from "./types";

type DailyLogNotesProps = {
  report: Pick<DailyLogRecord, "notes">;
  notes?: DailyLogNotePayload[];
  isPreview?: boolean;
  onNotesChange?: (notes: DailyLogNotePayload[]) => void;
};

type NoteItem = {
  id: string;
  title: string;
  content: string;
};

const hasNoteContent = (value?: string) =>
  Boolean(value?.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim());

const getInitialNotes = (
  reportNotes: string,
  notes?: DailyLogNotePayload[],
  defaultTitle = "Notes",
) => {
  if (Array.isArray(notes) && notes.length > 0) {
    return notes.map((note, index) => ({
      id: note.id || `note-${index + 1}`,
      title: note.title?.trim() || defaultTitle,
      content: note.content ?? "",
    }));
  }

  return [
    {
      id: "note-1",
      title: defaultTitle,
      content: reportNotes ?? "",
    },
  ];
};

const DailyLogNotes = ({
  report,
  notes,
  isPreview = false,
  onNotesChange,
}: DailyLogNotesProps) => {
  const { t } = useTranslation();
  const defaultTitle = t("common.notes", { defaultValue: "Notes" });
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [noteItems, setNoteItems] = useState<NoteItem[]>(() =>
    getInitialNotes(report.notes, notes, defaultTitle),
  );
  const [draftNoteItems, setDraftNoteItems] = useState<NoteItem[]>(noteItems);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const visibleNotes = useMemo(
    () => noteItems.filter((note) => hasNoteContent(note.content)),
    [noteItems],
  );

  useEffect(() => {
    onNotesChange?.(
      visibleNotes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
      })),
    );
  }, [onNotesChange, visibleNotes]);

  const handleAddNote = () => {
    setDraftNoteItems((prev) => [
      ...prev,
      {
        id: `note-${Date.now()}`,
        title: defaultTitle,
        content: "",
      },
    ]);
  };

  const handleOpenNotesModal = () => {
    setDraftNoteItems(noteItems);
    setEditingTitleId(null);
    setIsNotesModalOpen(true);
  };

  const handleSaveNotes = () => {
    setNoteItems(draftNoteItems);
    setEditingTitleId(null);
    setIsNotesModalOpen(false);
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography
          variant="h6"
          sx={{
            color: CLIENT_REPORT_COLORS.sectionTitle,
          }}
        >
          {t("common.notes")}
        </Typography>
        {!isPreview && (
          <IconButton
            size="small"
            sx={{ color: "primary.main" }}
            onClick={handleOpenNotesModal}
          >
            <EditIcon width={16} height={16} fill="currentColor" />
          </IconButton>
        )}
      </Stack>
      <UIDialog
        open={isNotesModalOpen}
        title={t("common.notes")}
        onClose={() => setIsNotesModalOpen(false)}
        maxWidth="md"
        dividerAfterTitle
        contentSx={{ py: 2 }}
        secondaryAction={{
          label: t("common.cancel"),
          onClick: () => setIsNotesModalOpen(false),
        }}
        primaryAction={{
          label: t("common.save", { defaultValue: "Save" }),
          onClick: handleSaveNotes,
        }}
      >
        <Stack spacing={1.5}>
          {draftNoteItems.map((note) => (
            <Box key={note.id}>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                {editingTitleId === note.id ? (
                  <TextField
                    size="small"
                    value={note.title}
                    onChange={(event) =>
                      setDraftNoteItems((prev) =>
                        prev.map((item) =>
                          item.id === note.id
                            ? { ...item, title: event.target.value }
                            : item,
                        ),
                      )
                    }
                    onBlur={() => setEditingTitleId(null)}
                    autoFocus
                    sx={{ maxWidth: 320 }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: CLIENT_REPORT_COLORS.bodyText }}>
                    {note.title || defaultTitle}
                  </Typography>
                )}
                <IconButton
                  size="small"
                  sx={{ color: "primary.main" }}
                  onClick={() => setEditingTitleId(note.id)}
                >
                  <EditIcon width={16} height={16} fill="currentColor" />
                </IconButton>
              </Stack>
              <BasicTextEditor
                minHeight={96}
                value={note.content}
                onChange={(value) =>
                  setDraftNoteItems((prev) =>
                    prev.map((item) =>
                      item.id === note.id ? { ...item, content: value } : item,
                    ),
                  )
                }
              />
            </Box>
          ))}
          <Button
            onClick={handleAddNote}
            startIcon={<AddIcon fontSize="small" />}
            sx={{ px: 0, alignSelf: "flex-start" }}
            variant="text"
          >
            {t("clientReport.addNotes", { defaultValue: "Add notes" })}
          </Button>
        </Stack>
      </UIDialog>
      <Box
        sx={{
          bgcolor: "background.paper",
          border: `1px solid ${CLIENT_REPORT_COLORS.border}`,
          borderRadius: 1,
          minHeight: { xs: 112, sm: 134 },
          p: { xs: 1.25, sm: 1.5 },
        }}
      >
        {visibleNotes.length > 0 ? (
          <Stack spacing={1.5}>
            {visibleNotes.map((note) => (
              <Box key={note.id}>
                <Typography
                  sx={{
                    color: CLIENT_REPORT_COLORS.bodyText,
                    typography: "body2",
                    mb: 0.5,
                  }}
                >
                  {note.title || defaultTitle}
                </Typography>
                <BasicTextEditor
                  isPreview
                  minHeight={0}
                  value={note.content}
                />
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: CLIENT_REPORT_COLORS.mutedText }}>
            {t("clientReport.noNotesAdded", {
              defaultValue: "No notes added",
            })}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DailyLogNotes;
