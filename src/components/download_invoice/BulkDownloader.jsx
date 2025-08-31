import React, { useState, useEffect } from 'react';
import mockData from './mock-invoices.json';
import { useInvoiceValidator } from './useInvoiceValidator';
import { useCancelableTask } from './useCancelableTask';
import { exportInvoices } from './invoiceExporter';
import styles from './BulkDownloader.module.css';

export default function BulkDownloader() {
  const [form, setForm] = useState({ startId: '', endId: '', bulkMode: false });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const { errors, validate, resetErrors } = useInvoiceValidator();
  const { cancelRef, start, cancel } = useCancelableTask();

  // Warn before unload if downloading
  useEffect(() => {
    const beforeUnload = (e) => {
      if (loading) {
        e.preventDefault();
        e.returnValue =
          'Download is in progress. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [loading]);

  const resetForm = () => {
    setForm({ startId: '', endId: '', bulkMode: false });
    setProgress({ current: 0, total: 0 });
    resetErrors();
  };

  const handleDownload = async () => {
    if (!validate(form)) return;

    const from = parseInt(form.startId, 10);
    const to = form.bulkMode && form.endId ? parseInt(form.endId, 10) : from;

    const invoices = mockData.filter((inv) => inv.id >= from && inv.id <= to);
    if (invoices.length === 0) {
      alert('No invoice(s) found for that ID or range.');
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: invoices.length });
    start();

    await exportInvoices({
      invoices,
      bulkMode: form.bulkMode,
      cancelRef,
      onProgress: (current, total) => setProgress({ current, total }),
    });

    setLoading(false);
    resetForm();
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Invoice Downloader</h2>

      <label className={styles.label}>
        <input
          type="checkbox"
          checked={form.bulkMode}
          onChange={() => setForm((f) => ({ ...f, bulkMode: !f.bulkMode }))}
          disabled={loading}
          className={styles.checkbox}
        />
        Enable Bulk Mode
      </label>

      <div className={styles.inputGroup}>
        <input
          type="number"
          placeholder="Start ID"
          value={form.startId}
          onChange={(e) => setForm((f) => ({ ...f, startId: e.target.value }))}
          disabled={loading}
          className={styles.input}
        />
        {errors.startId && <p className={styles.error}>{errors.startId}</p>}

        {form.bulkMode && (
          <>
            <input
              type="number"
              placeholder="End ID"
              value={form.endId}
              onChange={(e) =>
                setForm((f) => ({ ...f, endId: e.target.value }))
              }
              disabled={loading}
              className={styles.input}
            />
            {errors.endId && <p className={styles.error}>{errors.endId}</p>}
          </>
        )}
      </div>

      <div className={styles.buttonGroup}>
        {!loading ? (
          <button
            onClick={handleDownload}
            className={`${styles.button} ${styles.success}`}
          >
            {form.bulkMode ? 'Download ZIP' : 'Download Image'}
          </button>
        ) : (
          <>
            <p className={styles.progress}>
              ⏳ Generating {progress.current}/{progress.total}...
            </p>
            <button
              onClick={cancel}
              className={`${styles.button} ${styles.danger}`}
            >
              Cancel
            </button>
          </>
        )}

        {!loading && (
          <button
            onClick={resetForm}
            className={`${styles.button} ${styles.gray}`}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
