import { useState } from 'react'

interface AddTodoProps {
  onAdd: (text: string) => void
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onAdd(text.trim())
      setText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={% raw %}{{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}{% endraw %}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new todo..."
        style={% raw %}{{ flex: 1, padding: '0.5rem' }}{% endraw %}
      />
      <button type="submit">Add</button>
    </form>
  )
}
