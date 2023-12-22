FROM python:3.10

# OS binaries
RUN apt update && apt-get -y upgrade
RUN apt-get install -y libpq-dev libglib2.0-dev libgl-dev libxkbcommon-x11-0 libegl-dev build-essential libgl1-mesa-dev libdbus-1-3
RUN apt-get install -y wget python3 python3-pip git

# Source code
WORKDIR /opt/resilience_calculator
COPY . .

# Certificates
RUN wget -q -P /usr/local/share/ca-certificates/ http://certstore.inl.gov/pki/CAINLROOT_B64.crt
RUN /usr/sbin/update-ca-certificates
RUN pip config set global.cert /usr/local/share/ca-certificates/CAINLROOT_B64.crt

# App dependencies
RUN pip install --default-timeout=1000 -r requirements.dev.txt
RUN pip install --default-timeout=1000 --src /opt/spine -r requirements.spine.txt
ENV PATH=$PATH:/opt/spine

# Config
RUN mkdir -p /root/.spinetoolbox/SpineProject
COPY ./install/SpineToolbox.conf /root/.spinetoolbox/SpineProject

# Julia
WORKDIR /opt
RUN wget https://julialang-s3.julialang.org/bin/linux/x64/1.9/julia-1.9.3-linux-x86_64.tar.gz
RUN tar zxvf julia-1.9.3-linux-x86_64.tar.gz
ENV PATH=$PATH:/opt/julia-1.9.3/bin
RUN . ./resilience_calculator/install/julia.sh

# Environment
ENV QT_QPA_PLATFORM="offscreen"
ENV FLASK_APP=./src/app.py

WORKDIR /opt/resilience_calculator