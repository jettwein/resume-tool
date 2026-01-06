.PHONY: dev test lint build clean install

# Install all dependencies
install:
	cd frontend && npm install
{% if cookiecutter.backend_choice == 'node' %}
	cd backend-node && npm install
{% else %}
	cd backend-python && pip install -e ".[dev]"
{% endif %}

# Start development servers
dev:
{% if cookiecutter.use_docker == 'yes' %}
	docker-compose up
{% else %}
	@echo "Starting frontend and backend..."
	@echo "Run in separate terminals:"
	@echo "  cd frontend && npm run dev"
{% if cookiecutter.backend_choice == 'node' %}
	@echo "  cd backend-node && npm run dev"
{% else %}
	@echo "  cd backend-python && flask run --port 3000"
{% endif %}
{% endif %}

# Run all tests
test:
	cd frontend && npm run test
{% if cookiecutter.backend_choice == 'node' %}
	cd backend-node && npm run test
{% else %}
	cd backend-python && pytest
{% endif %}

# Run linters
lint:
	cd frontend && npm run lint && npm run typecheck
{% if cookiecutter.backend_choice == 'node' %}
	cd backend-node && npm run lint
{% else %}
	cd backend-python && ruff check . && mypy app
{% endif %}

# Build for production
build:
	cd frontend && npm run build
{% if cookiecutter.backend_choice == 'node' %}
	cd backend-node && npm run build
{% endif %}

{% if cookiecutter.use_docker == 'yes' %}
# Clean up Docker resources
clean:
	docker-compose down -v --remove-orphans
{% endif %}
