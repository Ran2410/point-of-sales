import { useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import api from "../lib/api";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Pagination from "../components/ui/Pagination";
import { toast } from "sonner";

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

// ─── Form Fields ──────────────────────────────────────────────────────────────
function BranchFormFields({ form, onChange, error }) {
  const inputClass = "w-full h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nama Cabang</label>
          <input value={form.name} onChange={e => onChange("name", e.target.value)}
            placeholder="Cabang Jakarta" className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Kode Cabang</label>
          <input value={form.code} onChange={e => onChange("code", e.target.value.toUpperCase())}
            placeholder="JKT" className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Alamat</label>
          <input value={form.address} onChange={e => onChange("address", e.target.value)}
            placeholder="Jl. Sudirman No. 1" className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Telepon</label>
          <input value={form.phone} onChange={e => onChange("phone", e.target.value)}
            placeholder="021-12345678" className={inputClass} required />
        </div>
      </div>
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" checked={form.is_active}
          onChange={e => onChange("is_active", e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
        <span className="text-sm text-slate-700">Cabang aktif</span>
      </label>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", code: "", address: "", phone: "", is_active: true };

export default function BranchManagement() {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";

  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
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
  const [confirm, setConfirm]     = useState({ open: false, type: "", id: null, name: "" });
  const [confirming, setConfirming] = useState(false);

  const totalActive = useMemo(() => branches.filter(b => b.is_active).length, [branches]);

  const fetchBranches = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/branches", { params: { page, limit: LIMIT } });
      // Backend branch tidak punya pagination — handle keduanya
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setBranches(data);
        setMeta({ total: data.length, totalPages: 1 });
      } else {
        setBranches(data?.data || []);
        setMeta({ total: data?.total || 0, totalPages: data?.totalPages || 1 });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data cabang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, [page]);

  // ─── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setCreateError("");
    try {
      await api.post("/branches", createForm);
      setCreateModal(false);
      setCreateForm(EMPTY_FORM);
      fetchBranches();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Gagal membuat cabang");
    } finally { setSaving(false); }
  };

  // ─── Edit ────────────────────────────────────────────────────────────────────
  const openEdit = (branch) => {
    setEditTarget(branch);
    setEditForm({ name: branch.name, code: branch.code, address: branch.address, phone: branch.phone, is_active: branch.is_active });
    setEditError("");
    setEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true); setEditError("");
    try {
      await api.put(`/branches/${editTarget.id}`, editForm);
      setEditModal(false);
      fetchBranches();
    } catch (err) {
      setEditError(err.response?.data?.message || "Gagal memperbarui cabang");
    } finally { setSaving(false); }
  };

  // ─── Toggle / Delete ─────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setConfirming(true);
    try {
      if (confirm.type === "toggle") await api.patch(`/branches/${confirm.id}/toggle-status`);
      if (confirm.type === "delete") await api.delete(`/branches/${confirm.id}`);
      setConfirm({ open: false, type: "", id: null, name: "" });
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal");
    } finally { setConfirming(false); }
  };

  const confirmMeta = {
    toggle: { title: "Ubah Status Cabang", message: `Ubah status aktif cabang "${confirm.name}"?`, label: "Konfirmasi", variant: "warning" },
    delete: { title: "Hapus Cabang",       message: `Hapus cabang "${confirm.name}" secara permanen? Pastikan tidak ada pengguna yang terikat.`, label: "Hapus", variant: "danger" },
  };

  return (
    <AppLayout title="Manajemen Cabang" subtitle="Kelola cabang dalam toko Anda">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

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
          <>
            {[
              { label: "Total Cabang",  value: branches.length,  accent: "bg-indigo-50",  icon: <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
              { label: "Cabang Aktif",  value: totalActive,      accent: "bg-emerald-50", icon: <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
              { label: "Nonaktif",      value: branches.length - totalActive, accent: "bg-amber-50", icon: <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-5 flex items-start gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${s.accent}`}>{s.icon}</div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800 leading-none">{s.value}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Daftar Cabang</h2>
        {isOwner && (
          <button onClick={() => { setCreateForm(EMPTY_FORM); setCreateError(""); setCreateModal(true); }}
            className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition cursor-pointer flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Cabang
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Nama Cabang", "Kode", "Alamat", "Telepon", "Pengguna", "Status", ...(isOwner ? ["Aksi"] : [])].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    {Array(isOwner ? 7 : 6).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-4"><Skeleton height={14} /></td>
                    ))}
                  </tr>
                ))
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={isOwner ? 7 : 6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-sm">Belum ada cabang</span>
                    </div>
                  </td>
                </tr>
              ) : branches.map(branch => (
                <tr key={branch.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-800">{branch.name}</td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{branch.code}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 max-w-[180px] truncate">{branch.address || <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-4 text-slate-500">{branch.phone || <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-4 text-slate-500">{branch.users?.length ?? 0} orang</td>
                  <td className="px-5 py-4">
                    <Badge variant={branch.is_active ? "success" : "danger"}>
                      {branch.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                  {isOwner && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(branch)} title="Edit cabang"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer">
                          <IconEdit />
                        </button>
                        <button onClick={() => setConfirm({ open: true, type: "toggle", id: branch.id, name: branch.name })}
                          title={branch.is_active ? "Nonaktifkan cabang" : "Aktifkan cabang"}
                          className={`h-8 w-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                            branch.is_active
                              ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}>
                          <IconToggle active={branch.is_active} />
                        </button>
                        <button onClick={() => setConfirm({ open: true, type: "delete", id: branch.id, name: branch.name })}
                          title="Hapus cabang"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer">
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">{meta.total} cabang</span>
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
      </div>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Tambah Cabang Baru">
        <form onSubmit={handleCreate} className="space-y-4">
          <BranchFormFields form={createForm} onChange={(k, v) => setCreateForm(p => ({ ...p, [k]: v }))} error={createError} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCreateModal(false)} disabled={saving}
              className="h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="h-9 px-4 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer disabled:opacity-50">
              {saving ? "Menyimpan..." : "Tambah Cabang"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title={`Edit Cabang — ${editTarget?.name}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <BranchFormFields form={editForm} onChange={(k, v) => setEditForm(p => ({ ...p, [k]: v }))} error={editError} />
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

