{% if cookiecutter.include_sample_app == 'yes' %}import { useState } from 'react'
import { TodoList } from './components/TodoList'
import { AddTodo } from './components/AddTodo'
import type { Todo } from './types'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])

  const addTodo = (text: string) => {
    setTodos([...todos, { id: Date.now(), text, completed: false }])
  }

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <main style={% raw %}{{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}{% endraw %}>
      <h1>{{ cookiecutter.project_name }}</h1>
      <AddTodo onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </main>
  )
}{% else %}function App() {
  return (
    <main style={% raw %}{{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}{% endraw %}>
      <h1>{{ cookiecutter.project_name }}</h1>
      <p>Welcome to your new project. Start building!</p>
    </main>
  )
}{% endif %}

export default App
