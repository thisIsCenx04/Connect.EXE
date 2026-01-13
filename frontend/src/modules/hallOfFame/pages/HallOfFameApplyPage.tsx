import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyHallOfFame } from '../../../services/hallOfFame'

const types = ['STARTUP', 'PERSON']

export function HallOfFameApplyPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: 'STARTUP',
    referenceId: '',
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const result = await applyHallOfFame({
        type: form.type,
        referenceId: form.referenceId,
      })
      navigate(`/hall-of-fame/${result.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <Typography variant="h4">Apply to Hall of Fame</Typography>
        <TextField
          label="Type"
          select
          value={form.type}
          onChange={(event) => setForm({ ...form, type: event.target.value })}
          sx={{ maxWidth: 260 }}
        >
          {types.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Reference ID"
          value={form.referenceId}
          onChange={(event) => setForm({ ...form, referenceId: event.target.value })}
          placeholder="UUID of startup or person"
          required
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit application'}
        </Button>
      </Stack>
    </Box>
  )
}
