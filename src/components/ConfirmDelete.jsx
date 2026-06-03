import React, { useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

export default function ConfirmDelete({ open, onClose, onConfirm, title, message, requireConfirmation }) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (requireConfirmation) {
      if (inputValue !== requireConfirmation) {
        setError('Text does not match');
        return;
      }
    }
    setInputValue('')
    setError('')
    onConfirm()
  }

  const handleClose = () => {
    setInputValue('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon color="warning" />
        {title || 'Confirm Delete'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
        </DialogContentText>
        {requireConfirmation && (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Warning</AlertTitle>
              Type <strong>{requireConfirmation}</strong> to confirm deletion.
            </Alert>
            <TextField
              autoFocus
              fullWidth
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setError('') }}
              placeholder={requireConfirmation}
              error={!!error}
              helperText={error}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={requireConfirmation && inputValue !== requireConfirmation}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
