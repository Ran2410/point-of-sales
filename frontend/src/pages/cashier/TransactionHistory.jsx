import { useEffect, useState, useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AppLayout from "../../components/AppLayout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import { getTransactions, getTransactionById, voidTransaction } from "../../lib/transactionApi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const fmt = (val) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val || 0);

const STATUS_BADGE = { completed: "success", cancelled: "danger", refunded: "warning" };
const STATUS_LABEL = { completed: "Selesai", cancelled: "Dibatalkan", refunded: "Refund" };
const PAYMENT_LABEL = { cash: "Tunai", qris: "QRIS", transfer: "Transfer", card: "Kartu" };

export default function TransactionHistory() {
  const { user } = useAuth();
  const isOwnerOrBranchOwner = ["owner", "branch_owner"].includes(user?.role);

  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta]                 = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [detailModal, setDetailModal] = useState(false);
  const [detail, setDetail]           = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [voidModal, setVoidModal]   = useState(false);
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidNotes, setVoidNotes]   = useState("");
  const [voiding, setVoiding]       = useState(false);

  const fetchTransactions = useCallback(() => {
    setLoading(true);
    getTransactions({ page, limit: 15, date_from: dateFrom, date_to: dateTo, status: statusFilter })
      .then(r => { setTransactions(r.data?.data?.data || []); setMeta(r.data?.data || {}); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, dateFrom, dateTo, statusFilter]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  useEffect(() => { setPage(1); }, [dateFrom, dateTo, statusFilter]);

  const openDetail = async (id) => {
    setDetailLoading(true); setDetailModal(true);
    try {
      const res = await getTransactionById(id);
      setDetail(res.data.data);
    } catch { setDetailModal(false); }
    finally { setDetailLoading(false); }
  };

  const handleVoid = async () => {
    setVoiding(true);
    try {
      await voidTransaction(voidTarget.id, { notes: voidNotes });
      setVoidModal(false); setVoidNotes("");
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membatalkan transaksi");
    } finally { setVoiding(false); }
  };

  const inputClass = "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition";

  return (
    <AppLayout title="Riwayat Transaksi" subtitle="Semua transaksi di cabang Anda">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-5">
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputClass} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputClass} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputClass}>
          <option value="">Semua Status</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
        {(dateFrom || dateTo || statusFilter) && (
          <button onClick={() => { setDateFrom(""); setDateTo(""); setStatusFilter(""); }}
            className="h-9 px-3 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm transition cursor-pointer">
            Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Kode", "Waktu", "Kasir", "Item", "Total", "Bayar", "Kembalian", "Status", "Aksi"].map(h => (
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
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm">Belum ada transaksi</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.map(trx => (
                <tr key={trx.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{trx.transaction_code}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">
                    {new Date(trx.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{trx.cashier?.name || "—"}</td>
                  <td className="px-5 py-4 text-slate-500">{trx.items?.length} item</td>
                  <td className="px-5 py-4 font-medium text-slate-800">{fmt(trx.grand_total)}</td>
                  <td className="px-5 py-4 text-slate-500">
                    {fmt(trx.amount_paid)}
                    <span className="ml-1 text-xs text-slate-400">({PAYMENT_LABEL[trx.payment_method]})</span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{fmt(trx.change_amount)}</td>
                  <td className="px-5 py-4">
                    <Badge variant={STATUS_BADGE[trx.status] || "default"}>
                      {STATUS_LABEL[trx.status] || trx.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openDetail(trx.id)} title="Lihat detail"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      {isOwnerOrBranchOwner && trx.status === "completed" && (
                        <button onClick={() => { setVoidTarget(trx); setVoidNotes(""); setVoidModal(true); }} title="Batalkan transaksi"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">{meta.total} transaksi</span>
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
      </div>

      {/* Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={`Detail — ${detail?.transaction_code || ""}`} size="md">
        {detailLoading ? (
          <div className="space-y-3"><Skeleton count={5} height={16} /></div>
        ) : detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-slate-400">Kasir</p><p className="font-medium">{detail.cashier?.name}</p></div>
              <div><p className="text-xs text-slate-400">Cabang</p><p className="font-medium">{detail.branch?.name}</p></div>
              <div><p className="text-xs text-slate-400">Waktu</p><p className="font-medium">{new Date(detail.createdAt).toLocaleString("id-ID")}</p></div>
              <div><p className="text-xs text-slate-400">Metode</p><p className="font-medium">{PAYMENT_LABEL[detail.payment_method]}</p></div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              {detail.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-600">{item.product_name} <span className="text-slate-400">×{item.quantity} {item.unit}</span></span>
                  <span className="font-medium">{fmt(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{fmt(detail.total_amount)}</span></div>
              {parseFloat(detail.discount_amount) > 0 && <div className="flex justify-between text-emerald-600"><span>Diskon</span><span>-{fmt(detail.discount_amount)}</span></div>}
              {parseFloat(detail.tax_amount) > 0 && <div className="flex justify-between text-slate-500"><span>Pajak</span><span>{fmt(detail.tax_amount)}</span></div>}
              <div className="flex justify-between font-bold text-slate-900 text-base pt-1"><span>Total</span><span>{fmt(detail.grand_total)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Dibayar</span><span>{fmt(detail.amount_paid)}</span></div>
              {parseFloat(detail.change_amount) > 0 && <div className="flex justify-between text-indigo-600 font-semibold"><span>Kembalian</span><span>{fmt(detail.change_amount)}</span></div>}
            </div>

            <div className="flex justify-center">
              <Badge variant={STATUS_BADGE[detail.status]}>{STATUS_LABEL[detail.status]}</Badge>
            </div>
          </div>
        )}
      </Modal>

      {/* Void Modal */}
      <Modal open={voidModal} onClose={() => setVoidModal(false)} title={`Batalkan — ${voidTarget?.transaction_code}`} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Membatalkan transaksi akan mengembalikan stok semua item. Tindakan ini tidak bisa dibatalkan.</p>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Alasan (opsional)</label>
            <textarea value={voidNotes} onChange={e => setVoidNotes(e.target.value)} rows={2}
              placeholder="Alasan pembatalan..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setVoidModal(false)} disabled={voiding}
              className="h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">Batal</button>
            <button onClick={handleVoid} disabled={voiding}
              className="h-9 px-4 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition cursor-pointer disabled:opacity-50">
              {voiding ? "Memproses..." : "Batalkan Transaksi"}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
