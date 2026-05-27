import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AppLayout from "../../components/AppLayout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import BarcodeDisplay from "../../components/ui/BarcodeDisplay";
import { getProductById, adjustStock, getStockMovements } from "../../lib/productApi";
import api from "../../lib/api";

const ADJUSTMENT_TYPES = [
  { value: "purchase",       label: "Pembelian / Restock",    direction: "in"  },
  { value: "adjustment_in",  label: "Koreksi Tambah",         direction: "in"  },
  { value: "adjustment_out", label: "Koreksi Kurang",         direction: "out" },
  { value: "transfer_in",    label: "Terima dari Cabang Lain", direction: "in"  },
  { value: "transfer_out",   label: "Kirim ke Cabang Lain",   direction: "out" },
];

const TYPE_LABELS = {
  sale          : "Penjualan",
  sale_return   : "Retur",
  purchase      : "Pembelian",
  adjustment_in : "Koreksi +",
  adjustment_out: "Koreksi −",
  transfer_in   : "Terima Transfer",
  transfer_out  : "Kirim Transfer",
  initial       : "Stok Awal",
};

const TYPE_BADGE = {
  sale          : "danger",
  sale_return   : "success",
  purchase      : "success",
  adjustment_in : "success",
  adjustment_out: "danger",
  transfer_in   : "info",
  transfer_out  : "warning",
  initial       : "default",
};

const formatRupiah = (val) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val || 0);

