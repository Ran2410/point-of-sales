import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

const fmt = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val || 0);

const fmtDate = (iso) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2,
    "0")}`;
};

const METHOD_LABEL = {
  cash: "Tunai",
  qris: "QRIS",
  transfer: "Transfer",
  card: "Kartu",
};

export default function Receipt({ transaction, onClose, autoPrint = false, extraAction = null }) {
  const barcodeRef = useRef(null);

  // Render barcode ke <svg> setelah mount
  useEffect(() => {
    if (barcodeRef.current && transaction?.transaction_code) {
      JsBarcode(barcodeRef.current, transaction.transaction_code, {
        format: "CODE128",
        width: 1.5,
        height: 40,
        fontSize: 10,
        margin: 0,
        displayValue: false,
      });
    }
  }, [transaction]);

  // Auto-print setelah sukses (opsional)
  useEffect(() => {
    if (autoPrint) {
      setTimeout(() => window.print(), 500);
    }
  }, [autoPrint]);

  if (!transaction) return null;

  const { branch, store, cashier, items = [] } = transaction;
  const storeName = store?.name || branch?.name || "Toko";
  const storeCode = store?.code || branch?.code;

  return (
    <div className="receipt-print-wrapper fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 print:bg-transparent print:p-0 print:relative">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm print:shadow-none print:rounded-none print:max-w-none">
        
        {/* Toolbar — hide on print */}
        <div className="flex justify-end gap-2 p-3 border-b border-slate-100 print:hidden">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium cursor-pointer flex items-center gap-1"
          >
            🖨 Print
          </button>
          {extraAction}
        </div>

        {/* Receipt body — print area */}
        <div className="receipt-print p-5 font-mono text-[12px] text-slate-800">
          
          {/* Header toko */}
          <div className="text-center mb-2">
            <h2 className="text-base font-bold uppercase">{storeName}</h2>
            {storeCode && <p className="text-[10px] text-slate-500">Kode Toko: {storeCode}</p>}
            {branch?.address && <p className="text-[10px]">{branch.address}</p>}
            {branch?.phone && <p className="text-[10px]">Telp: {branch.phone}</p>}
          </div>

          <div className="border-t border-dashed border-slate-300 my-2"></div>

          {/* Info transaksi */}
          <div className="space-y-0.5 text-[11px]">
            <div className="flex justify-between">
              <span>No</span>
              <span className="font-semibold">{transaction.transaction_code}</span>
            </div>
            <div className="flex justify-between">
              <span>Tgl</span>
              <span>{fmtDate(transaction.createdAt)}</span>
            </div>
            {cashier?.name && (
              <div className="flex justify-between">
                <span>Kasir</span>
                <span>{cashier.name}</span>
              </div>
            )}
            {branch?.name && (
              <div className="flex justify-between">
                <span>Cabang</span>
                <span>{branch.name}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-slate-300 my-2"></div>

          {/* Items */}
          <div className="space-y-1">
            {items.map((item, i) => (
              <div key={i} className="text-[11px]">
                <div className="font-medium">{item.product_name}</div>
                <div className="flex justify-between text-slate-600">
                  <span>{item.quantity} x {fmt(item.unit_price)}</span>
                  <span className="font-semibold">{fmt(item.subtotal)}</span>
                  </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-300 my-2"></div>

          {/* Totals */}
          <div className="space-y-0.5 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{fmt(transaction.total_amount)}</span>
            </div>
            {parseFloat(transaction.discount_amount) > 0 && (
              <div className="flex justify-between">
                <span>Diskon</span>
                <span>-{fmt(transaction.discount_amount)}</span>
              </div>
            )}
            {parseFloat(transaction.tax_amount) > 0 && (
              <div className="flex justify-between">
                <span>Pajak</span>
                <span>{fmt(transaction.tax_amount)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-slate-300 my-2"></div>

          <div className="flex justify-between text-sm font-bold">
            <span>TOTAL</span>
            <span>{fmt(transaction.grand_total)}</span>
          </div>

          <div className="mt-2 space-y-0.5 text-[11px]">
            <div className="flex justify-between">
              <span>Bayar ({METHOD_LABEL[transaction.payment_method] || transaction.payment_method})</span>
              <span>{fmt(transaction.amount_paid)}</span>
            </div>
            {parseFloat(transaction.change_amount) > 0 && (
              <div className="flex justify-between font-semibold">
                <span>Kembali</span>
                <span>{fmt(transaction.change_amount)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-slate-300 my-3"></div>

          {/* Footer */}
          <div className="text-center text-[10px] space-y-0.5">
            <p className="font-semibold">TERIMA KASIH</p>
            <p>Barang yang sudah dibeli</p>
            <p>tidak dapat dikembalikan</p>
          </div>

          <div className="border-t border-dashed border-slate-300 my-3"></div>

          {/* Barcode */}
          <div className="flex justify-center">
            <svg ref={barcodeRef} className="receipt-barcode"></svg>
          </div>
          <p className="text-center text-[9px] text-slate-500 mt-1">
            {transaction.transaction_code}
          </p>
        </div>
      </div>
    </div>
  );
}