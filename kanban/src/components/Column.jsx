import { useDroppable } from '@dnd-kit/core'
import TodoCard from './TodoCard'
import './Column.css'

const COLUMN_TITLES = {
  todo: 'Todo',
  doing: 'Doing',
  done: 'Done'
}

function Column({ status, items, onUpdate, onDelete }) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  })

  return (
    <div className={`column ${isOver ? 'column-over' : ''}`}>
      <h2 className="column-title">
        {COLUMN_TITLES[status]}
        <span className="column-count">{items.length}</span>
      </h2>
      <div className="column-content" ref={setNodeRef}>
        {items.map(item => (
          <TodoCard
            key={item.id}
            item={item}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        {items.length === 0 && (
          <p className="column-empty">Drop items here</p>
        )}
      </div>
    </div>
  )
}

export default Column
