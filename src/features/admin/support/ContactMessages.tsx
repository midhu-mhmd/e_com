import React from "react";
import { Mail, Search, CheckCircle2, XCircle, Reply, Loader2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { supportApi, type ContactMessageDto } from "./supportApi";
import { useToast } from "../../../components/ui/Toast";

const ContactMessagesPage: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<ContactMessageDto[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [resolved, setResolved] = React.useState<"all" | "open" | "closed">("all");
  const [replying, setReplying] = React.useState<number | null>(null);
  const [viewing, setViewing] = React.useState<ContactMessageDto | null>(null);
  const [reply, setReply] = React.useState({ reply_message: "", mark_resolved: false });

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 2000);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supportApi.list({
        search: debouncedSearch || undefined,
        is_resolved: resolved === "all" ? undefined : resolved === "closed",
        limit,
        offset: (page - 1) * limit,
      });
      setItems(data.results);
      setTotalCount(data.count);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Unable to load messages. Please ensure the admin list endpoint exists.");
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [resolved, debouncedSearch, page, limit]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const visibleStart = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const visibleEnd = Math.min(page * limit, totalCount);

  const handleResolve = async (m: ContactMessageDto, makeResolved: boolean) => {
    try {
      const updated = await supportApi.resolve(m.id, makeResolved);
      setItems((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
      toast.show(makeResolved ? "Marked as resolved" : "Marked as open", "success");
    } catch (e: any) {
      toast.show(e?.response?.data?.detail || "Failed to update", "error");
    }
  };

  const openReply = (m: ContactMessageDto) => {
    setReplying(m.id);
    setReply({ reply_message: `Hi ${m.name},\n\n`, mark_resolved: false });
  };

  const sendReply = async (m: ContactMessageDto) => {
    try {
      const res = await supportApi.reply(m.id, reply);
      toast.show(res?.detail || "Reply sent successfully", "success");
      if (reply.mark_resolved) {
        setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_resolved: true } : x)));
      }
      setReplying(null);
    } catch {
      const subject = `Re: ${m.subject}`;
      const mailto = `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(reply.reply_message)}`;
      window.open(mailto, "_blank");
      setReplying(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">Support Messages</h1>
        <p className="text-[#71717A] text-sm mt-1">View and reply to customer inquiries.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#EEEEEE] shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 md:max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              placeholder="Search by name, email, subject or message..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#F4F4F5] border border-transparent rounded-xl text-[13px] font-medium outline-none transition-all duration-200 focus:bg-white focus:border-[#D4D4D8] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] placeholder:text-[#A1A1AA]"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[#E5E5E5] text-[#A1A1AA] hover:text-[#52525B] transition-colors"
              >
                <XCircle size={14} />
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#F4F4F5] p-1 rounded-xl">
            {([
              { key: "all" as const, label: "All" },
              { key: "open" as const, label: "Open" },
              { key: "closed" as const, label: "Resolved" },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setResolved(tab.key);
                  setPage(1);
                }}
                className={`text-[11px] font-bold px-4 py-1.5 rounded-lg transition-all duration-200 ${
                  resolved === tab.key
                    ? "bg-white text-black shadow-sm"
                    : "text-[#71717A] hover:text-[#18181B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Count Badge */}
          <div className="ml-auto flex items-center gap-2">
            {debouncedSearch && (
              <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                {totalCount} result{totalCount !== 1 ? "s" : ""}
              </span>
            )}
            <span className="text-[11px] font-bold text-white bg-black px-2.5 py-1 rounded-full min-w-[28px] text-center">
              {totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FAFAFA]">
              <tr className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest border-b border-[#EEEEEE]">
                <th className="px-5 py-3">From</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Message</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEEEE]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 w-40 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-56 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-64 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-6 w-20 bg-gray-100 rounded-full" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-8 w-8 bg-gray-100 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#71717A]">
                    {error || "No messages found."}
                  </td>
                </tr>
              ) : (
                items.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FBFBFA] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm">{m.name}</div>
                      <div className="text-[11px] text-[#A1A1AA]">{m.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm">{m.subject}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-[#52525B] truncate max-w-[200px] sm:max-w-[300px] lg:max-w-[380px]">{m.message}</div>
                    </td>
                    <td className="px-5 py-4">
                      {m.is_resolved ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border bg-emerald-50 text-emerald-600 border-emerald-100">
                          Resolved
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border bg-amber-50 text-amber-600 border-amber-100">
                          Open
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[11px] text-[#52525B] font-medium">
                      {new Date(m.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="View"
                          onClick={() => setViewing(m)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          title="Reply"
                          onClick={() => openReply(m)}
                          className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600"
                        >
                          <Reply size={16} />
                        </button>
                        <button
                          title={m.is_resolved ? "Mark Open" : "Mark Resolved"}
                          onClick={() => handleResolve(m, !m.is_resolved)}
                          className={`p-2 rounded-lg ${m.is_resolved ? "hover:bg-amber-50 text-amber-600" : "hover:bg-emerald-50 text-emerald-600"}`}
                        >
                          {m.is_resolved ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#EEEEEE] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-4">
            <div className="text-[11px] text-[#A1A1AA] font-medium">
              Showing {visibleStart}–{visibleEnd} of {totalCount} messages
            </div>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="p-1.5 bg-[#F9F9F9] border border-[#EEEEEE] rounded-lg text-xs outline-none focus:border-[#D4D4D8]"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2 border border-[#EEEEEE] rounded-lg hover:bg-[#FAFAFA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold px-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages || loading}
              className="p-2 border border-[#EEEEEE] rounded-lg hover:bg-[#FAFAFA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* View Drawer */}
      {viewing && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewing(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3 mb-4">
              <div>
                <h3 className="text-lg font-black">Message Details</h3>
                <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">#{viewing.id}</span>
              </div>
              <button onClick={() => setViewing(null)} className="text-[#A1A1AA] hover:text-black">Close</button>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase mb-1">From</p>
                <p className="text-sm font-bold">{viewing.name}</p>
                <p className="text-xs text-[#A1A1AA]">{viewing.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase mb-1">Subject</p>
                <p className="text-sm font-bold">{viewing.subject}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase mb-1">Message</p>
                <div className="bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl p-4 text-sm leading-relaxed text-[#3F3F46] whitespace-pre-wrap">
                  {viewing.message}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase mb-1">Created</p>
                <p className="text-xs text-[#52525B]">
                  {new Date(viewing.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replying !== null && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setReplying(null)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Mail size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black">Reply via Email</h3>
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase">Your message will be emailed to the customer</p>
              </div>
            </div>
            <div className="space-y-3">
              <textarea
                value={reply.reply_message}
                onChange={(e) => setReply((r) => ({ ...r, reply_message: e.target.value }))}
                rows={6}
                className="w-full p-3 bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl outline-none focus:bg-white focus:border-[#D4D4D8] text-sm"
                placeholder="Write your response..."
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={reply.mark_resolved}
                  onChange={(e) => setReply((r) => ({ ...r, mark_resolved: e.target.checked }))}
                />
                Mark as resolved
              </label>
              <div className="flex justify-end gap-2">
                <button onClick={() => setReplying(null)} className="px-4 py-2 text-sm font-bold rounded-lg border border-[#E5E5E5]">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const m = items.find((x) => x.id === replying);
                    if (!m) return;
                    setLoading(true);
                    Promise.resolve(sendReply(m)).finally(() => setLoading(false));
                  }}
                  className="px-4 py-2 text-sm font-bold rounded-lg bg-black text-white"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessagesPage;
