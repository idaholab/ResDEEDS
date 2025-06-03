.PHONY: build up stop down clean deploy
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
	docker compose down -v --remove-orphans

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

# target: run-api - Run the api locally
run-api:
	cd api && uvicorn src.main:app --host 0.0.0.0 --port 5000 --reload

# target: run-web - Run the web locally
run-web:
	cd web && ng serve
