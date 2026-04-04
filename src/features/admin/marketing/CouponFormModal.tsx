import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";
import { useToast } from "../../../components/ui/Toast";
import {
    createCouponRequest,
    updateCouponRequest,
    selectCouponsLoading,
} from "./couponsSlice";
import type { Coupon } from "./couponsSlice";
import { api } from "../../../services/api";
import { formatForInput } from "../../../utils/date";

interface CouponFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    coupon: Coupon | null;
}

const couponSchema = z.object({
    code: z.string().min(1, "Coupon code is required"),
    description: z.string().default(""),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z.coerce.number().min(0, "Discount value is required"),
    min_order_amount: z.coerce.number().min(0).default(0),
    max_discount_amount: z.coerce.number().min(0).nullable().default(null),
    valid_from: z.string().min(1, "Valid from date is required"),
    valid_to: z.string().nullable().default(null),
    is_active: z.boolean().default(true),
    usage_limit: z.coerce.number().min(1).nullable().default(null),
    assigned_user: z.number().nullable().default(null),
    is_referral_reward: z.boolean().default(false),
    is_first_order_reward: z.boolean().default(false),
});

export type CouponFormData = z.infer<typeof couponSchema>;

export const CouponFormModal: React.FC<CouponFormModalProps> = ({ isOpen, onClose, coupon }) => {
    const dispatch = useDispatch();
    const toast = useToast();
    const loading = useSelector(selectCouponsLoading);
    const [users, setUsers] = useState<{ id: number; email: string }[]>([]);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const userSearchRef = useRef<HTMLInputElement>(null);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CouponFormData>({
        resolver: zodResolver(couponSchema) as any,
        defaultValues: coupon ? {
            code: coupon.code,
            description: coupon.description || "",
            discount_type: coupon.discount_type,
            discount_value: Number(coupon.discount_value),
            min_order_amount: Number(coupon.min_order_amount),
            max_discount_amount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
            valid_from: coupon.valid_from ? formatForInput(new Date(coupon.valid_from)) : formatForInput(new Date()),
            valid_to: coupon.valid_to ? formatForInput(new Date(coupon.valid_to)) : null,
            is_active: coupon.is_active,
            usage_limit: coupon.usage_limit,
            assigned_user: coupon.assigned_user,
            is_referral_reward: coupon.is_referral_reward,
            is_first_order_reward: coupon.is_first_order_reward,
        } : {
            code: "",
            description: "",
            discount_type: "percentage",
            discount_value: 0,
            min_order_amount: 0,
            max_discount_amount: null,
            valid_from: formatForInput(new Date()),
            valid_to: null,
            is_active: true,
            usage_limit: null,
            assigned_user: null,
            is_referral_reward: false,
            is_first_order_reward: false,
        },
    });

    const assignedUser = watch("assigned_user");
    const discountType = watch("discount_type");

    useEffect(() => {
        if (isOpen) {
            if (coupon) {
                setUserSearchTerm(coupon.assigned_user_email || "");
            } else {
                setUserSearchTerm("");
            }
        }
    }, [isOpen, coupon]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (userSearchTerm.length > 2) {
                try {
                    const res = await api.get(`/users/?q=${userSearchTerm}`);
                    setUsers(res.data.results.map((u: any) => ({ id: u.id, email: u.email })));
                    setShowUserDropdown(true);
                } catch (err) {
                    console.error("Failed to fetch users", err);
                }
            } else {
                setUsers([]);
                setShowUserDropdown(false);
            }
        };
        const handler = setTimeout(fetchUsers, 300);
        return () => clearTimeout(handler);
    }, [userSearchTerm]);

    const onSubmit = (data: CouponFormData) => {
        const payload = {
            ...data,
            discount_value: data.discount_value.toString(),
            min_order_amount: data.min_order_amount?.toString(),
            max_discount_amount: data.max_discount_amount?.toString() || null,
            valid_from: new Date(data.valid_from).toISOString(),
            valid_to: data.valid_to ? new Date(data.valid_to).toISOString() : null,
            usage_limit: data.usage_limit || null,
            assigned_user: data.assigned_user || null,
        };

        if (coupon) {
            dispatch(updateCouponRequest({ id: coupon.id, payload }));
            toast.success("Coupon updated successfully!");
        } else {
            dispatch(createCouponRequest(payload));
            toast.success("Coupon created successfully!");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {coupon ? "Edit Coupon" : "Add New Coupon"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Code */}
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                            Coupon Code
                        </label>
                        <Controller
                            name="code"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    id="code"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            )}
                        />
                        {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <textarea
                                    {...field}
                                    id="description"
                                    rows={3}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                ></textarea>
                            )}
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                    </div>

                    {/* Discount Type and Value */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700">
                                Discount Type
                            </label>
                            <Controller
                                name="discount_type"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        id="discount_type"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                )}
                            />
                            {errors.discount_type && <p className="mt-1 text-sm text-red-600">{errors.discount_type.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700">
                                Discount Value ({discountType === "percentage" ? "%" : "AED"})
                            </label>
                            <Controller
                                name="discount_value"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        id="discount_value"
                                        step="0.01"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                )}
                            />
                            {errors.discount_value && <p className="mt-1 text-sm text-red-600">{errors.discount_value.message}</p>}
                        </div>
                    </div>

                    {/* Min Order Amount and Max Discount Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="min_order_amount" className="block text-sm font-medium text-gray-700">
                                Minimum Order Amount (AED)
                            </label>
                            <Controller
                                name="min_order_amount"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        id="min_order_amount"
                                        step="0.01"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                )}
                            />
                            {errors.min_order_amount && <p className="mt-1 text-sm text-red-600">{errors.min_order_amount.message}</p>}
                        </div>
                        {discountType === "percentage" && (
                            <div>
                                <label htmlFor="max_discount_amount" className="block text-sm font-medium text-gray-700">
                                    Maximum Discount Amount (AED)
                                </label>
                                <Controller
                                    name="max_discount_amount"
                                    control={control}
                                    render={({ field }) => (
                                    <input
                                        {...field}
                                        value={field.value ?? ""}
                                        type="number"
                                        id="max_discount_amount"
                                        step="0.01"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                )}
                                />
                                {errors.max_discount_amount && <p className="mt-1 text-sm text-red-600">{errors.max_discount_amount.message}</p>}
                            </div>
                        )}
                    </div>

                    {/* Validity Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="valid_from" className="block text-sm font-medium text-gray-700">
                                Valid From
                            </label>
                            <Controller
                                name="valid_from"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="datetime-local"
                                        id="valid_from"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                )}
                            />
                            {errors.valid_from && <p className="mt-1 text-sm text-red-600">{errors.valid_from.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="valid_to" className="block text-sm font-medium text-gray-700">
                                Valid To
                            </label>
                            <Controller
                                name="valid_to"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        value={field.value ?? ""}
                                        type="datetime-local"
                                        id="valid_to"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                )}
                            />
                            {errors.valid_to && <p className="mt-1 text-sm text-red-600">{errors.valid_to.message}</p>}
                        </div>
                    </div>

                    {/* Usage Limit */}
                    <div>
                        <label htmlFor="usage_limit" className="block text-sm font-medium text-gray-700">
                            Usage Limit (Total uses)
                        </label>
                        <Controller
                            name="usage_limit"
                            control={control}
                            render={({ field }) => (
                                    <input
                                        {...field}
                                        value={field.value ?? ""}
                                        type="number"
                                        id="usage_limit"
                                        min="1"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                )}
                        />
                        {errors.usage_limit && <p className="mt-1 text-sm text-red-600">{errors.usage_limit.message}</p>}
                    </div>

                    {/* Assigned User */}
                    <div>
                        <label htmlFor="assigned_user" className="block text-sm font-medium text-gray-700">
                            Assigned User (Optional)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                ref={userSearchRef}
                                value={userSearchTerm}
                                onChange={(e) => {
                                    setUserSearchTerm(e.target.value);
                                    setValue("assigned_user", null); // Clear assigned user ID on search
                                }}
                                onFocus={() => setShowUserDropdown(true)}
                                onBlur={() => setTimeout(() => setShowUserDropdown(false), 100)}
                                placeholder="Search by email..."
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {showUserDropdown && users.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                    {users.map((user) => (
                                        <li
                                            key={user.id}
                                            onMouseDown={() => { // Use onMouseDown to prevent blur before click
                                                setValue("assigned_user", user.id);
                                                setUserSearchTerm(user.email);
                                                setShowUserDropdown(false);
                                            }}
                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {user.email}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {assignedUser && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Currently assigned to: {userSearchTerm} (ID: {assignedUser})
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setValue("assigned_user", null);
                                            setUserSearchTerm("");
                                        }}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        (Clear)
                                    </button>
                                </p>
                            )}
                        </div>
                        {errors.assigned_user && <p className="mt-1 text-sm text-red-600">{errors.assigned_user.message}</p>}
                    </div>

                    {/* Checkboxes for special types */}
                    <div className="flex items-center space-x-4">
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field: { value, onChange, ...rest } }) => (
                                <label className="flex items-center">
                                    <input
                                        {...rest}
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => onChange(e.target.checked)}
                                        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                    />
                                    <span className="ml-2 text-sm text-gray-900">Is Active</span>
                                </label>
                            )}
                        />
                        <Controller
                            name="is_referral_reward"
                            control={control}
                            render={({ field: { value, onChange, ...rest } }) => (
                                <label className="flex items-center">
                                    <input
                                        {...rest}
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => onChange(e.target.checked)}
                                        disabled={!!assignedUser} // Disable if assigned_user is set
                                        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                    />
                                    <span className="ml-2 text-sm text-gray-900">Is Referral Reward</span>
                                </label>
                            )}
                        />
                        <Controller
                            name="is_first_order_reward"
                            control={control}
                            render={({ field: { value, onChange, ...rest } }) => (
                                <label className="flex items-center">
                                    <input
                                        {...rest}
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => onChange(e.target.checked)}
                                        disabled={!!assignedUser} // Disable if assigned_user is set
                                        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                    />
                                    <span className="ml-2 text-sm text-gray-900">Is First Order Reward</span>
                                </label>
                            )}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                            {coupon ? "Update Coupon" : "Create Coupon"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};