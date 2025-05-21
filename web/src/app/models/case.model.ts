export interface Case {
    _id?: string;
    name: string;
    project_id?: string;
    diagram_data?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CaseResults {
    static_data: {
        buses: any;
        generators: any;
        lines: any;
        loads: any;
        storage_units: any;
    };
    flow_results: {
        lines_flow: {
            p0: { [key: string]: number };  // Active power at bus0 side
            p1: { [key: string]: number };  // Active power at bus1 side
            q0: { [key: string]: number };  // Reactive power at bus0 side
            q1: { [key: string]: number };  // Reactive power at bus1 side
        };
        generators_output: {
            p: { [key: string]: number };  // Active power output
            q: { [key: string]: number };  // Reactive power output
        };
        loads_consumption: {
            p: { [key: string]: number };  // Active power consumption
            q: { [key: string]: number };  // Reactive power consumption
        };
        storage_units_state: {
            p: { [key: string]: number };  // Active power charging/discharging
            state_of_charge: { [key: string]: number };  // Current SOC
        };
        buses_state: {
            v_mag_pu: { [key: string]: number };  // Voltage magnitude in p.u.
            v_ang: { [key: string]: number };     // Voltage angle in radians
        };
    };
}