import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const goHome = () => {
    if (!user) { navigate("/login"); return; }
    if (user.role === "admin")        navigate("/admin/dashboard");
    else if (user.role === "owner")   navigate("/owner/dashboard");
    else if (user.role === "branch_owner") navigate("/branch/dashboard");
    else navigate("/pos");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-slate-200 leading-none select-none">404</div>
        <h1 className="mt-4 text-xl font-bold text-slate-800">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-500">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <button onClick={goHome}
          className="mt-6 h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition cursor-pointer">
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
