from pypsa import Network


def add_battery(
    network: Network,
    name: str,
    bus: str,
    max_discharge_kw: float,
    total_capacity_kwh: float,
    max_charge_kw: float = 0,
    scaled_charge_percent: int = 100,
    max_power_factor: float = 1.2,
    min_power_factor: float = 0.8,
) -> None:
    """
    Add a battery to the PyPSA network with specified parameters.

    Parameters:
        network: The PyPSA network object.
        name (str): Name of the battery.
        bus (str): Bus to which the battery is connected.
        max_discharge_kw (float): Maximum rate of discharge in kW.
        total_capacity_kwh (float): Total charged capacity in kWh.
        max_charge_kw (float, optional): Maximum rate of charge in kW. Defaults to max_discharge_kw.
        scaled_charge_percent (float, optional): Initial charge as a percentage of capacity. Defaults to 100.
        max_power_factor (float, optional): Maximum power factor. Defaults to 1.2.
        min_power_factor (float, optional): Minimum power factor. Defaults to 0.8.

    Returns:
        None: Adds the battery to the network.
    """
    # Default maximum charge rate if not provided
    if max_charge_kw is None:
        max_charge_kw = max_discharge_kw

    # Calculate the initial state of charge (in kWh)
    initial_charge_kwh = (scaled_charge_percent / 100) * total_capacity_kwh

    # Add the battery as a storage unit
    network.add(
        "StorageUnit",
        name,
        bus=bus,
        p_nom=max_discharge_kw / 1000,  # Convert kW to MW
        max_hours=total_capacity_kwh / max_discharge_kw,  # Hours of storage
        state_of_charge_initial=initial_charge_kwh
        / total_capacity_kwh,  # Initial state of charge
        p_set=0,  # Default power flow is 0
        efficiency_store=0.9,  # Example efficiency for charging (90%)
        efficiency_dispatch=0.9,  # Example efficiency for discharging (90%)
        max_pu=max_power_factor,
        min_pu=min_power_factor,
    )


def add_bus(network: Network, name: str) -> None:
    """
    Add a bus to the PyPSA network with specified parameters.

    Parameters:
        network: The PyPSA network object.
        name (str): Name of the bus.
    """
    network.add("Bus", name)


def add_line(network: Network, name: str, bus0: str, bus1: str, length: float) -> None:
    """
    Add a line to the PyPSA network with specified parameters.

    Parameters:
        network: The PyPSA network object.
        name (str): Name of the line.
        bus0 (str): Name of the first bus.
        bus1 (str): Name of the second bus.
        length: distance is in km.

    Returns:
        None: Adds the line to the network.
    """
    network.add("Line", name, bus0=bus0, bus1=bus1, length=length)


def add_load(
    network: Network,
    name: str,
    bus: str,
    real_power_mw: float,
    reactive_power_kvar: float = 0,
    reduction_percent: float = 0,
):
    """
    Add a load to the PyPSA network with specified parameters.

    Parameters:
    - network (pypsa.Network): The PyPSA network object.
    - name (str): Custom name of the load.
    - bus (str): Bus to which the load is connected.
    - real_power_mw (float): Real power consumption in MW (required).
    - reactive_power_kvar (float, optional): Reactive power in kVAR. Defaults to 0.
    - reduction_percent (float, optional): Percentage reduction allowed. Defaults to 0%.

    Returns:
    - None: Adds the load to the network.
    """
    # Calculate reduced real power based on percentage reduction
    reduced_real_power_mw = real_power_mw * (1 - reduction_percent / 100)

    # Add the load to the network
    network.add(
        "Load",
        name,
        bus=bus,
        p_set=reduced_real_power_mw,  # Adjusted real power based on reduction
        q_set=reactive_power_kvar / 1000,  # Convert kVAR to MVAR
    )


