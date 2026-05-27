export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center gap-1 mt-4">
            <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">
                ‹
            </button>
            {pages.map(p => (
                <button key={p} onClick={() => onPageChange(p)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition cursor-pointer ${
                        p === page
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}>
                    {p}
                </button>
            ))}
            <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">
                ›
            </button>
        </div>
    );
}
