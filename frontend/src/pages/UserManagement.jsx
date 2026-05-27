import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Pagination from "../components/ui/Pagination";
import api from "../lib/api";
import { toast } from "sonner";

// ─── Role config per creator ──────────────────────────────────────────────────
const CREATABLE_ROLES = {
  owner       : [{ value: "branch_owner", label: "Branch Owner" }, { value: "cashier", label: "Cashier" }],
  branch_owner: [{ value: "cashier",      label: "Cashier" }],
};

const ROLE_BADGE  = { owner: "info", branch_owner: "warning", cashier: "default" };
const ROLE_LABELS = { owner: "Owner", branch_owner: "Branch Owner", cashier: "Cashier" };

// ─── Icons ────────────────────────────────────────────────────────────────────
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
const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// ─── User Form ────────────────────────────────────────────────────────────────
function UserForm({ form, setForm, branches, creatorRole, isEdit, error }) {
  const inputClass = "w-full h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

  const roleOptions = CREATABLE_ROLES[creatorRole] || [];

  // branch_owner tidak perlu pilih branch (otomatis branch mereka)
  const showBranchSelect = creatorRole === "owner";

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nama</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Nama lengkap" className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="email@contoh.com" className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            className={inputClass} required>
            {roleOptions.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        {showBranchSelect && (
          <div>
            <label className={labelClass}>Cabang</label>
            <select value={form.branch_id} onChange={e => setForm(p => ({ ...p, branch_id: e.target.value }))}
              className={inputClass} required>
              <option value="">Pilih cabang...</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className={showBranchSelect ? "" : "sm:col-span-2"}>
          <label className={labelClass}>
            {isEdit ? "Password Baru (opsional)" : "Password"}
          </label>
          <input type="password" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Min. 8 karakter"}
            className={inputClass} required={!isEdit} />
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" checked={form.is_active}
          onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
        <span className="text-sm text-slate-700">Akun aktif</span>
      </label>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", email: "", password: "", role: "", branch_id: "", is_active: true };

export default function UserManagement() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [users, setUsers]       = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 });
  const LIMIT = 10;

  // Create modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm]   = useState(EMPTY_FORM);
  const [createError, setCreateError] = useState("");

  // Edit modal
  const [editModal, setEditModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState(EMPTY_FORM);
  const [editError, setEditError]   = useState("");

  // Confirm dialog
  const [confirm, setConfirm]       = useState({ open: false, type: "", id: null, name: "" });
  const [confirming, setConfirming] = useState(false);

  const stats = useMemo(() => ({
    total   : users.length,
    active  : users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
  }), [users]);

  const defaultRole = CREATABLE_ROLES[user?.role]?.[0]?.value || "cashier";

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, branchesRes] = await Promise.all([
        api.get("/users", { params: { page, limit: LIMIT } }),
        api.get("/branches"),
      ]);
      const userData = usersRes.data?.data;
      if (Array.isArray(userData)) {
        setUsers(userData);
        setMeta({ total: userData.length, totalPages: 1 });
      } else {
        setUsers(userData?.data || []);
        setMeta({ total: userData?.total || 0, totalPages: userData?.totalPages || 1 });
      }
      setBranches(branchesRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!["owner", "branch_owner"].includes(user?.role)) {
      navigate("/pos");
      return;
    }
    fetchData();
  }, [page]);

  // ─── Create ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setCreateForm({ ...EMPTY_FORM, role: defaultRole });
    setCreateError("");
    setCreateModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setCreateError("");
    try {
      await api.post("/users", {
        name     : createForm.name,
        email    : createForm.email,
        password : createForm.password,
        role     : createForm.role,
        branch_id: createForm.branch_id ? Number(createForm.branch_id) : undefined,
        is_active: createForm.is_active,
      });
      setCreateModal(false);
      fetchData();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Gagal membuat pengguna");
    } finally { setSaving(false); }
  };

  // ─── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (target) => {
    setEditTarget(target);
    setEditForm({
      name     : target.name,
      email    : target.email,
      password : "",
      role     : target.role,
      branch_id: target.branch?.id ? String(target.branch.id) : "",
      is_active: target.is_active,
    });
    setEditError("");
    setEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true); setEditError("");
    try {
      const payload = {
        name     : editForm.name,
        email    : editForm.email,
        role     : editForm.role,
        is_active: editForm.is_active,
      };
      if (editForm.branch_id && user?.role === "owner") {
        payload.branch_id = Number(editForm.branch_id);
      }
      if (editForm.password) payload.password = editForm.password;

      await api.put(`/users/${editTarget.id}`, payload);
      setEditModal(false);
      fetchData();
    } catch (err) {
      setEditError(err.response?.data?.message || "Gagal memperbarui pengguna");
    } finally { setSaving(false); }
  };

  // ─── Toggle / Delete ───────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setConfirming(true);
    try {
      if (confirm.type === "toggle") await api.patch(`/users/${confirm.id}/toggle-status`);
      if (confirm.type === "delete") await api.delete(`/users/${confirm.id}`);
      setConfirm({ open: false, type: "", id: null, name: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal");
    } finally { setConfirming(false); }
  };

  const confirmMeta = {
    toggle: { title: "Ubah Status Akun",  message: `Ubah status akun "${confirm.name}"?`, label: "Konfirmasi", variant: "warning" },
    delete: { title: "Hapus Pengguna",    message: `Hapus akun "${confirm.name}" secara permanen?`, label: "Hapus", variant: "danger" },
  };

  const canManage = (target) => target.id !== user?.id;

  return (
    <AppLayout title="Manajemen Pengguna" subtitle={
      user?.role === "owner"
        ? "Kelola branch owner dan cashier dalam toko Anda"
        : "Kelola cashier dalam cabang Anda"
    }>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 flex items-start gap-4">
              <Skeleton width={40} height={40} borderRadius={12} />
              <div className="flex-1"><Skeleton width={80} height={12} /><Skeleton width={50} height={28} className="mt-2" /></div>
            </div>
          ))
        ) : (
          [
            { label: "Total Pengguna", value: stats.total,    accent: "bg-indigo-50",  color: "text-indigo-500",  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
            { label: "Aktif",          value: stats.active,   accent: "bg-emerald-50", color: "text-emerald-500", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: "Nonaktif",       value: stats.inactive, accent: "bg-amber-50",   color: "text-amber-500",  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-5 flex items-start gap-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${s.accent} ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800 leading-none">{s.value}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Daftar Pengguna</h2>
        <button onClick={openCreate}
          className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition cursor-pointer flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengguna
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Nama", "Email", "Role", "Cabang", "Status", "Aksi"].map(h => (
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
                      <span className="text-sm">Belum ada pengguna</span>
                    </div>
                  </td>
                </tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-semibold shrink-0">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{u.email}</td>
                  <td className="px-5 py-4">
                    <Badge variant={ROLE_BADGE[u.role] || "default"}>
                      {ROLE_LABELS[u.role] || u.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {u.branch?.name || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={u.is_active ? "success" : "danger"}>
                      {u.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    {canManage(u) && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)} title="Edit pengguna"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer">
                          <IconEdit />
                        </button>
                        <button onClick={() => setConfirm({ open: true, type: "toggle", id: u.id, name: u.name })}
                          title={u.is_active ? "Nonaktifkan akun" : "Aktifkan akun"}
                          className={`h-8 w-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                            u.is_active
                              ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}>
                          <IconToggle active={u.is_active} />
                        </button>
                        <button onClick={() => setConfirm({ open: true, type: "delete", id: u.id, name: u.name })}
                          title="Hapus pengguna"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer">
                          <IconTrash />
                        </button>
                      </div>
                    )}
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

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Tambah Pengguna Baru">        <form onSubmit={handleCreate} className="space-y-4">
          <UserForm form={createForm} setForm={setCreateForm} branches={branches}
            creatorRole={user?.role} isEdit={false} error={createError} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCreateModal(false)} disabled={saving}
              className="h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="h-9 px-4 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer disabled:opacity-50">
              {saving ? "Menyimpan..." : "Tambah Pengguna"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title={`Edit Pengguna — ${editTarget?.name}`}>
        <form onSubmit={handleEdit} className="space-y-4">
          <UserForm form={editForm} setForm={setEditForm} branches={branches}
            creatorRole={user?.role} isEdit={true} error={editError} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditModal(false)} disabled={saving}
              className="h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="h-9 px-4 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
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
