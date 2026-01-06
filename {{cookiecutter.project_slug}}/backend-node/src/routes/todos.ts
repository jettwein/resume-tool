import { Router } from 'express'
import type { Todo } from '../types/index.js'

const router = Router()

// In-memory storage for demo purposes
let todos: Todo[] = []
let nextId = 1

// GET /api/v1/todos
router.get('/', (_req, res) => {
  res.json({ data: todos, error: null })
})

// GET /api/v1/todos/:id
router.get('/:id', (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id))
  if (!todo) {
    res.status(404).json({ data: null, error: 'Todo not found' })
    return
  }
  res.json({ data: todo, error: null })
})

// POST /api/v1/todos
router.post('/', (req, res) => {
  const { text } = req.body
  if (!text || typeof text !== 'string') {
    res.status(400).json({ data: null, error: 'Text is required' })
    return
  }

  const todo: Todo = {
    id: nextId++,
    text: text.trim(),
    completed: false,
  }
  todos.push(todo)
  res.status(201).json({ data: todo, error: null })
})

// PATCH /api/v1/todos/:id
router.patch('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const todoIndex = todos.findIndex((t) => t.id === id)

  if (todoIndex === -1) {
    res.status(404).json({ data: null, error: 'Todo not found' })
    return
  }

  const { text, completed } = req.body
  if (text !== undefined) {
    todos[todoIndex].text = text
  }
  if (completed !== undefined) {
    todos[todoIndex].completed = completed
  }

  res.json({ data: todos[todoIndex], error: null })
})

// DELETE /api/v1/todos/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const todoIndex = todos.findIndex((t) => t.id === id)

  if (todoIndex === -1) {
    res.status(404).json({ data: null, error: 'Todo not found' })
    return
  }

  const [deleted] = todos.splice(todoIndex, 1)
  res.json({ data: deleted, error: null })
})

export { router as todoRouter }
