import { Badge, IconButton, Tooltip } from "@mui/material";
import { Paperclip } from "lucide-react";

interface LineAttachmentsButtonProps {
  count: number;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

/** A claim line's paperclip: how many files it has, and the way into them. */
const LineAttachmentsButton = ({
  count,
  label,
  disabled = false,
  onClick,
}: LineAttachmentsButtonProps) => (
  <Tooltip title={label} arrow>
    {/* The span keeps the tooltip working while the button is disabled. */}
    <span>
      <IconButton size="small" aria-label={label} disabled={disabled} onClick={onClick}>
        <Badge badgeContent={count} color="primary" max={99}>
          <Paperclip size={16} />
        </Badge>
      </IconButton>
    </span>
  </Tooltip>
);

export default LineAttachmentsButton;
