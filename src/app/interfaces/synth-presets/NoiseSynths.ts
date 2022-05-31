    import * as Tone from 'tone';

    export class NoiseSynths {
        
    static Gravel(): Tone.NoiseSynth{
        return new Tone.NoiseSynth({
            noise: {
                type: 'pink',
                playbackRate: 0.1
            },
            envelope: {
                attack: 0.5,
                decay: 2,
                sustain: 0.5,
                release: 3
            }
        });
    }
    
    static Slap(): Tone.NoiseSynth {
        return new Tone.NoiseSynth({
            noise: {
                type: 'white',
                playbackRate: 5
            },
            envelope: {
                attack: 0.001,
                decay: 0.3,
                sustain: 0,
                release: 0.3
            }
        });
    }

}
