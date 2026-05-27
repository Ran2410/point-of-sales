import Modal from "./Modal";

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Konfirmasi",
    variant = "danger",
    loading = false,
}) {
    const btnClass =
        variant === "danger"
            ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
            : variant === "success"
            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm";

    const iconColor =
        variant === "danger"
            ? "text-red-500 bg-red-50"
            : variant === "success"
            ? "text-emerald-500 bg-emerald-50"
            : "text-amber-500 bg-amber-50";

    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
            <div className="flex gap-4">
                <div className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${iconColor}`}>
                    {variant === "danger" ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    ) : variant === "success" ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                        </svg>
                    )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pt-1">{message}</p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                >
                    Batal
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition cursor-pointer disabled:opacity-50 ${btnClass}`}
                >
                    {loading ? "Memproses..." : confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
