julia -e 'using Pkg; Pkg.rm("SpineInterface")' || true
julia -e 'using Pkg; Pkg.rm("SpineOpt")' || true
julia -e 'using Pkg; Pkg.add(url="https://github.com/spine-tools/SpineInterface.jl.git")'
julia -e 'using Pkg; Pkg.add(url="https://github.com/spine-tools/SpineOpt.jl.git")'
julia -e 'using Pkg; Pkg.add(["XLSX", "DataFrames", "Distributions", "CSV", "Revise", "Cbc", "Clp"])'