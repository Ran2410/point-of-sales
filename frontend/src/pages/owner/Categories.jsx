import { useEffect, useState, useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AppLayout from "../../components/AppLayout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../lib/productApi";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);
const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// ─── CategoryForm — di LUAR komponen utama ────────────────────────────────────
function CategoryForm({ form, setForm, formError }) {
  const inputClass = "w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-4">
      {formError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
      <div>
        <label className={labelClass}>Nama Kategori</label>
        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="Minuman, Makanan, dll" className={inputClass} required />
      </div>
      <div>
        <label className={labelClass}>Deskripsi (opsional)</label>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="Deskripsi singkat kategori..." rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition resize-none" />
      </div>
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" checked={form.is_active}
          onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
        <span className="text-sm text-slate-700">Kategori aktif</span>
      </label>
    </div>
  );
}

const EMPTY_FORM = { name: "", description: "", is_active: true };

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formError, setFormError]     = useState("");
  const [saving, setSaving]           = useState(false);

  const [confirm, setConfirm]       = useState({ open: false, id: null, name: "" });
  const [confirming, setConfirming] = useState(false);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    getCategories({ search })
      .then(r => setCategories(r.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError("");
    try {
      await createCategory(form);
      setCreateModal(false); setForm(EMPTY_FORM);
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || "Gagal membuat kategori");
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError("");
    try {
      await updateCategory(editTarget.id, form);
      setEditModal(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || "Gagal memperbarui kategori");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setConfirming(true);
    try {
      await deleteCategory(confirm.id);
      setConfirm({ open: false, id: null, name: "" });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus kategori");
    } finally { setConfirming(false); }
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({ name: cat.name, description: cat.description || "", is_active: cat.is_active });
    setFormError("");
    setEditModal(true);
  };

  return (
    <AppLayout title="Kategori Produk" subtitle="Kelola kategori untuk produk toko Anda">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kategori..."
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-slate-200 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setFormError(""); setCreateModal(true); }}
          className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Kategori
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Nama", "Slug", "Deskripsi", "Status", "Aksi"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    {Array(5).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><Skeleton height={14} /></td>)}
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-sm">Belum ada kategori</span>
                    </div>
                  </td>
                </tr>
              ) : categories.map(cat => (
                <tr key={cat.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-800">{cat.name}</td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{cat.slug}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 max-w-[200px] truncate">{cat.description || <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-4">
                    <Badge variant={cat.is_active ? "success" : "danger"}>
                      {cat.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(cat)} title="Edit kategori"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer">
                        <IconEdit />
                      </button>
                      <button onClick={() => setConfirm({ open: true, id: cat.id, name: cat.name })} title="Hapus kategori"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer">
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{categories.length} kategori</p>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Tambah Kategori">
        <form onSubmit={handleCreate} className="space-y-4">
          <CategoryForm form={form} setForm={setForm} formError={formError} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCreateModal(false)} disabled={saving}
              className="h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">Batal</button>
            <button type="submit" disabled={saving}
              className="h-9 px-4 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer disabled:opacity-50">
              {saving ? "Menyimpan..." : "Tambah"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title={`Edit — ${editTarget?.name}`}>
        <form onSubmit={handleEdit} className="space-y-4">
          <CategoryForm form={form} setForm={setForm} formError={formError} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditModal(false)} disabled={saving}
              className="h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">Batal</button>
            <button type="submit" disabled={saving}
              className="h-9 px-4 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ ...confirm, open: false })}
        onConfirm={handleDelete}
        loading={confirming}
        title="Hapus Kategori"
        message={`Hapus kategori "${confirm.name}"? Pastikan tidak ada produk yang menggunakan kategori ini.`}
        confirmLabel="Hapus"
        variant="danger"
      />
    </AppLayout>
  );
}
