import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ user, sidebarOpen, setSidebarOpen, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = useMemo(() => {
    if (user?.role === "admin") {
      return [
        { label: "Dashboard", path: "/admin/dashboard", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )},
        { label: "Toko", path: "/admin/stores", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )},
        { label: "Pengguna", path: "/admin/users", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )},
      ];
    }

    const dashPath = user?.role === "owner"
      ? "/owner/dashboard"
      : user?.role === "branch_owner"
      ? "/branch/dashboard"
      : "/pos";

    const dashIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );

    const trxIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    );

    const kasirIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    );

    // ─── Cashier: menu minimal ────────────────────────────────────────────────
    if (user?.role === "cashier") {
      return [
        { label: "Kasir",     path: "/pos",          icon: kasirIcon },
        { label: "Transaksi", path: "/transactions",  icon: trxIcon   },
      ];
    }

    const common = [
      { label: "Dashboard", path: dashPath, icon: dashIcon },
    ];

    if (user?.role === "owner") {
      return [
        ...common,
        { label: "Transaksi", path: "/owner/transactions", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )},
        { label: "Kategori", path: "/owner/categories", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        )},
        { label: "Produk", path: "/owner/products", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )},
        { label: "Manajemen Cabang", path: "/owner/branches", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )},
        { label: "Manajemen User", path: "/owner/users", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )},
        { label: "Laporan Global", path: "/owner/reports", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )},
      ];
    }

    if (user?.role === "branch_owner") {
      return [
        ...common,
        { label: "Kasir", path: "/pos", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )},
        { label: "Transaksi", path: "/branch/transactions", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )},
        { label: "Produk & Stok", path: "/branch/products", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )},
        { label: "Manajemen User", path: "/branch/users", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )},
        { label: "Laporan Cabang", path: "/branch/reports", icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )},
      ];
    }

    // fallback (tidak seharusnya tercapai)
    return [{ label: "Kasir", path: "/pos", icon: kasirIcon }];
  }, [user?.role]);

  const isActive = (item) => {
    if (!item.path) return false;
    const exactPaths = ["/owner/dashboard", "/branch/dashboard", "/pos", "/admin/dashboard", "/transactions", "/owner/transactions", "/branch/transactions"];
    if (exactPaths.includes(item.path)) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };
  const onClickMenu = (item) => {
    if (!item.path) return;
    navigate(item.path);
    setSidebarOpen(false);
  };

  const roleLabel = user?.role === "admin"
    ? "Super Admin"
    : user?.role?.replace(/_/g, " ") || "-";

  const NavItems = () => (
    <nav className="px-3 py-4 space-y-0.5 flex-1 overflow-auto">
      {menuItems.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onClickMenu(item)}
          disabled={!item.path}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all
            ${!item.path
              ? "text-slate-500 cursor-default"
              : isActive(item)
                ? "border-l-[3px] border-indigo-400 bg-white/5 text-white pl-[9px] cursor-pointer"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer"
            }`}
        >
          <span className={`shrink-0 ${isActive(item) ? "text-indigo-400" : ""}`}>
            {item.icon}
          </span>
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );

  const UserInfo = () => (
    <div className="px-4 py-4 border-b border-white/10">
      <button
        type="button"
        onClick={() => { navigate("/profile"); setSidebarOpen(false); }}
        className="flex items-center gap-3 w-full text-left hover:opacity-80 transition cursor-pointer"
      >
        <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 text-xs font-semibold shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.name || "Unknown"}</p>
          <p className="text-xs capitalize text-slate-400 truncate">{roleLabel}</p>
          {user?.store && (
            <p className="text-xs text-indigo-400 truncate">{user.store.name}</p>
          )}
        </div>
      </button>
    </div>
  );

  const SidebarContent = () => (
    <>
      <div className="h-16 px-5 flex items-center border-b border-white/10 shrink-0">
        <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-semibold text-white leading-tight">Point of Sales</p>
          <p className="text-xs text-slate-400 capitalize leading-tight">{roleLabel}</p>
        </div>
      </div>

      <UserInfo />
      <NavItems />

      <div className="p-3 border-t border-white/10 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-60 flex-col bg-[#0f172a] shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-40 h-full w-60 bg-[#0f172a] flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
