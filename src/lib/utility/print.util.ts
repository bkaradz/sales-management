import { jsPDF } from 'jspdf';

export async function generatePDF(elementId: string, documentName: string) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'letter',
    putOnlyUsedFonts: true,
    compress: true
  });

  const source = document.getElementById(elementId);

  if (!source) throw new Error('Doc Element not found');

  await doc.html(source, {
    width: 842,
    windowWidth: 1123,
    // margin: 10
  });

  doc.save(`${documentName}.pdf`);
}