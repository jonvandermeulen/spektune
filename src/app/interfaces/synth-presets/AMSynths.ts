import * as Tone from 'tone';

export class AMSynths {

    static Tiny(): Tone.AMSynth {
        return new Tone.AMSynth({
            harmonicity: 2,
            oscillator: {
                type: 'amsine2',
                modulationType: 'sine',
                harmonicity: 1.01
            },
            envelope: {
                attack: 0.006,
                decay: 4,
                sustain: 0.04,
                release: 1.2
            },
            modulation: {
                volume: 13,
                type: 'amsine2',
                modulationType: 'sine',
                harmonicity: 12
            },
            modulationEnvelope: {
                attack: 0.006,
                decay: 0.2,
                sustain: 0.2,
                release: 0.4
            }
        });
    }

    static Harmonics(): Tone.AMSynth {
        return new Tone.AMSynth({
            harmonicity: 3.999,
            oscillator: {
                type: 'square'
            },
            envelope: {
                attack: 0.03,
                decay: 0.3,
                sustain: 0.7,
                release: 0.8
            },
            modulation: {
                volume: 12,
                type: 'square6'
            },
            modulationEnvelope: {
                attack: 2,
                decay: 3,
                sustain: 0.8,
                release: 0.1
            }
        });
    }

}
