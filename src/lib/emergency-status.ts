import type { EmergencyRequestStatus } from "@/types/emergency";

export const STATUS_COPY: Record<
  EmergencyRequestStatus,
  {
    label: string;
    description: string;
    tone: "pending" | "active" | "done" | "stopped";
  }
> = {
  REQUESTED: {
    label: "Finding a lawyer",
    description: "We're matching you with an available lawyer now.",
    tone: "pending",
  },

  MATCHED: {
    label: "Lawyer matched",
    description: "A lawyer has been matched and notified.",
    tone: "active",
  },

  ACCEPTED: {
    label: "Lawyer accepted",
    description: "Your lawyer has accepted and will reach out shortly.",
    tone: "active",
  },

  REJECTED: {
    label: "Rematching",
    description: "That lawyer couldn't take this case. Finding another match.",
    tone: "pending",
  },

  IN_PROGRESS: {
    label: "In progress",
    description: "Your case is actively being handled.",
    tone: "active",
  },

  COMPLETED: {
    label: "Completed",
    description: "This request has been resolved.",
    tone: "done",
  },

  CANCELLED: {
    label: "Cancelled",
    description: "This request was cancelled.",
    tone: "stopped",
  },
};