import { Router } from 'express'
import { UserController } from '../controllers/auth.controller.js'
import jwt from 'jsonwebtoken'

export const createUserRouter = ({ userModel }) => {
  const userRouter = Router()
  const userController = new UserController({ userModel })

  userRouter.use((req, res, next) => {
    const token = req.cookies.access_token
    let data = null

    req.session = { user: null }

    try {
      data = jwt.verify(token, process.env.SECRET_JWT_KEY)
      req.session.user = data
    } catch (error) {}

    next() // Seguir ruta o middleware
  })

  userRouter.post('/register', userController.create)
  userRouter.post('/login', userController.login)
  userRouter.post('/logout', userController.logout)

  userRouter.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html')
  })

  userRouter.get('/protected', (req, res) => {
    const { user } = req.session
    if (!user) {
      return res.status(403).send('Access not authorized')
    }
    res.sendFile(process.cwd() + '/client/chat.html')
  })

  userRouter.get('/token', (req, res) => {
    const { user } = req.session
    if (!user) {
      res.status(403).send('Access not authorized')
    }
    res.json(user)
  })

  return userRouter
}
