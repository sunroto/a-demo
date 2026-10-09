import { Router } from 'express'
import type { DB } from '../db.js'

export interface AttemptSummary {
  id: number
  title: string
  score: number
  created_at: string
}

export function attemptsRouter(db: DB): Router {
  const router = Router()

  const listAttempts = db.prepare<[], AttemptSummary>(`
    SELECT a.id, t.title, a.score, a.created_at
    FROM attempts AS a
    JOIN texts AS t ON t.id = a.text_id
    ORDER BY a.created_at DESC, a.id DESC
  `)

  router.get('/', (_req, res) => {
    res.json(listAttempts.all())
  })

  return router
}
