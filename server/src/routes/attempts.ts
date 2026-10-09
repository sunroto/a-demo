import { Router } from 'express'
import type { DB } from '../db.js'
import { scoreAttempt, type Mark } from '../services/scoring.js'

export interface AttemptSummary {
  id: number
  title: string
  score: number
  created_at: string
}

export interface AttemptResult {
  id: number
  text_id: number
  score: number
  marks: Mark[]
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

  const getTextContent = db.prepare<[number], { content: string }>(
    'SELECT content FROM texts WHERE id = ?',
  )

  const insertAttempt = db.prepare<[number, string, number], { id: number; created_at: string }>(
    'INSERT INTO attempts (text_id, input, score) VALUES (?, ?, ?) RETURNING id, created_at',
  )

  router.get('/', (_req, res) => {
    res.json(listAttempts.all())
  })

  router.post('/', (req, res) => {
    const body: unknown = req.body
    const { text_id: textId, input } =
      typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}

    if (typeof textId !== 'number' || !Number.isSafeInteger(textId) || textId <= 0) {
      res.status(400).json({ error: 'text_id must be a positive integer' })
      return
    }
    if (typeof input !== 'string' || input.trim() === '') {
      res.status(400).json({ error: 'input must be a non-empty string' })
      return
    }

    const text = getTextContent.get(textId)
    if (!text) {
      res.status(404).json({ error: 'Text not found' })
      return
    }

    const { score, marks } = scoreAttempt(text.content, input)
    const row = insertAttempt.get(textId, input, score)
    if (!row) {
      throw new Error('Failed to insert attempt')
    }

    const result: AttemptResult = {
      id: row.id,
      text_id: textId,
      score,
      marks,
      created_at: row.created_at,
    }
    res.status(201).json(result)
  })

  return router
}
