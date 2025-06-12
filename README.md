# ⚡ ResDEEDS

Resilience Development for Electric Energy Delivery Systems

## 🧠 Overview

Resilience Development for Electric Energy Delivery Systems (ResDEEDS) is a decision-support tool designed to guide users through the assessment of electric energy delivery systems (EEDS) resilience. Built on top of the PyPSA (Python for Power System Analysis) framework, ResDEEDS automates the core steps of the INL Resilience Framework for EEDS. It enables systematic evaluation, tracks resilience planning activities, and offers data-driven recommendations for mitigating potential hazards.

## 🔧 Tech Stack

- **Languages:** Python, TypeScript, JavaScript
- **Frameworks:** FastAPI, Angular
- **Database:** MongoDB
- **Package Management:** pnpm (frontend), uv (backend)
- **Containerization:** Docker, Docker Compose
- **Tools:**
  - [PyPSA](https://pypsa.readthedocs.io/) (for power system modeling)
  - [DrawIO](https://github.com/jgraph/drawio) (for energy diagrams)

## 🚀 Features

- Secure authentication and user management (JWT-based)
- Project and case management
- Linear power flow analysis (LPF) and network modeling
- RESTful API endpoints for integration
- Responsive, modern web UI
- Containerized deployment for easy setup

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/idaholabs/ResDEEDS.git
cd ResDEEDS
```

Copy over env.dist to .env file

`cp env.dist .env`

### Run with Docker (Recommended)

```bash
docker compose up --build
```

### Local Development

For frontend development, this project uses **pnpm** as the package manager:

```bash
# Install pnpm (if not already installed)
npm install -g pnpm

# Install frontend dependencies
cd web
pnpm install

# Run development server
pnpm start
# or
ng serve
```

For backend development, this project uses **uv** as the package manager:

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create a virtual environment (if not already created)
uv venv --directory api


# Activate virtual environment
cd api
source .venv/bin/activate

# Install backend dependencies
uv sync --dev

# Run development server
uv run uvicorn src.main:app --host 0.0.0.0 --port 5000 --reload
```

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

## 📄 License

This project is licensed under the terms of the [LICENSE.txt](LICENSE.txt).

## 📬 Contact

For questions or support, please open an issue or contact the maintainers via GitHub.
