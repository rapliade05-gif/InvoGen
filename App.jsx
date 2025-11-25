import { useState } from "react";
import jsPDF from "jspdf";

export default function App() {
  const [invoiceData, setInvoiceData] = useState({
    client: "",
    items: [{ description: "", amount: "" }],
    notes: "",
  });

  const updateItem = (index, field, value) => {
    const updated = [...invoiceData.items];
    updated[index][field] = value;
    setInvoiceData({ ...invoiceData, items: updated });
  };

  const addItem = () => {
    setInvoiceData({ ...invoiceData, items: [...invoiceData.items, { description: "", amount: "" }] });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("InvoGen - Invoice", 20, 20);

    doc.setFontSize(12);
    doc.text(`Client: ${invoiceData.client}`, 20, 35);

    let y = 50;
    invoiceData.items.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.description} - Rp ${item.amount}`, 20, y);
      y += 10;
    });

    doc.text(`Notes: ${invoiceData.notes}`, 20, y + 10);
    doc.save("invoice.pdf");
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1>InvoGen</h1>

      <label>Client Name</label>
      <input
        style={{ width: "100%", marginBottom: 10 }}
        value={invoiceData.client}
        onChange={(e) => setInvoiceData({ ...invoiceData, client: e.target.value })}
      />

      <h2>Items</h2>
      {invoiceData.items.map((item, index) => (
        <div key={index}>
          <input
            placeholder="Description"
            value={item.description}
            onChange={(e) => updateItem(index, "description", e.target.value)}
          />
          <input
            placeholder="Amount"
            value={item.amount}
            onChange={(e) => updateItem(index, "amount", e.target.value)}
          />
        </div>
      ))}
      <button onClick={addItem}>Add Item</button>

      <h3>Notes</h3>
      <textarea
        style={{ width: "100%", height: 80 }}
        value={invoiceData.notes}
        onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
      />

      <button onClick={generatePDF}>Download PDF</button>
    </div>
  );
}
