from flask import Flask
from flask_cors import CORS


def create_app() -> Flask:
    """Application factory for the Flask app."""
    app = Flask(__name__)
    CORS(app)

    from app.routes import todos

    app.register_blueprint(todos.bp, url_prefix="/api/v1/todos")

    @app.get("/api/v1/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app
