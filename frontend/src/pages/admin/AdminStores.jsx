import { useEffect, useState, useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
    getStores, createStore, updateStore,
    approveStore, rejectStore, toggleStoreStatus,
} from "../../lib/adminApi";
import AppLayout from "../../components/AppLayout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";
import { toast } from "sonner";

const INIT_FORM = { store_name: "", owner_name: "", email: "", password: "" };

// Icon components
const IconEdit = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

const IconCheck = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconReject = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconToggle = ({ active }) => active ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function AdminStores() {
    const [stores, setStores]     = useState([]);
    const [meta, setMeta]         = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState("");
    const [status, setStatus]     = useState("");
    const [page, setPage]         = useState(1);

    // Modal states
    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal]     = useState(false);
    const [editTarget, setEditTarget]   = useState(null);
    const [form, setForm]               = useState(INIT_FORM);
    const [editName, setEditName]       = useState("");
    const [submitting, setSubmitting]   = useState(false);
    const [formError, setFormError]     = useState("");

    // Confirm dialog
    const [confirm, setConfirm]       = useState({ open: false, type: "", id: null, name: "" });
    const [confirming, setConfirming] = useState(false);

    const fetchStores = useCallback(() => {
        setLoading(true);
        getStores({ page, limit: 10, search, status })
            .then(r => { setStores(r.data.data.data); setMeta(r.data.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page, search, status]);

    useEffect(() => { fetchStores(); }, [fetchStores]);
    useEffect(() => { setPage(1); }, [search, status]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true); setFormError("");
        try {
            await createStore(form);
            setCreateModal(false); setForm(INIT_FORM);
            fetchStores();
        } catch (err) {
            setFormError(err.response?.data?.message || "Gagal membuat toko");
        } finally { setSubmitting(false); }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setSubmitting(true); setFormError("");
        try {
            await updateStore(editTarget.id, { name: editName });
            setEditModal(false);
            fetchStores();
        } catch (err) {
            setFormError(err.response?.data?.message || "Gagal memperbarui toko");
        } finally { setSubmitting(false); }
    };

    const openConfirm = (type, store) =>
        setConfirm({ open: true, type, id: store.id, name: store.name });

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            if (confirm.type === "approve") await approveStore(confirm.id);
            if (confirm.type === "reject")  await rejectStore(confirm.id);
            if (confirm.type === "toggle")  await toggleStoreStatus(confirm.id);
            setConfirm({ open: false, type: "", id: null, name: "" });
            fetchStores();
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal");
        } finally { setConfirming(false); }
    };

    const confirmMeta = {
        approve: { title: "Setujui Toko",     message: `Setujui pendaftaran toko "${confirm.name}"?`, label: "Setujui", variant: "success" },
        reject:  { title: "Tolak Toko",       message: `Tolak & hapus pendaftaran toko "${confirm.name}"? Tindakan ini tidak bisa dibatalkan.`, label: "Tolak", variant: "danger" },
        toggle:  { title: "Ubah Status Toko", message: `Ubah status aktif toko "${confirm.name}"?`, label: "Konfirmasi", variant: "danger" },
    };

    return (
        <AppLayout title="Manajemen Toko" subtitle="Kelola semua toko dalam platform">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-2 mb-5">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama / kode toko..."
                        className="w-full pl-9 pr-4 h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                    />
                </div>
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                    <option value="pending">Pending</option>
                </select>
                <button
                    onClick={() => { setForm(INIT_FORM); setFormError(""); setCreateModal(true); }}
                    className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Buat Toko
                </button>
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {["Nama Toko", "Kode", "Status", "Approval", "Owner", "Aksi"].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 last:border-0">
                                        {Array(6).fill(0).map((_, j) => (
                                            <td key={j} className="px-5 py-4"><Skeleton height={14} /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : stores.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="text-sm">Tidak ada data toko</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : stores.map(store => (
                                <tr key={store.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-4">
                                        <span className="font-medium text-slate-800">{store.name}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{store.code}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <Badge variant={store.is_active ? "success" : "danger"}>
                                            {store.is_active ? "Aktif" : "Nonaktif"}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4">
                                        <Badge variant={store.is_approved ? "success" : "warning"}>
                                            {store.is_approved ? "Disetujui" : "Pending"}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">
                                        {store.users?.[0]?.name || <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1">
                                            {!store.is_approved && (
                                                <>
                                                    <button
                                                        onClick={() => openConfirm("approve", store)}
                                                        title="Setujui toko"
                                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                                                    >
                                                        <IconCheck />
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirm("reject", store)}
                                                        title="Tolak toko"
                                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                                    >
                                                        <IconReject />
                                                    </button>
                                                </>
                                            )}
                                            {store.is_approved && (
                                                <button
                                                    onClick={() => openConfirm("toggle", store)}
                                                    title={store.is_active ? "Nonaktifkan toko" : "Aktifkan toko"}
                                                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                                                        store.is_active
                                                            ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                    }`}
                                                >
                                                    <IconToggle active={store.is_active} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setEditTarget(store); setEditName(store.name); setFormError(""); setEditModal(true); }}
                                                title="Edit nama toko"
                                                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                                            >
                                                <IconEdit />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">{meta.total} toko</span>
                <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
            </div>

            {/* Create Modal */}
            <Modal open={createModal} onClose={() => setCreateModal(false)} title="Buat Toko & Owner Baru">
                <form onSubmit={handleCreate} className="space-y-4">
                    {formError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
                    {[
                        { label: "Nama Toko",   key: "store_name", type: "text",     placeholder: "Toko Mineral" },
                        { label: "Nama Owner",  key: "owner_name", type: "text",     placeholder: "Budi Santoso" },
                        { label: "Email Owner", key: "email",      type: "email",    placeholder: "budi@email.com" },
                        { label: "Password",    key: "password",   type: "password", placeholder: "Min. 8 karakter" },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                            <input
                                type={f.type}
                                value={form[f.key]}
                                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                placeholder={f.placeholder}
                                required
                                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                            />
                        </div>
                    ))}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setCreateModal(false)} disabled={submitting}
                            className="h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                            Batal
                        </button>
                        <button type="submit" disabled={submitting}
                            className="h-9 px-4 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer disabled:opacity-50">
                            {submitting ? "Menyimpan..." : "Buat Toko"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Nama Toko">
                <form onSubmit={handleEdit} className="space-y-4">
                    {formError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nama Toko</label>
                        <input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            required
                            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setEditModal(false)} disabled={submitting}
                            className="h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                            Batal
                        </button>
                        <button type="submit" disabled={submitting}
                            className="h-9 px-4 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer disabled:opacity-50">
                            {submitting ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Dialog */}
            {confirm.type && (
                <ConfirmDialog
                    open={confirm.open}
                    onClose={() => setConfirm({ ...confirm, open: false })}
                    onConfirm={handleConfirm}
                    loading={confirming}
                    title={confirmMeta[confirm.type]?.title}
                    message={confirmMeta[confirm.type]?.message}
                    confirmLabel={confirmMeta[confirm.type]?.label}
                    variant={confirmMeta[confirm.type]?.variant}
                />
            )}
        </AppLayout>
    );
}
