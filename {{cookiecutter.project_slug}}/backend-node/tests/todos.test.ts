import request from 'supertest'
import { app } from '../src/index.js'

describe('Todos API', () => {
  describe('GET /api/v1/health', () => {
    it('returns ok status', async () => {
      const response = await request(app).get('/api/v1/health')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: 'ok' })
    })
  })

  describe('GET /api/v1/todos', () => {
    it('returns empty array initially', async () => {
      const response = await request(app).get('/api/v1/todos')
      expect(response.status).toBe(200)
      expect(response.body.data).toEqual([])
      expect(response.body.error).toBeNull()
    })
  })

  describe('POST /api/v1/todos', () => {
    it('creates a new todo', async () => {
      const response = await request(app)
        .post('/api/v1/todos')
        .send({ text: 'Test todo' })

      expect(response.status).toBe(201)
      expect(response.body.data.text).toBe('Test todo')
      expect(response.body.data.completed).toBe(false)
      expect(response.body.error).toBeNull()
    })

    it('returns error for missing text', async () => {
      const response = await request(app)
        .post('/api/v1/todos')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Text is required')
    })
  })
})
