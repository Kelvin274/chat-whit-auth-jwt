import { validPartialUser, validUser } from '../schemas/users.js'
import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import { QueryError, ValidationError } from '../errors.js'

const config = {
  host: 'localhost',
  port: 3315,
  user: 'root',
  password: '123456',
  database: 'chatdb'
}

const connection = await mysql.createConnection(config)

const saltRounds = process.env.SALT_ROUNDS ?? 10

export class UserModel {
  static create = async (user) => {
    try {
      const result = validUser(user)
      const { username, password, email } = user

      if (!result.success) {
        throw new ValidationError(result.error.flatten(), 400)
      }

      const [uuidResult] = await connection.query('SELECT UUID() uuid;')
      const [{ uuid }] = uuidResult

      const hashPassword = await bcrypt.hash(password, saltRounds)

      await connection.query(
        'INSERT INTO users (id, username, password, email) VALUES (UUID_TO_BIN(?), ?, ?, ?)',
        [uuid, username, hashPassword, email]
      )

      const [userResult] = await connection.query(
        `SELECT BIN_TO_UUID(id) id, username, email, create_at
          FROM users
          WHERE id = UUID_TO_BIN(?)`,
        [uuid]
      )

      return userResult[0]
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new QueryError('Username or email already exists.', 400)
      } else if (error instanceof ValidationError) {
        throw error
      }
    }
  }

  static login = async (user) => {
    try {
      const result = validPartialUser(user)
      const { username, password } = user

      if (!result.success) {
        throw new ValidationError(result.error.flatten(), 400)
      }

      const [usernameExist] = await connection.query(
        `
      SELECT username, password FROM users WHERE username = ?`,
        [username]
      )

      if (!usernameExist.length) {
        throw new ValidationError('User not found', 401)
      }

      const isValidPass = await bcrypt.compare(
        password,
        usernameExist[0].password
      )

      if (!isValidPass) throw new ValidationError('Password incorrect', 401)

      const [userExist] = await connection.query(
        `
        SELECT BIN_TO_UUID(id) id, username, email, create_at
        FROM users
        WHERE username = ?`,
        [username]
      )

      return userExist[0]
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      } else {
        throw error
      }
    }
  }

  static logout = async (user) => {}
}
