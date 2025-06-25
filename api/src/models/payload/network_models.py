from typing import Annotated
from pydantic import BaseModel, Field, ConfigDict, field_validator
from collections.abc import Sequence

# Modern type aliases (Python 3.12)
type ComponentName = str
type BusName = str
type Efficiency = Annotated[float, Field(ge=0.0, le=1.0)]
type Power = Annotated[float, Field(ge=0.0)]
type Cost = Annotated[float, Field(ge=0.0)]


class BusModel(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True)

    name: ComponentName
    carrier: str = "AC"
    v_nom: Power = 20.0
    x: float | None = None
    y: float | None = None


class GeneratorModel(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: ComponentName
    bus: BusName
    carrier: str
    p_nom: Power
    p_nom_extendable: bool = False
    marginal_cost: Cost = 0.0
    efficiency: Efficiency = 1.0
    control: str = "PQ"  # "PQ", "PV", "Slack"

    @field_validator("control")
    @classmethod
    def validate_control(cls, v: str) -> str:
        if v not in {"PQ", "PV", "Slack"}:
            raise ValueError('control must be "PQ", "PV", or "Slack"')
        return v


class LoadModel(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: ComponentName
    bus: BusName
    p_set: Power
    q_set: float = 0.0


class LineModel(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: ComponentName
    bus0: BusName
    bus1: BusName
    length: Annotated[float, Field(gt=0.0)]
    x: float = 0.1100
    r: float = 0.1000
    g: float = 0.0
    b: float = 0.00005


class StorageUnitModel(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: ComponentName
    bus: BusName
    p_nom: Power
    max_hours: Annotated[float, Field(gt=0.0)]
    efficiency_store: Efficiency = 0.9
    efficiency_dispatch: Efficiency = 0.9
    cyclic_state_of_charge: bool = True
    state_of_charge_initial: Annotated[float, Field(ge=0.0, le=1.0)] = 0.5


class SnapshotsConfig(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    start_time: str | None = None
    end_time: str | None = None
    freq: str = "H"
    count: int | None = None

    def create_snapshots(self):
        import pandas as pd

        if self.start_time and self.end_time:
            return pd.date_range(self.start_time, self.end_time, freq=self.freq)
        elif self.count:
            return pd.RangeIndex(self.count)
        else:
            return pd.RangeIndex(1)


class NetworkCreationModel(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True)

    name: ComponentName
    buses: Sequence[BusModel]
    generators: Sequence[GeneratorModel] = []
    loads: Sequence[LoadModel] = []
    lines: Sequence[LineModel] = []
    storage_units: Sequence[StorageUnitModel] = []
    snapshots_config: SnapshotsConfig | None = None


class NetworkResponseModel(BaseModel):
    network_name: str
    component_counts: dict[str, int]
    status: str
    message: str
