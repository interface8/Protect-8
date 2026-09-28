"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, FileUser, Loader2, MessageCircle, RefreshCw, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fetchWithSession } from "@/lib/auth/fetchWithSession";

type LawyerProfile = {
  id: string; barEnrollmentNumber: string; practiceLicenseUrl: string; idDocumentUrl: string;
  practiceAreas: string[]; languages: string[]; yearsOfExperience: number;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED"; isMatchable: boolean;
  availabilityStatus: "AVAILABLE" | "BUSY" | "OFFLINE"; rejectionReason: string | null;
};
type RequestItem = {
  id: string; lawyerId: string | null; title: string; description: string | null; category: string;
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string; citizen: { id: string; name: string; email: string | null; phone: string | null };
};
type Section = "overview" | "enquiries" | "availability" | "profile" | "messages";
type Application = { barEnrollmentNumber: string; practiceLicenseUrl: string; idDocumentUrl: string; practiceAreas: string; languages: string; yearsOfExperience: string };

const titles: Record<Section, { title: string; description: string }> = {
  overview: { title: "Overview", description: "A clear summary of your work and client activity." },
  enquiries: { title: "Client enquiries", description: "Review assigned enquiries and move each case forward." },
  availability: { title: "Availability", description: "Control when clients can find and contact you." },
  profile: { title: "Professional profile", description: "Manage your application details and verification documents." },
  messages: { title: "Messages", description: "Continue secure conversations with your clients." },
};

async function readResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "The request failed.");
  return body;
}