export default function ProductStock() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct]     = useState(null);
  const [branches, setBranches]   = useState([]);
  const [movements, setMovements] = useState([]);
  const [movMeta, setMovMeta]     = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading]     = useState(true);
  const [movPage, setMovPage]     = useState(1);
  const [branchFilter, setBranchFilter] = useState("");

  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustForm, setAdjustForm]   = useState({ branch_id: "", type: "purchase", quantity: "", notes: "" });
  const [adjustError, setAdjustError] = useState("");
  const [saving, setSaving]           = useState(false);

  const inputClass = "w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

  useEffect(() => {
    Promise.all([
      getProductById(id),
      api.get("/branches"),
    ]).then(([prodRes, branchRes]) => {
      setProduct(prodRes.data?.data);
      setBranches(branchRes.data?.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getStockMovements(id, { page: movPage, limit: 15, branch_id: branchFilter })
      .then(r => { setMovements(r.data?.data?.data || []); setMovMeta(r.data?.data || {}); })
      .catch(console.error);
  }, [id, movPage, branchFilter]);

  const handleAdjust = async (e) => {
    e.preventDefault();
    setSaving(true); setAdjustError("");
    try {
      await adjustStock(id, {
        branch_id: Number(adjustForm.branch_id),
        type     : adjustForm.type,
        quantity : Number(adjustForm.quantity),
        notes    : adjustForm.notes || undefined,
      });
      setAdjustModal(false);
      setAdjustForm({ branch_id: "", type: "purchase", quantity: "", notes: "" });
      // Refresh product dan movements
      const [prodRes] = await Promise.all([
        getProductById(id),
        getStockMovements(id, { page: movPage, limit: 15, branch_id: branchFilter })
          .then(r => { setMovements(r.data?.data?.data || []); setMovMeta(r.data?.data || {}); }),
      ]);
      setProduct(prodRes.data?.data);
    } catch (err) {
      setAdjustError(err.response?.data?.message || "Gagal menyesuaikan stok");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <AppLayout title="Stok Produk" subtitle="Kelola stok per cabang">
        <div className="space-y-4">
          <Skeleton height={120} borderRadius={16} />
          <Skeleton height={300} borderRadius={16} />
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout title="Stok Produk" subtitle="">
        <p className="text-slate-500">Produk tidak ditemukan.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Stok — ${product.name}`} subtitle="Kelola stok per cabang dan lihat riwayat pergerakan">
      {/* Back button */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 cursor-pointer transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Produk
      </button>

      {/* Product info card */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-5 mb-5 flex flex-wrap gap-6">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Produk</p>
          <p className="mt-1 font-semibold text-slate-800">{product.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{product.category?.name || "Tanpa kategori"} · {product.unit}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">SKU</p>
          <p className="mt-1 font-mono text-sm text-slate-600">{product.sku}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Harga Jual</p>
          <p className="mt-1 font-semibold text-slate-800">{formatRupiah(product.selling_price)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Harga Modal</p>
          <p className="mt-1 text-slate-600">{formatRupiah(product.cost_price)}</p>
        </div>
        {product.barcode && (
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">Barcode</p>
            <BarcodeDisplay value={product.barcode} height={50} />
          </div>
        )}
      </div>

      {/* Stock per branch */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700">Stok per Cabang</h2>
        <button onClick={() => { setAdjustForm({ branch_id: "", type: "purchase", quantity: "", notes: "" }); setAdjustError(""); setAdjustModal(true); }}
          className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition cursor-pointer flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Adjustment Stok
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {product.stocks?.length === 0 ? (
          <p className="text-sm text-slate-400 col-span-3">Belum ada data stok. Lakukan adjustment untuk menambah stok awal.</p>
        ) : product.stocks?.map(s => (
          <div key={s.id} className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.branch?.name}</p>
            <p className={`mt-2 text-3xl font-bold ${s.stock <= s.minimum_stock ? "text-red-500" : "text-slate-800"}`}>
              {s.stock}
            </p>
            <p className="text-xs text-slate-400 mt-1">{product.unit} · min. {s.minimum_stock}</p>
            {s.stock <= s.minimum_stock && (
              <p className="mt-2 text-xs text-red-500 font-medium">⚠ Stok menipis</p>
            )}
          </div>
        ))}
      </div>

      {/* Movement history */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold text-slate-700">Riwayat Pergerakan Stok</h2>
        <select value={branchFilter} onChange={e => { setBranchFilter(e.target.value); setMovPage(1); }}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition">
          <option value="">Semua Cabang</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Waktu", "Cabang", "Tipe", "Qty", "Sebelum", "Sesudah", "Oleh", "Catatan"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">Belum ada riwayat pergerakan stok</td>
                </tr>
              ) : movements.map(m => (
                <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                    {new Date(m.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{m.branch?.name}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={TYPE_BADGE[m.type] || "default"}>
                      {TYPE_LABELS[m.type] || m.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">+{m.quantity}</td>
                  <td className="px-5 py-3.5 text-slate-500">{m.previous_stock}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{m.current_stock}</td>
                  <td className="px-5 py-3.5 text-slate-500">{m.creator?.name || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-400 max-w-[150px] truncate">{m.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">{movMeta.total} pergerakan</span>
        <Pagination page={movPage} totalPages={movMeta.totalPages} onPageChange={setMovPage} />
      </div>

      {/* Adjust Stock Modal */}
      <Modal open={adjustModal} onClose={() => setAdjustModal(false)} title="Adjustment Stok" size="sm">
        <form onSubmit={handleAdjust} className="space-y-4">
          {adjustError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{adjustError}</p>}
          <div>
            <label className={labelClass}>Cabang</label>
            <select value={adjustForm.branch_id} onChange={e => setAdjustForm(p => ({ ...p, branch_id: e.target.value }))}
              className={inputClass} required>
              <option value="">Pilih cabang...</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Tipe</label>
            <select value={adjustForm.type} onChange={e => setAdjustForm(p => ({ ...p, type: e.target.value }))} className={inputClass}>
              {ADJUSTMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label} ({t.direction === "in" ? "+" : "−"})</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Jumlah ({product.unit})</label>
            <input type="number" min="1" value={adjustForm.quantity}
              onChange={e => setAdjustForm(p => ({ ...p, quantity: e.target.value }))}
              placeholder="0" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Catatan (opsional)</label>
            <input value={adjustForm.notes} onChange={e => setAdjustForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Alasan penyesuaian stok..." className={inputClass} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAdjustModal(false)} disabled={saving}
              className="h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">Batal</button>
            <button type="submit" disabled={saving}
              className="h-9 px-4 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
