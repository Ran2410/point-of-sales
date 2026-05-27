import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProducts } from "../../lib/productApi";
import { createTransaction } from "../../lib/transactionApi";
import AppLayout from "../../components/AppLayout";
import { toast } from "sonner";

// ─── Format Rupiah ────────────────────────────────────────────────────────────
const fmt = (val) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val || 0);

// ─── Payment methods ──────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: "cash",     label: "Tunai" },
  { value: "qris",     label: "QRIS" },
  { value: "transfer", label: "Transfer" },
  { value: "card",     label: "Kartu" },
];

// ─── Receipt Modal ────────────────────────────────────────────────────────────
function ReceiptModal({ transaction, onClose, onNewTransaction }) {
  if (!transaction) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6 text-center border-b border-slate-100">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-900">Transaksi Berhasil</h3>
          <p className="text-xs text-slate-400 mt-1">{transaction.transaction_code}</p>
        </div>

        <div className="p-5 space-y-3">
          {transaction.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-slate-600">{item.product_name} <span className="text-slate-400">×{item.quantity}</span></span>
              <span className="font-medium text-slate-800">{fmt(item.subtotal)}</span>
            </div>
          ))}
          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span><span>{fmt(transaction.total_amount)}</span>
            </div>
            {parseFloat(transaction.discount_amount) > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Diskon</span><span>-{fmt(transaction.discount_amount)}</span>
              </div>
            )}
            {parseFloat(transaction.tax_amount) > 0 && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>Pajak</span><span>{fmt(transaction.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 pt-1">
              <span>Total</span><span>{fmt(transaction.grand_total)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Bayar ({PAYMENT_METHODS.find(p => p.value === transaction.payment_method)?.label})</span>
              <span>{fmt(transaction.amount_paid)}</span>
            </div>
            {parseFloat(transaction.change_amount) > 0 && (
              <div className="flex justify-between text-sm font-semibold text-indigo-600">
                <span>Kembalian</span><span>{fmt(transaction.change_amount)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex gap-2 border-t border-slate-100">
          <button onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition cursor-pointer">
            Tutup
          </button>
          <button onClick={onNewTransaction}
            className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition cursor-pointer">
            Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ open, cart, onClose, onConfirm, processing }) {
  const [method, setMethod]     = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [discount, setDiscount] = useState("0");

  const subtotal   = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const discountAmt = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, subtotal - discountAmt);
  const change     = method === "cash" ? Math.max(0, (parseFloat(amountPaid) || 0) - grandTotal) : 0;

  useEffect(() => {
    if (open) { setMethod("cash"); setAmountPaid(""); setDiscount("0"); }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    const paid = method === "cash" ? parseFloat(amountPaid) : grandTotal;
    if (method === "cash" && paid < grandTotal) return;
    onConfirm({ payment_method: method, amount_paid: paid, discount_amount: discountAmt, grand_total: grandTotal });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Pembayaran</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Total */}
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Total Pembayaran</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{fmt(grandTotal)}</p>
          </div>

          {/* Diskon */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Diskon (Rp)</label>
            <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Metode Pembayaran</label>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map(m => (
                <button key={m.value} type="button" onClick={() => setMethod(m.value)}
                  className={`h-10 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    method === m.value
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Jumlah bayar (hanya untuk tunai) */}
          {method === "cash" && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Jumlah Dibayar (Rp)</label>
              <input type="number" min={grandTotal} value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
                placeholder={String(grandTotal)}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
              {/* Quick amount buttons */}
              <div className="flex gap-2 mt-2">
                {[grandTotal, Math.ceil(grandTotal / 10000) * 10000, Math.ceil(grandTotal / 50000) * 50000, Math.ceil(grandTotal / 100000) * 100000]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .slice(0, 4)
                  .map(v => (
                    <button key={v} type="button" onClick={() => setAmountPaid(String(v))}
                      className="flex-1 h-8 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                      {fmt(v)}
                    </button>
                  ))}
              </div>
              {change > 0 && (
                <p className="mt-2 text-sm font-semibold text-indigo-600">Kembalian: {fmt(change)}</p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleSubmit} disabled={processing || (method === "cash" && (parseFloat(amountPaid) || 0) < grandTotal)}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {processing ? "Memproses..." : `Bayar ${fmt(grandTotal)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main CashierPOS ──────────────────────────────────────────────────────────
export default function CashierPOS() {
  const { user } = useAuth();

  const [products, setProducts]   = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [cart, setCart]           = useState([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [processing, setProcessing]   = useState(false);
  const [receipt, setReceipt]         = useState(null);
  const searchRef = useRef(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    getProducts({ search, limit: 50, is_active: "true" })
      .then(r => setProducts(r.data?.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ─── Cart operations ─────────────────────────────────────────────────────────
  const addToCart = (product) => {
    const branchStock = product.stocks?.[0];
    const availableStock = branchStock?.stock ?? 0;

    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= availableStock) return prev; // jangan melebihi stok
        return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      if (availableStock === 0) return prev;
      return [...prev, {
        product_id  : product.id,
        product_name: product.name,
        sku         : product.sku,
        unit        : product.unit,
        unit_price  : parseFloat(product.selling_price),
        quantity    : 1,
        max_stock   : availableStock,
        discount    : 0,
      }];
    });
  };

  const updateQty = (product_id, qty) => {
    if (qty <= 0) { removeFromCart(product_id); return; }
    setCart(prev => prev.map(i => {
      if (i.product_id !== product_id) return i;
      return { ...i, quantity: Math.min(qty, i.max_stock) };
    }));
  };

  const removeFromCart = (product_id) => setCart(prev => prev.filter(i => i.product_id !== product_id));
  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((s, i) => s + i.unit_price * i.quantity - i.discount, 0);

  // ─── Checkout ─────────────────────────────────────────────────────────────────
  const handlePaymentConfirm = async ({ payment_method, amount_paid, discount_amount }) => {
    setProcessing(true);
    try {
      const res = await createTransaction({
        items: cart.map(i => ({
          product_id: i.product_id,
          quantity  : i.quantity,
          discount  : i.discount,
        })),
        payment_method,
        amount_paid,
        discount_amount,
        tax_amount: 0,
      });
      setReceipt(res.data.data);
      setPaymentOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Transaksi gagal");
    } finally {
      setProcessing(false);
    }
  };

  const handleNewTransaction = () => {
    setReceipt(null);
    clearCart();
    fetchProducts(); // refresh stok
    searchRef.current?.focus();
  };

  return (
    <AppLayout title="Kasir" subtitle={`${user?.branch?.name || "Cabang"} · ${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">

        {/* ─── Kiri: Produk ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search */}
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk atau scan barcode..."
              className="w-full pl-9 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm">Produk tidak ditemukan</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {products.map(p => {
                  const stock = p.stocks?.[0]?.stock ?? 0;
                  const inCart = cart.find(i => i.product_id === p.id);
                  const outOfStock = stock === 0;

                  return (
                    <button key={p.id} type="button" onClick={() => addToCart(p)} disabled={outOfStock}
                      className={`text-left bg-white rounded-xl border p-3 transition cursor-pointer group ${
                        outOfStock
                          ? "border-slate-100 opacity-50 cursor-not-allowed"
                          : inCart
                            ? "border-indigo-300 ring-1 ring-indigo-200 bg-indigo-50/30"
                            : "border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                      }`}>
                      <p className="text-sm font-medium text-slate-800 leading-tight line-clamp-2">{p.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.unit}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm font-bold text-indigo-600">{fmt(p.selling_price)}</p>
                        <span className={`text-xs font-medium ${stock <= 5 ? "text-amber-500" : "text-slate-400"}`}>
                          Stok: {stock}
                        </span>
                      </div>
                      {inCart && (
                        <div className="mt-1.5 text-xs text-indigo-600 font-medium">
                          ✓ {inCart.quantity} di keranjang
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Kanan: Keranjang ─────────────────────────────────────────────── */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Keranjang
              {cart.length > 0 && <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 rounded-full px-2 py-0.5">{cart.length}</span>}
            </h2>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 transition cursor-pointer">Kosongkan</button>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-300">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0Zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0Z" />
                </svg>
                <p className="text-sm">Keranjang kosong</p>
              </div>
            ) : cart.map(item => (
              <div key={item.product_id} className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{item.product_name}</p>
                  <p className="text-xs text-slate-400">{fmt(item.unit_price)} / {item.unit}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                    className="h-6 w-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm transition cursor-pointer">−</button>
                  <span className="w-6 text-center text-xs font-semibold text-slate-800">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product_id, item.quantity + 1)}
                    disabled={item.quantity >= item.max_stock}
                    className="h-6 w-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm transition cursor-pointer disabled:opacity-40">+</button>
                </div>
                <div className="text-right shrink-0 w-16">
                  <p className="text-xs font-semibold text-slate-800">{fmt(item.unit_price * item.quantity)}</p>
                  <button onClick={() => removeFromCart(item.product_id)}
                    className="text-xs text-red-400 hover:text-red-600 transition cursor-pointer">hapus</button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} item)</span>
              <span className="font-semibold text-slate-800">{fmt(cartTotal)}</span>
            </div>
            <button onClick={() => setPaymentOpen(true)} disabled={cart.length === 0}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              Bayar {cart.length > 0 ? fmt(cartTotal) : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentOpen}
        cart={cart}
        onClose={() => setPaymentOpen(false)}
        onConfirm={handlePaymentConfirm}
        processing={processing}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        transaction={receipt}
        onClose={() => setReceipt(null)}
        onNewTransaction={handleNewTransaction}
      />
    </AppLayout>
  );
}
