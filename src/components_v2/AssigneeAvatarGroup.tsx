import React from "react";
import { Avatar, Box, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TruncatedText } from "@/components_v2/TruncatedText";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

/**
 * AssigneeAvatarGroup - A reusable component for displaying assignee avatars in various layouts.
 *
 * Component Details:
 * This component renders user avatars with support for profile photos (with auto-generated
 * initials fallback), stacked overlapping avatars for multiple assignees (Kanban-style),
 * inline display with name for single assignee, unassigned state with placeholder avatar,
 * tooltip on hover for each assignee, and overflow indicator when assignees exceed limit.
 *
 * Props:
 * - assignees: Array of assignees with id and name (required)
 * - usersData: Array of user data including profileImageUrl for photo lookup
 * - unassignedText: Custom text to show when no assignees (defaults to i18n "common.unassigned")
 * - maxVisible: Maximum avatars to show before overflow indicator (default: 3)
 * - layout: "inline" shows avatar+name for single assignee; "stack" shows overlapping avatars only
 * - avatarSize: Pixel size for all avatars (default: 25)
 * - showName: When true with single assignee, forces avatar+name display even in "stack" layout
 * - isShowUnassigned: When false, renders null instead of unassigned placeholder (default: true)
 *
 * Rendering behavior:
 * - 0 assignees: Shows grey placeholder avatar + "Unassigned" text (if isShowUnassigned is true)
 * - 1 assignee + (layout="inline" OR showName=true): Shows avatar + full name inline
 * - 1 assignee + layout="stack" + showName=false: Shows single avatar only
 * - 2+ assignees: Shows overlapping stacked avatars with optional +N overflow indicator
 */
interface AssigneeAvatarGroupProps {
  assignees: Array<{ id: string; name: string }>;
  usersData?: Array<{ userId: string; profileImageUrl?: string }>;
  unassignedText?: string;
  maxVisible?: number;
  /** `inline`: single assignee shows name; `stack`: overlapping avatars only (Kanban). */
  layout?: "inline" | "stack";
  avatarSize?: number;
  /** If true and there's only 1 assignee, show avatar with name. */
  showName?: boolean;
  /** If true, show 'Unassigned' text when no assignees. If false, render nothing. */
  isShowUnassigned?: boolean;
}

const AssigneeAvatarGroup: React.FC<AssigneeAvatarGroupProps> = ({
  assignees,
  usersData = [],
  unassignedText,
  maxVisible = 3,
  layout = "inline",
  avatarSize = 25,
  showName = false,
  isShowUnassigned = true,
}) => {
  const { t } = useTranslation();
  const overlap = Math.round(avatarSize * 0.4);

  if (assignees.length === 0) {
    if (!isShowUnassigned) {
      return null;
    }
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Avatar
          sx={{
            p: 0,
            width: avatarSize,
            height: avatarSize,
            fontSize: avatarSize * 0.36,
            fontWeight: 600,
            bgcolor: "grey.400",
            color: "common.white",
          }}
          alt={t("common.unassigned")}
        />
        <Typography variant="body2" sx={{ ml: 1 }}>
          {unassignedText || t("common.unassigned")}
        </Typography>
      </Box>
    );
  }

  if (assignees.length === 1 && (layout === "inline" || showName)) {
    const assignee = assignees[0];
    const user = usersData.find((u) => u.userId === assignee.id);
    const hasPhoto = Boolean(user?.profileImageUrl);

    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Avatar
          sx={{
            p: 0,
            width: avatarSize,
            height: avatarSize,
            fontSize: avatarSize * 0.36,
            fontWeight: 600,
            bgcolor: hasPhoto ? undefined : "primary.main",
            color: "common.white",
          }}
          src={user?.profileImageUrl}
          alt={assignee.name}
        >
          {!hasPhoto ? initialsFromName(assignee.name) : null}
        </Avatar>
        <TruncatedText text={assignee.name} className="ml-1" limit={20} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        isolation: "isolate",
      }}
    >
      {assignees.slice(0, maxVisible).map((assignee, index) => {
        const user = usersData.find((u) => u.userId === assignee.id);
        const hasPhoto = Boolean(user?.profileImageUrl);
        return (
          <Tooltip key={assignee.id} title={assignee.name} arrow placement="top">
            <Box
              sx={{
                position: "relative",
                ml: index === 0 ? 0 : `-${overlap}px`,
                zIndex: maxVisible - index,
              }}
            >
              <Avatar
                sx={{
                  p: 0,
                  width: avatarSize,
                  height: avatarSize,
                  fontSize: avatarSize * 0.36,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "2px solid",
                  borderColor: "common.white",
                  bgcolor: hasPhoto ? undefined : "primary.main",
                  color: "common.white",
                  "&:hover": {
                    transform: "scale(1.08)",
                    transition: "transform 0.2s",
                    zIndex: maxVisible + 1,
                  },
                }}
                src={user?.profileImageUrl}
                alt={assignee.name}
              >
                {!hasPhoto ? initialsFromName(assignee.name) : null}
              </Avatar>
            </Box>
          </Tooltip>
        );
      })}
      {assignees.length > maxVisible ? (
        <Tooltip
          title={t("common.moreAssignees", {
            count: assignees.length - maxVisible,
          })}
          arrow
          placement="top"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              ml: `-${overlap}px`,
              zIndex: 1,
            }}
          >
            <Avatar
              sx={{
                p: 0,
                width: avatarSize,
                height: avatarSize,
                bgcolor: "primary.main",
                border: "2px solid",
                borderColor: "common.white",
                fontSize: avatarSize * 0.36,
                fontWeight: 700,
              }}
            >
              +{assignees.length - maxVisible}
            </Avatar>
          </Box>
        </Tooltip>
      ) : null}
    </Box>
  );
};

export default AssigneeAvatarGroup;

