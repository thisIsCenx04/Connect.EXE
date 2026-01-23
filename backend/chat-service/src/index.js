const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
const { Pool } = require('pg')
const { v4: uuidv4 } = require('uuid')

const app = express()
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || process.env.POSTGRES_DB || 'Connect.EXE',
  user: process.env.DB_USER || process.env.POSTGRES_USER || 'connectexe',
  password: process.env.DB_PASS || process.env.POSTGRES_PASSWORD || 'dtpo9094',
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
})

const CONVERSATION_TYPE = 'FOUNDER_INVESTOR'

async function getConversationByParticipants(participantA, participantB) {
  const result = await pool.query(
    `SELECT c.id
     FROM conversations c
     JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = $1
     JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = $2
     WHERE c.type = $3
     LIMIT 1`,
    [participantA, participantB, CONVERSATION_TYPE]
  )
  return result.rows[0] ? result.rows[0].id : null
}

async function createConversation(participantA, participantB) {
  const conversationId = uuidv4()
  await pool.query('BEGIN')
  try {
    await pool.query(
      'INSERT INTO conversations (id, type, created_at) VALUES ($1, $2, now())',
      [conversationId, CONVERSATION_TYPE]
    )
    await pool.query(
      'INSERT INTO conversation_participants (conversation_id, user_id, joined_at) VALUES ($1, $2, now()), ($1, $3, now())',
      [conversationId, participantA, participantB]
    )
    await pool.query('COMMIT')
    return conversationId
  } catch (error) {
    await pool.query('ROLLBACK')
    throw error
  }
}

app.post('/api/conversations', async (req, res) => {
  const { participantIds } = req.body || {}
  if (!Array.isArray(participantIds) || participantIds.length !== 2) {
    return res.status(400).json({ error: 'participantIds must include two users' })
  }
  const [rawA, rawB] = participantIds
  if (!rawA || !rawB) {
    return res.status(400).json({ error: 'participantIds must include two users' })
  }
  const [participantA, participantB] = [rawA, rawB].sort()
  try {
    let conversationId = await getConversationByParticipants(participantA, participantB)
    if (!conversationId) {
      conversationId = await createConversation(participantA, participantB)
    }
    return res.json({ conversationId })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create conversation' })
  }
})

app.get('/api/conversations', async (req, res) => {
  const userId = req.query.userId
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }
  try {
    const result = await pool.query(
      `SELECT c.id, c.created_at, c.type, cp.last_read_at
       FROM conversations c
       JOIN conversation_participants cp ON cp.conversation_id = c.id
       WHERE cp.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    )
    return res.json({ conversations: result.rows })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load conversations' })
  }
})

app.get('/api/messages/:conversationId', async (req, res) => {
  const { conversationId } = req.params
  const limit = Math.min(Number(req.query.limit || 50), 200)
  try {
    const result = await pool.query(
      `SELECT id, conversation_id, sender_id, content, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT $2`,
      [conversationId, limit]
    )
    return res.json({ messages: result.rows })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load messages' })
  }
})

io.on('connection', (socket) => {
  socket.on('join', async ({ conversationId, userId }) => {
    if (!conversationId || !userId) {
      return
    }
    socket.join(conversationId)
    await pool.query(
      'UPDATE conversation_participants SET last_read_at = now() WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, userId]
    ).catch(() => null)
    io.to(conversationId).emit('message:read', {
      conversationId,
      userId,
      readAt: new Date().toISOString(),
    })
  })

  socket.on('message:send', async ({ conversationId, senderId, content }) => {
    if (!conversationId || !senderId || !content) {
      return
    }
    const messageId = uuidv4()
    const createdAt = new Date().toISOString()
    try {
      await pool.query(
        'INSERT INTO messages (id, conversation_id, sender_id, content, created_at) VALUES ($1, $2, $3, $4, $5)',
        [messageId, conversationId, senderId, content, createdAt]
      )
      io.to(conversationId).emit('message:new', {
        id: messageId,
        conversationId,
        senderId,
        content,
        createdAt,
      })
    } catch (error) {
      socket.emit('message:error', { error: 'Failed to send message' })
    }
  })

  socket.on('message:read', async ({ conversationId, userId }) => {
    if (!conversationId || !userId) {
      return
    }
    const readAt = new Date().toISOString()
    await pool.query(
      'UPDATE conversation_participants SET last_read_at = $1 WHERE conversation_id = $2 AND user_id = $3',
      [readAt, conversationId, userId]
    ).catch(() => null)
    io.to(conversationId).emit('message:read', { conversationId, userId, readAt })
  })
})

const port = Number(process.env.CHAT_SERVER_PORT || 8090)
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`chat-service listening on ${port}`)
})
