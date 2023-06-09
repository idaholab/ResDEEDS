#!/bin/bash -e
apt update
apt install python3 python3-pip git -y
python3 -m pip install pip --upgrade
python3 -m pip install -r requirements.txt
python3 -m jill install --confirm
# should lock this to a commit hash
julia -e 'using Pkg; Pkg.add(url="https://github.com/spine-tools/SpineInterface.jl.git")'
julia -e 'using Pkg; Pkg.add(url="https://github.com/spine-tools/SpineOpt.jl.git")'
julia -e 'using Pkg; Pkg.add(["XLSX", "DataFrames", "Distributions", "CSV", "Revise", "Cbc", "Clp"])'
apt install libglib2.0-dev libgl-dev libxkbcommon-x11-0 -y
apt install libegl-dev build-essential libgl1-mesa-dev libdbus-1-3 -y