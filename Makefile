.PHONY: build up stop down clean deploy
include .env
export

# target: help - Display callable targets.
help:
	@egrep "^# target:" [Mm]akefile

# target: build - Build the docker image.
build:
	docker compose build --no-cache

# target: build-prod - Build the production docker image.
build-prod:
	docker compose -f compose.production.yml build --no-cache

# target: up - Start the docker container.
up:
	docker compose up -d

# target: up-prod - Start the production docker container.
up-prod:
	docker compose -f compose.production.yml up -d

# target: stop - Stop the docker container.
stop:
	docker compose stop

# target: stop-prod - Stop the production docker container.
stop-prod:
	docker compose -f compose.production.yml stop

# target: down - Stop the docker container.
down:
	docker compose down -v --remove-orphans

# target: down-prod - Stop the production docker container.
down-prod:
	docker compose -f compose.production.yml down -v --remove-orphans

# target: deploy - deploy to resdeeds server
deploy:
	cd deploy && python main.py

# target: attach-web - Attach to the running container.
attach-web:
	docker attach resdeeds-web

# target: attach-api - Attach to the running container.
attach-api:
	docker attach resdeeds-api

# target: bash-api - Run bash in the container.
bash-api:
	docker exec -it resdeeds-api bash

# target: install-api - Install api dependencies
install-api:
	cd api && uv sync --dev

# target: run-api - Run the api locally
run-api:
	cd api && uv run uvicorn src.main:app --host 0.0.0.0 --port 5000 --reload

# target: install-web - Install web dependencies
install-web:
	cd web && pnpm install

# target: run-web - Run the web locally
run-web:
	cd web && pnpm ng serve
