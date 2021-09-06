
export interface ListItem {
    name?: string;
}

export interface ListResponse {
    items: ListItem[];
    metadata?: CamFileMetadata[];
}

export interface CamDef {
    name: string;
}

export interface CamMetadata {
    label?: string;
    description?: string;
}

export type CamMetadataDict = {[k: string]: CamMetadata};

export interface CamMetadataResponse {
    camera_metadata: CamMetadataDict 
}

export interface CamListResponse {
    items: CamDef[];
}

export interface CamFileMetadata {
    detector: MotionDetectorMetadata | null
}
export interface MotionDetectorMetadata {
    fps: number
    total_frames: number
    duration: number
    motion_seconds_longest: number
    motion_seconds_total: number
    too_many_objects: number
    motion_start_frames: number[]
    motion_stop_frames: number[]
}

export interface MotionDetectorRawJsonFile {
    detector_results: MotionDetectorMetadata[]; // contains 1-element array
    cli_args: any;
    options: any;
}
