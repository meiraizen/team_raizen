import React, { useState } from 'react'
import {
  Box, Container, Typography, TextField, Button, Grid, FormControl,
  FormLabel, RadioGroup, Radio, FormControlLabel, Switch,
  Alert, Snackbar, Paper, Chip, Divider, useTheme
} from '@mui/material'
import { motion, AnimatePresence } from 'motion/react'
import PersonIcon from '@mui/icons-material/Person'
import StraightenIcon from '@mui/icons-material/Straighten'
import ScaleIcon from '@mui/icons-material/Scale'
import SchoolIcon from '@mui/icons-material/School'
import PhoneIcon from '@mui/icons-material/Phone'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import HomeIcon from '@mui/icons-material/Home'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PsychologyIcon from '@mui/icons-material/Psychology'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import FavoriteIcon from '@mui/icons-material/Favorite'
import MaleIcon from '@mui/icons-material/Male'
import FemaleIcon from '@mui/icons-material/Female'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { createStudent } from '../services/supabase'
import { logAudit } from '../services/audit'
import BackButton from '../components/BackButton'

const MOTIVATIONS = [
  'Improving physical fitness',
  'Developing self discipline',
  'Participate in tournaments',
  'Achieve black belt',
  'Learn self defence',
  'Socialization',
]

const HOW_KNEW = [
  'Through Neighbour',
  'Google Search/Maps',
  'Name board',
  'Posters',
  'Instagram',
  'Facebook',
]

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

function SectionDivider({ label, icon: Icon }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, mb: 0.5 }}>
      {Icon && <Icon sx={{ color: 'primary.main', fontSize: 20 }} />}
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        {label}
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Box>
  )
}

