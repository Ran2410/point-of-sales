import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

/**
 * Render barcode EAN-13 sebagai SVG menggunakan JsBarcode.
 *
 * Props:
 *   value    — string barcode (EAN-13)
 *   width    — lebar bar (default 1.2)
 *   height   — tinggi bar dalam px (default 50)
 *   showText — tampilkan angka di bawah barcode (default true)
 */
export default function BarcodeDisplay({ value, width = 1.2, height = 50, showText = true }) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current || !value) return;
        try {
            JsBarcode(svgRef.current, value, {
                format      : "EAN13",
                width,
                height,
                displayValue: showText,
                fontSize    : 10,
                margin      : 2,
                background  : "transparent",
                lineColor   : "#0f172a",
            });
        } catch {
            // Barcode tidak valid — biarkan kosong
        }
    }, [value, width, height, showText]);

    if (!value) return null;

    return (
        <svg
            ref={svgRef}
            style={{
                display   : "block",
                maxWidth  : showText ? "120px" : "80px",
                height    : "auto",
                verticalAlign: "middle",
            }}
        />
    );
}
