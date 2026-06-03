import React from 'react'
import { IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'

export default function BackButton({ to }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <IconButton onClick={handleClick} size="small" disableRipple disableFocusRipple
      sx={{ color: 'text.secondary', p: 0.5, '&:hover': { bgcolor: 'transparent', color: 'text.primary' } }}
    >
      <ArrowBackIcon fontSize="small" />
    </IconButton>
  )
}
