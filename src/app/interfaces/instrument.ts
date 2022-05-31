import * as Tone from 'tone';
type ToneInstrumentType = Tone.AMSynth | Tone.FMSynth | Tone.MonoSynth | Tone.NoiseSynth | 
    Tone.Sampler | Tone.Synth

export class Instrument {
    toneOject: ToneInstrumentType;

    constructor(
        private instrument: ToneInstrumentType
        ){ 
        
        this.toneOject = instrument;
    }

    triggerAttackRelease(note: string, duration: number, time?: number, velocity?: number): ToneInstrumentType {
        return this.toneOject.triggerAttackRelease(note, duration, time, velocity);
    }
}
