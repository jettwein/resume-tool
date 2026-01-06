import type { Todo } from '../types'

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p>No todos yet. Add one above!</p>
  }

  return (
    <ul style={% raw %}{{ listStyle: 'none', padding: 0 }}{% endraw %}>
      {todos.map((todo) => (
        <li
          key={todo.id}
          style={% raw %}{{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0',
            borderBottom: '1px solid #eee',
          }}{% endraw %}
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
          />
          <span
            style={% raw %}{{
              flex: 1,
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? '#888' : 'inherit',
            }}{% endraw %}
          >
            {todo.text}
          </span>
          <button onClick={() => onDelete(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}
