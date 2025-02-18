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


def create_network(case_name: str) -> Network:
    """
    Create a PyPSA network with the specified case name.

    Parameters:
        case_name (str): Name of the PyPSA network.

    Returns:
        network (pypsa.Network): The PyPSA network object.
    """

    network = Network(name=case_name)

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
