import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import RequestChat from "@/components/chat/RequestChat";

export default async function RequestChatPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent(`/requests/${params.id}/chat`)}`);
  if (user.role !== "citizen" && user.role !== "lawyer") redirect("/dashboard");
  return <RequestChat requestId={params.id} currentUserId={user.id} currentRole={user.role} />;
}
