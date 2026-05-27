import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getDashboardStats } from "../../lib/adminApi";
import AppLayout from "../../components/AppLayout";

const StatCard = ({ title, value, sub, icon, accent }) => (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-5 flex items-start gap-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 leading-none">{value ?? "—"}</p>
            {sub && <p className="mt-1.5 text-xs text-slate-400">{sub}</p>}
        </div>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats()
            .then(r => setStats(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const cards = stats ? [
        {
            title: "Total Toko",
            value: stats?.stores?.total,
            accent: "bg-indigo-50",
            icon: (
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            title: "Toko Aktif",
            value: stats?.stores?.active,
            sub: "Sudah disetujui & aktif",
            accent: "bg-emerald-50",
            icon: (
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            title: "Menunggu Approval",
            value: stats?.stores?.pending,
            sub: "Perlu ditinjau",
            accent: "bg-amber-50",
            icon: (
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            title: "Total User",
            value: stats?.users?.total,
            accent: "bg-slate-100",
            icon: (
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
        {
            title: "User Aktif",
            value: stats?.users?.active,
            accent: "bg-emerald-50",
            icon: (
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
        {
            title: "Total Cabang",
            value: stats?.branches?.total,
            accent: "bg-indigo-50",
            icon: (
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },
    ] : [];

    return (
        <AppLayout title="Dashboard" subtitle="Ringkasan platform">
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 flex items-start gap-4">
                            <Skeleton width={40} height={40} borderRadius={12} />
                            <div className="flex-1">
                                <Skeleton width={100} height={12} />
                                <Skeleton width={60} height={28} className="mt-2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cards.map((card) => (
                        <StatCard key={card.title} {...card} />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
