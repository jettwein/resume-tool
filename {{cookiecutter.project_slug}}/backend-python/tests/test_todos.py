import pytest
from app import create_app


@pytest.fixture
def client():
    """Create a test client for the app."""
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health(client):
    """Test health endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json == {"status": "ok"}


def test_get_todos_empty(client):
    """Test getting todos when empty."""
    response = client.get("/api/v1/todos/")
    assert response.status_code == 200
    assert response.json["error"] is None


def test_create_todo(client):
    """Test creating a new todo."""
    response = client.post("/api/v1/todos/", json={"text": "Test todo"})
    assert response.status_code == 201
    assert response.json["data"]["text"] == "Test todo"
    assert response.json["data"]["completed"] is False
    assert response.json["error"] is None


def test_create_todo_missing_text(client):
    """Test creating a todo without text."""
    response = client.post("/api/v1/todos/", json={})
    assert response.status_code == 400
    assert response.json["error"] == "Text is required"
