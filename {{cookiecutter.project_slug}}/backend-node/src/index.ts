import express from 'express'
import cors from 'cors'
import { todoRouter } from './routes/todos.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/v1/todos', todoRouter)

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export { app }
