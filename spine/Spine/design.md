# Miracl-Spine implementation framework


## Purpose

The purpose of this document is twofold:

1. To present the requirements for the application of the Miracl framework in Spine.
2. To specify a Spine application that implements those requirements.

If suited, this document might also be used as a base for the user manual of the resulting application.

## Requirements

TODO: Expand below

### Use cases

#### User defines and visualize an energy system

#### User selects a hazard and applies the hazard to their system

#### User runs the simulation for the selected hazard and collects the corresponding metrics

## Spine system specification

The specification consists of two parts:

1. An energy system template that provides users with the basic building blocks for defining an energy system.
2. A hazard & metrics definition database where developers and users can define the different hazards that may affect the energy system, as well as metrics that reflect their consequences.

The rationale is that hazard and metrics can be generally applied to *any* energy system regardless of its idiosyncrasies, and thus are better defined separately. 

### Energy system template

The energy system template allows users to define an energy system to apply the Miracl framework on. The template provide classes, definitions, and alternatives that the user may use as it suits.

To define a new system, the user must do the following:

1. Enter the objects and relationships that compose the system in the appropriate classes.
2. Specify values for the appropriate parameters so as to characterize components' behavior under normal circumstances (no failure).
3. Specify any values that characterize the behavior under failure.


#### Alternatives

| name | description |
|---|---|
| `Base` | The base alternative that describes the normal operation of the system. |
| `failure` | The alternative that describes the operation of the system under failure. |

#### Object classes

| name | description |
|----------------------|----------------------------------------------------------------------|
| `battery_storage_unit` | an electricity node that can store energy                            |
| `demand`               | an electricty demand                                                 |
| `electricity_node`     | null                                                                 |
| `fuel_pipeline`        | null                                                                 |
| `fuel_storage`         | a fuel that can be consumed to produce electricity                   |
| `model`                | null                                                                 |
| `reserve`              | null                                                                 |
| `solar_unit`           | a generating unit that uses solar power power to produce electricity |
| `thermal_unit`         | a generating unit that uses a fuel to produce electricity            |
| `transmission_line`    | an electricity transmission line                                     |
| `wind_unit`            | a generating unit that uses wind power to produce electricity        |

#### Relationship classes

| name | member classes |
|---------------------------------------------|---------------------------------------|
| `battery_storage_unit__from_electricity_node` | `battery_storage_unit` - `electricity_node` |
| `battery_storage_unit__to_electricity_node`   | `battery_storage_unit` - `electricity_node` |
| `demand__electricity_node`                    | `demand` - `electricity_node`               |
| `fuel_pipeline__from_fuel_storage`            | `fuel_pipeline` - `fuel_storage`            |
| `fuel_pipeline__to_fuel_storage`              | `fuel_pipeline` - `fuel_storage`            |
| `fuel_storage__thermal_unit`                  | `fuel_storage` - `thermal_unit`             |
| `solar_unit__electricity_node`                | `solar_unit` - `electricity_node`           |
| `thermal_unit__electricity_node`              | `thermal_unit` - `electricity_node`         |
| `thermal_unit__reserve`                       | `thermal_unit` - `reserve`                  |
| `transmission_line__from_electricity_node`    | `transmission_line` - `electricity_node`    |
| `transmission_line__to_electricity_node`      | `transmission_line` - `electricity_node`    |
| `wind_unit__electricity_node`                 | `wind_unit` - `electricity_node`            |

#### Parameter definitions

| class | name |
|----------------------|---------------------------|
| `battery_storage_unit` | `charging_capacity`         |
| `battery_storage_unit` | `discharge_rate`            |
| `battery_storage_unit` | `generation_capacity`       |
| `battery_storage_unit` | `round_trip_efficiency`     |
| `battery_storage_unit` | `storage_volume`            |
| `demand`               | `absolute_demand`           |
| `demand`               | `load_participation_factor` |
| `fuel_pipeline`        | `capacity_backward`         |
| `fuel_pipeline`        | `capacity_forward`          |
| `fuel_storage`         | `fuel_cost`                 |
| `fuel_storage`         | `storage_capacity`          |
| `fuel_storage`         | `initial_level`             |
| `solar_unit`           | `availability_factor`       |
| `solar_unit`           | `max_capacity`              |
| `thermal_unit`         | `forced_outage_rate`        |
| `thermal_unit`         | `idle_heat_rate`            |
| `thermal_unit`         | `incremental_heat_rate`     |
| `thermal_unit`         | `max_capacity`              |
| `thermal_unit`         | `min_stable`                |
| `thermal_unit`         | `minimum_down_time`         |
| `thermal_unit`         | `minimum_up_time`           |
| `thermal_unit`         | `ramp_down_rate`            |
| `thermal_unit`         | `ramp_up_rate`              |
| `thermal_unit`         | `shutdown_cost`             |
| `thermal_unit`         | `start_up_cost`             |
| `thermal_unit`         | `start_up_fuel_use`         |
| `transmission_line`    | `capacity_backward`         |
| `transmission_line`    | `capacity_forward`          |
| `transmission_line`    | `reactance`                 |
| `transmission_line`    | `resistance`                |
| `wind_unit`            | `availability_factor`       |
| `wind_unit`            | `max_capacity`              |



### Hazard & metrics definition database

It provides a simple data structure for developers to characterize standard hazards and associated metrics. The structure is easy to extend so that advanced users can define their own hazards and metrics if needed.

A new hazard is defined in three steps:

1. Enter a corresponding object in the `hazard` class.
2. Enter the corresponding `hazard__component` relationships between the above `hazard` object and any `component` objects that are affected by it.
3. Specify `mean_time_to_failure` and `mean_time_to_repair` for each of the above relationships.

Applying a hazard to an energy system is simply a matter of generating the parameter values that reflect the hazard for each affected component. First, we look at `mean_time_to_failure` and `mean_time_to_repair` to generate a time-series for the component status. Then, for each parameter value that has the `failure` alternative, we generate a new time-series that is a copy of the status time-series but has the values for `Base` and `failure` in the points where the component is on and off, respectively. The resulting time-series is then used as the value of the parameter for the hazard situation.

TODO: Metrics

#### Object classes

| name | description |
|---|---|
| `hazard` | a hazard that may affect the energy system |
| `component` | an energy system component - corresponding to an object class from the System template above |
| `metrics` | a metrics that reflects a specific consequence of a hazard on the system |

#### Relationship classes


| name | member classes | description |
|---|---|---|
| `hazard__component` | `hazard` - `component` | indicates that a certain hazard may affect a certain system component |
| `hazard__metrics` | `hazard` - `metrics` | indicates that a certain hazard may trigger the computation of a certain metrics |

#### Parameter definitions

| class | name | description |
|---|---|---|
| `hazard__component` | `mean_time_to_failure` | The average amount of time, counted from the beginning of the simulation period, until the component fails due to the hazard. A value of 0 is interpreted as immediate failure with no possibility of reparation. |
| `hazard__component` | `mean_time_to_repair` | The average amount of time before the component is back in operation (disregarded if `mean_time_to_failure` is 0) |
