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