# Generators
def add_diesel_generator(
    network: Network,
    name: str,
    bus: str,
    nominal_power_kva: float,
    power_factor: float = 0.8,
    units: int = 1,
    main_system_power_supply: bool = False,
):
    """
    Add a diesel generator to the PyPSA network with specified parameters.

    Parameters:
    - network (pypsa.Network): The PyPSA network object.
    - name (str): Name of the diesel generator.
    - bus (str): Bus to which the generator is connected.
    - nominal_power_kva (float): Nominal power in kVA (required).
    - power_factor (float, optional): Power factor. Defaults to 0.8.
    - units (int, optional): Number of identical units. Defaults to 1.
    - main_system_power_supply (bool, optional): If True, set generator as primary supply. Defaults to False.

    Returns:
    - None: Adds the diesel generator(s) to the network.
    """
    # Calculate nominal power in MW
    nominal_power_mw = (nominal_power_kva * power_factor) / 1000

    # Scale power for multiple units
    total_nominal_power_mw = nominal_power_mw * units

    # Add the diesel generator(s) to the network
    network.add(
        "Generator",
        f"{name} - Diesel Generator",
        bus=bus,
        p_nom=total_nominal_power_mw,  # Total nominal power (MW)
        efficiency=0.4,  # Example efficiency (40%)
        marginal_cost=0,  # Cost per MWh
        p_max_pu=1.0,  # Allow full nominal output
        p_min_pu=0.0,  # Allow turning off completely
        ramp_limit_up=0.2,  # Example ramp rate up (20%)
        ramp_limit_down=0.2,  # Example ramp rate down (20%)
    )


def add_solar_generator(
    network: Network,
    name: str,
    bus: str,
    max_power_kva: float,
    scaled_max_power_percent: int = 100,
    max_power_factor: float = 1.0,
    min_power_factor: float = 0.9,
):
    """
    Add a solar generator to the PyPSA network with specified parameters.

    Parameters:
    - network (pypsa.Network): The PyPSA network object.
    - name (str): Name of the solar generator.
    - bus (str): Bus to which the generator is connected.
    - max_power_kva (float): Maximum power in kVA (required).
    - scaled_max_power_percent (float, optional): Percentage of max power used for scaling. Defaults to 100%.
    - max_power_factor (float, optional): Maximum power factor. Defaults to 1.0.
    - min_power_factor (float, optional): Minimum power factor. Defaults to 0.9.

    Returns:
    - None: Adds the solar generator to the network.
    """
    # Calculate the scaled maximum power (in MW)
    scaled_max_power_mw = (scaled_max_power_percent / 100) * (max_power_kva / 1000)

    # Add the solar generator to the network
    network.add(
        "Generator",
        f"{name} - Solar Generator",
        bus=bus,
        p_nom=scaled_max_power_mw,  # Nominal power (MW)
        marginal_cost=0,  # No fuel cost for solar
        p_max_pu=1.0,  # Default to 100% max output
        max_pu=max_power_factor,  # Maximum power factor
        min_pu=min_power_factor,  # Minimum power factor
        efficiency=0.9,  # Example efficiency (90%)
    )


def add_wind_generator(
    network,
    name,
    bus,
    max_power_kva,
    scaled_max_power_percent=100,
    max_power_factor=1.0,
    min_power_factor=0.9,
):
    """
    Add a wind generator to the PyPSA network with specified parameters.

    Parameters:
    - network (pypsa.Network): The PyPSA network object.
    - name (str): Name of the wind generator.
    - bus (str): Bus to which the generator is connected.
    - max_power_kva (float): Maximum power in kVA (required).
    - scaled_max_power_percent (float, optional): Percentage of max power for scaling. Defaults to 100%.
    - max_power_factor (float, optional): Maximum power factor. Defaults to 1.0.
    - min_power_factor (float, optional): Minimum power factor. Defaults to 0.9.

    Returns:
    - None: Adds the wind generator to the network.
    """
    # Calculate scaled maximum power in MW
    scaled_max_power_mw = (scaled_max_power_percent / 100) * (max_power_kva / 1000)

    # Add the wind generator to the network
    network.add(
        "Generator",
        f"{name} - Wind Generator",
        bus=bus,
        p_nom=scaled_max_power_mw,  # Nominal power in MW
        marginal_cost=0,  # Wind has no fuel cost
        p_max_pu=1.0,  # Full nominal output allowed
        max_pu=max_power_factor,  # Maximum power factor
        min_pu=min_power_factor,  # Minimum power factor
        efficiency=0.95,  # Example efficiency for wind (95%)
    )
