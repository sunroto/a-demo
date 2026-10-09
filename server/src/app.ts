import express, { type ErrorRequestHandler } from 'express'
import type { DB } from './db.js'
import { attemptsRouter } from './routes/attempts.js'
import { textsRouter } from './routes/texts.js'

export function createApp(db: DB): express.Express {
  const app = express()
  app.use(express.json())

  app.use('/api/texts', textsRouter(db))
  app.use('/api/attempts', attemptsRouter(db))

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not Found' })
  })

  const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
    // body-parser errors (malformed JSON, payload too large) carry a 4xx status
    const status = (err as { status?: unknown } | null)?.status
    if (typeof status === 'number' && status >= 400 && status < 500) {
      res.status(status).json({ error: status === 413 ? 'Payload Too Large' : 'Bad Request' })
      return
    }
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
  app.use(errorHandler)

  return app
}
