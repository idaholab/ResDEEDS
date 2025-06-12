# Project Agents.md Guide for ResDEEDS

This Agents.md file provides comprehensive guidance for ResDEEDS when working with code in this repository.

## Project Overview

ResDEEDS (Resilience Development for Electric Energy Delivery Systems) is a decision-support tool for assessing electric energy delivery systems resilience. It combines a FastAPI backend with an Angular frontend, using MongoDB for persistence and PyPSA for power system analysis.

## Development Commands

### Docker-based Development (Recommended)
```bash
# Start all services
docker compose up --build

# Using Makefile shortcuts
make build         # Build development docker images
make build-prod    # Build production docker images
make up            # Start development containers in detached mode
make up-prod       # Start production containers in detached mode
make down          # Stop and remove containers
make stop          # Stop containers without removing

# Access running containers
make attach-web    # Attach to web container
make attach-api    # Attach to API container
make bash-api      # Run bash in API container
```

Note: Development uses `Dockerfile.dev` for hot-reloading and faster rebuilds, while production uses optimized `Dockerfile` with security hardening.

### Local Development
```bash

Copy over env.dist to .env file

`cp env.dist .env`

# Run API locally (requires uv and virtual environment)
make run-api
# Or: cd api && uv run uvicorn src.main:app --host 0.0.0.0 --port 5000 --reload

# Install API dependencies (use --active to target the existing virtual environment)
cd api && uv sync --dev --active

# Install deployment dependencies  
cd deploy && uv sync

# Run Angular frontend locally
make run-web
# Or: cd web && ng serve

# Angular commands
cd web
ng build              # Build for production
ng build --watch      # Build with file watching
ng test               # Run unit tests
```

### Deployment
```bash
make deploy    # Deploy to production server via deploy/main.py
```

## Architecture

### Backend (FastAPI)
- **Entry Point**: `api/src/main.py` - FastAPI app with CORS middleware
- **Routes**: Organized in `api/src/routes/`
  - `auth.py` - Authentication endpoints
  - `projects/` - Project management (projects.py, cases.py, analysis.py)
- **Business Logic**: `api/src/bll/`
  - `auth.py` - Authentication logic
  - `psa/` - PyPSA integration for power system analysis
  - `utils.py` - Common utilities
- **Models**: `api/src/models/`
  - `database/` - MongoDB document models
  - `payload/` - Request/response models
- **Database**: `api/src/database/` - MongoDB integration

### Frontend (Angular 19)
- **Entry Point**: `web/src/main.ts`
- **Routing**: `web/src/app/app.routes.ts` - Protected routes with AuthGuard
- **Components**: `web/src/app/components/`
  - Authentication: login, signup
  - Core: home, navbar, projects
  - Specialized: drawio-diagram, project-diagram
- **Services**: `web/src/app/services/`
  - `auth.service.ts` - JWT authentication
  - `project.service.ts` - Project CRUD operations
  - `auth.guard.ts` - Route protection
  - `auth.interceptor.ts` - HTTP request authentication

### Key Integrations
- **PyPSA**: Python power system analysis framework for electrical modeling
- **DrawIO**: Embedded diagram editor for energy system visualization
- **MongoDB**: Document storage for projects, cases, and user data
- **JWT**: Token-based authentication between frontend and backend

## Service Architecture

The application runs as three Docker services:
- **web**: Angular frontend (ports 80, 443, 4200)
- **api**: FastAPI backend (port 5000)
- **mongodb**: MongoDB database (port 27017)

Environment configuration is managed via `api/.env` file.

## Power System Analysis

The core functionality revolves around PyPSA integration:
- Linear power flow analysis (LPF)
- Network modeling for electrical systems
- Resilience assessment workflows
- Integration with the INL Resilience Framework for Electric Energy Delivery Systems
