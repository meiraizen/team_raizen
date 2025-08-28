import React, { useState, useEffect,useMemo, useCallback } from 'react';
import { Box, TextField, Checkbox, FormControlLabel, MenuItem, Select, InputLabel, FormControl, OutlinedInput, ListItemText, Chip, Button, Grid, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { supabase } from '../../chat/supabaseClient';
import { useAuthStore } from '../../store/auth';


const paidForOptions = [
  { label: 'Register Fee', value: 'Register Fee', amount: 500 },
  { label: 'Monthly Fee', value: 'Monthly Fee', amount: 1000 },
  { label: 'Monthly Fee / 3days', value: 'Monthly Fee / 3days', amount: 1300 },
  { label: 'Exam Fee', value: 'Exam Fee', amount: 1000 },
  { label: 'Uniform Fee', value: 'Uniform Fee', amount: 1200 },
  { label: 'Event Fee', value: 'Event Fee', amount: 500 },
];

const paidToOptions = ['Coach Amalesh', 'Coach Bala', 'Coach Daniel', 'Coach Ebi'];
const paymentOptions = ['UPI', 'CASH'];
const batchOptions = ['MWF 6-7.30', 'TT 5-6', 'TT 6-7.30', 'SS 4-5', 'SS 5-6', 'SS 6-7'];

export default function BillbookFormHandler() {
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    receiptNo: '',
    date: dayjs().format('YYYY-MM-DD'),
    currentDate: false,
    studentName: '',
    paidFor: [],
    remarks: '',
    paidTo: '',
    payment: [],
    batch: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 🧠 Memoize total fee based on selected services
  const totalFee = useMemo(() => {
    return paidForOptions
      .filter((opt) => form.paidFor.includes(opt.value))
      .reduce((sum, opt) => sum + opt.amount, 0);
  }, [form.paidFor]);

  // 🔢 Fetch next receipt number
  const fetchNextReceiptNo = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('raizen-bill-book')
        .select('receipt_no')
        .order('receipt_no', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const last = parseInt(data[0].receipt_no, 10);
        return isNaN(last) ? '1' : String(last + 1);
      }
    } catch (err) {
      console.error('❌ Fetch receipt number failed:', err);
    }
    return '1';
  }, []);

  // ⏳ On mount: fetch initial receipt number
  useEffect(() => {
    (async () => {
      const next = await fetchNextReceiptNo();
      setForm((prev) => ({ ...prev, receiptNo: next }));
    })();
  }, [fetchNextReceiptNo]);

  // 🧽 Clear form
  const clearForm = useCallback(async () => {
    const nextReceipt = await fetchNextReceiptNo();
    setForm({
      receiptNo: nextReceipt,
      date: dayjs().format('YYYY-MM-DD'),
      currentDate: false,
      studentName: '',
      paidFor: [],
      remarks: '',
      paidTo: '',
      payment: [],
      batch: '',
    });
    setSuccess(false);
    setError('');
  }, [fetchNextReceiptNo]);

  const handleChange = useCallback((field) => (event) => {
    let value = event.target.value;

    if (field === 'currentDate') {
      const checked = event.target.checked;
      setForm((prev) => ({
        ...prev,
        currentDate: checked,
        date: checked ? dayjs().format('YYYY-MM-DD') : prev.date,
      }));
      return;
    }

    if (field === 'studentName') {
      const rawValue = event.target.value;
      if (!/^[A-Za-z\s]*$/.test(rawValue)) return;

      value = rawValue
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleDateChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, date: e.target.value }));
  }, []);

  const isFormFilled = useMemo(() => {
    return (
      form.receiptNo &&
      form.date &&
      form.studentName &&
      form.paidFor.length > 0 &&
      totalFee > 0 &&
      form.paidTo &&
      form.payment.length > 0 &&
      form.batch
    );
  }, [form, totalFee]);

  // 📨 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        receipt_no: form.receiptNo,
        date: form.date,
        student_name: form.studentName,
        paid_for: form.paidFor.join(', '),
        fee_paid: String(totalFee),
        batch: form.batch,
        remarks: form.remarks,
        paid_to: form.paidTo,
        payment_method: form.payment.join(', '),
        created_by: user?.email || '',
        created_at: dayjs().toISOString(),
      };

      const { error: supaError } = await supabase.from('raizen-bill-book').insert([payload]);

      if (supaError) {
        setError(supaError.message || 'Failed to save bill.');
        return;
      }

      setSuccess(true);
      await clearForm(); // refresh receipt number too

    } catch (err) {
      setError(err.message || 'Failed to save bill.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, p: 2, borderRadius: 2, boxShadow: 1, bgcolor: 'background.paper', border: '1px solid #eee' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ cursor:'not-allowed',color: 'black', border: '1px solid black', borderRadius: 1, px: 2, py: 1, bgcolor: 'background.paper',width: '100%' }}>
              Receipt No: <span style={{fontWeight: 600, color: 'black'}}>{form.receiptNo || '...'}</span>
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={form.date}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { borderColor: 'black' }, disabled: form.currentDate }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'black' }, '&.Mui-focused fieldset': { borderColor: 'black' } }, '& .MuiInputLabel-root.Mui-focused': { color: 'black' }, mr: 2 }}
              disabled={form.currentDate}
            />
            {/* <FormControlLabel
              control={<Checkbox checked={form.currentDate} onChange={handleChange('currentDate')} sx={{ color: 'black', '&.Mui-checked': { color: 'black' } }} />}
              label="Today"
            /> */}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField label="Student Name" fullWidth required value={form.studentName} onChange={handleChange('studentName')}  InputProps={{ sx: { borderColor: 'black' } }} sx={{'& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'black' }, '&.Mui-focused fieldset': { borderColor: 'black' } }, '& .MuiInputLabel-root.Mui-focused': { color: 'black' } }} />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'black' }, '&.Mui-focused fieldset': { borderColor: 'black' } }, '& .MuiInputLabel-root.Mui-focused': { color: 'black' } }}>
            <InputLabel>Paid For</InputLabel>
            <Select
              multiple
              value={form.paidFor}
              onChange={handleChange('paidFor')}
              input={<OutlinedInput label="Paid For" />}
              renderValue={(selected) => {
                const maxToShow = 3;
                const chips = selected.slice(0, maxToShow).map((value) => (
                  <Chip key={value} label={value} sx={{ bgcolor: 'black', color: 'white', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }} />
                ));
                if (selected.length > maxToShow) {
                  chips.push(
                    <Chip key="more" label={`+${selected.length - maxToShow}`} sx={{ bgcolor: 'black', color: 'white' }} />
                  );
                }
                return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{chips}</Box>;
              }}
              sx={{ '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' }, height: { xs: 'auto', sm: 56 } }}
            >
              {paidForOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={form.paidFor.indexOf(option.value) > -1} sx={{ color: 'black', '&.Mui-checked': { color: 'black' } }} />
                  <ListItemText primary={`${option.label} (${option.amount})`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField label="Fee Paid" fullWidth required value={totalFee} onChange={handleChange('feePaid')} InputProps={{ sx: { borderColor: 'black' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'black' }, '&.Mui-focused fieldset': { borderColor: 'black' } }, '& .MuiInputLabel-root.Mui-focused': { color: 'black' } }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'black' }, '&.Mui-focused fieldset': { borderColor: 'black' } }, '& .MuiInputLabel-root.Mui-focused': { color: 'black' } }}>
            <InputLabel>Batch</InputLabel>
            <Select
              value={form.batch}
              onChange={handleChange('batch')}
              input={<OutlinedInput label="Batch" />}
              sx={{ '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' } }}
            >
              {batchOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Remarks"
            fullWidth
            value={form.remarks}
            onChange={handleChange('remarks')}
            InputProps={{ sx: { borderColor: 'black' } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'black' }, '&.Mui-focused fieldset': { borderColor: 'black' } }, '& .MuiInputLabel-root.Mui-focused': { color: 'black' } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'black' }, '&.Mui-focused fieldset': { borderColor: 'black' } }, '& .MuiInputLabel-root.Mui-focused': { color: 'black' } }}>
            <InputLabel>Paid To</InputLabel>
            <Select
              value={form.paidTo}
              onChange={handleChange('paidTo')}
              input={<OutlinedInput label="Paid To" />}
              sx={{ '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' } }}
            >
              {paidToOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'black' }, '&.Mui-focused fieldset': { borderColor: 'black' } }, '& .MuiInputLabel-root.Mui-focused': { color: 'black' } }}>
            <InputLabel>Payment</InputLabel>
            <Select
              multiple
              value={form.payment}
              onChange={handleChange('payment')}
              input={<OutlinedInput label="Payment" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} sx={{ bgcolor: 'black', color: 'white' }} />
                  ))}
                </Box>
              )}
              sx={{ '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' } }}
            >
              {paymentOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox checked={form.payment.indexOf(option) > -1} sx={{ color: 'black', '&.Mui-checked': { color: 'black' } }} />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              fullWidth
              onClick={clearForm}
              sx={{ borderColor: 'red', color: 'red', fontWeight: 600, borderRadius: 2, boxShadow: 0, background: 'none', transition: 'none', '&.Mui-disabled': { color: '#aaa', borderColor: '#eee' }, '&:hover': { bgcolor: 'red', color: 'white', borderColor: 'red' } }}
            >
              Clear
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!isFormFilled || loading}
              sx={{ bgcolor: 'white', border: '1px solid black', color: 'black', borderRadius: 2, fontWeight: 600, boxShadow: 0, transition: 'none', '&:hover': { bgcolor: '#000000ff', color: 'white' }, '&.Mui-disabled': { bgcolor: '#eee', color: '#aaa', border: '1px solid #eee' }, '&.Mui-focusVisible': { outline: 'black' } }}
            >
              {loading ? 'Saving...' : 'Submit'}
            </Button>
          </Box>
        </Grid>
        {success && (
          <Grid item xs={12}>
            <Typography color="success.main">Bill saved successfully!</Typography>
          </Grid>
        )}
        {error && (
          <Grid item xs={12}>
            <Typography color="error.main">{error}</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
