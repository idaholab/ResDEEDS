using SpineInterface
using Dates

url_in, url_out = ARGS

function _do_work()
	scens = [x["name"] for x in run_request(url_in, "query", ("scenario_sq",))["scenario_sq"]]
	alts = [x["name"] for x in run_request(url_in, "query", ("alternative_sq",))["alternative_sq"]]
	scen_alts = [
		(x["scenario_name"], x["alternative_name"], x["before_alternative_name"])
		for x in run_request(
			url_in, "query", ("ext_linked_scenario_alternative_sq",)
		)["ext_linked_scenario_alternative_sq"]
	]
	data = Dict(:alternatives => alts, :scenarios => scens, :scenario_alternatives => scen_alts)
	import_data(url_out, data, "Create hazard scenarios and alternatives")
	for alt in alts
		_import_alt_data(alt)
	end
end

function _import_alt_data(alt)
	M = Module()
	using_spinedb(url_in, M; filters=Dict("alternatives" => [String(alt)]))
	objects = []  # Tuples (class, object)
	object_pvals = []  # Tuples (class, object, parameter, value, alternative)
	relationships = []  # Tuples (class, tuple of (object1, object2, ...))
	relationship_pvals = []  # Tuples (class, tuple of (object1, object2, ...), parameter, value, alternative)
	data = Dict(
		:objects => objects,
		:object_parameter_values => object_pvals,
		:relationships => relationships,
		:relationship_parameter_values => relationship_pvals,
	)
	# Model stuff
	push!(objects, ("temporal_block", "flat"))
	push!(objects, ("stochastic_structure", "deterministic"))
	push!(objects, ("stochastic_scenario", "realisation"))
	push!(objects, ("report", "basic_report"))
	push!(relationships, ("stochastic_structure__stochastic_scenario", ("deterministic", "realisation")))
	push!(relationships, ("report__output", ("basic_report", "node_slack_pos")))  # For load not served metrics
	push!(relationships, ("report__output", ("basic_report", "node_state")))
	push!(relationships, ("report__output", ("basic_report", "unit_flow")))
	push!(relationships, ("report__output", ("basic_report", "connection_flow")))
	for m in M.model()
		push!(objects, ("model", m.name))
		push!(relationships, ("model__temporal_block", (m.name, "flat")))
		push!(relationships, ("model__default_temporal_block", (m.name, "flat")))
		push!(relationships, ("model__stochastic_structure", (m.name, "deterministic")))
		push!(relationships, ("model__default_stochastic_structure", (m.name, "deterministic")))
		push!(relationships, ("model__report", (m.name, "basic_report")))
		resolution = M.resolution(model=m, _strict=false)
		model_start = M.model_start(model=m, _strict=false)
		model_end = M.model_end(model=m, _strict=false)
		roll_fwd = M.roll_forward(model=m, _strict=false)
		is_active = M.is_active(model=m, _strict=false)
		resolution === nothing || push!(
			object_pvals, ("temporal_block", "flat", "resolution", unparse_db_value(resolution), alt)
		)
		model_start === nothing || push!(object_pvals, ("model", m.name, "model_start", unparse_db_value(model_start), alt))
		model_end === nothing || push!(object_pvals, ("model", m.name, "model_end", unparse_db_value(model_end), alt))
		roll_fwd === nothing || push!(object_pvals, ("model", m.name, "roll_forward", unparse_db_value(roll_fwd), alt))
		is_active === nothing || push!(object_pvals, ("model", m.name, "is_active", unparse_db_value(is_active), alt))
	end
	for n in M.reserve()
		push!(objects, ("node", n.name))
		abs_req = M.absolute_requirement(reserve=n, _strict=false)
		abs_req === nothing || push!(object_pvals, ("node", n.name, "demand", unparse_db_value(abs_req), alt))
	end
	for (u, n) in M.thermal_unit__reserve()
		push!(relationships, ("unit__to_node", (u.name, n.name)))
	end
	for n in M.electricity_node()
		push!(objects, ("node", n.name))
		demands = (M.absolute_demand(demand=d, _strict=false) for d in M.demand__electricity_node(electricity_node=n))
		total_demand = sum(d for d in demands if d !== nothing; init=0)
		if !iszero(total_demand)
			push!(object_pvals, ("node", n.name, "demand", unparse_db_value(total_demand), alt))
			push!(object_pvals, ("node", n.name, "node_slack_penalty", 1, alt))
		end
		balance_type = M.balance_type(electricity_node=n, _strict=false)
		if balance_type == :infinite_supply
			push!(object_pvals, ("node", n.name, "nodal_balance_sense", "<=", alt))
		end
	end
	for n in M.fuel_storage()
		push!(objects, ("node", n.name))
		push!(object_pvals, ("node", n.name, "has_state", true, alt))
	end
	for u in M.thermal_unit()
		push!(objects, ("unit", u.name))
		mut = M.minimum_up_time(thermal_unit=u, _strict=false)
		mut === nothing || push!(object_pvals, ("unit", u.name, "min_up_time", unparse_db_value(Hour(mut)), alt))
		mdt = M.minimum_down_time(thermal_unit=u, _strict=false)
		mdt === nothing || push!(object_pvals, ("unit", u.name, "min_down_time", unparse_db_value(Hour(mdt)), alt))
		suc = M.start_up_cost(thermal_unit=u, _strict=false)
		suc === nothing || push!(object_pvals, ("unit", u.name, "start_up_cost", suc, alt))
		for n_to in M.thermal_unit__electricity_node(thermal_unit=u)
			push!(relationships, ("unit__to_node", (u.name, n_to.name)))
			cap = M.max_capacity(thermal_unit=u, _strict=false) 
			cap === nothing || push!(
				relationship_pvals, ("unit__to_node", (u.name, n_to.name), "unit_capacity", cap, alt)
			)
			ms = M.min_stable(thermal_unit=u, _strict=false)
			if !(ms === nothing)
				if cap === nothing
					@warn(
						"A value for min_stable has been defined for thermal_unit $u ",
						"but no value for `max_capacity` was found. min_stable is ignored for this unit")
				else
					min_val = ms / cap
					push!(
						relationship_pvals,
						("unit__to_node", (u.name, n_to.name), "minimum_operating_point", min_val, alt)
					)
				end
			end
		end	
	end
	for u in M.wind_unit()
		push!(objects, ("unit", u.name))
		avf = M.availability_factor(wind_unit=u, _strict=false)
		avf === nothing || push!(object_pvals, ("unit", u.name, "unit_availability_factor", unparse_db_value(avf), alt))
		for n in M.wind_unit__electricity_node(wind_unit=u)
			push!(relationships, ("unit__to_node", (u.name, n.name)))
			maxc = M.max_capacity(wind_unit=u, _strict=false)
			maxc === nothing || push!(
				relationship_pvals,	("unit__to_node", (u.name, n.name), "unit_capacity", maxc, alt)
			)
		end			
	end
	for u in M.solar_unit()
		push!(objects, ("unit", u.name))
		avf = M.availability_factor(solar_unit=u, _strict=false)
		avf === nothing || push!(object_pvals, ("unit", u.name, "unit_availability_factor", avf, alt))
		for n in M.solar_unit__electricity_node(solar_unit=u)
			push!(relationships, ("unit__to_node", (u.name, n.name)))
			maxc = M.max_capacity(solar_unit=u, _strict=false)
			maxc === nothing || push!(
				relationship_pvals, ("unit__to_node", (u.name, n.name), "unit_capacity", maxc, alt)
			)
		end			
	end
	for c in M.fuel_pipeline()
		faf = M.forced_availability_factor(fuel_pipeline=c, _strict=false)
		if faf !== nothing
			push!(object_pvals, ("connection", c.name, "forced_availability_factor", unparse_db_value(faf), alt))
		end
		push!(objects, ("connection", c.name))
	end
	for (c, n) in M.fuel_pipeline__from_fuel_storage()
		push!(relationships, ("connection__from_node", (c.name, n.name)))
		cap_bwd = M.capacity_backward(fuel_pipeline=c, _strict=false)
		if cap_bwd !== nothing
			push!(
				relationship_pvals,
				("connection__from_node", (c.name, n.name), "connection_capacity", unparse_db_value(cap_bwd), alt)
			)
		end
	end
	for (c, n) in M.fuel_pipeline__to_fuel_storage()
		push!(relationships, ("connection__to_node", (c.name, n.name)))
		cap_fwd = M.capacity_forward(fuel_pipeline=c, _strict=false)
		if cap_fwd !== nothing
			push!(
				relationship_pvals,
				("connection__to_node", (c.name, n.name), "connection_capacity", unparse_db_value(cap_fwd), alt)
			)
			# FIXME: We add a small negative cost so that the pipeline fills the receiving storage.
			# This is important in rolling optimizations that cannot see the full horizon at once.
			push!(
				relationship_pvals,
				("connection__to_node", (c.name, n.name), "connection_flow_cost", -1, alt)
			)
		end
	end
	for c in M.transmission_line()
		push!(objects, ("connection", c.name))
		react = M.reactance(transmission_line=c, _strict=false)
		react === nothing || push!(object_pvals, ("connection", c.name, "connection_reactance", react, alt))
		resist = M.resistance(transmission_line=c, _strict=false)
		resist === nothing || push!(object_pvals, ("connection", c.name, "connection_resistance", resist, alt))
		faf = M.forced_availability_factor(transmission_line=c, _strict=false)
		if faf !== nothing
			push!(object_pvals, ("connection", c.name, "forced_availability_factor", unparse_db_value(faf), alt))
		end
	end
	for (c, n_from) in M.transmission_line__from_electricity_node()
		push!(relationships, ("connection__from_node", (c.name, n_from.name)))
		push!(relationships, ("connection__to_node", (c.name, n_from.name)))
		cap_fwd = M.capacity_forward(transmission_line=c, _strict=false)
		cap_fwd === nothing || push!(
			relationship_pvals,
			("connection__from_node", (c.name, n_from.name), "connection_capacity", cap_fwd, alt)
		)
		cap_bwd = M.capacity_backward(transmission_line=c, _strict=false)
		cap_bwd === nothing || push!(
			relationship_pvals,
			("connection__to_node", (c.name, n_from.name), "connection_capacity", cap_bwd, alt)
		)
		for n_to in M.transmission_line__to_electricity_node(transmission_line=c)
			push!(relationships, ("connection__from_node", (c.name, n_to.name)))
			push!(relationships, ("connection__to_node", (c.name, n_to.name)))
			push!(relationships, ("connection__node__node", (c.name, n_from.name, n_to.name)))
			push!(relationships, ("connection__node__node", (c.name, n_to.name, n_from.name)))
			push!(
				relationship_pvals,
				("connection__node__node", (c.name, n_from.name, n_to.name), "fix_ratio_out_in_connection_flow", 1, alt)
			)
			push!(
				relationship_pvals,
				("connection__node__node", (c.name, n_to.name, n_from.name), "fix_ratio_out_in_connection_flow", 1, alt)
			)
		end
	end
	for (n_fuel, u) in M.fuel_storage__thermal_unit()
		push!(relationships, ("unit__from_node", (u.name, n_fuel.name)))
		for n_elec in M.thermal_unit__electricity_node(thermal_unit=u)
			push!(relationships, ("unit__to_node", (u.name, n_elec.name)))
			push!(relationships, ("unit__node__node", (u.name, n_fuel.name, n_elec.name)))
		end
	end
	for u in indices(M.idle_heat_rate)		
		for n_from in M.fuel_storage__thermal_unit(thermal_unit=u)
			for n_to in M.thermal_unit__electricity_node(thermal_unit=u)			
				push!(
					relationship_pvals,
					(
						"unit__node__node",
						(u.name, n_from.name, n_to.name),
						"unit_idle_heat_rate", M.idle_heat_rate(thermal_unit=u),
						alt
					)
				)
			end
		end
	end
	for u in indices(M.incremental_heat_rate)
		for n_from in M.fuel_storage__thermal_unit(thermal_unit=u)
			for n_to in M.thermal_unit__electricity_node(thermal_unit=u)		
				push!(
					relationship_pvals,
					(
						"unit__node__node",
						(u.name, n_from.name, n_to.name),
						"unit_incremental_heat_rate",
						M.incremental_heat_rate(thermal_unit=u), alt
					)
				)
			end
		end
	end
	for u in indices(M.start_up_fuel_use)
		for n_from in M.fuel_storage__thermal_unit(thermal_unit=u)
			for n_to in M.thermal_unit__electricity_node(thermal_unit=u)					
				push!(
					relationship_pvals,
					(
						"unit__node__node",
						(u.name, n_from.name, n_to.name),
						"unit_start_flow",
						M.start_up_fuel_use(thermal_unit=u), alt
					)
				)
			end
		end
	end
	import_data(url_out, data, "Import data for alternative $alt")
end

_do_work()