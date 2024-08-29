.PHONY: run
include .env
export

# target: help - Display callable targets.
help:
	@egrep "^# target:" [Mm]akefile

# target: build - Build the docker image.
build:
	docker compose build --no-cache

# target: up - Start the docker container.
up:
	docker compose up -d

# target: stop - Stop the docker container.
stop:
	docker compose stop

# target: down - Stop the docker container.
down:
	docker compose down -v

# target: run - Run local web server.
run:
	python src/app.py

# target: attach - Attach to the running container.
attach:
	docker attach rescalc

# target: bash - Run bash in the container.
bash:
	docker exec -it rescalc bash

# target: shell - Run shell in the container.
shell:
	docker exec -it rescalc flask shell