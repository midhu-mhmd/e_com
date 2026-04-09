import React, { useEffect, useState } from "react";
import {
  Truck,
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deliveryApi, type DeliveryBoyUser } from "../../delivery/deliveryApi";

const EMIRATES = [
  { value: "abu_dhabi", label: "Abu Dhabi" },
  { value: "dubai", label: "Dubai" },
  { value: "sharjah", label: "Sharjah" },
  { value: "ajman", label: "Ajman" },
  { value: "umm_al_quwain", label: "Umm Al Quwain" },
  { value: "fujairah", label: "Fujairah" },
  { value: "ras_al_khaimah", label: "Ras Al Khaimah" },
];

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  assigned_emirates: [] as string[],
  vehicle_number: "",
  identity_number: "",
  emergency_contact: "",
  notes: "",
  is_available: true,
};

type FormState = typeof EMPTY_FORM;

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (field: keyof FormState, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleEmirate = (val: string) =>
    setForm((prev) => ({
      ...prev,
      assigned_emirates: prev.assigned_emirates.includes(val)
        ? prev.assigned_emirates.filter((e) => e !== val)
        : [...prev.assigned_emirates, val],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim()) { setErr("First name is required."); return; }
    if (!form.email.trim() && !form.phone_number.trim()) { setErr("Email or phone number is required."); return; }
    setSaving(true);
    setErr(null);
    try {
      await deliveryApi.adminCreateDeliveryBoy({
        ...form,
        email: form.email.trim() || undefined,
        phone_number: form.phone_number.trim() || undefined,
        vehicle_number: form.vehicle_number.trim() || undefined,
        identity_number: form.identity_number.trim() || undefined,
        emergency_contact: form.emergency_contact.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      onCreated();
      onClose();
    } catch (e: any) {
      const data = e?.response?.data;
      if (data && typeof data === "object") {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
          .join(" | ");
        setErr(msg);
      } else {
        setErr(e?.message || "Failed to create delivery boy.");
      }
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full text-sm border border-[#EEEEEE] rounded-lg px-3 py-2 bg-white outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-100 placeholder:text-gray-300";
  const labelCls = "block text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-[#EEEEEE] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEE]">
          <h2 className="text-sm font-bold">Add Delivery Boy</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>First Name <span className="text-rose-400">*</span></label>
              <input className={inputCls} value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="Ahmed" />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input className={inputCls} value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Ali" />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="delivery@example.com" />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input className={inputCls} value={form.phone_number} onChange={(e) => set("phone_number", e.target.value)} placeholder="+971501234567" />
            </div>
          </div>
          <p className="text-[10px] text-[#A1A1AA] -mt-3">At least one of email or phone is required.</p>

          {/* Emirates */}
          <div>
            <label className={labelCls}>Assigned Emirates</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {EMIRATES.map((em) => (
                <button
                  key={em.value}
                  type="button"
                  onClick={() => toggleEmirate(em.value)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                    form.assigned_emirates.includes(em.value)
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {em.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle + Identity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Vehicle Number</label>
              <input className={inputCls} value={form.vehicle_number} onChange={(e) => set("vehicle_number", e.target.value)} placeholder="ABC123" />
            </div>
            <div>
              <label className={labelCls}>Identity Number</label>
              <input className={inputCls} value={form.identity_number} onChange={(e) => set("identity_number", e.target.value)} placeholder="784-1234-5678-9" />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <label className={labelCls}>Emergency Contact</label>
            <input className={inputCls} value={form.emergency_contact} onChange={(e) => set("emergency_contact", e.target.value)} placeholder="+971509876543" />
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional notes…" />
          </div>

          {/* Available toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("is_available", !form.is_available)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                form.is_available ? "bg-emerald-500" : "bg-gray-200"
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                form.is_available ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </button>
            <span className="text-xs font-medium text-gray-600">Available for delivery</span>
          </div>

          {err && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{err}</p>}
        </form>

        <div className="px-6 py-4 border-t border-[#EEEEEE] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-[#EEEEEE] rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={saving}
            className="flex-1 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

const LIMIT = 10;

const DeliveryBoysList: React.FC = () => {
  const navigate = useNavigate();
  const [allBoys, setAllBoys] = useState<DeliveryBoyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deliveryApi.adminListDeliveryBoys();
      setAllBoys(Array.isArray(data) ? data : data.results ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to load delivery boys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* ── client-side search + pagination ── */
  const filtered = allBoys.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${b.first_name} ${b.last_name} ${b.full_name}`.toLowerCase();
    return name.includes(q) || b.email?.toLowerCase().includes(q) || b.phone_number?.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);
  const visibleStart = filtered.length === 0 ? 0 : (currentPage - 1) * LIMIT + 1;
  const visibleEnd = Math.min(currentPage * LIMIT, filtered.length);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  return (
    <div className="space-y-6">
      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreated={load} />
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#18181B]">Delivery Boys</h1>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            {allBoys.length} registered delivery personnel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
          >
            <Plus size={14} /> Add Delivery Boy
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#EEEEEE] text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white border border-[#EEEEEE] rounded-2xl overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-[#EEEEEE]">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, email or phone…"
              className="w-full pl-8 pr-3 py-2 text-xs border border-[#EEEEEE] rounded-lg bg-[#FAFAFA] outline-none focus:border-gray-300 focus:bg-white"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-[#A1A1AA]">
            <Loader2 size={24} className="animate-spin" /> <span className="text-sm">Loading…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle size={24} className="text-rose-400" />
            <p className="text-sm text-rose-600">{error}</p>
            <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#EEEEEE] text-sm hover:bg-gray-50">
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#A1A1AA]">
            <Users size={32} />
            <p className="text-sm">{search ? "No results found." : "No delivery boys yet."}</p>
            {!search && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-bold hover:bg-gray-800"
              >
                <Plus size={13} /> Add First Delivery Boy
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EEEEEE] bg-[#FAFAFA]">
                  <th className="text-left text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider px-5 py-3">#</th>
                  <th className="text-left text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider px-5 py-3">Name / Contact</th>
                  <th className="text-left text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider px-5 py-3 hidden md:table-cell">Emirates</th>
                  <th className="text-left text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Vehicle</th>
                  <th className="text-left text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider px-5 py-3">Availability</th>
                  <th className="text-left text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider px-5 py-3">Active</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F5]">
                {paginated.map((boy, idx) => {
                  const displayName =
                    boy.full_name || `${boy.first_name} ${boy.last_name}`.trim() || boy.email;
                  return (
                    <tr
                      key={boy.id}
                      onClick={() => navigate(`/admin/delivery/boys/${boy.id}`)}
                      className="hover:bg-[#FBFBFA] transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4 text-xs font-mono text-[#A1A1AA]">
                        {(currentPage - 1) * LIMIT + idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-xs font-black text-cyan-700 shrink-0">
                            {(displayName[0] || "?").toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#18181B]">{displayName}</p>
                            <p className="text-[10px] text-[#A1A1AA] mt-0.5 flex items-center gap-1">
                              <Phone size={9} /> {boy.phone_number || boy.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {boy.delivery_profile?.assigned_emirates_display?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {boy.delivery_profile.assigned_emirates_display.map((e) => (
                              <span key={e} className="inline-flex items-center gap-0.5 bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">
                                <MapPin size={9} /> {e}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#D4D4D8] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-xs text-[#52525B]">
                          {boy.delivery_profile?.vehicle_number || <span className="text-[#D4D4D8]">—</span>}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          boy.delivery_profile?.is_available
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}>
                          <Truck size={9} />
                          {boy.delivery_profile?.is_available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {boy.is_active
                          ? <CheckCircle2 size={15} className="text-emerald-500" />
                          : <XCircle size={15} className="text-rose-400" />
                        }
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/delivery/boys/${boy.id}`); }}
                          className="p-2 rounded-lg text-[#A1A1AA] hover:bg-black hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="p-4 border-t border-[#EEEEEE] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
            <div className="text-[11px] text-[#A1A1AA] font-medium">
              Showing {visibleStart}–{visibleEnd} of {filtered.length} delivery boys
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-[#EEEEEE] rounded-lg hover:bg-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold px-2">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 border border-[#EEEEEE] rounded-lg hover:bg-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoysList;
