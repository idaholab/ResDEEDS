from collections.abc import Sequence
from typing import Protocol, runtime_checkable
from pypsa import Network
from src.models.payload.network_models import (
    NetworkCreationModel,
    BusModel,
    GeneratorModel,
    LoadModel,
    LineModel,
    StorageUnitModel
)

@runtime_checkable
class NetworkComponent(Protocol):
    name: str
    
    def add_to_network(self, network: Network) -> None: ...

class NetworkValidationError(Exception):
    """Custom exception for network validation errors."""
    
    def __init__(self, message: str, component_type: str | None = None):
        self.component_type = component_type
        super().__init__(message)

def create_dynamic_network(config: NetworkCreationModel) -> tuple[Network, dict[str, int]]:
    """
    Create PyPSA network using modern Python 3.12 syntax and latest PyPSA patterns.
    
    Returns:
        Tuple of (network, component_counts)
    """
    network = Network(name=config.name)
    
    # Configure snapshots using latest PyPSA approach
    if config.snapshots_config:
        network.set_snapshots(config.snapshots_config.create_snapshots())
    
    # Use pattern matching for component processing
    component_counts = {}
    
    for component_type, components in [
        ("buses", config.buses),
        ("generators", config.generators),
        ("loads", config.loads),
        ("lines", config.lines),
        ("storage_units", config.storage_units),
    ]:
        match component_type:
            case "buses":
                _add_buses(network, components)
            case "generators":
                _add_generators(network, components)
            case "loads":
                _add_loads(network, components)
            case "lines":
                _add_lines(network, components)
            case "storage_units":
                _add_storage_units(network, components)
        
        component_counts[component_type] = len(components)
    
    return network, component_counts

def _add_buses(network: Network, buses: Sequence[BusModel]) -> None:
    """Add buses to network using latest PyPSA patterns."""
    for bus in buses:
        network.add(
            "Bus",
            bus.name,
            carrier=bus.carrier,
            v_nom=bus.v_nom,
            x=bus.x,
            y=bus.y
        )

def _add_generators(network: Network, generators: Sequence[GeneratorModel]) -> None:
    """Add generators to network using latest PyPSA patterns."""
    for gen in generators:
        network.add(
            "Generator",
            gen.name,
            bus=gen.bus,
            carrier=gen.carrier,
            p_nom=gen.p_nom,
            p_nom_extendable=gen.p_nom_extendable,
            marginal_cost=gen.marginal_cost,
            efficiency=gen.efficiency,
            control=gen.control
        )

def _add_loads(network: Network, loads: Sequence[LoadModel]) -> None:
    """Add loads to network using latest PyPSA patterns."""
    for load in loads:
        network.add(
            "Load",
            load.name,
            bus=load.bus,
            p_set=load.p_set,
            q_set=load.q_set
        )

def _add_lines(network: Network, lines: Sequence[LineModel]) -> None:
    """Add lines to network using latest PyPSA patterns."""
    for line in lines:
        network.add(
            "Line",
            line.name,
            bus0=line.bus0,
            bus1=line.bus1,
            length=line.length,
            x=line.x,
            r=line.r,
            g=line.g,
            b=line.b
        )

def _add_storage_units(network: Network, storage_units: Sequence[StorageUnitModel]) -> None:
    """Add storage units to network using latest PyPSA patterns."""
    for storage in storage_units:
        network.add(
            "StorageUnit",
            storage.name,
            bus=storage.bus,
            p_nom=storage.p_nom,
            max_hours=storage.max_hours,
            efficiency_store=storage.efficiency_store,
            efficiency_dispatch=storage.efficiency_dispatch,
            cyclic_state_of_charge=storage.cyclic_state_of_charge,
            state_of_charge_initial=storage.state_of_charge_initial
        )

def validate_network_topology(config: NetworkCreationModel) -> None:
    """Validate network topology using Python 3.12 features."""
    
    bus_names = {bus.name for bus in config.buses}
    
    # Validate generator bus references
    for gen in config.generators:
        if gen.bus not in bus_names:
            raise NetworkValidationError(
                f"Generator '{gen.name}' references unknown bus '{gen.bus}'",
                component_type="generator"
            )
    
    # Validate load bus references
    for load in config.loads:
        if load.bus not in bus_names:
            raise NetworkValidationError(
                f"Load '{load.name}' references unknown bus '{load.bus}'",
                component_type="load"
            )
    
    # Validate line bus references
    for line in config.lines:
        if line.bus0 not in bus_names:
            raise NetworkValidationError(
                f"Line '{line.name}' references unknown bus0 '{line.bus0}'",
                component_type="line"
            )
        if line.bus1 not in bus_names:
            raise NetworkValidationError(
                f"Line '{line.name}' references unknown bus1 '{line.bus1}'",
                component_type="line"
            )
    
    # Validate storage unit bus references
    for storage in config.storage_units:
        if storage.bus not in bus_names:
            raise NetworkValidationError(
                f"Storage unit '{storage.name}' references unknown bus '{storage.bus}'",
                component_type="storage_unit"
            )
    
    # Ensure at least one slack generator exists
    slack_generators = [gen for gen in config.generators if gen.control == "Slack"]
    if not slack_generators and config.generators:
        raise NetworkValidationError(
            "Network must have at least one generator with 'Slack' control",
            component_type="generator"
        )