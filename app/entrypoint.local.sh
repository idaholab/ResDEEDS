#!/bin/sh
# Copyright 2023, Battelle Energy Alliance, LLC

mv /opt/spine/spine-engine /opt/resilience_calculator/spine/
mv /opt/spine/spine-items /opt/resilience_calculator/spine/
mv /opt/spine/spinedb-api /opt/resilience_calculator/spine/
mv /opt/spine/spinetoolbox /opt/resilience_calculator/spine/

tail -f /dev/null