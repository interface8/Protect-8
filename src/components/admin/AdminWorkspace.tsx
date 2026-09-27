"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MapPin, Plus, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { fetchWithSession } from "@/lib/auth/fetchWithSession";

// Admin table rows vary by section and are validated by their route schemas.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;
type Section = "overview" | "lawyers" | "users" | "rights-guides" | "articles" | "categories" | "requests" | "audit";

const titles: Record<Section, string> = {
  overview: "Admin overview",
  lawyers: "Lawyer reviews",
  users: "User management",
  "rights-guides": "Know Your Rights guides",
  articles: "Knowledge Center articles",
  categories: "Emergency situations",
  requests: "Requests and enquiries",
  audit: "Audit log",
};

async function readJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "The request failed.");
  return body;
}

function dateLabel(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${props.className ?? "bg-[#0a0a0a] text-white hover:bg-[#252525]"}`}>{children}</button>;
}

function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return <div className="rounded-2xl border border-black/[0.06] bg-white p-5"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-3xl font-semibold text-[#0a0a0a]">{value}</p>{note && <p className="mt-1 text-xs text-gray-400">{note}</p>}</div>;
}

export default function AdminWorkspace({ section }: { section: Section }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Row | null>(null);
  const [lawyers, setLawyers] = useState<Row[]>([]);
  const [availableLawyers, setAvailableLawyers] = useState<Row[]>([]);
  const [roles, setRoles] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [assignment, setAssignment] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (section === "overview") {
        const [summaryResult, pendingResult] = await Promise.allSettled([
          fetchWithSession("/api/admin/dashboard/summary").then(readJson),
          fetchWithSession("/api/admin/lawyers?status=pending&limit=100").then(readJson),
        ]);
        if (summaryResult.status === "fulfilled") setSummary(summaryResult.value);
        else throw summaryResult.reason;
        setRows(pendingResult.status === "fulfilled" ? pendingResult.value.data ?? [] : []);
      } else if (section === "lawyers") {
        const response = await fetchWithSession("/api/admin/lawyers?status=all&limit=100").then(readJson);
        setRows(response.data ?? []);
      } else if (section === "users") {
        const params = new URLSearchParams({ limit: "100" });
        if (search) params.set("search", search);
        const [response, roleResponse] = await Promise.all([
          fetchWithSession(`/api/admin/users?${params}`).then(readJson),
          fetchWithSession("/api/roles").then(readJson),
        ]);
        setRows(response.data ?? []);
        setRoles(roleResponse ?? []);
      } else if (section === "rights-guides") {
        const params = search ? `?search=${encodeURIComponent(search)}` : "";
        const response = await fetchWithSession(`/api/admin/rights-guides${params}`).then(readJson);
        setRows(response.data ?? []);
      } else if (section === "articles") {
        const params = search ? `?search=${encodeURIComponent(search)}` : "";
        const response = await fetchWithSession(`/api/admin/articles${params}`).then(readJson);
        setRows(response.data ?? []);
      } else if (section === "categories") {
        const response = await fetchWithSession("/api/admin/emergency-categories").then(readJson);
        setRows(response.data ?? []);
      } else if (section === "requests") {
        const [requestResponse, emergencyResponse, lawyerResponse, availableResponse] = await Promise.all([
          fetchWithSession("/api/requests?limit=100").then(readJson),
          fetchWithSession("/api/emergency-requests").then(readJson),
          fetchWithSession("/api/admin/lawyers?status=approved&limit=100").then(readJson),
          fetchWithSession("/api/lawyers/available?limit=20").then(readJson),
        ]);
        setRows([...(requestResponse.data ?? []).map((row: Row) => ({ ...row, recordType: "enquiry" })), ...(emergencyResponse.data ?? []).map((row: Row) => ({ ...row, recordType: "emergency" }))]);
        setLawyers(lawyerResponse.data ?? []);
        setAvailableLawyers(availableResponse.data ?? []);
      } else if (section === "audit") {
        const response = await fetchWithSession("/api/admin/audit?limit=100").then(readJson);
        setRows(response.data ?? []);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }, [section, search]);

  useEffect(() => { void load(); }, [load]);

  async function mutate(url: string, method: string, body?: Row, success = "Changes saved.") {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await readJson(await fetchWithSession(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      }));
      setNotice(success);
      setEditing(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The change could not be saved.");
    } finally { setSaving(false); }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSearch(searchText.trim());
  }

  function startNewGuide() {
    setEditing({ type: "guide", title: "", slug: "", iconKey: "book-open", shortDescription: "", body: "## What You Should Do\n1. ", order: rows.length + 1, isActive: true });
  }
  function startNewArticle() {
    setEditing({ type: "article", title: "", slug: "", excerpt: "", body: "", category: "CRIMINAL_RIGHTS", readTimeMinutes: 5, isPublished: false });
  }
  function startNewCategory() {
    setEditing({ type: "category", key: "", label: "", iconKey: "scale", sortOrder: rows.length + 1 });
  }

  const header = <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c4922a]">Admin</p><h1 className="mt-1 text-2xl font-semibold text-[#0a0a0a]">{titles[section]}</h1></div><Button type="button" onClick={() => void load()} className="border border-black/10 bg-white text-gray-700 hover:bg-gray-50"><RefreshCw className="h-4 w-4" />Refresh</Button></div>;

  return <>
    {header}
    {notice && <p role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

    {section === "overview" && <>
      {loading ? <div className="flex justify-center py-14"><Loader2 className="h-8 w-8 animate-spin text-[#c4922a]" /></div> : <>
        <p className="mb-3 text-xs text-gray-500">Live counts from the database · refreshed {summary?.computedAt ? dateLabel(summary.computedAt) : "just now"}</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Approved lawyers" value={summary?.approvedLawyers ?? 0} note={`${summary?.lawyerProfiles ?? 0} profiles total`} />
          <Metric label="Available lawyers" value={summary?.availableLawyers ?? 0} note="Approved and currently available" />
          <Metric label="Awaiting review" value={summary?.pendingLawyers ?? 0} />
          <Metric label="Rejected profiles" value={summary?.rejectedLawyers ?? 0} />
          <Metric label="Active users" value={summary?.activeUsers ?? 0} note={`${summary?.users ?? 0} accounts total`} />
          <Metric label="Open enquiries" value={summary?.openRequests ?? 0} note={`${summary?.requests ?? 0} enquiries total`} />
          <Metric label="Unresolved emergencies" value={summary?.unresolvedEmergencyRequests ?? 0} note={`${summary?.emergencyRequests ?? 0} emergency requests total`} />
          <Metric label="Completed enquiries" value={summary?.completedRequests ?? 0} />
        </div>
        <section className="mt-6 rounded-2xl border border-black/[0.06] bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Pending lawyer reviews</h2><Link href="/admin/lawyers" className="text-sm font-medium text-[#a5771d] hover:underline">Review all</Link></div>{rows.length ? <div className="mt-4 space-y-3">{rows.slice(0, 5).map((row) => <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.06] pt-3"><div><p className="font-medium">{row.user?.name}</p><p className="text-sm text-gray-500">{row.practiceAreas?.join(", ")}</p></div><span className="text-xs text-gray-400">{dateLabel(row.createdAt)}</span></div>)}</div> : <p className="mt-3 text-sm text-gray-500">No pending lawyer profiles.</p>}</section>
      </>}
    </>}

    {section === "lawyers" && <div className="space-y-3">{loading ? <Loading /> : rows.map((lawyer) => <article key={lawyer.id} className="rounded-2xl border border-black/[0.06] bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-lg font-semibold">{lawyer.user?.name}</h2><Status value={lawyer.verificationStatus} /></div><p className="mt-1 text-sm text-gray-500">{lawyer.user?.email} · {lawyer.user?.phone ?? "No phone"}</p><p className="mt-2 text-sm">{lawyer.practiceAreas?.join(", ")}</p><p className="mt-1 text-sm text-gray-500">Bar #{lawyer.barEnrollmentNumber} · {lawyer.yearsOfExperience} years · {lawyer.languages?.join(", ")}</p><div className="mt-3 flex gap-3 text-sm"><a className="text-[#a5771d] underline" href={lawyer.practiceLicenseUrl} target="_blank" rel="noreferrer">Practice license</a><a className="text-[#a5771d] underline" href={lawyer.idDocumentUrl} target="_blank" rel="noreferrer">Identity document</a></div>{lawyer.rejectionReason && <p className="mt-2 text-sm text-red-700">Reason: {lawyer.rejectionReason}</p>}</div><div className="flex gap-2">{lawyer.verificationStatus !== "APPROVED" && <Button type="button" disabled={saving} onClick={() => void mutate(`/api/admin/lawyers/${lawyer.id}/approve`, "PATCH", {}, "Lawyer approved.")}><ShieldCheck className="h-4 w-4" />Approve</Button>}{lawyer.verificationStatus !== "REJECTED" && <Button type="button" disabled={saving} onClick={() => { const reason = window.prompt("Reason for rejection?"); if (reason?.trim()) void mutate(`/api/admin/lawyers/${lawyer.id}/reject`, "PATCH", { reason: reason.trim() }, "Lawyer rejected."); }} className="bg-red-700 text-white hover:bg-red-800">Reject</Button>}</div></div><p className="mt-3 text-xs text-gray-400">Submitted {dateLabel(lawyer.createdAt)}{lawyer.reviewedAt ? ` · Reviewed ${dateLabel(lawyer.reviewedAt)}` : ""}</p></article>)}{!loading && rows.length === 0 && <Empty>No lawyer profiles match this view.</Empty>}</div>}

    {section === "users" && <>
      <SearchBar value={searchText} onChange={setSearchText} onSubmit={submitSearch} />
      <div className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white">{loading ? <Loading /> : <table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Joined</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody>{rows.map((user) => <tr key={user.id} className="border-t border-black/[0.06]"><td className="p-4"><p className="font-medium">{user.name}</p><p className="text-gray-500">{user.email ?? user.phone ?? "No contact"}</p></td><td className="p-4"><select disabled={saving} value={user.role?.id ?? ""} onChange={(event) => void mutate("/api/admin/users", "PATCH", { id: user.id, roleId: event.target.value }, "User role updated.")} className="rounded-lg border border-black/10 bg-white px-2 py-2 capitalize">{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></td><td className="p-4 text-gray-500">{dateLabel(user.createdAt)}</td><td className="p-4"><Status value={user.isActive ? "Active" : "Suspended"} /></td><td className="p-4"><Button type="button" disabled={saving} onClick={() => void mutate("/api/admin/users", "PATCH", { id: user.id, isActive: !user.isActive }, user.isActive ? "User suspended." : "User reactivated.")} className={user.isActive ? "bg-red-700 text-white hover:bg-red-800" : "bg-green-700 text-white hover:bg-green-800"}>{user.isActive ? "Suspend" : "Reactivate"}</Button></td></tr>)}</tbody></table>}</div>
    </>}

    {section === "rights-guides" && <>
      <div className="flex flex-wrap items-center justify-between gap-3"><SearchBar value={searchText} onChange={setSearchText} onSubmit={submitSearch} /><Button type="button" onClick={startNewGuide}><Plus className="h-4 w-4" />New guide</Button></div>
      {editing?.type === "guide" && <GuideEditor value={editing} saving={saving} onChange={setEditing} onCancel={() => setEditing(null)} onSave={(value) => void mutate(editing.id ? `/api/admin/rights-guides/${editing.id}` : "/api/admin/rights-guides", editing.id ? "PATCH" : "POST", value, "Rights guide saved.")} />}
      <div className="mt-4 space-y-3">{loading ? <Loading /> : rows.map((guide) => <article key={guide.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-white p-4"><div><div className="flex items-center gap-2"><h2 className="font-semibold">{guide.title}</h2><Status value={guide.isActive ? "Published" : "Inactive"} /></div><p className="mt-1 text-sm text-gray-500">/{guide.slug} · Order {guide.order}</p><p className="mt-1 text-sm text-gray-500">{guide.shortDescription}</p></div><div className="flex gap-2"><Button type="button" onClick={() => setEditing({ ...guide, type: "guide" })} className="border border-black/10 bg-white text-gray-700 hover:bg-gray-50">Edit</Button>{guide.isActive && <Button type="button" disabled={saving} onClick={() => void mutate(`/api/admin/rights-guides/${guide.id}`, "DELETE", undefined, "Guide deactivated.")} className="bg-red-700 text-white hover:bg-red-800">Deactivate</Button>}</div></article>)}{!loading && rows.length === 0 && <Empty>No rights guides found.</Empty>}</div>
    </>}

    {section === "articles" && <>
      <div className="flex flex-wrap items-center justify-between gap-3"><SearchBar value={searchText} onChange={setSearchText} onSubmit={submitSearch} /><Button type="button" onClick={startNewArticle}><Plus className="h-4 w-4" />New article</Button></div>
      {editing?.type === "article" && <ArticleEditor value={editing} saving={saving} onChange={setEditing} onCancel={() => setEditing(null)} onSave={(value) => void mutate("/api/admin/articles", editing.id ? "PATCH" : "POST", editing.id ? { ...value, id: editing.id } : value, "Article saved.")} />}
      <div className="mt-4 space-y-3">{loading ? <Loading /> : rows.map((article) => <article key={article.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-white p-4"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{article.title}</h2><Status value={article.isPublished ? "Published" : "Draft"} />{article.isFlagged && <Status value="Flagged" />}</div><p className="mt-1 text-sm text-gray-500">{article.category.replaceAll("_", " ")} · {article.readTimeMinutes} min · /{article.slug}</p>{article.flagReason && <p className="mt-1 text-sm text-red-700">Flag: {article.flagReason}</p>}</div><div className="flex flex-wrap gap-2"><Button type="button" onClick={() => setEditing({ ...article, type: "article" })} className="border border-black/10 bg-white text-gray-700 hover:bg-gray-50">Edit</Button><Button type="button" disabled={saving} onClick={() => void mutate("/api/admin/articles", "PATCH", { id: article.id, isPublished: !article.isPublished }, article.isPublished ? "Article unpublished." : "Article published.")} className="bg-[#a5771d] text-white hover:bg-[#8e6518]">{article.isPublished ? "Unpublish" : "Publish"}</Button><Button type="button" disabled={saving} onClick={() => { if (article.isFlagged) { void mutate(`/api/admin/articles/${article.id}/flag`, "PATCH", { isFlagged: false }, "Article unflagged."); return; } const reason = window.prompt("Why are you flagging this article?"); if (reason !== null) void mutate(`/api/admin/articles/${article.id}/flag`, "PATCH", { isFlagged: true, flagReason: reason.trim() || "Requires review" }, "Article flagged."); }} className={article.isFlagged ? "bg-gray-700 text-white" : "bg-red-700 text-white hover:bg-red-800"}>{article.isFlagged ? "Clear flag" : "Flag"}</Button></div></article>)}{!loading && rows.length === 0 && <Empty>No articles found.</Empty>}</div>
    </>}

    {section === "categories" && <>
      <div className="flex justify-end"><Button type="button" onClick={startNewCategory}><Plus className="h-4 w-4" />New situation</Button></div>
      {editing?.type === "category" && <CategoryEditor value={editing} saving={saving} onChange={setEditing} onCancel={() => setEditing(null)} onSave={(value) => void mutate(editing.id ? `/api/admin/emergency-categories/${editing.id}` : "/api/admin/emergency-categories", editing.id ? "PATCH" : "POST", value, "Situation saved.")} />}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{loading ? <Loading /> : rows.map((category) => <article key={category.id} className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-white p-4"><div><div className="flex items-center gap-2"><h2 className="font-semibold">{category.label}</h2><Status value={category.isActive ? "Active" : "Inactive"} /></div><p className="mt-1 text-sm text-gray-500">{category.key} · {category.iconKey} · Sort {category.sortOrder}</p></div><div className="flex gap-2"><Button type="button" onClick={() => setEditing({ ...category, type: "category" })} className="border border-black/10 bg-white text-gray-700 hover:bg-gray-50">Edit</Button>{category.isActive && <Button type="button" disabled={saving} onClick={() => void mutate(`/api/admin/emergency-categories/${category.id}`, "DELETE", undefined, "Situation deactivated.")} className="bg-red-700 text-white hover:bg-red-800">Disable</Button>}</div></article>)}{!loading && rows.length === 0 && <Empty>No situations found.</Empty>}</div>
    </>}

    {section === "requests" && <div className="space-y-3">{loading ? <Loading /> : rows.map((item) => item.recordType === "emergency" ? <EmergencyRequestCard key={`emergency-${item.id}-${item.status}`} item={item} lawyers={availableLawyers} saving={saving} onAssign={(lawyerProfileId) => void mutate(`/api/admin/emergency-requests/${item.id}/assign`, "POST", { lawyerProfileId }, "Emergency request assigned.")} onUpdate={(status) => void mutate(`/api/emergency-requests/${item.id}/status`, "PATCH", { status }, "Emergency request updated.")} /> : <article key={`enquiry-${item.id}`} className="rounded-xl border border-black/[0.06] bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="font-semibold">{item.title}</h2><Status value={item.status} /></div><p className="mt-1 text-sm text-gray-500">{item.citizen?.name} → {item.lawyer?.name ?? "Unassigned"} · {item.category}</p><p className="mt-1 text-xs text-gray-400">{dateLabel(item.createdAt)}</p>{item.description && <p className="mt-3 max-w-3xl text-sm text-gray-700">{item.description}</p>}</div><div className="flex flex-wrap gap-2">{item.status === "OPEN" && <><select value={assignment[item.id] ?? ""} onChange={(event) => setAssignment((current) => ({ ...current, [item.id]: event.target.value }))} className="max-w-56 rounded-lg border border-black/10 bg-white px-2 text-sm"><option value="">Select lawyer</option>{lawyers.map((lawyer) => <option key={lawyer.id} value={lawyer.id}>{lawyer.user?.name} · {lawyer.practiceAreas?.[0]}</option>)}</select><Button type="button" disabled={saving || !assignment[item.id]} onClick={() => void mutate(`/api/requests/${item.id}/assign`, "POST", { lawyerProfileId: assignment[item.id] }, "Lawyer assigned.")}>Assign</Button></>}{({ OPEN: ["CANCELLED"], ASSIGNED: ["IN_PROGRESS", "COMPLETED", "CANCELLED"], IN_PROGRESS: ["COMPLETED", "CANCELLED"] } as Record<string, string[]>)[item.status]?.length > 0 && <select key={item.status} defaultValue="" disabled={saving} onChange={(event) => { if (event.target.value) void mutate(`/api/requests/${item.id}`, "PATCH", { status: event.target.value }, "Request status updated."); }} className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm"><option value="">Update status</option>{({ OPEN: ["CANCELLED"], ASSIGNED: ["IN_PROGRESS", "COMPLETED", "CANCELLED"], IN_PROGRESS: ["COMPLETED", "CANCELLED"] } as Record<string, string[]>)[item.status].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select>}</div></div></article>)}{!loading && rows.length === 0 && <Empty>No requests have been submitted.</Empty>}</div>}

    {section === "audit" && <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white">{loading ? <Loading /> : <table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">When</th><th className="p-4">Admin</th><th className="p-4">Action</th><th className="p-4">Target</th><th className="p-4">Details</th></tr></thead><tbody>{rows.map((entry) => <tr key={entry.id} className="border-t border-black/[0.06]"><td className="p-4 text-gray-500">{dateLabel(entry.createdAt)}</td><td className="p-4">{entry.actor?.name}<p className="text-xs text-gray-400">{entry.actor?.email}</p></td><td className="p-4 font-medium">{entry.action}</td><td className="p-4">{entry.target}</td><td className="max-w-sm p-4 text-xs text-gray-500">{entry.metadata ? JSON.stringify(entry.metadata) : "—"}</td></tr>)}</tbody></table>}{!loading && rows.length === 0 && <Empty>No audit events have been recorded.</Empty>}</div>}
  </>;
}

function Loading() { return <div className="flex justify-center rounded-xl bg-white py-12"><Loader2 className="h-7 w-7 animate-spin text-[#c4922a]" /></div>; }
function Empty({ children }: { children: React.ReactNode }) { return <div className="rounded-xl border border-dashed border-black/10 bg-white p-8 text-center text-sm text-gray-500">{children}</div>; }
function Status({ value }: { value: string }) { const good = ["APPROVED", "Active", "Published", "COMPLETED", "ASSIGNED", "AVAILABLE"].includes(value); return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${good ? "bg-green-50 text-green-700" : value === "REJECTED" || value === "Suspended" || value === "Flagged" || value === "CANCELLED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>{value.replaceAll("_", " ")}</span>; }
function SearchBar({ value, onChange, onSubmit }: { value: string; onChange: (value: string) => void; onSubmit: (event: FormEvent) => void }) { return <form onSubmit={onSubmit} className="flex w-full max-w-xl gap-2"><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search..." className="h-10 min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 text-sm" /><Button type="submit"><Search className="h-4 w-4" />Search</Button></form>; }

function EditorFrame({ title, children, onCancel, onSubmit, saving }: { title: string; children: React.ReactNode; onCancel: () => void; onSubmit: (event: FormEvent) => void; saving: boolean }) { return <form onSubmit={onSubmit} className="my-4 space-y-4 rounded-2xl border border-[#c4922a]/30 bg-white p-5"><h2 className="font-semibold">{title}</h2>{children}<div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button><Button type="button" onClick={onCancel} className="border border-black/10 bg-white text-gray-700 hover:bg-gray-50">Cancel</Button></div></form>; }
function inputField(label: string, value: string | number, onChange: (value: string) => void, required = true) { return <label className="block text-sm font-medium text-gray-700">{label}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-black/10 px-3 font-normal" /></label>; }
function textAreaField(label: string, value: string, onChange: (value: string) => void) { return <label className="block text-sm font-medium text-gray-700">{label}<textarea required value={value} onChange={(event) => onChange(event.target.value)} rows={8} className="mt-1 block w-full rounded-lg border border-black/10 p-3 font-mono text-sm font-normal" /></label>; }

function GuideEditor({ value, saving, onChange, onCancel, onSave }: { value: Row; saving: boolean; onChange: (value: Row) => void; onCancel: () => void; onSave: (value: Row) => void }) {
  const set = (key: string, next: string) => onChange({ ...value, [key]: key === "order" ? Number(next) : next });
  return <EditorFrame title={value.id ? "Edit rights guide" : "Create rights guide"} saving={saving} onCancel={onCancel} onSubmit={(event) => { event.preventDefault(); onSave({ slug: value.slug, title: value.title, iconKey: value.iconKey, shortDescription: value.shortDescription, body: value.body, order: Number(value.order), isActive: Boolean(value.isActive) }); }}>
    <div className="grid gap-3 sm:grid-cols-2">{inputField("Title", value.title, (v) => set("title", v))}{inputField("URL slug", value.slug, (v) => set("slug", v))}{inputField("Icon key", value.iconKey, (v) => set("iconKey", v))}{inputField("Display order", value.order, (v) => set("order", v))}</div>{inputField("Short description", value.shortDescription, (v) => set("shortDescription", v))}{textAreaField("Guide body (Markdown supported)", value.body, (v) => set("body", v))}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(value.isActive)} onChange={(event) => onChange({ ...value, isActive: event.target.checked })} />Published and visible to users</label>
  </EditorFrame>;
}

function ArticleEditor({ value, saving, onChange, onCancel, onSave }: { value: Row; saving: boolean; onChange: (value: Row) => void; onCancel: () => void; onSave: (value: Row) => void }) {
  const set = (key: string, next: string) => onChange({ ...value, [key]: key === "readTimeMinutes" ? Number(next) : next });
  return <EditorFrame title={value.id ? "Edit article" : "Create article"} saving={saving} onCancel={onCancel} onSubmit={(event) => { event.preventDefault(); onSave({ slug: value.slug, title: value.title, excerpt: value.excerpt, body: value.body, category: value.category, readTimeMinutes: Number(value.readTimeMinutes), isPublished: Boolean(value.isPublished) }); }}>
    <div className="grid gap-3 sm:grid-cols-2">{inputField("Title", value.title, (v) => set("title", v))}{inputField("URL slug", value.slug, (v) => set("slug", v))}<label className="text-sm font-medium text-gray-700">Category<select value={value.category} onChange={(event) => set("category", event.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-black/10 bg-white px-3">{["CRIMINAL_RIGHTS", "PRIVACY_RIGHTS", "PROPERTY_LAW", "FINANCIAL_CRIME", "TRAFFIC_LAW"].map((c) => <option key={c} value={c}>{c.replaceAll("_", " ")}</option>)}</select></label>{inputField("Read time (minutes)", value.readTimeMinutes, (v) => set("readTimeMinutes", v))}</div>{inputField("Excerpt", value.excerpt, (v) => set("excerpt", v))}{textAreaField("Article body", value.body, (v) => set("body", v))}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(value.isPublished)} onChange={(event) => onChange({ ...value, isPublished: event.target.checked })} />Published</label>
  </EditorFrame>;
}

function CategoryEditor({ value, saving, onChange, onCancel, onSave }: { value: Row; saving: boolean; onChange: (value: Row) => void; onCancel: () => void; onSave: (value: Row) => void }) {
  const set = (key: string, next: string) => onChange({ ...value, [key]: key === "sortOrder" ? Number(next) : next });
  return <EditorFrame title={value.id ? "Edit situation" : "Create situation"} saving={saving} onCancel={onCancel} onSubmit={(event) => { event.preventDefault(); onSave(value.id ? { key: value.key, label: value.label, iconKey: value.iconKey, sortOrder: Number(value.sortOrder), isActive: Boolean(value.isActive) } : { key: value.key, label: value.label, iconKey: value.iconKey, sortOrder: Number(value.sortOrder) }); }}>
    <div className="grid gap-3 sm:grid-cols-2">{inputField("Label", value.label, (v) => set("label", v))}{inputField("Key (kebab-case)", value.key, (v) => set("key", v))}{inputField("Icon key", value.iconKey, (v) => set("iconKey", v))}{inputField("Display order", value.sortOrder, (v) => set("sortOrder", v))}</div>{value.id && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(value.isActive)} onChange={(event) => onChange({ ...value, isActive: event.target.checked })} />Active</label>}
  </EditorFrame>;
}

function EmergencyRequestCard({ item, lawyers, saving, onAssign, onUpdate }: { item: Row; lawyers: Row[]; saving: boolean; onAssign: (lawyerProfileId: string) => void; onUpdate: (status: string) => void }) {
  const transitions: Record<string, string[]> = { REQUESTED: ["MATCHED", "CANCELLED"], MATCHED: ["ACCEPTED", "REJECTED", "CANCELLED"], ACCEPTED: ["IN_PROGRESS", "CANCELLED"], REJECTED: ["REQUESTED", "CANCELLED"], IN_PROGRESS: ["COMPLETED", "CANCELLED"] };
  const [lawyerId, setLawyerId] = useState("");
  const sharedLocation = item.locationConsent ? item.location ?? (item.latitude != null && item.longitude != null ? `${Number(item.latitude).toFixed(5)}, ${Number(item.longitude).toFixed(5)}` : "Location permission granted") : null;
  return <article className="rounded-xl border border-black/[0.06] bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{item.category?.label ?? item.category}</h2><Status value={item.status} /><span className="text-xs text-gray-400">{item.triggerSource}</span></div><p className="mt-1 text-sm text-gray-500">{item.user?.name} · {item.user?.email} · {item.locationConsent ? "Location shared" : "No location"}</p>{sharedLocation && <p className="mt-1 flex items-center gap-1 text-sm text-gray-600"><MapPin className="h-3.5 w-3.5" />{sharedLocation}</p>}<p className="mt-1 text-xs text-gray-400">{dateLabel(item.createdAt)} · Assigned to {item.assignedTo?.name ?? "—"}</p>{item.message && <p className="mt-3 text-sm text-gray-700">{item.message}</p>}</div><div className="flex flex-wrap gap-2">{item.status === "REQUESTED" && !item.assignedToId && <><select value={lawyerId} onChange={(event) => setLawyerId(event.target.value)} className="h-10 max-w-56 rounded-lg border border-black/10 bg-white px-2 text-sm"><option value="">Select available lawyer</option>{lawyers.map((lawyer) => <option key={lawyer.id} value={lawyer.id}>{lawyer.name} · {lawyer.practiceArea}</option>)}</select><Button type="button" disabled={saving || !lawyerId} onClick={() => onAssign(lawyerId)}>Assign</Button></>}{(transitions[item.status] ?? []).length > 0 && <select disabled={saving} defaultValue="" onChange={(event) => { if (event.target.value) onUpdate(event.target.value); }} className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm"><option value="">Update status</option>{transitions[item.status].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select>}</div></div></article>;
}
