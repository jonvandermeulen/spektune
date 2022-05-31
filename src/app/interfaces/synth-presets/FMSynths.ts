import * as Tone from 'tone';
export class FMSynths {

    static Kalimba(): Tone.FMSynth {
        return new Tone.FMSynth({
            harmonicity: 8,
            modulationIndex: 2,
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.001,
                decay: 2,
                sustain: 0.1,
                release: 2
            },
            modulation: {
                type: 'square'
            },
            modulationEnvelope: {
                attack: 0.002,
                decay: 0.2,
                sustain: 0,
                release: 0.2
            }
        });
    }

    static ElectricCello(): Tone.FMSynth {
        return new Tone.FMSynth({
            harmonicity: 3.01,
            modulationIndex: 14,
            oscillator: {
                type: 'triangle'
            },
            envelope: {
                attack: 0.2,
                decay: 0.3,
                sustain: 0.1,
                release: 1.2
            },
            modulation: {
                type: 'square'
            },
            modulationEnvelope: {
                attack: 0.01,
                decay: 0.5,
                sustain: 0.2,
                release: 0.1
            }
        });
    }

}
