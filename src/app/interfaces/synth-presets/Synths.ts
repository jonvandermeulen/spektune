import * as Tone from 'tone';

export class Synths {

    static AlienChorus(): Tone.Synth {
        return new Tone.Synth({
            oscillator: {
                type: 'fatsine4',
                spread: 60,
                count: 10
            },
            envelope: {
                attack: 0.4,
                decay: 0.01,
                sustain: 1,
                attackCurve: 'sine',
                releaseCurve: 'sine',
                release: 0.4
            }
        });
    }

    static DelicateWind(): Tone.Synth {
        return new Tone.Synth({
            portamento: 0.0,
            oscillator: {
                type: 'square4'
            },
            envelope: {
                attack: 2,
                decay: 1,
                sustain: 0.2,
                release: 2
            }
        });
    }

    static DropPulse(): Tone.Synth {
        return new Tone.Synth();
    }

    static Marimba(): Tone.Synth {
        return new Tone.Synth({
            oscillator: {
                partials: [
                    1,
                    0,
                    2,
                    0,
                    3
                ]
            },
            envelope: {
                attack: 0.001,
                decay: 1.2,
                sustain: 0,
                release: 1.2
            }
        });
    }

    static SteelPan(): Tone.Synth {
        return new Tone.Synth({
            oscillator: {
                type: 'fatcustom',
                partials: [0.2, 1, 0, 0.5, 0.1],
                spread: 40,
                count: 3
            },
            envelope: {
                attack: 0.001,
                decay: 1.6,
                sustain: 0,
                release: 1.6
            }
        });
    }

    static SuperSaw(): Tone.Synth {
        return new Tone.Synth({
            oscillator: {
                type: 'fatsawtooth',
                count: 3,
                spread: 30
            },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.5,
                release: 0.4,
                attackCurve: 'exponential'
            }
        });
    }
    
    static TreeTrunk(): Tone.Synth {
        return new Tone.Synth({
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.001,
                decay: 0.1,
                sustain: 0.1,
                release: 1.2
            }
        });
    }
}
