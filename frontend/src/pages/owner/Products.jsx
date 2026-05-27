import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AppLayout from "../../components/AppLayout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";
import BarcodeDisplay from "../../components/ui/BarcodeDisplay";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../lib/productApi";
import { getCategories as fetchCats } from "../../lib/productApi";
import { generateEAN13, isValidEAN13 } from "../../utils/generateBarcode";
import { toast } from "sonner";

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
const IconStock = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

// ─── ProductForm — komponen di LUAR agar tidak di-remount setiap render ───────
function ProductForm({ form, setForm, categories, branches, formError, isEdit }) {
  const inputClass = "w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";
  const UNITS = ["pcs", "kg", "gram", "liter", "ml", "box", "lusin", "karton"];

  const barcodeValid = isValidEAN13(form.barcode);

  const addInitialStock = () => {
    setForm(p => ({ ...p, initial_stocks: [...(p.initial_stocks || []), { branch_id: "", stock: 0, minimum_stock: 0 }] }));
  };
  const removeInitialStock = (idx) => {
    setForm(p => ({ ...p, initial_stocks: p.initial_stocks.filter((_, i) => i !== idx) }));
  };
  const updateInitialStock = (idx, field, value) => {
    setForm(p => ({
      ...p,
      initial_stocks: p.initial_stocks.map((s, i) => i === idx ? { ...s, [field]: value } : s),
    }));
  };

  return (
    <div className="space-y-4">
      {formError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nama Produk</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Nama produk" className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Kategori</label>
          <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} className={inputClass}>
            <option value="">Tanpa kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Satuan</label>
          <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className={inputClass}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>SKU</label>
          <input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value.toUpperCase() }))}
            placeholder="SKU-001" className={inputClass} required />
        </div>

        {/* Barcode dengan tombol generate */}
        <div>
          <label className={labelClass}>Barcode EAN-13</label>
          <div className="flex gap-2">
            <input value={form.barcode} onChange={e => setForm(p => ({ ...p, barcode: e.target.value }))}
              placeholder="Generate otomatis atau isi manual"
              className={`flex-1 h-9 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 transition ${
                form.barcode
                  ? barcodeValid
                    ? "border-emerald-300 focus:ring-emerald-500/30 focus:border-emerald-400"
                    : "border-red-300 focus:ring-red-500/30 focus:border-red-400"
                  : "border-slate-200 focus:ring-indigo-500/30 focus:border-indigo-400"
              }`} />
            <button type="button"
              onClick={() => setForm(p => ({ ...p, barcode: generateEAN13() }))}
              title="Generate barcode EAN-13 otomatis"
              className="h-9 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition cursor-pointer whitespace-nowrap">
              Generate
            </button>
          </div>
          {form.barcode && !barcodeValid && (
            <p className="mt-1 text-xs text-red-500">Format EAN-13 tidak valid (harus 13 digit)</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Harga Modal (Rp)</label>
          <input type="number" min="0" value={form.cost_price}
            onChange={e => setForm(p => ({ ...p, cost_price: e.target.value }))}
            placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Harga Jual (Rp)</label>
          <input type="number" min="0" value={form.selling_price}
            onChange={e => setForm(p => ({ ...p, selling_price: e.target.value }))}
            placeholder="0" className={inputClass} required />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Deskripsi (opsional)</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={2} placeholder="Deskripsi produk..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition resize-none" />
        </div>
      </div>

      {/* Preview barcode jika valid */}
      {barcodeValid && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col items-center gap-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Preview Barcode</p>
          <BarcodeDisplay value={form.barcode} height={55} />
        </div>
      )}

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" checked={form.is_active}
          onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
        <span className="text-sm text-slate-700">Produk aktif</span>
      </label>

      {/* Stok awal per cabang — hanya saat create */}
      {!isEdit && branches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>Stok Awal per Cabang (opsional)</label>
            <button type="button" onClick={addInitialStock}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
              + Tambah Cabang
            </button>
          </div>
          {(form.initial_stocks || []).map((s, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <select value={s.branch_id} onChange={e => updateInitialStock(idx, "branch_id", e.target.value)}
                className="flex-1 h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition">
                <option value="">Pilih cabang...</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input type="number" min="0" value={s.stock} onChange={e => updateInitialStock(idx, "stock", Number(e.target.value))}
                placeholder="Stok" className="w-20 h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
              <input type="number" min="0" value={s.minimum_stock} onChange={e => updateInitialStock(idx, "minimum_stock", Number(e.target.value))}
                placeholder="Min" className="w-20 h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
              <button type="button" onClick={() => removeInitialStock(idx)}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {(form.initial_stocks || []).length > 0 && (
            <p className="text-xs text-slate-400 mt-1">Stok = jumlah awal · Min = batas minimum stok</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", category_id: "", sku: "", barcode: "", description: "", unit: "pcs", cost_price: "", selling_price: "", image: "", is_active: true, initial_stocks: [] };

const formatRupiah = (val) => {
  if (!val && val !== 0) return "—";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches]     = useState([]);
  const [meta, setMeta]             = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage]             = useState(1);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formError, setFormError]     = useState("");
  const [saving, setSaving]           = useState(false);

  const [confirm, setConfirm]       = useState({ open: false, id: null, name: "" });
  const [confirming, setConfirming] = useState(false);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    getProducts({ search, category_id: categoryFilter, page, limit: 15 })
      .then(r => { setProducts(r.data?.data?.data || []); setMeta(r.data?.data || {}); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, categoryFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [search, categoryFilter]);
  useEffect(() => {
    fetchCats().then(r => setCategories(r.data?.data || [])).catch(console.error);
    import("../../lib/api").then(({ default: api }) =>
      api.get("/branches").then(r => setBranches(r.data?.data || [])).catch(console.error)
    );
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError("");
    try {
      await createProduct({ ...form, cost_price: Number(form.cost_price), selling_price: Number(form.selling_price) });
      setCreateModal(false); setForm(EMPTY_FORM);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || "Gagal membuat produk");
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError("");
    try {
      await updateProduct(editTarget.id, { ...form, cost_price: Number(form.cost_price), selling_price: Number(form.selling_price) });
      setEditModal(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || "Gagal memperbarui produk");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setConfirming(true);
    try {
      await deleteProduct(confirm.id);
      setConfirm({ open: false, id: null, name: "" });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus produk");
    } finally { setConfirming(false); }
  };

  const openEdit = (p) => {
    setEditTarget(p);
    setForm({
      name: p.name, category_id: p.category_id || "", sku: p.sku, barcode: p.barcode || "",
      description: p.description || "", unit: p.unit, cost_price: p.cost_price,
      selling_price: p.selling_price, image: p.image || "", is_active: p.is_active,
    });
    setFormError(""); setEditModal(true);
  };

  return (
    <AppLayout title="Produk" subtitle="Kelola produk dan stok toko Anda">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama / SKU..."
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-slate-200 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition">
          <option value="">Semua Kategori</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={() => { setForm(EMPTY_FORM); setFormError(""); setCreateModal(true); }}
          className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Produk
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Produk", "SKU", "Barcode", "Kategori", "Harga Jual", "Margin", "Status", "Aksi"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    {Array(8).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><Skeleton height={14} /></td>)}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-sm">Belum ada produk</span>
                    </div>
                  </td>
                </tr>
              ) : products.map(p => {
                const margin = p.selling_price > 0
                  ? Math.round(((p.selling_price - p.cost_price) / p.selling_price) * 100)
                  : 0;
                return (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.unit}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{p.sku}</span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      {p.barcode
                        ? <div className="flex items-center"><BarcodeDisplay value={p.barcode} height={28} showText={false} /></div>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{p.category?.name || <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-4 font-medium text-slate-800">{formatRupiah(p.selling_price)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold ${margin >= 20 ? "text-emerald-600" : margin >= 10 ? "text-amber-600" : "text-red-500"}`}>
                        {margin}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={p.is_active ? "success" : "danger"}>
                        {p.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/owner/products/${p.id}/stock`)} title="Kelola stok"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer">
                          <IconStock />
                        </button>
                        <button onClick={() => openEdit(p)} title="Edit produk"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer">
                          <IconEdit />
                        </button>
                        <button onClick={() => setConfirm({ open: true, id: p.id, name: p.name })} title="Hapus produk"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer">
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">{meta.total} produk</span>
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
      </div>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Tambah Produk" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <ProductForm form={form} setForm={setForm} categories={categories} branches={branches} formError={formError} isEdit={false} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCreateModal(false)} disabled={saving}
              className="h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">Batal</button>
            <button type="submit" disabled={saving}
              className="h-9 px-4 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer disabled:opacity-50">
              {saving ? "Menyimpan..." : "Tambah Produk"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title={`Edit — ${editTarget?.name}`} size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <ProductForm form={form} setForm={setForm} categories={categories} branches={branches} formError={formError} isEdit={true} />
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
        title="Hapus Produk"
        message={`Hapus produk "${confirm.name}"? Data akan dihapus secara soft delete.`}
        confirmLabel="Hapus"
        variant="danger"
      />
    </AppLayout>
  );
}
