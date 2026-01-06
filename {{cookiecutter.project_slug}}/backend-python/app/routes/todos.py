from typing import Any

from flask import Blueprint, jsonify, request

bp = Blueprint("todos", __name__)

# In-memory storage for demo purposes
todos: list[dict[str, Any]] = []
next_id = 1


@bp.get("/")
def get_todos() -> tuple[dict[str, Any], int]:
    """Get all todos."""
    return {"data": todos, "error": None}, 200


@bp.get("/<int:todo_id>")
def get_todo(todo_id: int) -> tuple[dict[str, Any], int]:
    """Get a specific todo by ID."""
    todo = next((t for t in todos if t["id"] == todo_id), None)
    if not todo:
        return {"data": None, "error": "Todo not found"}, 404
    return {"data": todo, "error": None}, 200


@bp.post("/")
def create_todo() -> tuple[dict[str, Any], int]:
    """Create a new todo."""
    global next_id

    data = request.get_json()
    if not data or not data.get("text"):
        return {"data": None, "error": "Text is required"}, 400

    todo = {
        "id": next_id,
        "text": data["text"].strip(),
        "completed": False,
    }
    next_id += 1
    todos.append(todo)

    return {"data": todo, "error": None}, 201


@bp.patch("/<int:todo_id>")
def update_todo(todo_id: int) -> tuple[dict[str, Any], int]:
    """Update a todo."""
    todo = next((t for t in todos if t["id"] == todo_id), None)
    if not todo:
        return {"data": None, "error": "Todo not found"}, 404

    data = request.get_json()
    if data:
        if "text" in data:
            todo["text"] = data["text"]
        if "completed" in data:
            todo["completed"] = data["completed"]

    return {"data": todo, "error": None}, 200


@bp.delete("/<int:todo_id>")
def delete_todo(todo_id: int) -> tuple[dict[str, Any], int]:
    """Delete a todo."""
    global todos

    todo_index = next((i for i, t in enumerate(todos) if t["id"] == todo_id), None)
    if todo_index is None:
        return {"data": None, "error": "Todo not found"}, 404

    deleted = todos.pop(todo_index)
    return {"data": deleted, "error": None}, 200
