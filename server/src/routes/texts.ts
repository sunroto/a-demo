import { Router } from 'express'
import type { DB } from '../db.js'

export interface TextMeta {
  id: number
  title: string
}

export function textsRouter(db: DB): Router {
  const router = Router()

  // Never select `content`: the source text must not reach the client.
  const listTexts = db.prepare<[], TextMeta>('SELECT id, title FROM texts ORDER BY id')

  router.get('/', (_req, res) => {
    res.json(listTexts.all())
  })

  return router
}
