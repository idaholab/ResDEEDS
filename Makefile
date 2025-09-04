.PHONY: help
include .env
export

# target: help - Display callable targets.
help:
	@egrep "^# target:" [Mm]akefile

# target: dev - Run the development server.
dev:
	@echo "Starting development server..."
	pnpm dev

# target: build - Build the application.
build:
	@echo "Building the application..."
	pnpm build

# target: test - Run tests.
test:
	@echo "Running tests..."
	pnpm test:run

# target: coverage - Generate code coverage report.
coverage:
	@echo "Generating code coverage report..."
	pnpm test:coverage

# target: lint - Run the linter.
lint:
	@echo "Running linter..."
	pnpm lint

# target: check - Run all checks (lint, test, coverage).
check: lint test coverage
	@echo "All checks passed."

# target: build-backend - Build the backend executable.
build-backend:
	@echo "Building backend executable..."
	cd src/backend && uv run build.py

# target: build-backend-clean - Clean build and rebuild backend executable.
build-backend-clean:
	@echo "Clean building backend executable..."
	cd src/backend && python build.py --no-deps

# target: verify-backend - Verify backend build.
verify-backend:
	@echo "Verifying backend build..."
	cd src/backend && python build.py --verify-only

# target: dist - Build the distribution package with backend.
dist: build-backend
	@echo "Building distribution package with backend..."
	pnpm dist

# target: dist-mac - Build macOS distribution package.
dist-mac: build-backend
	@echo "Building macOS distribution package..."
	pnpm dist:mac

# target: dist-win - Build Windows distribution package.
dist-win: build-backend
	@echo "Building Windows distribution package..."
	pnpm dist:win

# target: dist-linux - Build Linux distribution package.
dist-linux: build-backend
	@echo "Building Linux distribution package..."
	pnpm dist:linux
