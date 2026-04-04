import React from "react";
import { productsApi, type CategoryDto } from "./productApi";
import { useToast } from "../../../components/ui/Toast";
import { Search, Plus, Pencil, Trash2, Loader2, ImagePlus, X } from "lucide-react";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

type FormState = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  parent: null,
};

const CategoriesPage: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<CategoryDto[]>([]);
  const [q, setQ] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const cats = await productsApi.listCategories();
      setItems(cats);
    } catch (e: any) {
      toast.show(e?.response?.data?.detail || "Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        (c.description || "").toLowerCase().includes(term)
    );
  }, [items, q]);

  const startCreate = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const startEdit = (c: CategoryDto) => {
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      parent: c.parent ?? null,
    });
    setImageFile(null);
    setImagePreview(c.image || null);
    setShowForm(true);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "parent"
          ? value === "" ? null : Number(value)
          : value,
    }));
  };

  const onNameBlur = () => {
    if (!form.slug) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.show("Name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("slug", form.slug.trim() || slugify(form.name));
      fd.append("description", form.description.trim());
      if (form.parent !== null) fd.append("parent", String(form.parent));
      if (imageFile) fd.append("image", imageFile);

      if (form.id) {
        const updated = await productsApi.updateCategory(form.id, fd);
        setItems((prev) => prev.map((c) => (c.id === form.id ? updated : c)));
        toast.show("Category updated", "success");
      } else {
        const created = await productsApi.createCategory(fd);
        setItems((prev) => [created, ...prev]);
        toast.show("Category created", "success");
      }
      setShowForm(false);
    } catch (e: any) {
      toast.show(e?.response?.data?.detail || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    setDeletingId(id);
    try {
      await productsApi.deleteCategory(id);
      setItems((prev) => prev.filter((c) => c.id !== id));
      toast.show("Category deleted", "success");
    } catch (e: any) {
      toast.show(e?.response?.data?.detail || "Delete failed", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">Categories</h1>
          <p className="text-[#71717A] text-sm mt-1">Create and manage product categories.</p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-bold"
        >
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#EEEEEE] p-4 flex items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 pr-3 py-2 bg-[#F9F9F9] border border-transparent rounded-md text-sm outline-none focus:bg-white focus:border-[#EEEEEE]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FAFAFA]">
              <tr className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest border-b border-[#EEEEEE]">
                <th className="px-5 py-3">Image</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Parent</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEEEE]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-10 w-10 bg-gray-100 rounded-lg" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-6 w-16 bg-gray-100 rounded-full" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-56 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-8 w-8 bg-gray-100 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#71717A]">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const parentName = c.parent ? items.find((p) => p.id === c.parent)?.name || `#${c.parent}` : "—";
                  return (
                    <tr key={c.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="px-5 py-4">
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="w-10 h-10 rounded-lg object-cover border border-[#EEEEEE]" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#F4F4F5] flex items-center justify-center">
                            <ImagePlus size={16} className="text-[#A1A1AA]" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-sm">{c.name}</div>
                        <div className="text-[11px] text-[#A1A1AA]">ID: {c.id}</div>
                      </td>
                      <td className="px-5 py-4 text-sm">{c.slug}</td>
                      <td className="px-5 py-4 text-sm">{parentName}</td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-[#52525B] truncate max-w-[200px] sm:max-w-[350px] lg:max-w-[500px]">
                          {c.description || <span className="italic text-[#A1A1AA]">—</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Edit"
                            onClick={() => startEdit(c)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => remove(c.id)}
                            disabled={deletingId === c.id}
                            className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 disabled:opacity-50"
                          >
                            {deletingId === c.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Form */}
      {showForm && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3 mb-5">
              <div>
                <h3 className="text-lg font-black">{form.id ? "Edit Category" : "New Category"}</h3>
                <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">
                  {form.id ? `#${form.id}` : "Create"}
                </span>
              </div>
              <button onClick={() => setShowForm(false)} className="text-[#A1A1AA] hover:text-black">Close</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-2 block">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  onBlur={onNameBlur}
                  className="w-full p-3 bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl outline-none focus:bg-white focus:border-[#D4D4D8] text-sm"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-2 block">Slug</label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={onChange}
                  className="w-full p-3 bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl outline-none focus:bg-white focus:border-[#D4D4D8] text-sm"
                  placeholder="slug (auto from name if left blank)"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-2 block">Parent</label>
                <select
                  name="parent"
                  value={form.parent ?? ""}
                  onChange={onChange}
                  className="w-full p-3 bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl outline-none focus:bg-white focus:border-[#D4D4D8] text-sm"
                >
                  <option value="">None</option>
                  {items
                    .filter((c) => c.id !== form.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-2 block">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={4}
                  className="w-full p-3 bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl outline-none focus:bg-white focus:border-[#D4D4D8] text-sm"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-2 block">Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-xl object-cover border border-[#EEEEEE]" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="absolute -top-2 -right-2 p-1 bg-white border border-[#EEEEEE] rounded-full shadow-sm hover:bg-rose-50 text-rose-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-xl border-2 border-dashed border-[#D4D4D8] bg-[#FAFAFA] flex flex-col items-center justify-center gap-2 hover:border-[#A1A1AA] transition-colors"
                  >
                    <ImagePlus size={24} className="text-[#A1A1AA]" />
                    <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Upload</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-bold rounded-lg border border-[#E5E5E5]">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-black text-white disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin inline-block mr-2" /> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