export default function LawyerPortal({ lawyerName, section }: { lawyerName: string; section: Section }) {
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [application, setApplication] = useState<Application>({ barEnrollmentNumber: "", practiceLicenseUrl: "", idDocumentUrl: "", practiceAreas: "", languages: "English", yearsOfExperience: "0" });

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const [profileResponse, requestsResponse] = await Promise.all([
        fetchWithSession("/api/lawyers/me"),
        fetchWithSession("/api/requests?limit=100"),
      ]);
      const requestBody = await readResponse(requestsResponse);
      setRequests(requestBody.data ?? []);
      if (profileResponse.status === 404) setProfile(null);
      else setProfile(await readResponse(profileResponse));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your workspace.");
    } finally { if (showSpinner) setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const activeRequests = requests.filter((request) => ["ASSIGNED", "IN_PROGRESS"].includes(request.status));
  const assignedRequests = requests.filter((request) => request.status === "ASSIGNED");
  const completedRequests = requests.filter((request) => request.status === "COMPLETED");
  const conversations = requests.filter((request) => request.lawyerId && request.status !== "CANCELLED");
  const visibleRequests = useMemo(() => requests.filter((request) => filter === "ALL" || request.status === filter), [filter, requests]);
  const availability = profile?.availabilityStatus ?? "OFFLINE";
  const currentPage = titles[section];

  async function changeAvailability(availabilityStatus: LawyerProfile["availabilityStatus"]) {
    setSaving(true); setError(""); setNotice("");
    try {
      await readResponse(await fetchWithSession("/api/lawyers/me/availability", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ availabilityStatus }) }));
      setNotice(`Your availability is now ${availabilityStatus.toLowerCase()}.`);
      await load(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update availability."); }
    finally { setSaving(false); }
  }

  async function updateRequest(id: string, action: "start" | "complete") {
    setSaving(true); setError(""); setNotice("");
    try {
      await readResponse(await fetchWithSession(`/api/requests/${encodeURIComponent(id)}/${action}`, { method: "POST" }));
      setNotice(action === "start" ? "Enquiry moved to in progress." : "Enquiry marked complete.");
      await load(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update this enquiry."); }
    finally { setSaving(false); }
  }

  async function submitApplication(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    const payload = {
      barEnrollmentNumber: application.barEnrollmentNumber.trim(),
      practiceLicenseUrl: application.practiceLicenseUrl.trim(),
      idDocumentUrl: application.idDocumentUrl.trim(),
      practiceAreas: application.practiceAreas.split(",").map((item) => item.trim()).filter(Boolean),
      languages: application.languages.split(",").map((item) => item.trim()).filter(Boolean),
      yearsOfExperience: Number(application.yearsOfExperience),
    };
    try {
      const result = await readResponse(await fetchWithSession("/api/lawyers/onboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }));
      setProfile(result.profile);
      setNotice("Your application was submitted for administrator review.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not submit your application."); }
    finally { setSaving(false); }
  }

  function editRejectedApplication() {
    if (!profile) return;
    setApplication({ barEnrollmentNumber: profile.barEnrollmentNumber, practiceLicenseUrl: profile.practiceLicenseUrl, idDocumentUrl: profile.idDocumentUrl, practiceAreas: profile.practiceAreas.join(", "), languages: profile.languages.join(", "), yearsOfExperience: String(profile.yearsOfExperience) });
    setProfile(null);
  }

  const header = <header className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b08329]">Lawyer workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#171717]">{currentPage.title}</h1><p className="mt-1 max-w-2xl text-sm text-gray-500">{currentPage.description}</p></div><button type="button" onClick={() => void load()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"><RefreshCw className="h-4 w-4" />Refresh</button></header>;

  return <div className="min-h-screen bg-[#f5f3f0]">
    <div className="border-b border-black/[0.06] bg-white"><div className="mx-auto max-w-6xl px-4 py-5 md:px-8"><p className="text-sm text-gray-500">Good day, <span className="font-medium text-[#171717]">{lawyerName}</span></p></div></div>
    <main className="mx-auto max-w-6xl px-4 py-7 md:px-8">
      {header}
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      {loading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#c4922a]" /></div> : <>
        {profile && profile.verificationStatus !== "APPROVED" && <ApplicationStatus profile={profile} onEdit={editRejectedApplication} />}
        {section === "overview" && <Overview requests={requests} assigned={assignedRequests.length} active={activeRequests.length} completed={completedRequests.length} approved={profile?.verificationStatus === "APPROVED"} />}
        {section === "enquiries" && <Enquiries items={visibleRequests} filter={filter} setFilter={setFilter} saving={saving} updateRequest={updateRequest} />}
        {section === "availability" && <Availability profile={profile} availability={availability} saving={saving} onChange={changeAvailability} />}
        {section === "profile" && <ProfileSection profile={profile} application={application} setApplication={setApplication} saving={saving} onSubmit={submitApplication} />}
        {section === "messages" && <Messages items={conversations} />}
      </>}
    </main>
  </div>;
}

function Overview({ requests, assigned, active, completed, approved }: { requests: RequestItem[]; assigned: number; active: number; completed: number; approved: boolean }) {
  const recent = requests.slice(0, 4);
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Needs your attention" value={assigned} icon={Users} detail="Assigned enquiries" /><Metric title="Active cases" value={active} icon={BriefcaseBusiness} /><Metric title="Completed cases" value={completed} icon={CheckCircle2} /><Metric title="Profile status" value={approved ? "Approved" : "In review"} icon={ShieldCheck} /></div>
    {!approved && <Callout title="Your profile is under review" body="You can prepare your professional profile while the administrator reviews your documents. Availability and client matching unlock after approval." href="/lawyer/profile" action="View profile" />}
    <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm"><div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4"><div><h2 className="font-semibold">Recent enquiries</h2><p className="mt-1 text-xs text-gray-500">Your latest assigned client requests</p></div><Link href="/lawyer/enquiries" className="text-sm font-medium text-[#9a6d19] hover:underline">View all</Link></div>{recent.length ? <div className="divide-y divide-black/[0.05]">{recent.map((item) => <RequestRow key={item.id} item={item} compact />)}</div> : <Empty title="No enquiries yet" body="New requests assigned to you will appear here." />}</section>
    <div className="grid gap-4 lg:grid-cols-2"><Shortcut href="/lawyer/availability" icon={Clock3} title="Set your availability" body="Let clients know when you can take new work." /><Shortcut href="/lawyer/messages" icon={MessageCircle} title="Open conversations" body="Continue a secure chat with a client." /></div>
  </div>;
}

function Enquiries({ items, filter, setFilter, saving, updateRequest }: { items: RequestItem[]; filter: string; setFilter: (value: "ALL" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED") => void; saving: boolean; updateRequest: (id: string, action: "start" | "complete") => Promise<void> }) {
  return <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] p-4 sm:p-5"><div><h2 className="font-semibold">Assigned enquiries</h2><p className="mt-1 text-xs text-gray-500">Review client details, chat, and update case progress.</p></div><div className="flex flex-wrap gap-1">{(["ALL", "ASSIGNED", "IN_PROGRESS", "COMPLETED"] as const).map((status) => <button type="button" key={status} onClick={() => setFilter(status)} className={`rounded-lg px-3 py-2 text-xs font-medium ${filter === status ? "bg-[#171717] text-white" : "text-gray-500 hover:bg-gray-100"}`}>{status.replaceAll("_", " ")}</button>)}</div></div>{items.length ? <div className="divide-y divide-black/[0.05]">{items.map((item) => <article key={item.id} className="p-5"><RequestRow item={item} /><div className="mt-4 flex flex-wrap gap-2"><Link href={`/requests/${item.id}/chat`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#171717] px-4 text-sm font-medium text-white hover:bg-black"><MessageCircle className="h-4 w-4" />Open conversation</Link>{item.status === "ASSIGNED" && <button type="button" disabled={saving} onClick={() => void updateRequest(item.id, "start")} className="h-10 rounded-xl border border-black/10 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Start case</button>}{item.status === "IN_PROGRESS" && <button type="button" disabled={saving} onClick={() => void updateRequest(item.id, "complete")} className="h-10 rounded-xl border border-green-700/20 bg-green-50 px-4 text-sm font-medium text-green-800 hover:bg-green-100 disabled:opacity-50">Mark complete</button>}</div></article>)}</div> : <Empty title={filter === "ALL" ? "No enquiries yet" : `No ${filter.toLowerCase().replaceAll("_", " ")} enquiries`} body="Assigned client requests will appear here." />}</section>;
}

function Availability({ profile, availability, saving, onChange }: { profile: LawyerProfile | null; availability: LawyerProfile["availabilityStatus"]; saving: boolean; onChange: (status: LawyerProfile["availabilityStatus"]) => void }) {
  if (!profile || profile.verificationStatus !== "APPROVED") return <Callout title="Availability is locked" body="Complete your profile and wait for administrator approval before changing your matching status." href="/lawyer/profile" action="Open professional profile" />;
  const choices: { value: LawyerProfile["availabilityStatus"]; label: string; text: string }[] = [
    { value: "AVAILABLE", label: "Available", text: "Appear in matching results and accept enquiries." },
    { value: "BUSY", label: "Busy", text: "Show that you are occupied while keeping your profile visible." },
    { value: "OFFLINE", label: "Offline", text: "Pause new client matching until you return." },
  ];
  return <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><section className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6"><p className="text-sm text-gray-500">Current status</p><p className="mt-2 text-2xl font-semibold capitalize">{availability.toLowerCase()}</p><p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">Choose how clients and matching results should treat your availability. This setting can be changed at any time.</p><div className="mt-6 grid gap-3">{choices.map((choice) => <button key={choice.value} type="button" disabled={saving || availability === choice.value} onClick={() => onChange(choice.value)} className={`rounded-xl border p-4 text-left transition-colors ${availability === choice.value ? "border-[#c4922a] bg-[#c4922a]/5" : "border-black/10 hover:bg-gray-50"}`}><span className="flex items-center justify-between font-medium">{choice.label}{availability === choice.value && <span className="rounded-full bg-[#c4922a]/15 px-2 py-1 text-[10px] uppercase tracking-wide text-[#805b16]">Current</span>}</span><span className="mt-1 block text-sm text-gray-500">{choice.text}</span></button>)}</div></section><aside className="rounded-2xl border border-black/[0.06] bg-[#171717] p-5 text-white shadow-sm"><Clock3 className="h-5 w-5 text-[#d3a846]" /><h2 className="mt-4 text-lg font-semibold">Stay responsive</h2><p className="mt-2 text-sm leading-6 text-white/60">When you are available, keep an eye on new enquiries and update your status when you cannot respond.</p></aside></div>;
}

function ProfileSection({ profile, application, setApplication, saving, onSubmit }: { profile: LawyerProfile | null; application: Application; setApplication: (value: Application | ((current: Application) => Application)) => void; saving: boolean; onSubmit: (event: FormEvent) => void }) {
  if (profile && profile.verificationStatus !== "REJECTED") return <div className="grid gap-4 lg:grid-cols-[1fr_320px]"><section className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">Professional details</h2><p className="mt-1 text-sm text-gray-500">These details are used for administrator verification and client matching.</p></div><StatusTag value={profile.verificationStatus} /></div><dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2"><Detail label="Bar enrollment number" value={profile.barEnrollmentNumber} /><Detail label="Years of experience" value={`${profile.yearsOfExperience} years`} /><Detail label="Practice areas" value={profile.practiceAreas.join(", ")} /><Detail label="Languages" value={profile.languages.join(", ")} /></dl><div className="mt-6 flex flex-wrap gap-3"><DocumentLink href={profile.practiceLicenseUrl} label="View practice license" /><DocumentLink href={profile.idDocumentUrl} label="View identity document" /></div></section><aside className="h-fit rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm"><ShieldCheck className="h-5 w-5 text-[#b08329]" /><h3 className="mt-3 font-semibold">Verification</h3><p className="mt-1 text-sm leading-6 text-gray-500">{profile.verificationStatus === "APPROVED" ? "Your profile is approved. Keep your professional documents current." : "Your application is in the review queue. We will update this status after review."}</p></aside></div>;
  return <section className="mx-auto max-w-3xl rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-7"><div className="mb-6"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4efe3]"><FileUser className="h-5 w-5 text-[#a47722]" /></div><h2 className="mt-4 text-xl font-semibold">{profile ? "Update your application" : "Submit your professional profile"}</h2><p className="mt-1 text-sm leading-6 text-gray-500">Provide your bar details and verification documents. An administrator will review your submission before you can receive matched enquiries.</p>{profile?.rejectionReason && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">Review feedback: {profile.rejectionReason}</p>}</div><form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2"><Field label="Bar enrollment number" value={application.barEnrollmentNumber} onChange={(value) => setApplication((current) => ({ ...current, barEnrollmentNumber: value }))} /><Field label="Years of experience" type="number" value={application.yearsOfExperience} onChange={(value) => setApplication((current) => ({ ...current, yearsOfExperience: value }))} /><Field label="Practice areas" hint="Separate multiple areas with commas" value={application.practiceAreas} onChange={(value) => setApplication((current) => ({ ...current, practiceAreas: value }))} /><Field label="Languages" hint="Separate multiple languages with commas" value={application.languages} onChange={(value) => setApplication((current) => ({ ...current, languages: value }))} /><div className="sm:col-span-2"><Field label="Practice license document URL" type="url" value={application.practiceLicenseUrl} onChange={(value) => setApplication((current) => ({ ...current, practiceLicenseUrl: value }))} /></div><div className="sm:col-span-2"><Field label="Identity document URL" type="url" value={application.idDocumentUrl} onChange={(value) => setApplication((current) => ({ ...current, idDocumentUrl: value }))} /></div><div className="sm:col-span-2"><button type="submit" disabled={saving} className="h-11 rounded-xl bg-[#171717] px-5 text-sm font-medium text-white shadow-sm hover:bg-black disabled:opacity-50">{saving ? "Submitting…" : "Submit for review"}</button></div></form></section>;
}

function Messages({ items }: { items: RequestItem[] }) {
  return <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm"><div className="border-b border-black/[0.06] p-5"><h2 className="font-semibold">Client conversations</h2><p className="mt-1 text-sm text-gray-500">Messages are attached to the client enquiry they belong to.</p></div>{items.length ? <div className="divide-y divide-black/[0.05]">{items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div className="min-w-0"><p className="font-medium">{item.citizen.name}</p><p className="mt-1 truncate text-sm text-gray-500">{item.title} · {item.category}</p></div><Link href={`/requests/${item.id}/chat`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#171717] px-4 text-sm text-white hover:bg-black"><MessageCircle className="h-4 w-4" />Open chat</Link></div>)}</div> : <Empty title="No conversations yet" body="Chats started from your lawyer profile or assigned enquiries will appear here." />}</section>;
}

function ApplicationStatus({ profile, onEdit }: { profile: LawyerProfile; onEdit: () => void }) {
  const approved = profile.verificationStatus === "APPROVED";
  const rejected = profile.verificationStatus === "REJECTED";
  return <section className={`mb-5 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${approved ? "border-green-200 bg-green-50" : rejected ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
    <div><p className="font-medium text-[#171717]">{approved ? "Your profile is approved" : rejected ? "Your application needs updates" : "Your profile is under review"}</p><p className="mt-1 text-sm text-gray-600">{rejected ? profile.rejectionReason || "Review the details and resubmit your application." : approved ? "You can receive matched enquiries while your availability is on." : "You can review your professional profile while the administrator checks your documents."}</p></div>
    {rejected && <button type="button" onClick={onEdit} className="h-10 shrink-0 rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-red-800 hover:bg-red-50">Update application</button>}
  </section>;
}

function RequestRow({ item, compact = false }: { item: RequestItem; compact?: boolean }) {
  return <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${compact ? "p-5" : ""}`}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-[#171717]">{item.title}</p><StatusTag value={item.status} /></div><p className="mt-1 text-sm text-gray-500">{item.citizen.name} · {item.category} · {new Date(item.createdAt).toLocaleDateString()}</p>{!compact && item.description && <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{item.description}</p>}</div></div>;
}

function Metric({ title, value, icon: Icon, detail }: { title: string; value: number | string; icon: LucideIcon; detail?: string }) {
  return <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-gray-500">{title}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4efe3]"><Icon className="h-4 w-4 text-[#a47722]" /></span></div><p className="mt-4 text-3xl font-semibold tracking-tight text-[#171717]">{value}</p>{detail && <p className="mt-1 text-xs text-gray-400">{detail}</p>}</div>;
}

function Callout({ title, body, href, action }: { title: string; body: string; href: string; action: string }) {
  return <section className="flex flex-col gap-4 rounded-2xl border border-[#e8d6a9] bg-[#fbf7eb] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-[#5f481b]">{title}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-[#746747]">{body}</p></div><Link href={href} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#171717] px-4 text-sm font-medium text-white">{action}<ArrowRight className="h-4 w-4" /></Link></section>;
}

function Shortcut({ href, icon: Icon, title, body }: { href: string; icon: LucideIcon; title: string; body: string }) {
  return <Link href={href} className="group flex items-start gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4efe3]"><Icon className="h-5 w-5 text-[#a47722]" /></span><span className="min-w-0"><span className="block font-semibold text-[#171717]">{title}</span><span className="mt-1 block text-sm text-gray-500">{body}</span></span><ArrowRight className="ml-auto h-4 w-4 shrink-0 text-gray-400 transition group-hover:translate-x-1" /></Link>;
}

function Empty({ title, body }: { title: string; body: string }) {
  return <div className="px-6 py-12 text-center"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gray-100"><BriefcaseBusiness className="h-5 w-5 text-gray-400" /></span><h3 className="mt-3 font-medium text-[#171717]">{title}</h3><p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{body}</p></div>;
}

function StatusTag({ value }: { value: string }) {
  const classes = value === "APPROVED" || value === "COMPLETED" || value === "AVAILABLE" ? "bg-green-50 text-green-700" : value === "REJECTED" || value === "CANCELLED" || value === "OFFLINE" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800";
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${classes}`}>{value.replaceAll("_", " ")}</span>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt><dd className="mt-1 text-sm font-medium text-[#252525]">{value || "—"}</dd></div>;
}

function DocumentLink({ href, label }: { href: string; label: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/10 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">{label}<ArrowRight className="h-3.5 w-3.5" /></a>;
}

function Field({ label, value, onChange, type = "text", hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; hint?: string }) {
  return <label className="block text-sm font-medium text-gray-700">{label}{hint && <span className="ml-2 text-xs font-normal text-gray-400">{hint}</span>}<input required value={value} type={type} min={type === "number" ? 0 : undefined} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 font-normal outline-none focus:border-[#c4922a] focus:ring-2 focus:ring-[#c4922a]/15" /></label>;
}
