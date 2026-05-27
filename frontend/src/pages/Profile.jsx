import { useEffect, useState } from "react";
import { toast } from "sonner";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function Profile() {
  const { user, login } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [pwForm, setPwForm]           = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw]           = useState(false);
  const [showPw, setShowPw]               = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    if (user) setProfileForm({ name: user.name || "", email: user.email || "" });
  }, [user]);

  const inputClass = "w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put("/profile", profileForm);
      // Update user di context agar nama di sidebar ikut berubah
      const token = localStorage.getItem("token");
      login(token, { ...user, name: res.data.data.name, email: res.data.data.email });
      toast.success("Profil berhasil diperbarui");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    if (pwForm.new_password.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }
    setSavingPw(true);
    try {
      await api.patch("/profile/change-password", {
        current_password: pwForm.current_password,
        new_password    : pwForm.new_password,
      });
      toast.success("Password berhasil diubah");
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengubah password");
    } finally { setSavingPw(false); }
  };

  const PwInput = ({ field, label, placeholder }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <input
          type={showPw[field] ? "text" : "password"}
          value={pwForm[field]}
          onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
          placeholder={placeholder}
          className={`${inputClass} pr-10`}
          required
        />
        <button type="button" onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
          {showPw[field] ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <AppLayout title="Profil Saya" subtitle="Kelola informasi akun Anda">
      <div className="max-w-xl space-y-6">

        {/* Avatar & info */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 capitalize mt-0.5">
              {user?.role?.replace(/_/g, " ")}
              {user?.store && ` · ${user.store.name}`}
              {user?.branch && ` · ${user.branch.name}`}
            </p>
          </div>
        </div>

        {/* Update profil */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Informasi Akun</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className={labelClass}>Nama</label>
              <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nama lengkap" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                placeholder="email@contoh.com" className={inputClass} required />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={savingProfile}
                className="h-9 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition cursor-pointer disabled:opacity-50">
                {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>

        {/* Ganti password */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Ganti Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <PwInput field="current_password" label="Password Saat Ini" placeholder="Password lama" />
            <PwInput field="new_password"     label="Password Baru"     placeholder="Min. 8 karakter" />
            <PwInput field="confirm_password" label="Konfirmasi Password Baru" placeholder="Ulangi password baru" />
            <div className="flex justify-end">
              <button type="submit" disabled={savingPw}
                className="h-9 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition cursor-pointer disabled:opacity-50">
                {savingPw ? "Menyimpan..." : "Ganti Password"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </AppLayout>
  );
}
