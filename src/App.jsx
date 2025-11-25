import React, { useState } from "react";
import jsPDF from "jspdf";

export default function App() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    client: "",
    businessName: "",
    businessAddress: "",
    items: [{ description: "", qty: "1", amount: "" }],
    notes: "",
    logoDataUrl: "",
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
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", qty: "1", amount: "" }],
    }));
  };

  const removeItem = (index) => {
    const updated = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({
      ...invoiceData,
      items: updated.length ? updated : [{ description: "", qty: "1", amount: "" }],
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateField("logoDataUrl", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const cleanNumber = (value) =>
    parseFloat(value?.toString().replace(/[^0-9.-]/g, "")) || 0;

  const lineTotal = (item) => {
    const qty = cleanNumber(item.qty || "0");
    const price = cleanNumber(item.amount || "0");
    return qty * price;
  };

  const subtotal = invoiceData.items.reduce((sum, item) => {
    if (!item.description && !item.amount && !item.qty) return sum;
    return sum + lineTotal(item);
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

    // HEADER BACKGROUND
    doc.setFillColor(32, 41, 64);
    doc.rect(0, 0, pageWidth, 100, "F");

    // LOGO (kalau ada)
    if (invoiceData.logoDataUrl) {
      try {
        const imgType = invoiceData.logoDataUrl.includes("image/png")
          ? "PNG"
          : "JPEG";
        doc.addImage(
          invoiceData.logoDataUrl,
          imgType,
          pageWidth - 150,
          24,
          90,
          52
        );
      } catch (e) {
        console.warn("Gagal render logo di PDF:", e);
      }
    }

    // HEADER TEXT
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(invoiceData.businessName || "InvoGen Invoice", 40, 45);

    doc.setFontSize(11);
    const today = new Date().toLocaleDateString("id-ID");
    doc.text(`Tanggal: ${today}`, 40, 63);
    if (invoiceData.businessAddress) {
      const addr = doc.splitTextToSize(
        invoiceData.businessAddress,
        pageWidth - 200
      );
      doc.text(addr, 40, 80);
    }

    // BODY INFO
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(11);

    let y = 120;
    doc.text(`Invoice No : ${invoiceData.invoiceNumber || "-"}`, 40, y);
    y += 18;
    doc.text(`Ditagihkan ke : ${invoiceData.client || "-"}`, 40, y);

    // TABLE HEADER
    y += 30;
    const colNoX = 40;
    const colDescX = 60;
    const colQtyX = pageWidth - 240;
    const colPriceX = pageWidth - 170;
    const colTotalX = pageWidth - 60;

    doc.setFillColor(243, 244, 246);
    doc.rect(30, y - 18, pageWidth - 60, 26, "F");

    doc.text("No", colNoX, y);
    doc.text("Deskripsi", colDescX, y);
    doc.text("Qty", colQtyX, y, { align: "right" });
    doc.text("Harga", colPriceX, y, { align: "right" });
    doc.text("Total", colTotalX, y, { align: "right" });

    y += 22;

    invoiceData.items.forEach((item, index) => {
      if (!item.description && !item.amount && !item.qty) return;

      const qty = cleanNumber(item.qty || "0");
      const price = cleanNumber(item.amount || "0");
      const total = qty * price;

      doc.text(String(index + 1), colNoX, y);
      doc.text(item.description || "-", colDescX, y);
      doc.text(String(qty || 0), colQtyX, y, { align: "right" });
      doc.text(formattedCurrency(price), colPriceX, y, { align: "right" });
      doc.text(formattedCurrency(total), colTotalX, y, { align: "right" });

      y += 20;
    });

    // SUBTOTAL / TOTAL
    y += 10;
    doc.line(30, y, pageWidth - 30, y);
    y += 20;

    doc.setFontSize(12);
    doc.text("Total", colPriceX, y);
    doc.text(formattedCurrency(subtotal), colTotalX, y, { align: "right" });

    // NOTES
    if (invoiceData.notes) {
      y += 36;
      doc.setFontSize(11);
      doc.text("Catatan:", 40, y);
      const splitNotes = doc.splitTextToSize(
        invoiceData.notes,
        pageWidth - 80
      );
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
          <span className="app-badge">v1.1</span>
        </header>

        <div className="app-layout">
          {/* LEFT: FORM */}
          <div className="app-column">
            <section className="section">
              <h2 className="section-title">Bisnis & Klien</h2>
              <div className="field-grid">
                <div className="field">
                  <label>Nama Bisnis</label>
                  <input
                    className="input"
                    placeholder="Nama usaha / brand"
                    value={invoiceData.businessName}
                    onChange={(e) =>
                      updateField("businessName", e.target.value)
                    }
                  />
                </div>
                <div className="field">
                  <label>No. Invoice</label>
                  <input
                    className="input"
                    placeholder="Contoh: INV-001"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) =>
                      updateField("invoiceNumber", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="field-grid" style={{ marginTop: 8 }}>
                <div className="field">
                  <label>Alamat Bisnis</label>
                  <textarea
                    className="textarea"
                    placeholder="Alamat lengkap bisnis untuk ditampilkan di invoice"
                    value={invoiceData.businessAddress}
                    onChange={(e) =>
                      updateField("businessAddress", e.target.value)
                    }
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
                  <div className="logo-upload">
                    <label className="logo-label">Logo Bisnis (opsional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="input"
                      onChange={handleLogoUpload}
                    />
                    {invoiceData.logoDataUrl && (
                      <div className="logo-preview">
                        <img
                          src={invoiceData.logoDataUrl}
                          alt="Logo bisnis"
                          className="logo-preview-img"
                        />
                      </div>
                    )}
                  </div>
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
                      className="input"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateItem(index, "qty", e.target.value)}
                    />
                  </div>
                  <div className="item-amount">
                    <input
                      className="input input-amount"
                      placeholder="Harga / unit (Rp)"
                      value={item.amount}
                      onChange={(e) =>
                        updateItem(index, "amount", e.target.value)
                      }
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
                <span className="total-value">
                  {formattedCurrency(subtotal)}
                </span>
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

          {/* RIGHT: LIVE PREVIEW */}
          <div className="app-column preview-column">
            <div className="preview-card">
              <div className="preview-header">
                <div>
                  <p className="preview-label">
                    {invoiceData.businessName || "Nama Bisnis"}
                  </p>
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

              {invoiceData.businessAddress && (
                <p className="preview-notes" style={{ marginBottom: 6 }}>
                  {invoiceData.businessAddress}
                </p>
              )}

              <div className="preview-items">
                {invoiceData.items.map((item, index) => {
                  const qty = cleanNumber(item.qty || "0");
                  const price = cleanNumber(item.amount || "0");
                  const total = qty * price;

                  return (
                    <div key={index} className="preview-item-row">
                      <div>
                        <p className="preview-item-title">
                          {item.description || "Deskripsi item"}
                        </p>
                        <p className="preview-notes">
                          Qty {qty || 0} × {formattedCurrency(price)}
                        </p>
                      </div>
                      <p className="preview-item-amount">
                        {formattedCurrency(total)}
                      </p>
                    </div>
                  );
                })}
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
