import * as Tone from 'tone';
const bassElectricDef = require('../synth-presets/sampler-defs/cello.json');
const bassoonDef = require('../synth-presets/sampler-defs/bassoon.json');
const celloDef = require('../synth-presets/sampler-defs/cello.json');
const clarinetDef = require('../synth-presets/sampler-defs/clarinet.json');
const contrabassDef = require('../synth-presets/sampler-defs/contrabass.json');
const frenchHornDef = require('../synth-presets/sampler-defs/french-horn.json');
const guitarElectricDef = require('../synth-presets/sampler-defs/guitar-electric.json');
const guitarAccousticDef = require('../synth-presets/sampler-defs/guitar-accoustic.json');
const guitarNylonDef = require('../synth-presets/sampler-defs/guitar-nylon.json');
const harmoniumDef = require('../synth-presets/sampler-defs/harmonium.json');
const harpDef = require('../synth-presets/sampler-defs/harp.json');
const fluteDef = require('../synth-presets/sampler-defs/flute.json');
const organDef = require('../synth-presets/sampler-defs/organ.json');
const pianoDef = require('../synth-presets/sampler-defs/piano.json');
const saxophoneDef = require('../synth-presets/sampler-defs/saxophone.json');
const tromboneDef = require('../synth-presets/sampler-defs/trombone.json');
const trumpetDef = require('../synth-presets/sampler-defs/trumpet.json');
const tubaDef = require('../synth-presets/sampler-defs/tuba.json');
const violinDef = require('../synth-presets/sampler-defs/violin.json');
const xylophoneDef = require('../synth-presets/sampler-defs/xylophone.json');


export class Sampler { 
    static BassElectric(): Tone.Sampler {
        return new Tone.Sampler({
            urls: bassElectricDef.urls,
            baseUrl: bassElectricDef.baseUrl,
            volume: -15,
        });
    }

    static Bassoon(): Tone.Sampler {
        return new Tone.Sampler({
            urls: bassoonDef.urls,
            baseUrl: bassoonDef.baseUrl,
            volume: -15,
        });
    }

    static Cello(): Tone.Sampler {
        return new Tone.Sampler({
            urls: celloDef.urls,
            baseUrl: celloDef.baseUrl,
            volume: -15,
        });
    }

    static Clarinet(): Tone.Sampler {
        return new Tone.Sampler({
            urls: clarinetDef.urls,
            baseUrl: clarinetDef.baseUrl,
            volume: -15,
        });
    }

    static Contrabass(): Tone.Sampler {
        return new Tone.Sampler({
            urls: contrabassDef.urls,
            baseUrl: contrabassDef.baseUrl,
            volume: -15,
        });
    }

    static Flute(): Tone.Sampler {
        return new Tone.Sampler({
            urls: fluteDef.urls,
            baseUrl: fluteDef.baseUrl,
            volume: -15,
        });
    }

    static FrenchHorn(): Tone.Sampler {
        return new Tone.Sampler({
            urls: frenchHornDef.urls,
            baseUrl: frenchHornDef.baseUrl,
            volume: -15,
        });
    }

    static GuitarAccoustic(): Tone.Sampler {
        return new Tone.Sampler({
            urls: guitarAccousticDef.urls,
            baseUrl: guitarAccousticDef.baseUrl,
            volume: -15,
        });
    }

    static GuitarElectric(): Tone.Sampler {
        return new Tone.Sampler({
            urls: guitarElectricDef.urls,
            baseUrl: guitarElectricDef.baseUrl,
            volume: -15,
        });
    }

    static GuitarNylon(): Tone.Sampler {
        return new Tone.Sampler({
            urls: guitarNylonDef.urls,
            baseUrl: guitarNylonDef.baseUrl,
            volume: -15,
        });
    }

    static Harmonium(): Tone.Sampler {
        return new Tone.Sampler({
            urls: harmoniumDef.urls,
            baseUrl: harmoniumDef.baseUrl,
            volume: -15,
        });
    }

    static Harp(): Tone.Sampler {
        return new Tone.Sampler({
            urls: harpDef.urls,
            baseUrl: harpDef.baseUrl,
            volume: -15,
        });
    }

    static Organ(): Tone.Sampler {
        return new Tone.Sampler({
            urls: organDef.urls,
            baseUrl: organDef.baseUrl,
            volume: -15,
        });
    }

    static Piano(): Tone.Sampler {
        return new Tone.Sampler({
            urls: pianoDef.urls,
            baseUrl: pianoDef.baseUrl,
            volume: -15,
        });
    }

    static Saxophone(): Tone.Sampler {
        return new Tone.Sampler({
            urls: saxophoneDef.urls,
            baseUrl: saxophoneDef.baseUrl,
            volume: -15,
        });
    }

    static Trombone(): Tone.Sampler {
        return new Tone.Sampler({
            urls: tromboneDef.urls,
            baseUrl: tromboneDef.baseUrl,
            volume: -15,
        });
    }

    static Trumpet(): Tone.Sampler {
        return new Tone.Sampler({
            urls: trumpetDef.urls,
            baseUrl: trumpetDef.baseUrl,
            volume: -15,
        });
    }

    static Tuba(): Tone.Sampler {
        return new Tone.Sampler({
            urls: tubaDef.urls,
            baseUrl: tubaDef.baseUrl,
            volume: -15,
        });
    }

    static Violin(): Tone.Sampler {
        return new Tone.Sampler({
            urls: violinDef.urls,
            baseUrl: violinDef.baseUrl,
            volume: -15,
        });
    }

    static Xylophone(): Tone.Sampler {
        return new Tone.Sampler({
            urls: xylophoneDef.urls,
            baseUrl: xylophoneDef.baseUrl,
            volume: -15,
        });
    }


}
