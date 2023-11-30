using SpineInterface
using XLSX
using DataFrames
using CSV
using Dates

function get_outages()
	#println(io, "Outages")
	#println(io, "demand, start, duration [hr], load not served [kWh], % of load served")
	outages = []
	@show collect(indices(node_slack_pos))
	for ent in indices(node_slack_pos)
		@show nsp = node_slack_pos(; ent...)
		nsp === nothing && continue
		n = ent.node
		start = nothing
		load_not_served = nothing
		for (time_stamp, value) in nsp
			if start === nothing
				if value > 0
					start = time_stamp
					load_not_served = value
				end
			else
				if value > 0
					load_not_served += value
				else
					duration = Hour(time_stamp - start).value
					total_load = sum(demand(node=node(n.name), t=t) for t in start:Hour(1):time_stamp)
					load_served_percentage = 100 * (total_load - load_not_served) / total_load
					push!(
						outages,
						(node=n, start=start, duration=duration, total_load=total_load, load_not_served=load_not_served)
					)
					start = nothing
				end
			end
		end
	end
	outages
end

function _percentage_of_served_load(total_load, load_not_served)
	if iszero(total_load)
		0
	else
		100 * (total_load - load_not_served) / total_load
	end
end

function compute_metrics(url_in, url_out)
	filter_configs = run_request(url_in, "call_method", ("get_filter_configs",))
	hazard = first(cfg["scenario"] for cfg in filter_configs if cfg["type"] == "scenario_filter")
	using_spinedb(url_in)
	outages = get_outages()
	if isempty(outages)
		load_not_served = 0
		percentage_of_served_load = 0
		outage_duration = nothing
	else
		load_not_served = sum(out.load_not_served for out in outages)
		total_load = sum(out.total_load for out in outages)
		percentage_of_served_load = _percentage_of_served_load(total_load, load_not_served)
		outage_duration = Map([x.start for x in outages], [x.duration for x in outages])
	end
	params = Dict(
		:value => Dict(
			(hazard=Symbol(hazard), metrics=:load_not_served) => load_not_served,
			(hazard=Symbol(hazard), metrics=:percentage_of_served_load) => percentage_of_served_load,
			(hazard=Symbol(hazard), metrics=:outage_duration) => outage_duration
		)
	)
	write_parameters(params, url_out; alternative="Base")
end

url_in, url_out = ARGS

compute_metrics(url_in, url_out)