export interface Todo {
  id: number
  text: string
  completed: boolean
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
