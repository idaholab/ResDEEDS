using SpineOpt

run_spineopt(ARGS..., upgrade=true)

# The above uses the default solvers which are currently CLP for LP problems and Cbc for MIP problems
# The below is an example for using the CPLEX solver. Other solvers follow a similar form
#=
using SpineOpt
using CPLEX
using JuMP

run_spineopt(
	ARGS...,
	mip_solver=optimizer_with_attributes(
		CPLEX.Optimizer, 
		"CPX_PARAM_EPGAP" => 0.01
	),
	lp_solver=optimizer_with_attributes(CPLEX.Optimizer)
)
=#
