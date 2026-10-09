import { createApp } from './app.js'
import { defaultDbPath, openDatabase } from './db.js'

const PORT = Number(process.env.PORT ?? 3000)

const db = openDatabase()
const app = createApp(db)

const server = app.listen(PORT, (err?: Error) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening on http://localhost:${PORT} (db: ${defaultDbPath})`)
})

function shutdown(): void {
  server.close(() => {
    db.close()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
