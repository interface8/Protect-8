import { getCurrentUser } from "@/lib/auth/session";
import LawyerPortal from "@/components/lawyer/LawyerPortal";

export default async function LawyerAvailabilityPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return <LawyerPortal lawyerName={user.name} section="availability" />;
}
