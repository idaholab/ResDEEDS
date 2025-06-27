import logging

from pypsa import Network

from src.bll.psa.components import (
    add_bus,
    add_line,
    add_battery,
    add_solar_generator,
    add_wind_generator,
    add_diesel_generator,
    add_load,
)


logger = logging.getLogger(__name__)


def validate_user_input(diagram: dict) -> list:
    """
    Review user input data associated with the specified case name.

    Parameters:
        case (case): The case to validate.

    Returns:
        warnings (list): A list of warnings for the user.
    """

    warnings = []

    if "object" not in diagram:
        return [
            "The diagram data does not contain any objects. Please check the diagram."
        ]

    for obj in diagram["object"]:
        if not isinstance(obj, dict):
            warnings.append(
                "The diagram data contains an object that is not a dictionary. Please check the diagram."
            )
            continue

        match obj.get("@label"):
            case "Battery":
                for num_attr in [
                    "@max_discharge_kw",
                    "@total_capacity_kwh",
                    "@max_charge_kw",
                    "@scaled_charge_percent",
                    "@max_power_factor",
                    "@max_power_factor",
                ]:
                    try:
                        float(obj.get(num_attr, ""))
                    except Exception as e:
                        logger.error(e)
                        warnings.append(
                            f"The {num_attr[1:]} property for {obj.get('@label')} '{obj.get('@name')}' cannot be converted to a floating point number from value: {obj.get(num_attr, '')}"
                        )
            case "Bus":
                pass
            case "Line":
                for num_attr in ["@length"]:
                    try:
                        float(obj.get(num_attr, ""))
                    except Exception as e:
                        logger.error(e)
                        warnings.append(
                            f"The {num_attr[1:]} property for {obj.get('@label')} '{obj.get('@name')}' cannot be converted to a floating point number from value: {obj.get(num_attr, '')}"
                        )
            case "Load":
                for num_attr in ["@real_power_mw"]:
                    try:
                        float(obj.get(num_attr, ""))
                    except Exception as e:
                        logger.error(e)
                        warnings.append(
                            f"The {num_attr[1:]} property for {obj.get('@label')} '{obj.get('@name')}' cannot be converted to a floating point number from value: {obj.get(num_attr, '')}"
                        )
            case "Diesel Generator":
                for num_attr in ["@nominal_power_kva", "@power_factor"]:
                    try:
                        float(obj.get(num_attr, ""))
                    except Exception as e:
                        logger.error(e)
                        warnings.append(
                            f"The {num_attr[1:]} property for {obj.get('@label')} '{obj.get('@name')}' cannot be converted to a floating point number from value: {obj.get(num_attr, '')}"
                        )
            case "Solar Generator":
                for num_attr in [
                    "@max_power_kva",
                    "@max_power_kva",
                    "@min_power_factor",
                ]:
                    try:
                        float(obj.get(num_attr, ""))
                    except Exception as e:
                        logger.error(e)
                        warnings.append(
                            f"The {num_attr[1:]} property for {obj.get('@label')} '{obj.get('@name')}' cannot be converted to a floating point number from value: {obj.get(num_attr, '')}"
                        )
            case "Wind Generator":
                for num_attr in [
                    "@max_power_kva",
                    "@max_power_kva",
                    "@min_power_factor",
                ]:
                    try:
                        float(obj.get(num_attr, ""))
                    except Exception as e:
                        logger.error(e)
                        warnings.append(
                            f"The {num_attr[1:]} property for {obj.get('@label')} '{obj.get('@name')}' cannot be converted to a floating point number from value: {obj.get(num_attr, '')}"
                        )
            case _:
                warnings.append(
                    "Only objects from the 'Energy Systems Components' Library will be analyzed."
                )

    return list(set(warnings))


def create_network(case_name: str, diagram_data: dict, snapshots=None) -> Network:
    """
    Create a PyPSA network with the specified case name.

    Parameters:
        case_name (str): Name of the PyPSA network.
        snapshots (pd.Index, optional): Index for time-series analysis. Can be simple
                                       integer index or DatetimeIndex.

    Returns:
        network (pypsa.Network): The PyPSA network object.
    """

    network = Network(name=case_name)

    # Set snapshots if provided, otherwise use a single snapshot
    if snapshots is None:
        import pandas as pd

        snapshots = pd.RangeIndex(1)

    network.set_snapshots(snapshots)

    # Add buses
    add_bus(network, "Main")
    add_bus(network, "Navy Station")
    add_bus(network, "Renewable Field")

    # Add connections between buses (Feeders and Navy Station Bus to Main Bus)
    # Length is distance in Kilometers
    add_line(network, "Feeder 1", bus0="Main", bus1="Navy Station", length=6.0)
    add_line(
        network, "Feeder 2", bus0="Navy Station", bus1="Renewable Field", length=5.0
    )
    # add_line(network, "Feeder 3", bus0="Renewable Field", bus1="Main", length=4.0)

    # Add loads to the network
    add_load(network, "Town Load", bus="Main", real_power_mw=3.4)
    add_load(network, "Navy Station Load", bus="Navy Station", real_power_mw=0.5)

    # Add a battery storage unit (connected to the Main Bus)
    add_battery(
        network,
        name="Battery Unit",
        bus="Main",
        total_capacity_kwh=950,
        max_discharge_kw=1.225,
    )

    # Add diesel generators
    add_diesel_generator(
        network,
        name="Diesel 1",
        bus="Main",
        control="Slack",
        nominal_power_kva=3850,
        power_factor=0.85,
    )
    add_diesel_generator(
        network,
        name="Diesel 2",
        bus="Main",
        control="PV",
        nominal_power_kva=3851,
        power_factor=0.85,
    )
    add_diesel_generator(
        network,
        name="Diesel 3",
        bus="Main",
        control="PV",
        nominal_power_kva=3851,
        power_factor=0.85,
    )
    add_diesel_generator(
        network,
        name="Diesel 4",
        bus="Main",
        control="PV",
        nominal_power_kva=1875,
        power_factor=0.85,
    )
    add_diesel_generator(
        network,
        name="Diesel 5",
        bus="Main",
        control="PV",
        nominal_power_kva=906,
        power_factor=0.85,
    )
    add_diesel_generator(
        network,
        name="Standby",
        bus="Main",
        control="PV",
        nominal_power_kva=1887,
        power_factor=0.8,
    )

    # Add renewable generators (connected to the Renewable Field Bus)
    add_solar_generator(
        network,
        name="Solar 1",
        bus="Renewable Field",
        max_power_kva=1000,
        max_power_factor=1,
        min_power_factor=0.85,
    )
    add_wind_generator(
        network,
        name="Wind 1",
        bus="Renewable Field",
        max_power_kva=1800,
        max_power_factor=1,
        min_power_factor=0.85,
    )

    return network
