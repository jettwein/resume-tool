import { useState } from 'react'
import './AddTodoForm.css'

function AddTodoForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('todo')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      body: body.trim(),
      status,
      createdAt: new Date().toISOString()
    })

    setTitle('')
    setBody('')
    setStatus('todo')
    setError('')
  }

  return (
    <div className="add-todo-overlay" onClick={onCancel}>
      <form className="add-todo-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Add New Todo</h2>

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (error) setError('')
            }}
            placeholder="Enter todo title"
            autoFocus
          />
          {error && <span className="error">{error}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="body">Description</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter description (optional)"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-add">
            Add Todo
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddTodoForm
