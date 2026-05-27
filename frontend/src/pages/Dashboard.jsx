import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AppLayout from "../components/AppLayout";
import Badge from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const fmt = (val) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val || 0);

const StatCard = ({ title, value, sub, accent, icon }) => (
  <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-5 flex items-start gap-4">
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>{icon}</div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800 leading-none">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwner       = user?.role === "owner";
  const isBranchOwner = user?.role === "branch_owner";

  useEffect(() => {
    if (!isOwner && !isBranchOwner) { setLoading(false); return; }
    const endpoint = isOwner ? "/dashboard/owner" : "/dashboard/branch";
    api.get(endpoint)
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const SkeletonCards = ({ count = 4 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 flex items-start gap-4">
          <Skeleton width={40} height={40} borderRadius={12} />
          <div className="flex-1"><Skeleton width={100} height={12} /><Skeleton width={70} height={28} className="mt-2" /></div>
        </div>
      ))}
    </div>
  );

  // ─── Owner Dashboard ─────────────────────────────────────────────────────────
  if (isOwner) {
    return (
      <AppLayout title="Dashboard" subtitle="Ringkasan toko Anda hari ini">
        {loading ? <SkeletonCards count={4} /> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <StatCard title="Transaksi Hari Ini" value={data?.today?.transactions ?? 0}
                accent="bg-indigo-50" icon={<svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
              <StatCard title="Pendapatan Hari Ini" value={fmt(data?.today?.revenue)}
                accent="bg-emerald-50" icon={<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              <StatCard title="Pendapatan Bulan Ini" value={fmt(data?.month?.revenue)} sub={`${data?.month?.transactions ?? 0} transaksi`}
                accent="bg-amber-50" icon={<svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
              <StatCard title="Cabang Aktif" value={data?.overview?.branches ?? 0} sub={`${data?.overview?.products ?? 0} produk aktif`}
                accent="bg-purple-50" icon={<svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Stok menipis */}
              {data?.low_stock?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <h3 className="text-sm font-semibold text-slate-800">Stok Menipis</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {data.low_stock.slice(0, 5).map(s => (
                      <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{s.product?.name}</p>
                          <p className="text-xs text-slate-400">{s.branch?.name}</p>
                        </div>
                        <span className="text-sm font-bold text-red-500">{s.stock} {s.product?.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transaksi terbaru */}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">Transaksi Terbaru</h3>
                </div>
                {data?.recent_transactions?.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-slate-400 text-center">Belum ada transaksi</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data?.recent_transactions?.map(t => (
                      <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-mono text-slate-500">{t.transaction_code}</p>
                          <p className="text-xs text-slate-400">{t.branch?.name} · {t.cashier?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-800">{fmt(t.grand_total)}</p>
                          <Badge variant={t.status === "completed" ? "success" : "danger"}>
                            {t.status === "completed" ? "Selesai" : "Batal"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </AppLayout>
    );
  }

  // ─── Branch Owner Dashboard ───────────────────────────────────────────────────
  if (isBranchOwner) {
    return (
      <AppLayout title="Dashboard" subtitle={`Ringkasan cabang ${user?.branch?.name || ""} hari ini`}>
        {loading ? <SkeletonCards count={2} /> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <StatCard title="Transaksi Hari Ini" value={data?.today?.transactions ?? 0}
                accent="bg-indigo-50" icon={<svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
              <StatCard title="Pendapatan Hari Ini" value={fmt(data?.today?.revenue)}
                accent="bg-emerald-50" icon={<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data?.low_stock?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <h3 className="text-sm font-semibold text-slate-800">Stok Menipis</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {data.low_stock.slice(0, 5).map(s => (
                      <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800">{s.product?.name}</p>
                        <span className="text-sm font-bold text-red-500">{s.stock} {s.product?.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">Transaksi Terbaru</h3>
                </div>
                {data?.recent_transactions?.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-slate-400 text-center">Belum ada transaksi</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data?.recent_transactions?.map(t => (
                      <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-mono text-slate-500">{t.transaction_code}</p>
                          <p className="text-xs text-slate-400">{t.cashier?.name}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{fmt(t.grand_total)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </AppLayout>
    );
  }

  // ─── Fallback (cashier tidak punya dashboard) ─────────────────────────────────
  return (
    <AppLayout title="Dashboard" subtitle="">
      <div className="flex flex-col items-center justify-center h-40 text-slate-400">
        <p className="text-sm">Selamat datang, {user?.name}</p>
      </div>
    </AppLayout>
  );
}
