"use client";

import {
  Edit2,
  Trash2,
  Plus,
  Eye,
  Download,
  Copy,
  Share2,
  Archive,
  Save,
  X,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { IconButton } from "./icon-button";

interface ActionIconProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// CRUD Actions
export function EditAction({ onClick, disabled, loading }: ActionIconProps) {
  return (
    <IconButton
      icon={<Edit2 className="h-4 w-4" />}
      title="Edit"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      variant="edit"
    />
  );
}

export function DeleteAction({ onClick, disabled, loading }: ActionIconProps) {
  return (
    <IconButton
      icon={<Trash2 className="h-4 w-4" />}
      title="Delete"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      variant="delete"
    />
  );
}

export function AddAction({ onClick, disabled, loading }: ActionIconProps) {
  return (
    <IconButton
      icon={<Plus className="h-4 w-4" />}
      title="Add"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      variant="add"
    />
  );
}

export function ViewAction({ onClick, disabled }: ActionIconProps) {
  return (
    <IconButton
      icon={<Eye className="h-4 w-4" />}
      title="View"
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
    />
  );
}

export function SaveAction({
  onClick,
  disabled,
  loading,
}: ActionIconProps) {
  return (
    <IconButton
      icon={<Save className="h-4 w-4" />}
      title="Save"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      type="submit"
      variant="add"
    />
  );
}

export function CancelAction({ onClick, disabled }: ActionIconProps) {
  return (
    <IconButton
      icon={<X className="h-4 w-4" />}
      title="Cancel"
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
    />
  );
}

// Additional Actions
export function DownloadAction({ onClick, disabled }: ActionIconProps) {
  return (
    <IconButton
      icon={<Download className="h-4 w-4" />}
      title="Download"
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
    />
  );
}

export function CopyAction({ onClick, disabled, loading }: ActionIconProps) {
  return (
    <IconButton
      icon={<Copy className="h-4 w-4" />}
      title="Copy"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      variant="ghost"
    />
  );
}

export function ShareAction({ onClick, disabled }: ActionIconProps) {
  return (
    <IconButton
      icon={<Share2 className="h-4 w-4" />}
      title="Share"
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
    />
  );
}

export function ArchiveAction({ onClick, disabled, loading }: ActionIconProps) {
  return (
    <IconButton
      icon={<Archive className="h-4 w-4" />}
      title="Archive"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      variant="edit"
    />
  );
}

export function MoreAction({ onClick, disabled }: ActionIconProps) {
  return (
    <IconButton
      icon={<MoreVertical className="h-4 w-4" />}
      title="More"
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
    />
  );
}

export function MoveUpAction({ onClick, disabled }: ActionIconProps) {
  return (
    <IconButton
      icon={<ChevronUp className="h-4 w-4" />}
      title="Move up"
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
    />
  );
}

export function MoveDownAction({ onClick, disabled }: ActionIconProps) {
  return (
    <IconButton
      icon={<ChevronDown className="h-4 w-4" />}
      title="Move down"
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
    />
  );
}
