.PHONY: help
include .env
export

# target: help - Display callable targets.
help:
	@egrep "^# target:" [Mm]akefile
