function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
  downloadBlob(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

// SpreadsheetML/HTML-table technique: no third-party dependency, opens natively in Excel.
export function exportExcel(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (val: string | number) =>
    String(val).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const headerRow = `<tr>${headers.map((h) => `<th>${escape(h)}</th>`).join("")}</tr>`;
  const bodyRows = rows.map((r) => `<tr>${r.map((c) => `<td>${escape(c)}</td>`).join("")}</tr>`).join("");
  const html = `<html><head><meta charset="UTF-8"></head><body><table border="1">${headerRow}${bodyRows}</table></body></html>`;
  downloadBlob(html, `${filename}.xls`, "application/vnd.ms-excel");
}

export async function exportPdf(title: string, headers: string[], rows: (string | number)[][], filename: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  const colWidth = 182 / headers.length;
  let y = 28;

  headers.forEach((h, i) => doc.text(String(h), 14 + i * colWidth, y));
  y += 4;
  doc.setLineWidth(0.2);
  doc.line(14, y, 196, y);
  y += 6;

  rows.forEach((row) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    row.forEach((cell, i) => doc.text(String(cell), 14 + i * colWidth, y));
    y += 7;
  });

  doc.save(`${filename}.pdf`);
}
