import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import './TodoCard.css'

function TodoCard({ item, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)
  const [editBody, setEditBody] = useState(item.body)
  const [editStatus, setEditStatus] = useState(item.status)
  const [error, setError] = useState('')

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const handleSave = () => {
    if (!editTitle.trim()) {
      setError('Title is required')
      return
    }
    onUpdate(item.id, {
      title: editTitle.trim(),
      body: editBody.trim(),
      status: editStatus
    })
    setIsEditing(false)
    setError('')
  }

  const handleCancel = () => {
    setEditTitle(item.title)
    setEditBody(item.body)
    setEditStatus(item.status)
    setIsEditing(false)
    setError('')
  }

  const handleDelete = () => {
    onDelete(item.id)
    setShowDeleteConfirm(false)
  }

  const handleStatusChange = (newStatus) => {
    setEditStatus(newStatus)
    if (!isEditing) {
      onUpdate(item.id, { status: newStatus })
    }
  }

  if (isEditing) {
    return (
      <div className="card card-editing">
        <div className="form-group">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => {
              setEditTitle(e.target.value)
              if (error) setError('')
            }}
            placeholder="Title"
            autoFocus
          />
          {error && <span className="error">{error}</span>}
        </div>
        <div className="form-group">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
          />
        </div>
        <div className="form-group">
          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="card-actions">
          <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card ${isDragging ? 'card-dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="card-header">
        <h3 className="card-title">{item.title}</h3>
        <div className="card-menu">
          <button className="btn-icon" onClick={() => setIsEditing(true)} title="Edit">
            ✏️
          </button>
          <button className="btn-icon" onClick={() => setShowDeleteConfirm(true)} title="Delete">
            🗑️
          </button>
        </div>
      </div>
      {item.body && <p className="card-body">{item.body}</p>}
      <div className="card-footer">
        <select
          className="status-dropdown"
          value={item.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="todo">Todo</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
        <span className="card-date">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirm" onClick={e => e.stopPropagation()}>
            <p>Delete this todo?</p>
            <div className="delete-confirm-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TodoCard
