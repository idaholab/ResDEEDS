# will be used primarily for testing
FROM ubuntu:22.04
RUN apt update
RUN apt install python3 python3-pip git -y
WORKDIR /resilience_calculator
COPY requirements.txt requirements.txt 
RUN python3 -m pip install -r requirements.txt
RUN jill install --confirm
# should lock this to a commit hash
RUN julia -e 'using Pkg; Pkg.add(url="https://github.com/spine-tools/SpineInterface.jl.git")'
RUN julia -e 'using Pkg; Pkg.add(url="https://github.com/spine-tools/SpineOpt.jl.git")'
RUN julia -e 'using Pkg; Pkg.add(["XLSX", "DataFrames", "Distributions", "CSV", "Revise"])'
COPY config config
COPY spine spine
COPY src src
RUN apt install libglib2.0-dev libgl-dev libxkbcommon-x11-0 -y
RUN apt install libegl-dev build-essential libgl1-mesa-dev libdbus-1-3 -y
# WORKDIR /resilience_calculator/src
ENV FLASK_APP=./src/app.py
ENTRYPOINT [ "flask", "run", "--host=0.0.0.0" ]