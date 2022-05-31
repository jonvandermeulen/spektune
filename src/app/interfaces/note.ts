import { Duration } from "./duration";

export interface Note {
    time?: any;
    pitch: string[];
    duration: Duration[];
    velocity: number;
    noteIndex: number;
    rawData?: any;
    normalizedData?: any;
}

// export interface ModulationData {
//     duration?: Duration;
//     type?: string;
//     value?: number;
//     normalizedData?: any
// }