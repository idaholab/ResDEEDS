.PHONY: run
include .env
export

# target: help - Display callable targets.
help:
	@egrep "^# target:" [Mm]akefile

# target: run - Run local web server.
run:
	python src/app.py