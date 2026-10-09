import express, { type ErrorRequestHandler } from 'express'
import type { DB } from './db.js'
import { attemptsRouter } from './routes/attempts.js'

export function createApp(db: DB): express.Express {
  const app = express()
  app.use(express.json())

  app.use('/api/attempts', attemptsRouter(db))

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not Found' })
  })

  const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
  app.use(errorHandler)

  return app
}
