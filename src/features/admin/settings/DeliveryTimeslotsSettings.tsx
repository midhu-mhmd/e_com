import React, { useEffect, useState } from "react";
import { 
    Clock, Plus, Trash2, Save, Loader2, Calendar, 
    AlertCircle, Check, X, ShieldAlert, ChevronDown, Info, Pencil
} from "lucide-react";
import { ordersApi, type DeliverySlotDto } from "../orders/ordersApi";
import { useToast } from "../../../components/ui/Toast";

export const DeliveryTimeslotsSettings: React.FC = () => {
    const toast = useToast();
    const [slots, setSlots] = useState<DeliverySlotDto[]>([]);
    const [overrides, setOverrides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // UI State
    const [activeTab, setActiveTab] = useState<"slots" | "overrides">("slots");
    const [isAddingSlot, setIsAddingSlot] = useState(false);
    const [isAddingOverride, setIsAddingOverride] = useState(false);
    const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
    const [editSlotForm, setEditSlotForm] = useState<Partial<DeliverySlotDto>>({});

    // Form states
    const [slotForm, setSlotForm] = useState<Partial<DeliverySlotDto>>({
        name: "",
        start_time: "08:00",
        end_time: "09:00",
        cutoff_time: "07:30",
        sort_order: 1,
        is_active: true
    });

    const [overrideForm, setOverrideForm] = useState({
        slot: "",
        date: new Date().toISOString().split('T')[0],
        is_active: false,
        reason: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [s, o] = await Promise.all([
                ordersApi.getSlots(),
                ordersApi.getOverrides()
            ]);
            setSlots(Array.isArray(s) ? s : (s as any).results ?? []);
            setOverrides(Array.isArray(o) ? o : (o as any).results ?? []);
        } catch (err) {
            toast.error("Failed to load delivery settings.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSlot = async () => {
        if (!slotForm.name || !slotForm.start_time || !slotForm.end_time || !slotForm.cutoff_time) {
            toast.error("Please fill all required fields.");
            return;
        }
        setSaving(true);
        try {
            await ordersApi.createSlot(slotForm);
            toast.success("Timeslot created!");
            setIsAddingSlot(false);
            setSlotForm({ name: "", start_time: "08:00", end_time: "09:00", cutoff_time: "07:30", sort_order: slots.length + 1, is_active: true });
            loadData();
        } catch (err) {
            toast.error("Failed to create timeslot.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSlot = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this timeslot? This may affect existing orders.")) return;
        try {
            await ordersApi.deleteSlot(id);
            toast.success("Timeslot deleted.");
            loadData();
        } catch (err) {
            toast.error("Failed to delete timeslot.");
        }
    };

    const handleToggleSlot = async (slot: DeliverySlotDto) => {
        try {
            if (slot.is_active) {
                await ordersApi.deactivateSlot(slot.id);
                toast.success(`"${slot.name}" deactivated.`);
            } else {
                await ordersApi.activateSlot(slot.id);
                toast.success(`"${slot.name}" activated.`);
            }
            loadData();
        } catch (err) {
            toast.error("Failed to update slot status.");
        }
    };

    const handleEditSlot = (slot: DeliverySlotDto) => {
        setEditingSlotId(slot.id);
        setEditSlotForm({
            name: slot.name,
            start_time: slot.start_time,
            end_time: slot.end_time,
            cutoff_time: slot.cutoff_time,
            sort_order: slot.sort_order,
            is_active: slot.is_active,
        });
        setIsAddingSlot(false);
    };

    const handleUpdateSlot = async () => {
        if (!editingSlotId) return;
        if (!editSlotForm.name || !editSlotForm.start_time || !editSlotForm.end_time || !editSlotForm.cutoff_time) {
            toast.error("Please fill all required fields.");
            return;
        }
        setSaving(true);
        try {
            await ordersApi.updateSlot(editingSlotId, editSlotForm);
            toast.success("Timeslot updated!");
            setEditingSlotId(null);
            setEditSlotForm({});
            loadData();
        } catch (err) {
            toast.error("Failed to update timeslot.");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateOverride = async () => {
        if (!overrideForm.slot || !overrideForm.date) {
            toast.error("Please select a slot and date.");
            return;
        }
        setSaving(true);
        try {
            await ordersApi.createOverride(overrideForm);
            toast.success("Override added!");
            setIsAddingOverride(false);
            loadData();
        } catch (err) {
            toast.error("Failed to add override.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteOverride = async (id: number) => {
        try {
            await ordersApi.deleteOverride(id);
            toast.success("Override removed.");
            loadData();
        } catch (err) {
            toast.error("Failed to remove override.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Tabs */}
            <div className="flex w-full sm:w-fit bg-stone-100 p-1 rounded-2xl overflow-x-auto">
                <button
                    onClick={() => setActiveTab("slots")}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "slots" ? "bg-white text-black shadow-sm" : "text-stone-500 hover:text-black"}`}
                >
                    Global Timeslots
                </button>
                <button
                    onClick={() => setActiveTab("overrides")}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "overrides" ? "bg-white text-black shadow-sm" : "text-stone-500 hover:text-black"}`}
                >
                    Date Overrides
                </button>
            </div>

            {activeTab === "slots" ? (
                <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-stone-50 bg-stone-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-cyan-600 shrink-0" />
                            <div>
                                <h2 className="text-lg font-bold text-stone-900">Delivery Timeslots</h2>
                                <p className="text-xs text-stone-400">Global delivery windows and cutoff times.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAddingSlot(true)}
                            className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-all"
                        >
                            <Plus size={14} /> Add Slot
                        </button>
                    </div>

                    <div className="p-4 sm:p-6">
                        {isAddingSlot && (
                            <div className="mb-6 p-4 sm:p-6 bg-stone-50 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 items-end animate-in zoom-in-95 duration-200">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Morning"
                                        value={slotForm.name}
                                        onChange={e => setSlotForm(f => ({...f, name: e.target.value}))}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Start Time</label>
                                    <input 
                                        type="time" 
                                        value={slotForm.start_time}
                                        onChange={e => setSlotForm(f => ({...f, start_time: e.target.value}))}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">End Time</label>
                                    <input 
                                        type="time" 
                                        value={slotForm.end_time}
                                        onChange={e => setSlotForm(f => ({...f, end_time: e.target.value}))}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Cutoff Time</label>
                                    <input 
                                        type="time" 
                                        value={slotForm.cutoff_time}
                                        onChange={e => setSlotForm(f => ({...f, cutoff_time: e.target.value}))}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Status</label>
                                    <div className="flex bg-white rounded-xl border border-stone-200 p-1">
                                        <button 
                                            type="button"
                                            onClick={() => setSlotForm(f => ({...f, is_active: true}))}
                                            className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold transition-all ${slotForm.is_active ? "bg-emerald-500 text-white" : "text-stone-500"}`}
                                        >
                                            Active
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setSlotForm(f => ({...f, is_active: false}))}
                                            className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold transition-all ${!slotForm.is_active ? "bg-stone-400 text-white" : "text-stone-500"}`}
                                        >
                                            Inactive
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateSlot}
                                        disabled={saving}
                                        className="flex-1 bg-cyan-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-cyan-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                                    </button>
                                    <button
                                        onClick={() => setIsAddingSlot(false)}
                                        className="p-2 border border-stone-200 rounded-xl text-stone-500 hover:bg-stone-100"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full min-w-[580px]">
                                <thead>
                                    <tr className="border-b border-stone-100">
                                        <th className="text-[10px] font-black uppercase text-stone-400 tracking-widest text-left pb-4 px-2">Order</th>
                                        <th className="text-[10px] font-black uppercase text-stone-400 tracking-widest text-left pb-4 px-2">Name</th>
                                        <th className="text-[10px] font-black uppercase text-stone-400 tracking-widest text-left pb-4 px-2">Window</th>
                                        <th className="text-[10px] font-black uppercase text-stone-400 tracking-widest text-left pb-4 px-2">Cutoff</th>
                                        <th className="text-[10px] font-black uppercase text-stone-400 tracking-widest text-left pb-4 px-2">Status</th>
                                        <th className="text-[10px] font-black uppercase text-stone-400 tracking-widest text-right pb-4 px-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {slots.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-stone-400 text-sm">No timeslots configured yet.</td>
                                        </tr>
                                    ) : (
                                        slots.map((slot) => (
                                            <React.Fragment key={slot.id}>
                                            <tr className="hover:bg-stone-50/50 transition-colors group">
                                                <td className="py-4 px-2 text-sm font-bold text-stone-400 w-16">{slot.sort_order}</td>
                                                <td className="py-4 px-2 text-sm font-bold text-stone-900">{slot.name}</td>
                                                <td className="py-4 px-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm text-stone-600">{slot.start_time_display}</span>
                                                        <span className="text-stone-300">→</span>
                                                        <span className="text-sm text-stone-600">{slot.end_time_display}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 text-sm font-medium text-rose-500">{slot.cutoff_time}</td>
                                                <td className="py-4 px-2">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                        slot.is_active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-400"
                                                    }`}>
                                                        {slot.is_active ? <Check size={10} /> : <X size={10} />}
                                                        {slot.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-2 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => editingSlotId === slot.id ? setEditingSlotId(null) : handleEditSlot(slot)}
                                                            title="Edit"
                                                            className="text-stone-300 hover:text-cyan-600 hover:bg-cyan-50 transition-colors p-2 rounded-lg"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleSlot(slot)}
                                                            title={slot.is_active ? "Deactivate" : "Activate"}
                                                            className={`p-2 rounded-lg transition-colors text-xs font-bold ${
                                                                slot.is_active
                                                                    ? "text-stone-400 hover:text-amber-600 hover:bg-amber-50"
                                                                    : "text-stone-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                            }`}
                                                        >
                                                            {slot.is_active ? <ShieldAlert size={15} /> : <Check size={15} />}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteSlot(slot.id)}
                                                            className="text-stone-300 hover:text-rose-600 transition-colors p-2"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {editingSlotId === slot.id && (
                                                <tr className="bg-cyan-50/60">
                                                    <td colSpan={6} className="px-3 sm:px-4 py-4">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 items-end">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={editSlotForm.name ?? ""}
                                                                    onChange={e => setEditSlotForm(f => ({...f, name: e.target.value}))}
                                                                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Start Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={editSlotForm.start_time ?? ""}
                                                                    onChange={e => setEditSlotForm(f => ({...f, start_time: e.target.value}))}
                                                                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">End Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={editSlotForm.end_time ?? ""}
                                                                    onChange={e => setEditSlotForm(f => ({...f, end_time: e.target.value}))}
                                                                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Cutoff Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={editSlotForm.cutoff_time ?? ""}
                                                                    onChange={e => setEditSlotForm(f => ({...f, cutoff_time: e.target.value}))}
                                                                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Sort Order</label>
                                                                <input
                                                                    type="number"
                                                                    value={editSlotForm.sort_order ?? 1}
                                                                    onChange={e => setEditSlotForm(f => ({...f, sort_order: Number(e.target.value)}))}
                                                                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={handleUpdateSlot}
                                                                    disabled={saving}
                                                                    className="flex-1 bg-cyan-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-cyan-700 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Update
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingSlotId(null)}
                                                                    className="p-2 border border-stone-200 bg-white rounded-xl text-stone-500 hover:bg-stone-100"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-stone-50 bg-stone-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <h2 className="text-lg font-bold text-stone-900">Date Overrides</h2>
                                <p className="text-xs text-stone-400">Force disable/enable specific slots for specific dates.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAddingOverride(true)}
                            className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-all"
                        >
                            <Plus size={14} /> Add Override
                        </button>
                    </div>

                    <div className="p-4 sm:p-6">
                        {isAddingOverride && (
                            <div className="mb-6 p-4 sm:p-6 bg-amber-50 rounded-2xl border border-amber-200 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 items-end animate-in zoom-in-95 duration-200">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Slot</label>
                                    <select
                                        value={overrideForm.slot}
                                        onChange={e => setOverrideForm(f => ({...f, slot: e.target.value}))}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                    >
                                        <option value="">Select Slot</option>
                                        {slots.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Date</label>
                                    <input 
                                        type="date" 
                                        value={overrideForm.date}
                                        onChange={e => setOverrideForm(f => ({...f, date: e.target.value}))}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Status</label>
                                    <div className="flex bg-white rounded-xl border border-stone-200 p-1">
                                        <button 
                                            type="button"
                                            onClick={() => setOverrideForm(f => ({...f, is_active: false}))}
                                            className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold transition-all ${!overrideForm.is_active ? "bg-rose-500 text-white" : "text-stone-500"}`}
                                        >
                                            Disable
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setOverrideForm(f => ({...f, is_active: true}))}
                                            className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold transition-all ${overrideForm.is_active ? "bg-emerald-500 text-white" : "text-stone-500"}`}
                                        >
                                            Enable
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Reason</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Holiday, No drivers"
                                        value={overrideForm.reason}
                                        onChange={e => setOverrideForm(f => ({...f, reason: e.target.value}))}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateOverride}
                                        disabled={saving}
                                        className="flex-1 bg-amber-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                                    </button>
                                    <button
                                        onClick={() => setIsAddingOverride(false)}
                                        className="p-2 border border-amber-200 rounded-xl text-amber-900/50 hover:bg-amber-100"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full min-w-[480px]">
                                <thead>
                                    <tr className="border-b border-stone-100">
                                        <th className="text-[10px] font-black uppercase text-stone-400 tracking-widest text-left pb-4 px-2">Slot</th>
                                        <th className="text-[10px] font-black uppercase text-stone-400 tracking-widest text-left pb-4 px-2">Target Date</th>
                                        <th className="text-[10px] font-black uppercase text-stone-400 tracking-widest text-left pb-4 px-2">Action</th>
                                        <th className="text-[10px] font-black uppercase text-stone-400 tracking-widest text-left pb-4 px-2">Reason</th>
                                        <th className="text-[10px] font-black uppercase text-stone-400 tracking-widest text-right pb-4 px-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {overrides.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-stone-400 text-sm">No date-specific overrides active.</td>
                                        </tr>
                                    ) : (
                                        overrides.map((ov) => {
                                            const slot = slots.find(s => s.id === ov.slot);
                                            return (
                                                <tr key={ov.id} className="group">
                                                    <td className="py-4 px-2 text-sm font-bold text-stone-900">{slot?.name || `Slot #${ov.slot}`}</td>
                                                    <td className="py-4 px-2 text-sm text-stone-600">{ov.date}</td>
                                                    <td className="py-4 px-2">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${ov.is_active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                                            {ov.is_active ? <Check size={10} /> : <ShieldAlert size={10} />}
                                                            {ov.is_active ? "Force Enable" : "Force Disable"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2 text-xs text-stone-400 max-w-[160px] truncate">{ov.reason || "—"}</td>
                                                    <td className="py-4 px-2 text-right">
                                                        <button 
                                                            onClick={() => handleDeleteOverride(ov.id)}
                                                            className="text-stone-300 hover:text-rose-600 transition-colors p-2"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-amber-50/50 border-t border-amber-100">
                        <div className="flex gap-3">
                            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800/70 leading-relaxed">
                                Overrides take priority over global status. Use <span className="font-bold">Force Disable</span> for holidays or maintenance.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
