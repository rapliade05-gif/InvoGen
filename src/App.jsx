import React, { useState } from "react";
import jsPDF from "jspdf";

export default function App() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    client: "",
    items: [{ description: "", amount: "" }],
    notes: "",
  });

  const updateField = (field, value) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    const updated = [...invoiceData.items];
    updated[index][field] = value;
    setInvoiceData({ ...invoiceData, items: updated });
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: "", amount: "" }],
    });
  };

  const removeItem = (index) => {
    const updated = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: updated.length ? updated : [{ description: "", amount: "" }] });
  };

  const subtotal = invoiceData.items.reduce((sum, item) => {
    const num = parseFloat(item.amount.toString().replace(/[^0-9.-]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const formattedCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const generatePDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header background
    doc.setFillColor(32, 41, 64);
    doc.rect(0, 0, pageWidth, 90, "F");

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("InvoGen Invoice", 40, 50);

    doc.setFontSize(11);
    doc.text("Modern Invoice Generator", 40, 70);

    // Body
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(11);

    const today = new Date().toLocaleDateString("id-ID");

    doc.text(`Invoice No: ${invoiceData.invoiceNumber || "-"}`, 40, 120);
    doc.text(`Tanggal   : ${today}`, 40, 140);
    doc.text(`Kepada    : ${invoiceData.client || "-"}`, 40, 160);

    // Table header
    const startY = 190;
    const colNoX = 40;
    const colDescX = 80;
    const colAmountX = pageWidth - 140;

    doc.setFontSize(11);
    doc.setFillColor(243, 244, 246);
    doc.rect(30, startY - 18, pageWidth - 60, 26, "F");

    doc.text("No", colNoX, startY);
    doc.text("Deskripsi", colDescX, startY);
    doc.text("Jumlah", colAmountX, startY, { align: "right" });

    let y = startY + 20;

    invoiceData.items.forEach((item, index) => {
      if (!item.description && !item.amount) return;

      doc.text(String(index + 1), colNoX, y);
      doc.text(item.description || "-", colDescX, y);
      doc.text(
        formattedCurrency(
          parseFloat(item.amount.toString().replace(/[^0-9.-]/g, "")) || 0
        ),
        colAmountX,
        y,
        { align: "right" }
      );

      y += 20;
    });

    // Subtotal / total
    y += 10;
    doc.line(30, y, pageWidth - 30, y);
    y += 20;

    doc.setFontSize(12);
    doc.text("Total", colAmountX - 80, y);
    doc.text(formattedCurrency(subtotal), colAmountX, y, { align: "right" });

    // Notes
    if (invoiceData.notes) {
      y += 40;
      doc.setFontSize(11);
      doc.text("Catatan:", 40, y);
      const splitNotes = doc.splitTextToSize(invoiceData.notes, pageWidth - 80);
      doc.text(splitNotes, 40, y + 18);
    }

    doc.save("invoice-invogen.pdf");
  };

  return (
    <div className="app-root">
      <div className="app-card">
        <header className="app-header">
          <div>
            <h1 className="app-title">InvoGen</h1>
            <p className="app-subtitle">
              Modern invoice generator — simple, clean, dan terlihat profesional.
            </p>
          </div>
          <span className="app-badge">v1.0</span>
        </header>

        <div className="app-layout">
          {/* LEFT: Form */}
          <div className="app-column">
            <section className="section">
              <h2 className="section-title">Informasi Invoice</h2>
              <div className="field-grid">
                <div className="field">
                  <label>No. Invoice</label>
                  <input
                    className="input"
                    placeholder="Contoh: INV-001"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => updateField("invoiceNumber", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Nama Klien</label>
                  <input
                    className="input"
                    placeholder="Nama klien / perusahaan"
                    value={invoiceData.client}
                    onChange={(e) => updateField("client", e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="section">
              <h2 className="section-title">Item Tagihan</h2>

              {invoiceData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-main">
                    <input
                      className="input"
                      placeholder="Deskripsi pekerjaan / produk"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="item-amount">
                    <input
                      className="input input-amount"
                      placeholder="Nominal (Rp)"
                      value={item.amount}
                      onChange={(e) => updateItem(index, "amount", e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => removeItem(index)}
                    aria-label="Hapus item"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button type="button" className="btn-secondary" onClick={addItem}>
                + Tambah item
              </button>

              <div className="total-row">
                <span>Perkiraan Total</span>
                <span className="total-value">{formattedCurrency(subtotal)}</span>
              </div>
            </section>

            <section className="section">
              <h2 className="section-title">Catatan</h2>
              <textarea
                className="textarea"
                placeholder="Catatan tambahan untuk klien (opsional)"
                value={invoiceData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </section>
          </div>

          {/* RIGHT: Live preview */}
          <div className="app-column preview-column">
            <div className="preview-card">
              <div className="preview-header">
                <div>
                  <p className="preview-label">Invoice</p>
                  <p className="preview-id">
                    {invoiceData.invoiceNumber || "INV-XXX"}
                  </p>
                </div>
                <div className="preview-meta">
                  <p>{new Date().toLocaleDateString("id-ID")}</p>
                  <p className="preview-client">
                    {invoiceData.client || "Nama Klien"}
                  </p>
                </div>
              </div>

              <div className="preview-items">
                {invoiceData.items.map((item, index) => (
                  <div key={index} className="preview-item-row">
                    <div>
                      <p className="preview-item-title">
                        {item.description || "Deskripsi item"}
                      </p>
                    </div>
                    <p className="preview-item-amount">
                      {item.amount
                        ? formattedCurrency(
                            parseFloat(
                              item.amount.toString().replace(/[^0-9.-]/g, "")
                            ) || 0
                          )
                        : formattedCurrency(0)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="preview-footer">
                <div className="preview-total">
                  <span>Total</span>
                  <span className="preview-total-value">
                    {formattedCurrency(subtotal)}
                  </span>
                </div>
                {invoiceData.notes && (
                  <p className="preview-notes">{invoiceData.notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <button className="btn-primary btn-full" onClick={generatePDF}>
          Download Invoice PDF
        </button>
      </div>
    </div>
  );
}
