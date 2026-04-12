import React, { useEffect, useState } from "react";
import { Save, Loader2, Truck, Info, Power } from "lucide-react";
import { ordersApi, type DeliveryChargeSettingsDto } from "../orders/ordersApi";
import { useToast } from "../../../components/ui/Toast";

export const DeliveryChargeSettings: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DeliveryChargeSettingsDto>({
    min_order_for_free_delivery: 40,
    delivery_charge_amount: 10,
    is_active: true,
  });
  const [original, setOriginal] = useState<DeliveryChargeSettingsDto | null>(null);

  useEffect(() => {
    ordersApi
      .getDeliveryChargeSettings()
      .then((data) => {
        setForm(data);
        setOriginal(data);
      })
      .catch(() => toast.error("Failed to load delivery charge settings."))
      .finally(() => setLoading(false));
  }, []);

  const isDirty =
    original !== null &&
    (form.min_order_for_free_delivery !== original.min_order_for_free_delivery ||
      form.delivery_charge_amount !== original.delivery_charge_amount ||
      form.is_active !== original.is_active);

  const handleSave = async () => {
    if (form.min_order_for_free_delivery < 0 || form.delivery_charge_amount < 0) {
      toast.error("Values cannot be negative.");
      return;
    }
    setSaving(true);
    try {
      const updated = await ordersApi.updateDeliveryChargeSettings(form);
      setForm(updated);
      setOriginal(updated);
      toast.success("Delivery charge settings updated!");
    } catch {
      toast.error("Failed to update delivery charge settings.");
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-50 bg-stone-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight leading-tight text-stone-900">Delivery Charges</h2>
              <p className="text-xs text-stone-400">
                Configure free-delivery threshold and shipping fee.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
              title={form.is_active ? "Disable delivery charges" : "Enable delivery charges"}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                form.is_active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {form.is_active ? "Active" : "Inactive"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-stone-800 disabled:opacity-40 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-50/70 rounded-2xl border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Orders below the minimum threshold will be charged a delivery fee.
              Orders at or above the threshold get <strong>free delivery</strong>.
            </p>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Minimum order for free delivery */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 flex items-center gap-1">
                Free Delivery Threshold (AED)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-medium">
                  AED
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.min_order_for_free_delivery}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      min_order_for_free_delivery: Number(e.target.value),
                    }))
                  }
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                />
              </div>
              <p className="text-[11px] text-stone-400">
                Orders ≥ this amount get free shipping.
              </p>
            </div>

            {/* Delivery charge amount */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 flex items-center gap-1">
                Delivery Charge (AED)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-medium">
                  AED
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.delivery_charge_amount}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      delivery_charge_amount: Number(e.target.value),
                    }))
                  }
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                />
              </div>
              <p className="text-[11px] text-stone-400">
                Fee applied when order is below the threshold.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-stone-100 bg-stone-50/50 p-5 space-y-3">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Current Rules Preview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-stone-100">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-stone-600">
                  Order &lt; AED {form.min_order_for_free_delivery}
                </span>
                <span className="ml-auto font-bold text-stone-800">
                  AED {form.delivery_charge_amount}
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-stone-100">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-stone-600">
                  Order ≥ AED {form.min_order_for_free_delivery}
                </span>
                <span className="ml-auto font-bold text-emerald-600">FREE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
