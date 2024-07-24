import { ZodError } from 'zod'

export class ValidationError extends ZodError {
  constructor(message, statusCode) {
    super(message)
    this.name = 'ValidationError'
    this.status = statusCode
  }
}

export class QueryError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.name = 'QueryError'
    this.status = statusCode
  }
}
