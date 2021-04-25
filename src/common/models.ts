
export interface ListItem {
    name?: string;
}

export interface ListResponse {
    items: ListItem[];
}

export interface CameraDef {
    name: string;
    title?: string;
    description?: string;
}

export interface CamListResponse {
    items: CameraDef[];
}
