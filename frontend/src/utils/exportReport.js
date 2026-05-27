import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const fmt = (val) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val || 0);

/**
 * Export laporan transaksi ke Excel (.xlsx)
 */
export const exportTransactionsExcel = (transactions, filename = "laporan-transaksi") => {
  const rows = transactions.map(t => ({
    "Kode Transaksi" : t.transaction_code,
    "Tanggal"        : new Date(t.createdAt).toLocaleString("id-ID"),
    "Cabang"         : t.branch?.name || "-",
    "Kasir"          : t.cashier?.name || "-",
    "Jumlah Item"    : t.items?.length || 0,
    "Subtotal"       : parseFloat(t.total_amount),
    "Diskon"         : parseFloat(t.discount_amount),
    "Total"          : parseFloat(t.grand_total),
    "Metode Bayar"   : t.payment_method,
    "Dibayar"        : parseFloat(t.amount_paid),
    "Kembalian"      : parseFloat(t.change_amount),
    "Status"         : t.status,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transaksi");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * Export laporan transaksi ke PDF
 */
export const exportTransactionsPDF = (transactions, title = "Laporan Transaksi", filename = "laporan-transaksi") => {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(9);
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 22);

  autoTable(doc, {
    startY: 27,
    head: [["Kode", "Tanggal", "Cabang", "Kasir", "Total", "Metode", "Status"]],
    body: transactions.map(t => [
      t.transaction_code,
      new Date(t.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }),
      t.branch?.name || "-",
      t.cashier?.name || "-",
      fmt(t.grand_total),
      t.payment_method,
      t.status,
    ]),
    styles     : { fontSize: 8 },
    headStyles : { fillColor: [79, 70, 229] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Export laporan produk/stok ke Excel
 */
export const exportProductsExcel = (products, filename = "laporan-produk") => {
  const rows = products.flatMap(p =>
    (p.stocks || []).map(s => ({
      "Nama Produk"  : p.name,
      "SKU"          : p.sku,
      "Kategori"     : p.category?.name || "-",
      "Satuan"       : p.unit,
      "Harga Modal"  : parseFloat(p.cost_price),
      "Harga Jual"   : parseFloat(p.selling_price),
      "Cabang"       : s.branch?.name || "-",
      "Stok"         : s.stock,
      "Stok Minimum" : s.minimum_stock,
      "Status"       : s.stock <= s.minimum_stock ? "Menipis" : "Normal",
    }))
  );

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produk");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