export default function RegisterStudent() {
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const theme = useTheme()

  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    school: '',
    phone: '',
    emergency_phone: '',
    address: '',
    landmark: '',
    motivations: [],
    motivationOther: '',
    how_knew: [],
    howKnewOther: '',
    past_karate_experience: false,
    past_karate_details: '',
    health_condition: false,
    health_condition_details: '',
  })

  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (e) => {
    const value = e.target.value
    if (field === 'date_of_birth') {
      let age = ''
      if (value) {
        const dob = new Date(value + 'T00:00:00')
        const today = new Date()
        let a = today.getFullYear() - dob.getFullYear()
        const m = today.getMonth() - dob.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--
        age = a
      }
      setForm(prev => ({ ...prev, date_of_birth: value, age }))
    } else {
      setForm(prev => ({ ...prev, [field]: value }))
    }
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleMultiSelect = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Full name is required'
    if (!form.date_of_birth) errs.date_of_birth = 'Date of birth is required'
    if (!form.gender) errs.gender = 'Gender is required'
    if (!form.phone) errs.phone = 'Phone number is required'
    if (!form.address.trim()) errs.address = 'Address is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const motivations = [...form.motivations]
      if (form.motivationOther) motivations.push(`Other: ${form.motivationOther}`)

      const howKnew = [...form.how_knew]
      if (form.howKnewOther) howKnew.push(`Other: ${form.howKnewOther}`)

      const studentData = {
        full_name: form.full_name.trim(),
        date_of_birth: form.date_of_birth || null,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        school: form.school || null,
        phone: form.phone || null,
        emergency_phone: form.emergency_phone || null,
        address: form.address || null,
        landmark: form.landmark || null,
        motivations: motivations.length > 0 ? motivations : null,
        how_knew: howKnew.length > 0 ? howKnew : null,
        past_karate_experience: form.past_karate_experience,
        past_karate_details: form.past_karate_details || null,
        health_condition: form.health_condition,
        health_condition_details: form.health_condition_details || null,
        created_by: user?.email,
      }

      const { data, error } = await createStudent(studentData)
      if (error) throw error

      await logAudit({
        action: 'CREATE', entityType: 'student', entityId: data.id,
        changes: { before: null, after: studentData },
        metadata: { created_by: user?.email },
      })

      setSnackbar({ open: true, message: `Student "${form.full_name}" registered successfully!`, severity: 'success' })
      setForm({
        full_name: '', date_of_birth: '', age: '', gender: '', height_cm: '',
        weight_kg: '', school: '', phone: '', emergency_phone: '', address: '',
        landmark: '', motivations: [], motivationOther: '', how_knew: [],
        howKnewOther: '', past_karate_experience: false, past_karate_details: '',
        health_condition: false, health_condition_details: '',
      })
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to register student', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 1, sm: 2, md: 3 }, mb: 4 }}>
      <BackButton to="/home" />
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mt: 1, mb: 0.5, fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>
          Register New Student
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Fill in the details below to enroll a new student.
        </Typography>
      </motion.div>

      <Paper elevation={0} sx={{
        p: { xs: 1.5, sm: 2.5, md: 3.5 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Section 1: Personal Information */}
            <Grid item xs={12}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible">
                <SectionDivider label="Personal Information" icon={PersonIcon} />
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
                <TextField label="Full Name" fullWidth required value={form.full_name}
                  onChange={handleChange('full_name')} error={!!errors.full_name} helperText={errors.full_name}
                  slotProps={{ input: { startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} /> } }}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.08 }}>
                <TextField label="Date of Birth" type="date" fullWidth value={form.date_of_birth}
                  onChange={handleChange('date_of_birth')} InputLabelProps={{ shrink: true }}
                  error={!!errors.date_of_birth} helperText={errors.date_of_birth}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                <TextField label="Age" fullWidth value={form.age || ''}
                  InputProps={{ readOnly: true, sx: { bgcolor: 'action.hover' } }}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.12 }}>
                <FormControl error={!!errors.gender}>
                  <FormLabel sx={{ fontWeight: 500 }}>Gender</FormLabel>
                  <RadioGroup row value={form.gender} onChange={handleChange('gender')}
                    sx={{ flexWrap: 'wrap', gap: { xs: 0, sm: 1 } }}
                  >
                    <FormControlLabel value="Male" control={<Radio />} label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><MaleIcon fontSize="small" /> Male</Box>} />
                    <FormControlLabel value="Female" control={<Radio />} label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><FemaleIcon fontSize="small" /> Female</Box>} />
                    <FormControlLabel value="Other" control={<Radio />} label="Other" />
                  </RadioGroup>
                  {errors.gender && <Typography variant="caption" color="error">{errors.gender}</Typography>}
                </FormControl>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.14 }}>
                <TextField label="Height (cm)" type="number" fullWidth value={form.height_cm}
                  onChange={handleChange('height_cm')} inputProps={{ step: 0.1 }}
                  slotProps={{ input: { startAdornment: <StraightenIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} /> } }}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.16 }}>
                <TextField label="Weight (kg)" type="number" fullWidth value={form.weight_kg}
                  onChange={handleChange('weight_kg')} inputProps={{ step: 0.1 }}
                  slotProps={{ input: { startAdornment: <ScaleIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} /> } }}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.18 }}>
                <TextField label="School" fullWidth value={form.school} onChange={handleChange('school')}
                  slotProps={{ input: { startAdornment: <SchoolIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} /> } }}
                />
              </motion.div>
            </Grid>

            {/* Section 2: Contact Details */}
            <Grid item xs={12}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                <SectionDivider label="Contact Details" icon={PhoneIcon} />
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.22 }}>
                <TextField label="Phone No" fullWidth required value={form.phone}
                  onChange={handleChange('phone')} error={!!errors.phone} helperText={errors.phone}
                  slotProps={{ input: { startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} /> } }}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.24 }}>
                <TextField label="Emergency No" fullWidth value={form.emergency_phone}
                  onChange={handleChange('emergency_phone')}
                  slotProps={{ input: { startAdornment: <LocalPhoneIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} /> } }}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.26 }}>
                <TextField label="Full Address" fullWidth required multiline rows={2}
                  value={form.address} onChange={handleChange('address')}
                  error={!!errors.address} helperText={errors.address}
                  slotProps={{ input: { startAdornment: <HomeIcon sx={{ mr: 1, color: 'action.active', fontSize: 20, alignSelf: 'flex-start', mt: 1.5 }} /> } }}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.28 }}>
                <TextField label="Landmark" fullWidth value={form.landmark} onChange={handleChange('landmark')}
                  slotProps={{ input: { startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} /> } }}
                />
              </motion.div>
            </Grid>

            {/* Section 3: Background */}
            <Grid item xs={12}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                <SectionDivider label="Background" icon={PsychologyIcon} />
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.32 }}>
                <Typography variant="subtitle2" fontWeight={500} gutterBottom sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                  What motivates you to join?
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {MOTIVATIONS.map(m => (
                    <Chip key={m} label={m}
                      color={form.motivations.includes(m) ? 'primary' : 'default'}
                      onClick={() => handleMultiSelect('motivations', m)}
                      variant={form.motivations.includes(m) ? 'filled' : 'outlined'}
                      sx={{
                        fontWeight: form.motivations.includes(m) ? 600 : 400,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-1px)', boxShadow: 1 },
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      }}
                    />
                  ))}
                </Box>
                <TextField size="small" placeholder="Other motivation..." value={form.motivationOther}
                  onChange={handleChange('motivationOther')} sx={{ mt: 1.5, maxWidth: 400 }}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.34 }}>
                <Typography variant="subtitle2" fontWeight={500} gutterBottom sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                  How did you hear about us?
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {HOW_KNEW.map(h => (
                    <Chip key={h} label={h}
                      color={form.how_knew.includes(h) ? 'primary' : 'default'}
                      onClick={() => handleMultiSelect('how_knew', h)}
                      variant={form.how_knew.includes(h) ? 'filled' : 'outlined'}
                      sx={{
                        fontWeight: form.how_knew.includes(h) ? 600 : 400,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-1px)', boxShadow: 1 },
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      }}
                    />
                  ))}
                </Box>
                <TextField size="small" placeholder="Other..." value={form.howKnewOther}
                  onChange={handleChange('howKnewOther')} sx={{ mt: 1.5, maxWidth: 400 }}
                />
              </motion.div>
            </Grid>

            {/* Section 4: Health & Experience */}
            <Grid item xs={12}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.36 }}>
                <SectionDivider label="Health & Experience" icon={FavoriteIcon} />
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.38 }}>
                <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <FormControlLabel
                    control={<Switch checked={form.past_karate_experience}
                      onChange={e => setForm(prev => ({ ...prev, past_karate_experience: e.target.checked }))}
                    />}
                    label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FitnessCenterIcon fontSize="small" sx={{ color: form.past_karate_experience ? 'primary.main' : 'action.disabled' }} />
                      Past Karate Experience
                    </Box>}
                  />
                  <AnimatePresence>
                    {form.past_karate_experience && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                        <TextField fullWidth multiline rows={2} size="small" placeholder="Describe past karate experience..."
                          value={form.past_karate_details} onChange={handleChange('past_karate_details')}
                          sx={{ mt: 1.5 }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <FormControlLabel
                    control={<Switch checked={form.health_condition}
                      onChange={e => setForm(prev => ({ ...prev, health_condition: e.target.checked }))}
                    />}
                    label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FavoriteIcon fontSize="small" sx={{ color: form.health_condition ? 'error.main' : 'action.disabled' }} />
                      Any Health Condition
                    </Box>}
                  />
                  <AnimatePresence>
                    {form.health_condition && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                        <TextField fullWidth multiline rows={2} size="small" placeholder="Describe health condition..."
                          value={form.health_condition_details} onChange={handleChange('health_condition_details')}
                          sx={{ mt: 1.5 }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Paper>
              </motion.div>
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.3 }}>
                <Box sx={{
                  display: 'flex',
                  gap: 2,
                  mt: 1,
                  flexDirection: { xs: 'column-reverse', sm: 'row' },
                  '& .MuiButton-root': { py: { xs: 1.2, sm: 1.4 } }
                }}>
                  <Button variant="outlined" color="inherit" onClick={() => navigate('/students-info')}
                    sx={{ flex: { xs: 'none', sm: '0 0 auto' }, minWidth: { xs: '100%', sm: 120 } }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" disabled={loading} sx={{ flex: 1 }}>
                    {loading ? 'Registering...' : 'Register Student'}
                  </Button>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2, boxShadow: 4 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
