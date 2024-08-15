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
	docker compose up

# target: down - Stop the docker container.
down:
	docker compose down -v

# target: run - Run local web server.
run:
	python src/app.py