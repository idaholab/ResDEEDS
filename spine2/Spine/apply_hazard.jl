using Revise
using SpineInterface
using SpineOpt
using XLSX
using DataFrames
using Distributions
using Dates

user_input_fp, system_url = ARGS

module System end

using_spinedb(system_url, System)

"""
Apply hazards into system.
Create one scenario per hazard.
"""
function apply_hazards()
	hazard_df = DataFrame(XLSX.readtable(user_input_fp, "hazard"))
	hazard_component_df = DataFrame(XLSX.readtable(user_input_fp, "hazard_component"))
	hazards = [row[1] for row in eachrow(hazard_df)]
	model_hazard = Dict()
	for (hzrd, mtts, mtte, model) in eachrow(hazard_df)
		push!(get!(model_hazard, Symbol(model), []), (hzrd, mtts, mtte))
	end
	hazard_components = Dict()
	for (hzrd, comp_type, name, percentage_affected, failure_avail_factor) in eachrow(hazard_component_df)
		push!(get!(hazard_components, hzrd, []), (comp_type, name, percentage_affected, failure_avail_factor))
	end
	pvals = []
	for m in System.model()
		push!(pvals, ("model", string(m.name), "is_active", false, "Base"))
		m_start = System.model_start(model=m, _strict=false)
		m_end = System.model_end(model=m, _strict=false)
		# Simulate hazard forced outages
		# Simulate components failures
		for (hzrd, mtts, mtte) in get(model_hazard, m.name, ())
			hzrd_alt = string(hzrd, "_alt")
			no_hzrd_alt = string("no_", hzrd, "_alt")
			push!(pvals, ("model", string(m.name), "is_active", true, hzrd_alt))
			push!(pvals, ("model", string(m.name), "is_active", true, no_hzrd_alt))
			hazard_fo = unparse_db_value(
				forced_availability_factor_time_series(
					m_start,
					m_end,
					parse_db_value(Dict("data" => mtts, "type" => "duration")),
					parse_db_value(Dict("data" => mtte, "type" => "duration"))
				)
			)
			affected_components = []
			for (comp_type, name, percentage_affected, failure_avail_factor) in get(hazard_components, hzrd, ())
				comp_type = Symbol(comp_type)
				if !isempty(name)
					push!(affected_components, (comp_type, Symbol(name), failure_avail_factor))
				elseif !isempty(percentage_affected)
					component_class = getproperty(System, comp_type)
					components = component_class()
					uniform = DiscreteUniform(1, length(components))
					for i in rand(uniform, div(percentage_affected * length(components), 100))
						obj = components[i]
						push!(affected_components, (comp_type, obj.name, failure_avail_factor))
					end
				end
			end
			for (comp_type, comp_name, failure_avail_factor) in affected_components
				# TODO: Apply failure_avail_factor to hazard_fo
				forced_availability_factor = (comp_type, comp_name, "forced_availability_factor", hazard_fo, hzrd_alt)
				push!(pvals, forced_availability_factor)
			end
		end
	end
	# Generate scenarios and alternatives
	scens = [(string(prefix, h), true) for h in hazards for prefix in ("", "no_")]
	alts = []
	scen_alts = []
	for (scen, active) in scens
		alt = string(scen, "_alt")
		push!(alts, alt)
		push!(scen_alts, (scen, alt, nothing))
		push!(scen_alts, (scen, "Base", alt))
	end
	# Import data
	data = Dict(
		:object_parameter_values => pvals,
		:alternatives => alts,
		:scenarios => scens,
		:scenario_alternatives => scen_alts
	)
	println(import_data(system_url, data, "Apply hazard"))
end

apply_hazards()