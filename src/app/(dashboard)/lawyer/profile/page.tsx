import { getCurrentUser } from "@/lib/auth/session";
import LawyerPortal from "@/components/lawyer/LawyerPortal";

export default async function LawyerProfilePage({ searchParams }: { searchParams?: { welcome?: string } }) {
  const user = await getCurrentUser();
  if (!user) return null;
  return <>
    {searchParams?.welcome === "1" && <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8"><div className="rounded-2xl border border-[#e8d6a9] bg-[#fbf7eb] p-5"><h2 className="font-semibold text-[#5f481b]">Your lawyer account is ready. Complete your application to continue.</h2><p className="mt-1 text-sm leading-6 text-[#746747]">Add your professional details and verification document links below. Once submitted, an administrator will review your application before your profile can appear to clients.</p></div></div>}
    <LawyerPortal lawyerName={user.name} section="profile" />
  </>;
}
