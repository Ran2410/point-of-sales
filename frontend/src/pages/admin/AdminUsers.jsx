import { useEffect, useState, useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
    getUsers, updateUser, toggleUserStatus,
    resetUserPassword, deleteUser,
} from "../../lib/adminApi";
import AppLayout from "../../components/AppLayout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";
import { toast } from "sonner";

const ROLE_LABELS = { owner: "Owner", branch_owner: "Branch Owner", cashier: "Cashier", admin: "Admin" };
const ROLE_BADGE  = { owner: "info", branch_owner: "warning", cashier: "default", admin: "danger" };

// Icon components
const IconEdit = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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

const IconKey = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
);

const IconTrash = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export default function AdminUsers() {
    const [users, setUsers]     = useState([]);
    const [meta, setMeta]       = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState("");
    const [role, setRole]       = useState("");
    const [status, setStatus]   = useState("");
    const [page, setPage]       = useState(1);

    // Edit modal
    const [editModal, setEditModal]   = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editForm, setEditForm]     = useState({ name: "", email: "", role: "" });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError]   = useState("");

    // Reset password modal
    const [pwModal, setPwModal]   = useState(false);
    const [pwTarget, setPwTarget] = useState(null);
    const [newPw, setNewPw]       = useState("");
    const [pwError, setPwError]   = useState("");

    // Confirm dialog
    const [confirm, setConfirm]       = useState({ open: false, type: "", id: null, name: "" });
    const [confirming, setConfirming] = useState(false);

    const fetchUsers = useCallback(() => {
        setLoading(true);
        getUsers({ page, limit: 10, search, role, status })
            .then(r => { setUsers(r.data.data.data); setMeta(r.data.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page, search, role, status]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { setPage(1); }, [search, role, status]);

    const openEdit = (user) => {
        setEditTarget(user);
        setEditForm({ name: user.name, email: user.email, role: user.role });
        setFormError(""); setEditModal(true);
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setSubmitting(true); setFormError("");
        try {
            await updateUser(editTarget.id, editForm);
            setEditModal(false); fetchUsers();
        } catch (err) {
            setFormError(err.response?.data?.message || "Gagal memperbarui user");
        } finally { setSubmitting(false); }
    };

    const handleResetPw = async (e) => {
        e.preventDefault();
        setPwError("");
        if (newPw.length < 8) { setPwError("Password minimal 8 karakter"); return; }
        setSubmitting(true);
        try {
            await resetUserPassword(pwTarget.id, newPw);
            setPwModal(false); setNewPw("");
        } catch (err) {
            setPwError(err.response?.data?.message || "Gagal reset password");
        } finally { setSubmitting(false); }
    };

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            if (confirm.type === "toggle") await toggleUserStatus(confirm.id);
            if (confirm.type === "delete") await deleteUser(confirm.id);
            setConfirm({ open: false, type: "", id: null, name: "" });
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal");
        } finally { setConfirming(false); }
    };

    const confirmMeta = {
        toggle: { title: "Ubah Status Akun",  message: `Ubah status akun "${confirm.name}"?`, label: "Konfirmasi", variant: "warning" },
        delete: { title: "Hapus Pengguna",     message: `Hapus akun "${confirm.name}" secara permanen? Tindakan ini tidak bisa dibatalkan.`, label: "Hapus", variant: "danger" },
    };

    return (
        <AppLayout title="Manajemen Pengguna" subtitle="Kelola semua akun pengguna">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-2 mb-5">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama / email..."
                        className="w-full pl-9 pr-4 h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                    />
                </div>
                <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                >
                    <option value="">Semua Role</option>
                    <option value="owner">Owner</option>
                    <option value="branch_owner">Branch Owner</option>
                    <option value="cashier">Cashier</option>
                </select>
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                </select>
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {["Nama", "Email", "Role", "Toko", "Status", "Aksi"].map(h => (
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
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-sm">Tidak ada data pengguna</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-4">
                                        <span className="font-medium text-slate-800">{user.name}</span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">{user.email}</td>
                                    <td className="px-5 py-4">
                                        <Badge variant={ROLE_BADGE[user.role] || "default"}>
                                            {ROLE_LABELS[user.role] || user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">{user.store?.name || <span className="text-slate-300">—</span>}</td>
                                    <td className="px-5 py-4">
                                        <Badge variant={user.is_active ? "success" : "danger"}>
                                            {user.is_active ? "Aktif" : "Nonaktif"}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEdit(user)}
                                                title="Edit pengguna"
                                                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                                            >
                                                <IconEdit />
                                            </button>
                                            <button
                                                onClick={() => setConfirm({ open: true, type: "toggle", id: user.id, name: user.name })}
                                                title={user.is_active ? "Nonaktifkan akun" : "Aktifkan akun"}
                                                className={`h-8 w-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                                                    user.is_active
                                                        ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                                        : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                }`}
                                            >
                                                <IconToggle active={user.is_active} />
                                            </button>
                                            <button
                                                onClick={() => { setPwTarget(user); setNewPw(""); setPwError(""); setPwModal(true); }}
                                                title="Reset password"
                                                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                            >
                                                <IconKey />
                                            </button>
                                            {user.role !== "admin" && (
                                                <button
                                                    onClick={() => setConfirm({ open: true, type: "delete", id: user.id, name: user.name })}
                                                    title="Hapus pengguna"
                                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                                >
                                                    <IconTrash />
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
                <span className="text-xs text-slate-400">{meta.total} pengguna</span>
                <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
            </div>

            {/* Edit Modal */}
            <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Pengguna">
                <form onSubmit={handleEdit} className="space-y-4">
                    {formError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
                    {[
                        { label: "Nama", key: "name", type: "text" },
                        { label: "Email", key: "email", type: "email" },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                            <input
                                type={f.type}
                                value={editForm[f.key]}
                                onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Role</label>
                        <select
                            value={editForm.role}
                            onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                        >
                            <option value="owner">Owner</option>
                            <option value="branch_owner">Branch Owner</option>
                            <option value="cashier">Cashier</option>
                        </select>
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

            {/* Reset Password Modal */}
            <Modal open={pwModal} onClose={() => setPwModal(false)} title={`Reset Password — ${pwTarget?.name}`} size="sm">
                <form onSubmit={handleResetPw} className="space-y-4">
                    {pwError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{pwError}</p>}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Password Baru</label>
                        <input
                            type="password"
                            value={newPw}
                            onChange={e => setNewPw(e.target.value)}
                            placeholder="Min. 8 karakter"
                            required
                            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setPwModal(false)} disabled={submitting}
                            className="h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                            Batal
                        </button>
                        <button type="submit" disabled={submitting}
                            className="h-9 px-4 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer disabled:opacity-50">
                            {submitting ? "Menyimpan..." : "Reset Password"}
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
