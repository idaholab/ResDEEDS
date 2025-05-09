export interface Case {
    _id?: string;
    name: string;
    project_id?: string;
    diagram_data?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CaseResults {
    buses: any;
    generators: any;
    lines: any;
    loads: any;
    storage_units: any;
}