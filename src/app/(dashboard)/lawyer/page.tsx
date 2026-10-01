import { getCurrentUser } from "@/lib/auth/session";
import LawyerPortal from "@/components/lawyer/LawyerPortal";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function LawyerPortalPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await prisma.lawyerProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!profile) redirect("/lawyer/profile?welcome=1");
  return <LawyerPortal lawyerName={user.name} section="overview" />;
}
