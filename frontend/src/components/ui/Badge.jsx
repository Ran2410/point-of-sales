const variants = {
    success : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
    danger  : "bg-red-50 text-red-600 ring-1 ring-red-200/80",
    warning : "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",
    info    : "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/80",
    default : "bg-slate-100 text-slate-500 ring-1 ring-slate-200/80",
};

export default function Badge({ variant = "default", children }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide ${variants[variant]}`}>
            {children}
        </span>
    );
}
