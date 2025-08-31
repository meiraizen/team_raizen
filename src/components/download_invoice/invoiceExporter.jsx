import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as ReactDOMClient from 'react-dom/client';
import InvoiceRenderer from './InvoiceRenderer';

/**
 * Renders an invoice to a PNG Blob.
 */
async function renderInvoiceToBlob(invoice) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-10000px';
  document.body.appendChild(container);

  const root = ReactDOMClient.createRoot(container);
  root.render(<InvoiceRenderer data={invoice} />);

  // Wait a bit for React to render
  await new Promise((res) => setTimeout(res, 80));

  const canvas = await html2canvas(container, { scale: 2, useCORS: true });
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));

  root.unmount();
  document.body.removeChild(container);

  return blob;
}

/**
 * Exports invoices either individually (image) or as a ZIP archive.
 */
export async function exportInvoices({
  invoices,
  bulkMode,
  onProgress,
  cancelRef,
}) {
  const zip = new JSZip();

  for (let i = 0; i < invoices.length; i++) {
    if (cancelRef.current) break;

    const invoice = invoices[i];
    const blob = await renderInvoiceToBlob(invoice);

    if (bulkMode) {
      zip.file(`invoice_${invoice.id}.png`, blob);
    } else {
      saveAs(blob, `invoice_${invoice.id}.png`);
    }

    if (onProgress) onProgress(i + 1, invoices.length);
  }

  if (bulkMode && !cancelRef.current) {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const from = invoices[0].id;
    const to = invoices[invoices.length - 1].id;
    saveAs(zipBlob, `invoices_${from}_to_${to}.zip`);
  }
}
