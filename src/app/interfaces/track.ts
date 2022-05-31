import { DurationInterface } from "./duration";
import { Note } from "./note";

export interface Track {
    name?: string,
    channel?: number,
    midiInstrumentId?: number,
    key: {
        useGlobalKeyScale?: boolean,
        globalKeyNote?: string;
        globalKeyScale?: string;
        keyNote?: string,
        keyScale?: string,
        startOctave?: number,
        endOctave?: number,
    },
    options: {
        noteDuration?: DurationInterface,
        offset?: DurationInterface,
        mergeLimit?: number,
        restNotes?: string,
        tempo?: number,
        sustain?: boolean,
        volume?: number;
        defaultVelocity?: number;
        modulationOptions?: number;
    },
    modulationOptions?: ModulationOption[],
    noteData: Note[],
    data: any,
}

export interface DrumTrack {
    name?: string,
    channel?: number,
    midiInstrumentId?: number,
    // key: {
    //     useGlobalKeyScale?: boolean,
    //     globalKeyNote?: string;
    //     globalKeyScale?: string;
    //     keyNote?: string,
    //     keyScale?: string,
    //     startOctave?: number,
    //     endOctave?: number,
    // },
    options: {
        phrases?: number,
        noteDuration?: DurationInterface,
        offset?: DurationInterface,
        mergeLimit?: number,
        restNotes?: string,
        tempo?: number,
        sustain?: boolean,
        volume?: number;
    },
    modulationOptions?: ModulationOption[],
    noteData: Note[],
    data: any,
}

export interface ModulationOption {
    type: string,
    duration: DurationInterface,
    minValue: any,
    maxValue: any,
    options?: any,
    data?: any,
}