import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import Column from './Column'
import AddTodoForm from './AddTodoForm'
import TodoCard from './TodoCard'
import './KanbanBoard.css'

const STORAGE_KEY = 'kanban-todos'

const INITIAL_TODOS = []

function KanbanBoard() {
  const [todos, setTodos] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : INITIAL_TODOS
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const handleAddTodo = (newTodo) => {
    setTodos(prev => [...prev, newTodo])
    setShowAddForm(false)
  }

  const handleUpdateTodo = (id, updates) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    ))
  }

  const handleDeleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const todoId = active.id
    const newStatus = over.id

    if (['todo', 'doing', 'done'].includes(newStatus)) {
      const todo = todos.find(t => t.id === todoId)
      if (todo && todo.status !== newStatus) {
        handleUpdateTodo(todoId, { status: newStatus })
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const activeTodo = activeId ? todos.find(t => t.id === activeId) : null

  const todoItems = todos.filter(t => t.status === 'todo')
  const doingItems = todos.filter(t => t.status === 'doing')
  const doneItems = todos.filter(t => t.status === 'done')

  return (
    <>
      <div className="kanban-toolbar">
        <button className="btn-add-todo" onClick={() => setShowAddForm(true)}>
          + Add Todo
        </button>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="kanban-board">
          <Column
            status="todo"
            items={todoItems}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
            onAddClick={() => setShowAddForm(true)}
          />
          <Column
            status="doing"
            items={doingItems}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
          />
          <Column
            status="done"
            items={doneItems}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
          />
        </div>
        <DragOverlay>
          {activeTodo ? (
            <div className="drag-overlay-card">
              <TodoCard item={activeTodo} onUpdate={() => {}} onDelete={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {showAddForm && (
        <AddTodoForm
          onAdd={handleAddTodo}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </>
  )
}

export default KanbanBoard
