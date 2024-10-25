.PHONY: run
include api/.env
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

# target: attach-web - Attach to the running container.
attach-web:
	docker attach resdeeds-web

# target: attack-api - Attach to the running container.
attach-api:
	docker attach resdeeds-api

# target: bash-api - Run bash in the container.
bash-api:
	docker exec -it resdeeds-api bash

# target: shell - Run shell in the container.
shell:
	docker exec -it resdeeds-api flask shell