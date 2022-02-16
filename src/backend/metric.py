from enum import Enum

class MetricUnit(Enum):
    KILOWATTS = 'kW'
    KILOWATT_HOURS = 'kWh'
    KILOMETERS = 'km'
    #TODO: many more...
    OTHER = 'other'

class MetricType:
    #this should probably be dynamic...
    pass

class Metric:

    pass