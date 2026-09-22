"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileInfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  helperText?: string;
  editable?: boolean;
  onSave?: (value: string) => Promise<boolean>;
  validate?: (value: string) => string | null;
  editLabel?: string;
  isLast?: boolean;
}

export default function ProfileInfoRow({
  label,
  value,
  icon,
  helperText,
  editable = false,
  onSave,
  validate,
  editLabel = "Edit",
  isLast = false,
}: ProfileInfoRowProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  function startEdit() {
    setInputValue(value);
    setLocalError("");
    setEditing(true);
  }

  function cancelEdit() {
    setInputValue(value);
    setLocalError("");
    setEditing(false);
  }

  async function handleSave() {
    if (!onSave) return;

    // Run validation if provided
    if (validate) {
      const err = validate(inputValue);
      if (err) {
        setLocalError(err);
        return;
      }
    }

    setSaving(true);
    setLocalError("");

    const success = await onSave(inputValue.trim());

    setSaving(false);

    if (success) {
      setEditing(false);
    }
  }

  // Read-only row
  if (!editable) {
    return (
      <div
        className={`py-5 ${isLast ? "" : "border-b border-[#554116]/10"}`}
      >
        <div className="flex items-center gap-1.5 mb-1">
          {icon}
          <p className="text-sm text-[#0a0a0a]/50">{label}</p>
        </div>
        <p className="text-base md:text-lg font-medium text-[#0a0a0a]">
          {value}
        </p>
        {helperText && (
          <p className="text-xs text-[#0a0a0a]/40 mt-1">{helperText}</p>
        )}
      </div>
    );
  }

  // Editable row — display mode
  if (!editing) {
    return (
      <div
        className={`py-5 ${isLast ? "" : "border-b border-[#554116]/10"}`}
      >
        <div className="flex items-center gap-1.5 mb-1">
          {icon}
          <p className="text-sm text-[#0a0a0a]/50">{label}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base md:text-lg font-medium text-[#0a0a0a]">
            {value}
          </p>
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-1.5 text-sm font-medium text-[#c4922a] hover:underline"
          >
            <Pencil className="w-4 h-4" />
            {editLabel}
          </button>
        </div>
      </div>
    );
  }

  // Editable row — edit mode
  return (
    <div className={`py-5 ${isLast ? "" : "border-b border-[#554116]/10"}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-sm text-[#0a0a0a]/50">{label}</p>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="h-10 rounded-lg border-[#554116]/20 focus-visible:ring-[#c4922a] focus-visible:border-[#c4922a]"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") cancelEdit();
          }}
        />
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#c4922a] hover:bg-[#c4922a]/80 text-white h-10 px-4 rounded-lg font-medium"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button
          onClick={cancelEdit}
          variant="outline"
          disabled={saving}
          className="h-10 px-4 rounded-lg border-[#554116]/20"
        >
          Cancel
        </Button>
      </div>

      {localError && (
        <p className="text-xs text-red-500 mt-1.5">{localError}</p>
      )}
    </div>
  );
}