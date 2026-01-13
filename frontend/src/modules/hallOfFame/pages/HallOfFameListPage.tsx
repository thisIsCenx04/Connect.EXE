import { Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { listHallOfFame, type HallOfFameEntry } from '../../../services/hallOfFame'

const types = ['STARTUP', 'PERSON']

export function HallOfFameListPage() {
  const user = useAppSelector((state) => state.auth.user)
  const [entries, setEntries] = useState<HallOfFameEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('')

  const loadEntries = async () => {
    setLoading(true)
    try {
      const data = await listHallOfFame({ type: type || undefined })
      setEntries(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [])

  return (
    <Box>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Typography variant="h4">Hall of Fame</Typography>
          <Stack direction="row" spacing={2}>
            {user && (
              <Button component={Link} to="/hall-of-fame/apply" variant="contained">
                Apply
              </Button>
            )}
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Type"
            select
            value={type}
            onChange={(event) => setType(event.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            {types.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={loadEntries} disabled={loading}>
            {loading ? 'Loading...' : 'Apply'}
          </Button>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {entries.length === 0 && !loading && (
            <Typography color="text.secondary">No hall of fame entries found.</Typography>
          )}
          {entries.map((entry) => (
            <Card key={entry.id} elevation={4}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h6">{entry.type}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Score: {entry.score?.toFixed?.(2) ?? entry.score} ({entry.ratingCount} votes)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ref: {entry.referenceId}
                  </Typography>
                  <Button component={Link} to={`/hall-of-fame/${entry.id}`} size="small">
                    View details
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Stack>
    </Box>
  )
}
