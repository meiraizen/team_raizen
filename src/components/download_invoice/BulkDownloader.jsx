import React, { useState, useEffect } from 'react';
import { useCancelableTask } from './useCancelableTask';
import { exportInvoices } from './invoiceExporter';
import styles from './BulkDownloader.module.css';

export default function BulkDownloader({ receipts = [] }) {
  const [form, setForm] = useState({ startId: '', endId: '', bulkMode: false });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState({});

  const { cancelRef, start, cancel } = useCancelableTask();

  useEffect(() => {
    const beforeUnload = (e) => {
      if (loading) { e.preventDefault(); e.returnValue = 'Download in progress.'; }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [loading]);

  const resetForm = () => {
    setForm({ startId: '', endId: '', bulkMode: false });
    setProgress({ current: 0, total: 0 });
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!form.startId.trim()) errs.startId = 'Start ID is required';
    if (form.bulkMode && !form.endId.trim()) errs.endId = 'End ID is required';
    if (form.bulkMode && form.startId && form.endId && parseInt(form.endId) < parseInt(form.startId)) {
      errs.endId = 'End ID must be >= Start ID';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDownload = async () => {
    if (!validate()) return;

    const from = parseInt(form.startId, 10);
    const to = form.bulkMode && form.endId ? parseInt(form.endId, 10) : from;

    const invoices = receipts.filter((r) => {
      const num = parseInt(r.receipt_no, 10);
      return !isNaN(num) && num >= from && num <= to;
    });

    if (invoices.length === 0) {
      alert('No receipt(s) found for that ID range.');
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
      <h2 className={styles.heading}>Receipt Downloader</h2>

      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
        {receipts.length} receipts available (Receipt #{receipts[0]?.receipt_no || 'N/A'} - #{receipts[receipts.length - 1]?.receipt_no || 'N/A'})
      </p>

      <label className={styles.label}>
        <input type="checkbox" checked={form.bulkMode}
          onChange={() => setForm((f) => ({ ...f, bulkMode: !f.bulkMode }))}
          disabled={loading} className={styles.checkbox} />
        Enable Bulk Mode
      </label>

      <div className={styles.inputGroup}>
        <input type="number" placeholder="Receipt No (Start)"
          value={form.startId}
          onChange={(e) => setForm((f) => ({ ...f, startId: e.target.value }))}
          disabled={loading} className={styles.input} />
        {errors.startId && <p className={styles.error}>{errors.startId}</p>}

        {form.bulkMode && (
          <>
            <input type="number" placeholder="Receipt No (End)"
              value={form.endId}
              onChange={(e) => setForm((f) => ({ ...f, endId: e.target.value }))}
              disabled={loading} className={styles.input} />
            {errors.endId && <p className={styles.error}>{errors.endId}</p>}
          </>
        )}
      </div>

      <div className={styles.buttonGroup}>
        {!loading ? (
          <button onClick={handleDownload}
            className={`${styles.button} ${styles.success}`}>
            {form.bulkMode ? 'Download ZIP' : 'Download Image'}
          </button>
        ) : (
          <>
            <p className={styles.progress}>Generating {progress.current}/{progress.total}...</p>
            <button onClick={cancel} className={`${styles.button} ${styles.danger}`}>Cancel</button>
          </>
        )}
        {!loading && (
          <button onClick={resetForm} className={`${styles.button} ${styles.gray}`}>Reset</button>
        )}
      </div>
    </div>
  );
}
