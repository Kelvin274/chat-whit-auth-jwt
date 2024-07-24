import express, { json } from 'express'
import logger from 'morgan'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import mysql from 'mysql2/promise'
import cookieParser from 'cookie-parser'
import { UserModel } from './models/auth.models.js'
import { createUserRouter } from './routes/auth.js'

const config = {
  host: 'localhost',
  port: 3315,
  user: 'root',
  password: '123456',
  database: 'chatdb'
}

const connection = await mysql.createConnection(config)
const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {}
})

io.on('connection', async (socket) => {
  console.log('a user has connected')

  socket.on('disconnect', () => {
    console.log('an user has disconnected')
  })

  socket.on('chat message', async (msg) => {
    const username = socket.handshake.auth.username ?? 'Anonymous'

    try {
      await connection.query(
        'INSERT INTO messages (content, username) VALUES (?, ?)',
        [msg, username]
      )
    } catch (error) {
      console.error(error)
      return
    }

    io.emit('chat message', msg, username)
  })

  if (!socket.recovered) {
    try {
      const [messagesOnDb] = await connection.query(
        `
        SELECT id, content, username FROM messages
        WHERE id > ?
        `,
        [socket.handshake.auth.serverOffset ?? 0]
      )

      messagesOnDb.forEach((row) => {
        socket.emit('chat message', row.content, row.username)
      })
    } catch (error) {
      console.error(error)
    }
  }
})
app.use(logger('dev'))
app.use(json())
app.use(cookieParser())
app.disable('x-powered-by')

app.use('/', createUserRouter({ userModel: UserModel }))

server.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`)
})
