import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AppLayout from "../../components/AppLayout";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import BarcodeDisplay from "../../components/ui/BarcodeDisplay";
import { getProducts } from "../../lib/productApi";
import { getCategories } from "../../lib/productApi";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconStock = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const formatRupiah = (val) => {
  if (!val && val !== 0) return "—";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
};

export default function BranchProducts() {
  const navigate = useNavigate();

  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta]             = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage]             = useState(1);

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
    getCategories().then(r => setCategories(r.data?.data || [])).catch(console.error);
  }, []);

  return (
    <AppLayout title="Produk & Stok Cabang" subtitle="Lihat produk dan stok di cabang Anda">
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Produk", "SKU", "Barcode", "Kategori", "Harga Jual", "Stok Cabang", "Min. Stok", "Status", "Aksi"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    {Array(9).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><Skeleton height={14} /></td>)}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-sm">Belum ada produk</span>
                    </div>
                  </td>
                </tr>
              ) : products.map(p => {
                // stocks sudah difilter backend hanya untuk cabang ini
                const branchStock = p.stocks?.[0];
                const isLow = branchStock && branchStock.stock <= branchStock.minimum_stock;

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
                    <td className="px-5 py-4">
                      {p.barcode
                        ? <BarcodeDisplay value={p.barcode} height={32} showText={false} />
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{p.category?.name || <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-4 font-medium text-slate-800">{formatRupiah(p.selling_price)}</td>
                    <td className="px-5 py-4">
                      {branchStock !== undefined ? (
                        <span className={`font-bold text-base ${isLow ? "text-red-500" : "text-slate-800"}`}>
                          {branchStock?.stock ?? 0}
                          {isLow && <span className="ml-1 text-xs font-normal text-red-400">⚠ menipis</span>}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">Belum ada stok</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{branchStock?.minimum_stock ?? "—"}</td>
                    <td className="px-5 py-4">
                      <Badge variant={p.is_active ? "success" : "danger"}>
                        {p.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => navigate(`/branch/products/${p.id}/stock`)} title="Lihat riwayat stok"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer">
                        <IconStock />
                      </button>
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
    </AppLayout>
  );
}
