import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, RotateCcw, Loader2, Info, Gift, UserPlus } from "lucide-react";
import { useToast } from "../../../components/ui/Toast";
import {
    fetchRewardConfigRequest,
    updateRewardConfigRequest,
    resetRewardDefaultsRequest,
    selectRewardConfig,
    selectCouponsLoading,
} from "./couponsSlice";

const rewardConfigSchema = z.object({
    first_order_discount_type: z.enum(["percentage", "fixed"]),
    first_order_discount_value: z.coerce.number().min(0),
    first_order_min_amount: z.coerce.number().min(0),
    first_order_validity_days: z.coerce.number().min(1),
    referral_discount_type: z.enum(["percentage", "fixed"]),
    referral_discount_value: z.coerce.number().min(0),
    referral_min_amount: z.coerce.number().min(0),
    referral_validity_days: z.coerce.number().min(1),
    referral_usage_limit: z.coerce.number().min(1),
    referrer_discount_value: z.coerce.number().min(0),
    referrer_validity_days: z.coerce.number().min(1),
    max_discount_percentage: z.coerce.number().min(0).nullable(),
    is_referral_active: z.boolean(),
    is_first_order_active: z.boolean(),
});

type RewardConfigFormData = z.infer<typeof rewardConfigSchema>;

export const RewardSettings: React.FC = () => {
    const dispatch = useDispatch();
    const toast = useToast();
    const config = useSelector(selectRewardConfig);
    const loading = useSelector(selectCouponsLoading);

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<RewardConfigFormData>({
        resolver: zodResolver(rewardConfigSchema) as any,
    });

    useEffect(() => {
        dispatch(fetchRewardConfigRequest());
    }, [dispatch]);

    useEffect(() => {
        if (config) {
            reset({
                ...config,
                first_order_discount_value: Number(config.first_order_discount_value),
                first_order_min_amount: Number(config.first_order_min_amount),
                referral_discount_value: Number(config.referral_discount_value),
                referral_min_amount: Number(config.referral_min_amount),
                referrer_discount_value: Number(config.referrer_discount_value),
                max_discount_percentage: config.max_discount_percentage ? Number(config.max_discount_percentage) : null,
            });
        }
    }, [config, reset]);

    const onSubmit = (data: RewardConfigFormData) => {
        const payload = {
            ...data,
            first_order_discount_value: data.first_order_discount_value.toString(),
            first_order_min_amount: data.first_order_min_amount.toString(),
            referral_discount_value: data.referral_discount_value.toString(),
            referral_min_amount: data.referral_min_amount.toString(),
            referrer_discount_value: data.referrer_discount_value.toString(),
            max_discount_percentage: data.max_discount_percentage?.toString() || null,
        };
        dispatch(updateRewardConfigRequest(payload));
        toast.success("Reward configuration updated successfully!");
    };

    const handleResetToDefaults = () => {
        if (window.confirm("Are you sure you want to reset all reward settings to factory defaults?")) {
            dispatch(resetRewardDefaultsRequest());
            toast.success("Reward configuration reset to defaults!");
        }
    };

    if (loading && !config) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-50 bg-stone-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-100 text-cyan-600 rounded-xl shrink-0">
                            <Gift size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-stone-900 leading-tight">Reward Configuration</h2>
                            <p className="text-xs font-bold text-stone-500">System-wide settings for automated rewards</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleResetToDefaults}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-50 transition-all"
                        >
                            <RotateCcw size={14} /> Reset
                        </button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={!isDirty || loading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                        </button>
                    </div>
                </div>

                <form className="p-4 sm:p-8 space-y-8 sm:space-y-10">
                    {/* First Order Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-stone-900">
                                <Gift size={18} className="text-emerald-500" />
                                <h3 className="font-black text-sm uppercase tracking-wider">First Order Rewards</h3>
                            </div>
                            <Controller
                                name="is_first_order_active"
                                control={control}
                                render={({ field }) => (
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={field.value}
                                            onChange={field.onChange}
                                        />
                                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        <span className="ms-3 text-xs font-black text-stone-900 uppercase">
                                            {field.value ? "Active" : "Inactive"}
                                        </span>
                                    </label>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Discount Type</label>
                                <Controller
                                    name="first_order_discount_type"
                                    control={control}
                                    render={({ field }) => (
                                        <select {...field} className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold outline-none focus:border-cyan-500 transition-colors">
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (AED)</option>
                                        </select>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Discount Value</label>
                                <Controller
                                    name="first_order_discount_value"
                                    control={control}
                                    render={({ field }) => (
                                        <input {...field} type="number" step="0.01" className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold outline-none focus:border-cyan-500 transition-colors" />
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Min. Order Amount (AED)</label>
                                <Controller
                                    name="first_order_min_amount"
                                    control={control}
                                    render={({ field }) => (
                                        <input {...field} type="number" step="0.01" className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold outline-none focus:border-cyan-500 transition-colors" />
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Validity (Days)</label>
                                <Controller
                                    name="first_order_validity_days"
                                    control={control}
                                    render={({ field }) => (
                                        <input {...field} type="number" className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold outline-none focus:border-cyan-500 transition-colors" />
                                    )}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-stone-100 w-full" />

                    {/* Referral Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-stone-900">
                                <UserPlus size={18} className="text-blue-500" />
                                <h3 className="font-black text-sm uppercase tracking-wider">Referral System</h3>
                            </div>
                            <Controller
                                name="is_referral_active"
                                control={control}
                                render={({ field }) => (
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={field.value}
                                            onChange={field.onChange}
                                        />
                                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                        <span className="ms-3 text-xs font-black text-stone-900 uppercase">
                                            {field.value ? "Active" : "Inactive"}
                                        </span>
                                    </label>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Referee Settings */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] border-b border-stone-100 pb-2">Referee Settings (New User)</h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Discount Type</label>
                                        <Controller
                                            name="referral_discount_type"
                                            control={control}
                                            render={({ field }) => (
                                                <select {...field} className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-colors">
                                                    <option value="percentage">Percentage (%)</option>
                                                    <option value="fixed">Fixed Amount (AED)</option>
                                                </select>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Discount Value</label>
                                        <Controller
                                            name="referral_discount_value"
                                            control={control}
                                            render={({ field }) => (
                                                <input {...field} type="number" step="0.01" className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Min. Order Amount (AED)</label>
                                        <Controller
                                            name="referral_min_amount"
                                            control={control}
                                            render={({ field }) => (
                                                <input {...field} type="number" step="0.01" className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Validity (Days)</label>
                                        <Controller
                                            name="referral_validity_days"
                                            control={control}
                                            render={({ field }) => (
                                                <input {...field} type="number" className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Referrer Settings */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] border-b border-stone-100 pb-2">Referrer Settings (Existing User)</h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Reward Value (Fixed AED)</label>
                                        <Controller
                                            name="referrer_discount_value"
                                            control={control}
                                            render={({ field }) => (
                                                <input {...field} type="number" step="0.01" className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Reward Validity (Days)</label>
                                        <Controller
                                            name="referrer_validity_days"
                                            control={control}
                                            render={({ field }) => (
                                                <input {...field} type="number" className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Max Uses Per Referral</label>
                                        <Controller
                                            name="referral_usage_limit"
                                            control={control}
                                            render={({ field }) => (
                                                <input {...field} type="number" className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-stone-100 w-full" />

                    {/* Global Limits */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-stone-900">
                            <Info size={18} className="text-amber-500" />
                            <h3 className="font-black text-sm uppercase tracking-wider">Global Safety Limits</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Max Discount Percentage (%)</label>
                                <Controller
                                    name="max_discount_percentage"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                            type="number"
                                            step="0.01"
                                            placeholder="No limit"
                                            className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold outline-none focus:border-amber-500 transition-colors"
                                        />
                                    )}
                                />
                                <p className="text-[10px] text-stone-400 font-bold">Caps the final discount percentage on any order.</p>
                            </div>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
};
