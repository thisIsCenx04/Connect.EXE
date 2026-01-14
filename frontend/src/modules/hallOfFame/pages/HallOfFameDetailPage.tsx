import { Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { getHallOfFameEntry, voteHallOfFame, type HallOfFameEntry } from '../../../services/hallOfFame'

const ratingOptions = [1, 2, 3, 4, 5]

export function HallOfFameDetailPage() {
  const { id } = useParams()
  const user = useAppSelector((state) => state.auth.user)
  const [entry, setEntry] = useState<HallOfFameEntry | null>(null)
  const [rating, setRating] = useState(5)
  const [loading, setLoading] = useState(false)

  const loadEntry = async () => {
    if (!id) {
      return
    }
    setLoading(true)
    try {
      const data = await getHallOfFameEntry(id)
      setEntry(data)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!id) {
      return
    }
    setLoading(true)
    try {
      const data = await voteHallOfFame(id, { value: rating })
      setEntry(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntry()
  }, [id])

  if (!entry) {
    return <Typography color="text.secondary">{loading ? 'Loading...' : 'Entry not found.'}</Typography>
  }

  return (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4">Hall of Fame Detail</Typography>
        <Card elevation={4}>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6">{entry.type}</Typography>
              <Typography variant="body2" color="text.secondary">
                Reference: {entry.referenceId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {entry.status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Score: {entry.score?.toFixed?.(2) ?? entry.score} ({entry.ratingCount} votes)
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}>
          <TextField
            label="Your rating"
            select
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            sx={{ width: 160 }}
            disabled={!user}
          >
            {ratingOptions.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={handleVote} disabled={!user || loading}>
            {user ? 'Submit vote' : 'Login to vote'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
