import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.SECRET_JWT_KEY

export class UserController {
  constructor({ userModel }) {
    this.userModel = userModel
  }

  create = async (req, res) => {
    try {
      const result = await this.userModel.create(req.body)

      res.send(result)
    } catch (error) {
      console.log(error)
      if (error.name === 'ValidationError') {
        res.status(error.status).send(error.issues.fieldErrors)
      } else if (error.name === 'QueryError') {
        res.status(error.status).send(error.message)
      } else {
        res.status(500).send(error.message)
      }
    }
  }

  login = async (req, res) => {
    try {
      const user = await this.userModel.login(req.body)

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        SECRET_KEY,
        { expiresIn: '1h' }
      )

      res
        .cookie('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60
        })
        .send({ user, token })
    } catch (error) {
      if (error.issues) {
        res.status(error.status).send(error.issues.fieldErrors)
      } else {
        res.status(401).send(error.message)
      }
    }
  }

  logout = async (req, res) => {
    res.clearCookie('access_token').send()
  }
}
