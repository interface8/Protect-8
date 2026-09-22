"use client";

import { Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProfileInfoRow from "./ProfileInfoRow";
import { UserProfile } from "@/app/(dashboard)/profile/page";

interface ProfileInfoCardProps {
  user: UserProfile;
  onUserUpdate: (updated: Partial<UserProfile>) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function ProfileInfoCard({
  user,
  onUserUpdate,
  onSuccess,
  onError,
}: ProfileInfoCardProps) {
  // Save a field via PATCH /api/users/me
  async function handleSave(field: "name" | "phone", value: string) {
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        onError(data.message ?? `Failed to update ${field}`);
        return false;
      }

      onUserUpdate({ [field]: data[field] ?? value });
      onSuccess(
        field === "name" ? "Name updated" : "Phone number updated"
      );
      return true;
    } catch {
      onError("Something went wrong");
      return false;
    }
  }

  return (
    <Card className="p-6 md:p-8 bg-white rounded-2xl border border-[#554116]/10 shadow-sm">
      <p className="text-xs font-semibold text-[#554116]/60 uppercase tracking-wider mb-6">
        Personal Information
      </p>

      <div className="space-y-0">
        {/* Full Name — editable */}
        <ProfileInfoRow
          label="Full Name"
          value={user.name}
          editable
          onSave={(value) => handleSave("name", value)}
          validate={(value) =>
            value.trim().length < 2 ? "Name must be at least 2 characters" : null
          }
          editLabel="Edit"
        />

        {/* Email — read-only */}
        <ProfileInfoRow
          label="Email Address"
          value={user.email ?? "No email"}
          icon={<Mail className="w-3.5 h-3.5 text-[#0a0a0a]/40" />}
          helperText="Email cannot be changed here. Contact support if needed."
          editable={false}
        />

        {/* Phone — editable */}
        <ProfileInfoRow
          label="Phone Number"
          value={user.phone ?? "Not set"}
          icon={<Phone className="w-3.5 h-3.5 text-[#0a0a0a]/40" />}
          editable
          onSave={(value) => handleSave("phone", value)}
          validate={(value) => {
            const trimmed = value.trim();
            if (!trimmed) return null; // allow clearing
            if (trimmed.length < 7 || trimmed.length > 20)
              return "Phone number must be 7-20 characters";
            return null;
          }}
          editLabel={user.phone ? "Change" : "Add"}
          isLast
        />
      </div>
    </Card>
  );
}