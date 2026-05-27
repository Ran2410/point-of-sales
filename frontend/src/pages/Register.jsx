import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ store_name: "", owner_name: "", email: "", password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [storeCode, setStoreCode] = useState("");

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        store_name: form.store_name,
        owner_name: form.owner_name,
        email     : form.email,
        password  : form.password,
      });
      setStoreCode(res.data.data.store_code);
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Pendaftaran gagal");
    } finally { setLoading(false); }
  };

  const inputClass = "w-full rounded-xl border border-gray-300 bg-gray-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Pendaftaran Berhasil!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Akun Anda sedang menunggu persetujuan admin. Anda akan mendapat notifikasi setelah disetujui.
          </p>
          <div className="mt-4 bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Kode Toko Anda</p>
            <p className="text-2xl font-bold font-mono text-indigo-600 mt-1">{storeCode}</p>
            <p className="text-xs text-slate-400 mt-1">Simpan kode ini untuk referensi</p>
          </div>
          <button onClick={() => navigate("/login")}
            className="mt-6 w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition cursor-pointer">
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
            <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">Daftar Sekarang</h2>
          <p className="mt-3 text-indigo-200/70 text-lg leading-relaxed">
            Mulai kelola bisnis Anda dengan sistem POS yang lengkap dan mudah digunakan.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-gray-900">Daftarkan Toko Anda</h2>
              <p className="text-gray-500 text-sm mt-1">Isi data di bawah untuk memulai</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Toko</label>
                <input name="store_name" value={form.store_name} onChange={handleChange}
                  placeholder="Toko Mineral" className={inputClass} required />
                <p className="mt-1 text-xs text-gray-400">Kode toko akan digenerate otomatis</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Owner</label>
                <input name="owner_name" value={form.owner_name} onChange={handleChange}
                  placeholder="Nama lengkap Anda" className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="email@contoh.com" className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                    placeholder="Min. 8 karakter" className={`${inputClass} pr-11`} required />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
                <input type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange}
                  placeholder="Ulangi password" className={inputClass} required />
              </div>

              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
