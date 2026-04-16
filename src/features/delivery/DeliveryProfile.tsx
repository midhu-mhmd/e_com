import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Phone,
  Mail,
  Truck,
  Star,
  MapPin,
  Clock,
  Wallet,
  Calendar,
  BadgeCheck,
  Edit2,
  Save,
  X,
  Camera
} from "lucide-react";
import { logout, setUser } from "../auth/authSlice";
import { profileApi } from "../user/profileApi";
import { useToast } from "../../components/ui/Toast";

type EditableField = "first_name" | "last_name" | "dob";

const extractApiError = (error: any, fallback: string) => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    return data.non_field_errors[0];
  }

  const firstKey = Object.keys(data)[0];
  if (!firstKey) return fallback;

  const firstValue = data[firstKey];
  if (Array.isArray(firstValue)) return firstValue[0] || fallback;
  if (typeof firstValue === "string") return firstValue;

  return fallback;
};

const DeliveryProfile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state: any) => state.auth);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        date_of_birth: user.profile?.date_of_birth || ""
      });
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const handleSaveField = async (field: EditableField) => {
    if (!user?.id) return;

    if (field === "first_name" && !formData.first_name.trim()) {
      toast.error("First name is required.");
      return;
    }

    try {
      setIsSaving(true);
      const payload =
        field === "dob"
          ? { profile: { date_of_birth: formData.date_of_birth } }
          : { [field]: formData[field].trim() };

      const updatedUser = await profileApi.updateProfile(user.id, payload);
      dispatch(setUser(updatedUser));
      toast.success(
        field === "dob"
          ? "Date of birth updated successfully!"
          : `${field === "first_name" ? "First name" : "Last name"} updated successfully!`
      );
      setEditingField(null);
    } catch (error: any) {
      toast.error(
        extractApiError(
          error,
          field === "dob"
            ? "Failed to update date of birth."
            : `Failed to update ${field === "first_name" ? "first name" : "last name"}.`
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      setIsUploadingImage(true);
      const payload = new FormData();
      payload.append("profile.profile_picture", file);
      await profileApi.updateProfile(user.id, payload);
      const freshUser = await profileApi.getMe();
      dispatch(setUser(freshUser));
      toast.success("Profile picture updated successfully!");
    } catch (error: any) {
      toast.error(extractApiError(error, "Failed to update profile picture."));
    } finally {
      if (profileInputRef.current) {
        profileInputRef.current.value = "";
      }
      setIsUploadingImage(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      date_of_birth: user?.profile?.date_of_birth || ""
    });
    setEditingField(null);
  };

  // Industry-level stats
  const stats = [
    { label: "Rating", value: "4.9", icon: <Star size={18} />, color: "bg-amber-50 text-amber-600" },
    { label: "Orders", value: "154", icon: <Truck size={18} />, color: "bg-cyan-50 text-cyan-600" },
    { label: "Earnings", value: "₹4.2k", icon: <Wallet size={18} />, color: "bg-emerald-50 text-emerald-600" },
  ];

  const fullName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "Delivery Partner";
  const emirates = user?.delivery_profile?.assigned_emirates?.map((e: string) =>
    e.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  ).join(', ') || "Not Assigned";

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-10 animate-in fade-in duration-500">
      {/* ─── Profile Header ─── */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-cyan-600"></div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user?.delivery_profile?.is_available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${user?.delivery_profile?.is_available ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            {user?.delivery_profile?.is_available ? "Online" : "Offline"}
          </span>
        </div>

        <div className="relative mt-2">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ring-1 ring-black/5">
            {user?.profile?.profile_picture ? (
              <img src={user.profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <User size={44} className="opacity-40" />
              </div>
            )}
          </div>
          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => profileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="absolute -bottom-1 -left-1 inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700 shadow-md transition hover:bg-cyan-50 disabled:opacity-60"
          >
            <Camera size={12} />
            {isUploadingImage ? "Uploading" : "Photo"}
          </button>
          {user?.is_active && (
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
              <BadgeCheck size={20} className="text-cyan-600 fill-cyan-50" />
            </div>
          )}
        </div>

        <h2 className="mt-4 text-2xl font-black text-gray-800 tracking-tight">{fullName || "Partner Name"}</h2>

        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-[10px] font-bold rounded-md uppercase tracking-wider border border-cyan-100">
            {user?.role?.replace('_', ' ') || "Partner"}
          </span>
          <span className="text-gray-300">•</span>
          <p className="text-sm text-gray-500 font-medium">
            Partner ID: <span className="text-gray-900 font-bold">#S-{user?.id || "0000"}</span>
          </p>
        </div>
      </div>

      {/* ─── Performance Stats ─── */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} p-4 rounded-2xl flex flex-col items-center gap-1 shadow-sm border border-black/5 active:scale-[0.97] transition-transform cursor-pointer`}>
            <span className="p-1.5 bg-white/50 rounded-lg">{stat.icon}</span>
            <span className="font-bold text-lg leading-none mt-1">{stat.value}</span>
            <span className="text-[10px] font-bold uppercase opacity-60 tracking-tighter">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ─── Information Sections ─── */}
      <div className="space-y-3">
        {/* Contact Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account & Contact</h3>
          </div>
          <div className="divide-y divide-gray-50">
            <InfoRow icon={<Mail size={18} />} label="Email Address" value={user?.email || "Not Provided"} />
            <InfoRow icon={<Phone size={18} />} label="Phone Number" value={user?.phone_number || "Not Provided"} />
            <InfoRow icon={<MapPin size={18} />} label="Assigned Emirates" value={emirates} />
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personal & Preferences</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {editingField === 'first_name' ? (
              <EditRow
                icon={<User size={18} />}
                label="First Name"
                value={formData.first_name}
                onChange={(val) => setFormData({ ...formData, first_name: val })}
                onSave={() => handleSaveField('first_name')}
                onCancel={cancelEdit}
                isSaving={isSaving}
              />
            ) : (
              <InfoRow
                icon={<User size={18} />}
                label="First Name"
                value={user?.first_name || "Not set"}
                onEdit={() => setEditingField('first_name')}
              />
            )}
            {editingField === 'last_name' ? (
              <EditRow
                icon={<User size={18} />}
                label="Last Name"
                value={formData.last_name}
                onChange={(val) => setFormData({ ...formData, last_name: val })}
                onSave={() => handleSaveField('last_name')}
                onCancel={cancelEdit}
                isSaving={isSaving}
              />
            ) : (
              <InfoRow
                icon={<User size={18} />}
                label="Last Name"
                value={user?.last_name || "Not set"}
                onEdit={() => setEditingField('last_name')}
              />
            )}
            {editingField === 'dob' ? (
              <EditRow
                icon={<Calendar size={18} />}
                label="Date of Birth"
                value={formData.date_of_birth}
                onChange={(val) => setFormData({ ...formData, date_of_birth: val })}
                onSave={() => handleSaveField('dob')}
                onCancel={cancelEdit}
                isSaving={isSaving}
                type="date"
              />
            ) : (
              <InfoRow
                icon={<Calendar size={18} />}
                label="Date of Birth"
                value={user?.profile?.date_of_birth || "Not set"}
                onEdit={() => setEditingField('dob')}
              />
            )}
            <InfoRow icon={<Clock size={18} />} label="Joined Simak" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"} />
          </div>
        </div>
      </div>

      {/* ─── Action Buttons ─── */}
      <div className="grid grid-cols-1 gap-3 pt-2">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl font-black hover:bg-rose-100 border border-rose-100/50 transition-all active:scale-[0.98] shadow-sm shadow-rose-100/20"
        >
          <LogOut size={20} />
          Sign Out of Portal
        </button>
      </div>

      <div className="text-center pt-4">
        <p className="text-[10px] text-gray-300 uppercase font-black tracking-[0.3em]">Simak Fresh © 2026 • v2.0.4</p>
      </div>
    </div>
  );
};

// Sub-component for clean rows
const InfoRow = ({
  icon,
  label,
  value,
  onEdit
}: {
  icon: any,
  label: string,
  value: string,
  onEdit?: () => void
}) => (
  <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/40 transition-colors group">
    <div className="text-slate-400 p-2.5 bg-slate-50 rounded-xl group-hover:text-cyan-600 group-hover:bg-cyan-50/50 transition-all ring-1 ring-black/[0.03]">{icon}</div>
    <div className="flex-1 overflow-hidden">
      <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1 tracking-wider">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-bold text-gray-800 truncate">{value}</p>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="opacity-0 group-hover:opacity-100 p-1.5 bg-gray-50 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
            >
              <Edit2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Sub-component for editable rows
const EditRow = ({
  icon,
  label,
  value,
  onChange,
  onSave,
  onCancel,
  isSaving,
  type = "text"
}: {
  icon: any,
  label: string,
  value: string,
  onChange: (val: string) => void,
  onSave: () => void,
  onCancel: () => void,
  isSaving: boolean,
  type?: string
}) => (
  <div className="flex items-center gap-4 px-5 py-4 bg-cyan-50/30 transition-colors group animate-in slide-in-from-left-2 duration-200">
    <div className="text-cyan-600 p-2.5 bg-white rounded-xl shadow-sm ring-1 ring-black/[0.03]">{icon}</div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1 tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[13px] font-bold text-gray-800 border-none p-0 focus:ring-0 outline-none"
          autoFocus
        />
        <div className="flex items-center gap-1.5">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="p-1.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg shadow-sm border border-emerald-100 transition-all disabled:opacity-50"
          >
            {isSaving ? <Clock size={14} className="animate-spin" /> : <Save size={14} />}
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="p-1.5 bg-white text-rose-500 hover:bg-rose-50 rounded-lg shadow-sm border border-rose-100 transition-all"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  </div>
);



export default DeliveryProfile;
