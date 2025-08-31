import { useState } from 'react';
import mockData from './mock-invoices.json';

export function useInvoiceValidator() {
  const [errors, setErrors] = useState({ startId: '', endId: '' });

  const isValidId = (id) => {
    const parsed = parseInt(id, 10);
    return mockData.some((item) => item.id === parsed);
  };

  const validate = ({ startId, endId, bulkMode }) => {
    let isValid = true;
    const newErrors = { startId: '', endId: '' };

    if (!isValidId(startId)) {
      newErrors.startId = '⚠️ Invalid Start ID';
      isValid = false;
    }

    if (bulkMode && !isValidId(endId)) {
      newErrors.endId = '⚠️ Invalid End ID';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetErrors = () => setErrors({ startId: '', endId: '' });

  return { errors, validate, resetErrors };
}
