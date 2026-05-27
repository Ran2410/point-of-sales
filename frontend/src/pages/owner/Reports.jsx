import { useEffect, useState, useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AppLayout from "../../components/AppLayout";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import { getTransactions, getDailySummary } from "../../lib/transactionApi";
import { getProducts } from "../../lib/productApi";
import api from "../../lib/api";
import { exportTransactionsExcel, exportTransactionsPDF, exportProductsExcel } from "../../utils/exportReport";
import { toast } from "sonner";

const fmt = (val) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val || 0);

const TABS = [
  { key: "transactions", label: "Transaksi" },
  { key: "products",     label: "Produk & Stok" },
];

export default function Reports() {
  const [tab, setTab]           = useState("transactions");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo]     = useState(new Date().toISOString().split("T")[0]);
  const [branchFilter, setBranchFilter] = useState("");
  const [branches, setBranches] = useState([]);

  // Transactions
  const [transactions, setTransactions] = useState([]);
  const [trxMeta, setTrxMeta]           = useState({ total: 0, totalPages: 1 });
  const [trxPage, setTrxPage]           = useState(1);
  const [trxLoading, setTrxLoading]     = useState(false);
  const [summary, setSummary]           = useState(null);

  // Products
  const [products, setProducts]     = useState([]);
  const [prodLoading, setProdLoading] = useState(false);

  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api.get("/branches").then(r => setBranches(r.data?.data || [])).catch(console.error);
  }, []);

  const fetchTransactions = useCallback(() => {
    setTrxLoading(true);
    Promise.all([
      getTransactions({ page: trxPage, limit: 20, date_from: dateFrom, date_to: dateTo, branch_id: branchFilter }),
      getDailySummary({ date: dateTo }),
    ]).then(([trxRes, sumRes]) => {
      setTransactions(trxRes.data?.data?.data || []);
      setTrxMeta(trxRes.data?.data || {});
      setSummary(sumRes.data?.data);
    }).catch(console.error).finally(() => setTrxLoading(false));
  }, [trxPage, dateFrom, dateTo, branchFilter]);

  const fetchProducts = useCallback(() => {
    setProdLoading(true);
    getProducts({ limit: 200 })
      .then(r => setProducts(r.data?.data?.data || []))
      .catch(console.error)
      .finally(() => setProdLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "transactions") fetchTransactions();
    if (tab === "products")     fetchProducts();
  }, [tab, fetchTransactions, fetchProducts]);

  useEffect(() => { setTrxPage(1); }, [dateFrom, dateTo, branchFilter]);

  // ─── Export handlers ──────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      if (tab === "transactions") {
        // Fetch semua data tanpa pagination untuk export
        const res = await getTransactions({ limit: 9999, date_from: dateFrom, date_to: dateTo, branch_id: branchFilter });
        exportTransactionsExcel(res.data?.data?.data || [], `laporan-transaksi-${dateFrom}-${dateTo}`);
        toast.success("Export Excel berhasil");
      } else {
        const res = await getProducts({ limit: 9999 });
        exportProductsExcel(res.data?.data?.data || [], "laporan-produk-stok");
        toast.success("Export Excel berhasil");
      }
    } catch { toast.error("Gagal export Excel"); }
    finally { setExporting(false); }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await getTransactions({ limit: 9999, date_from: dateFrom, date_to: dateTo, branch_id: branchFilter });
      exportTransactionsPDF(
        res.data?.data?.data || [],
        `Laporan Transaksi ${dateFrom} s/d ${dateTo}`,
        `laporan-transaksi-${dateFrom}-${dateTo}`
      );
      toast.success("Export PDF berhasil");
    } catch { toast.error("Gagal export PDF"); }
    finally { setExporting(false); }
  };

  const inputClass = "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition";

  return (
    <AppLayout title="Laporan" subtitle="Analisis penjualan dan stok toko Anda">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Transactions Tab ─────────────────────────────────────────────────── */}
      {tab === "transactions" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputClass} />
            <span className="flex items-center text-slate-400 text-sm">s/d</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputClass} />
            <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className={inputClass}>
              <option value="">Semua Cabang</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <div className="flex gap-2 ml-auto">
              <button onClick={handleExportExcel} disabled={exporting}
                className="h-9 px-4 rounded-lg border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-sm font-medium transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Excel
              </button>
              <button onClick={handleExportPDF} disabled={exporting}
                className="h-9 px-4 rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 text-sm font-medium transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                PDF
              </button>
            </div>
          </div>

          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Total Transaksi", value: trxMeta.total || 0, color: "text-indigo-600" },
                { label: "Total Pendapatan", value: fmt(transactions.reduce((s, t) => s + parseFloat(t.grand_total), 0)), color: "text-emerald-600" },
                { label: "Rata-rata/Transaksi", value: trxMeta.total > 0 ? fmt(transactions.reduce((s, t) => s + parseFloat(t.grand_total), 0) / transactions.length) : "—", color: "text-slate-800" },
                { label: "Total Item Terjual", value: transactions.reduce((s, t) => s + (t.items?.length || 0), 0), color: "text-amber-600" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{s.label}</p>
                  <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Kode", "Waktu", "Cabang", "Kasir", "Item", "Total", "Metode", "Status"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trxLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        {Array(8).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><Skeleton height={14} /></td>)}
                      </tr>
                    ))
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">Tidak ada transaksi pada periode ini</td></tr>
                  ) : transactions.map(t => (
                    <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{t.transaction_code}</span></td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">{new Date(t.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</td>
                      <td className="px-5 py-3.5 text-slate-600">{t.branch?.name || "—"}</td>
                      <td className="px-5 py-3.5 text-slate-600">{t.cashier?.name || "—"}</td>
                      <td className="px-5 py-3.5 text-slate-500">{t.items?.length}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{fmt(t.grand_total)}</td>
                      <td className="px-5 py-3.5 text-slate-500 capitalize">{t.payment_method}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={t.status === "completed" ? "success" : "danger"}>
                          {t.status === "completed" ? "Selesai" : "Batal"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">{trxMeta.total} transaksi</span>
            <Pagination page={trxPage} totalPages={trxMeta.totalPages} onPageChange={setTrxPage} />
          </div>
        </>
      )}

      {/* ─── Products Tab ─────────────────────────────────────────────────────── */}
      {tab === "products" && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={handleExportExcel} disabled={exporting}
              className="h-9 px-4 rounded-lg border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-sm font-medium transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export Excel
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Produk", "SKU", "Kategori", "Harga Jual", "Cabang", "Stok", "Min. Stok", "Status Stok"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prodLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        {Array(8).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><Skeleton height={14} /></td>)}
                      </tr>
                    ))
                  ) : products.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">Belum ada produk</td></tr>
                  ) : products.flatMap(p =>
                    (p.stocks || [{ branch: null, stock: 0, minimum_stock: 0 }]).map((s, si) => (
                      <tr key={`${p.id}-${si}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-800">{p.name}</td>
                        <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{p.sku}</span></td>
                        <td className="px-5 py-3.5 text-slate-500">{p.category?.name || "—"}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">{fmt(p.selling_price)}</td>
                        <td className="px-5 py-3.5 text-slate-500">{s.branch?.name || "—"}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-800">{s.stock}</td>
                        <td className="px-5 py-3.5 text-slate-500">{s.minimum_stock}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={s.stock <= s.minimum_stock ? "danger" : "success"}>
                            {s.stock <= s.minimum_stock ? "Menipis" : "Normal"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
